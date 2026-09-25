import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface FileData {
  name: string;
  language: string;
  description: string;
  content: string;
}

const sourceFiles: FileData[] = [
  {
    name: 'tokenizer.h',
    language: 'c',
    description: 'Header file defining token types and the Tokenizer structure. This module handles lexical analysis - breaking input into meaningful tokens.',
    content: `#ifndef TOKENIZER_H
#define TOKENIZER_H

#include <stdbool.h>

// Token types
typedef enum {
    TOKEN_NUMBER,
    TOKEN_PLUS,
    TOKEN_MINUS,
    TOKEN_MULTIPLY,
    TOKEN_DIVIDE,
    TOKEN_POWER,
    TOKEN_LPAREN,
    TOKEN_RPAREN,
    TOKEN_SIN,
    TOKEN_COS,
    TOKEN_TAN,
    TOKEN_ASIN,
    TOKEN_ACOS,
    TOKEN_ATAN,
    TOKEN_LOG,
    TOKEN_LN,
    TOKEN_SQRT,
    TOKEN_ABS,
    TOKEN_FACTORIAL,
    TOKEN_PI,
    TOKEN_E,
    TOKEN_EOF,
    TOKEN_ERROR
} TokenType;

// Token structure
typedef struct {
    TokenType type;
    double value;        // For numbers
    char lexeme[64];     // Original text
} Token;

// Tokenizer state
typedef struct {
    const char* input;
    int position;
    int length;
    Token current_token;
} Tokenizer;

// Function declarations
void tokenizer_init(Tokenizer* tokenizer, const char* input);
Token tokenizer_next(Tokenizer* tokenizer);
Token tokenizer_peek(Tokenizer* tokenizer);
const char* token_type_to_string(TokenType type);

#endif // TOKENIZER_H`
  },
  {
    name: 'tokenizer.c',
    language: 'c',
    description: 'Implementation of the tokenizer. Reads characters from input and produces tokens for the parser.',
    content: `#include "tokenizer.h"
#include <stdio.h>
#include <string.h>
#include <ctype.h>
#include <stdlib.h>

// Initialize tokenizer with input string
void tokenizer_init(Tokenizer* tokenizer, const char* input) {
    tokenizer->input = input;
    tokenizer->position = 0;
    tokenizer->length = strlen(input);
    tokenizer->current_token.type = TOKEN_EOF;
    tokenizer->current_token.value = 0;
    tokenizer->current_token.lexeme[0] = '\\0';
}

// Skip whitespace characters
static void skip_whitespace(Tokenizer* tokenizer) {
    while (tokenizer->position < tokenizer->length && 
           isspace(tokenizer->input[tokenizer->position])) {
        tokenizer->position++;
    }
}

// Read a number (integer or decimal)
static Token read_number(Tokenizer* tokenizer) {
    Token token;
    token.type = TOKEN_NUMBER;
    int start = tokenizer->position;
    
    while (tokenizer->position < tokenizer->length && 
           (isdigit(tokenizer->input[tokenizer->position]) || 
            tokenizer->input[tokenizer->position] == '.')) {
        tokenizer->position++;
    }
    
    int len = tokenizer->position - start;
    if (len >= 64) len = 63;
    strncpy(token.lexeme, &tokenizer->input[start], len);
    token.lexeme[len] = '\\0';
    token.value = atof(token.lexeme);
    
    return token;
}

// Read a function name or constant
static Token read_identifier(Tokenizer* tokenizer) {
    Token token;
    int start = tokenizer->position;
    
    while (tokenizer->position < tokenizer->length && 
           isalpha(tokenizer->input[tokenizer->position])) {
        tokenizer->position++;
    }
    
    int len = tokenizer->position - start;
    if (len >= 64) len = 63;
    strncpy(token.lexeme, &tokenizer->input[start], len);
    token.lexeme[len] = '\\0';
    token.value = 0;
    
    // Match function names and constants
    if (strcmp(token.lexeme, "sin") == 0) token.type = TOKEN_SIN;
    else if (strcmp(token.lexeme, "cos") == 0) token.type = TOKEN_COS;
    else if (strcmp(token.lexeme, "tan") == 0) token.type = TOKEN_TAN;
    else if (strcmp(token.lexeme, "log") == 0) token.type = TOKEN_LOG;
    else if (strcmp(token.lexeme, "ln") == 0) token.type = TOKEN_LN;
    else if (strcmp(token.lexeme, "sqrt") == 0) token.type = TOKEN_SQRT;
    else if (strcmp(token.lexeme, "abs") == 0) token.type = TOKEN_ABS;
    else if (strcmp(token.lexeme, "pi") == 0) {
        token.type = TOKEN_PI;
        token.value = 3.14159265358979323846;
    }
    else if (strcmp(token.lexeme, "e") == 0) {
        token.type = TOKEN_E;
        token.value = 2.71828182845904523536;
    }
    else token.type = TOKEN_ERROR;
    
    return token;
}

// Get next token from input
Token tokenizer_next(Tokenizer* tokenizer) {
    skip_whitespace(tokenizer);
    
    if (tokenizer->position >= tokenizer->length) {
        Token token;
        token.type = TOKEN_EOF;
        token.value = 0;
        strcpy(token.lexeme, "EOF");
        tokenizer->current_token = token;
        return token;
    }
    
    char current = tokenizer->input[tokenizer->position];
    Token token;
    
    switch (current) {
        case '+': token.type = TOKEN_PLUS; strcpy(token.lexeme, "+"); break;
        case '-': token.type = TOKEN_MINUS; strcpy(token.lexeme, "-"); break;
        case '*': token.type = TOKEN_MULTIPLY; strcpy(token.lexeme, "*"); break;
        case '/': token.type = TOKEN_DIVIDE; strcpy(token.lexeme, "/"); break;
        case '^': token.type = TOKEN_POWER; strcpy(token.lexeme, "^"); break;
        case '(': token.type = TOKEN_LPAREN; strcpy(token.lexeme, "("); break;
        case ')': token.type = TOKEN_RPAREN; strcpy(token.lexeme, ")"); break;
        case '!': token.type = TOKEN_FACTORIAL; strcpy(token.lexeme, "!"); break;
        default:
            if (isdigit(current) || current == '.') {
                token = read_number(tokenizer);
            } else if (isalpha(current)) {
                token = read_identifier(tokenizer);
            } else {
                token.type = TOKEN_ERROR;
                token.lexeme[0] = current;
                token.lexeme[1] = '\\0';
            }
            tokenizer->position++;
            break;
    }
    
    tokenizer->current_token = token;
    return token;
}

const char* token_type_to_string(TokenType type) {
    switch (type) {
        case TOKEN_NUMBER:    return "NUMBER";
        case TOKEN_PLUS:      return "PLUS";
        case TOKEN_MINUS:     return "MINUS";
        case TOKEN_MULTIPLY:  return "MULTIPLY";
        case TOKEN_DIVIDE:    return "DIVIDE";
        case TOKEN_POWER:     return "POWER";
        case TOKEN_LPAREN:    return "LPAREN";
        case TOKEN_RPAREN:    return "RPAREN";
        case TOKEN_SIN:       return "SIN";
        case TOKEN_COS:       return "COS";
        case TOKEN_TAN:       return "TAN";
        case TOKEN_LOG:       return "LOG";
        case TOKEN_LN:        return "LN";
        case TOKEN_SQRT:      return "SQRT";
        case TOKEN_ABS:       return "ABS";
        case TOKEN_FACTORIAL: return "FACTORIAL";
        case TOKEN_PI:        return "PI";
        case TOKEN_E:         return "E";
        case TOKEN_EOF:       return "EOF";
        case TOKEN_ERROR:     return "ERROR";
        default:              return "UNKNOWN";
    }
}`
  },
  {
    name: 'parser.h',
    language: 'c',
    description: 'Header file defining the AST (Abstract Syntax Tree) node types and parser interface. The parser converts tokens into a tree structure.',
    content: `#ifndef PARSER_H
#define PARSER_H

#include "tokenizer.h"

// AST Node types
typedef enum {
    NODE_NUMBER,
    NODE_BINARY_OP,
    NODE_UNARY_OP,
    NODE_FUNCTION,
    NODE_CONSTANT
} NodeType;

// Binary operator types
typedef enum {
    OP_ADD,
    OP_SUBTRACT,
    OP_MULTIPLY,
    OP_DIVIDE,
    OP_POWER
} BinaryOp;

// Unary operator types
typedef enum {
    OP_NEGATE,
    OP_FACTORIAL
} UnaryOp;

// Function types
typedef enum {
    FUNC_SIN, FUNC_COS, FUNC_TAN,
    FUNC_ASIN, FUNC_ACOS, FUNC_ATAN,
    FUNC_LOG, FUNC_LN, FUNC_SQRT, FUNC_ABS
} FunctionType;

// AST Node structure
typedef struct ASTNode {
    NodeType type;
    union {
        double number_value;
        struct {
            BinaryOp op;
            struct ASTNode* left;
            struct ASTNode* right;
        } binary;
        struct {
            UnaryOp op;
            struct ASTNode* operand;
        } unary;
        struct {
            FunctionType func;
            struct ASTNode* argument;
        } function;
        double constant_value;
    } data;
} ASTNode;

// Parser structure
typedef struct {
    Tokenizer tokenizer;
    Token current_token;
    bool has_error;
    char error_message[256];
} Parser;

// Function declarations
void parser_init(Parser* parser, const char* input);
ASTNode* parse_expression(Parser* parser);
void free_ast(ASTNode* node);
void print_ast(ASTNode* node, int indent);

#endif // PARSER_H`
  },
  {
    name: 'parser.c',
    language: 'c',
    description: 'Recursive descent parser implementation. Builds an AST respecting operator precedence: + - < * / < ^ < unary < primary.',
    content: `#include "parser.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void parser_init(Parser* parser, const char* input) {
    tokenizer_init(&parser->tokenizer, input);
    parser->current_token = tokenizer_next(&parser->tokenizer);
    parser->has_error = false;
    parser->error_message[0] = '\\0';
}

static void parser_error(Parser* parser, const char* message) {
    if (!parser->has_error) {
        parser->has_error = true;
        strncpy(parser->error_message, message, 255);
    }
}

static void advance(Parser* parser) {
    parser->current_token = tokenizer_next(&parser->tokenizer);
}

static bool expect(Parser* parser, TokenType type) {
    if (parser->current_token.type == type) {
        advance(parser);
        return true;
    }
    char msg[256];
    snprintf(msg, sizeof(msg), "Expected %s but got %s", 
             token_type_to_string(type), 
             token_type_to_string(parser->current_token.type));
    parser_error(parser, msg);
    return false;
}

static ASTNode* create_node(NodeType type) {
    ASTNode* node = (ASTNode*)malloc(sizeof(ASTNode));
    if (node == NULL) {
        fprintf(stderr, "Memory allocation failed\\n");
        exit(1);
    }
    node->type = type;
    return node;
}

// Forward declarations
static ASTNode* parse_primary(Parser* parser);
static ASTNode* parse_exponent(Parser* parser);
static ASTNode* parse_term(Parser* parser);
static ASTNode* parse_additive(Parser* parser);

// Parse primary: numbers, constants, functions, parens
static ASTNode* parse_primary(Parser* parser) {
    if (parser->has_error) return NULL;
    ASTNode* node = NULL;
    
    switch (parser->current_token.type) {
        case TOKEN_NUMBER:
            node = create_node(NODE_NUMBER);
            node->data.number_value = parser->current_token.value;
            advance(parser);
            break;
        case TOKEN_PI:
        case TOKEN_E:
            node = create_node(NODE_CONSTANT);
            node->data.constant_value = parser->current_token.value;
            advance(parser);
            break;
        case TOKEN_LPAREN:
            advance(parser);
            node = parse_expression(parser);
            expect(parser, TOKEN_RPAREN);
            break;
        case TOKEN_MINUS:
            advance(parser);
            node = create_node(NODE_UNARY_OP);
            node->data.unary.op = OP_NEGATE;
            node->data.unary.operand = parse_primary(parser);
            break;
        // Functions: sin, cos, tan, etc.
        case TOKEN_SIN: case TOKEN_COS: case TOKEN_TAN:
        case TOKEN_ASIN: case TOKEN_ACOS: case TOKEN_ATAN:
        case TOKEN_LOG: case TOKEN_LN: case TOKEN_SQRT: case TOKEN_ABS: {
            FunctionType func;
            switch (parser->current_token.type) {
                case TOKEN_SIN: func = FUNC_SIN; break;
                case TOKEN_COS: func = FUNC_COS; break;
                case TOKEN_TAN: func = FUNC_TAN; break;
                case TOKEN_ASIN: func = FUNC_ASIN; break;
                case TOKEN_ACOS: func = FUNC_ACOS; break;
                case TOKEN_ATAN: func = FUNC_ATAN; break;
                case TOKEN_LOG: func = FUNC_LOG; break;
                case TOKEN_LN: func = FUNC_LN; break;
                case TOKEN_SQRT: func = FUNC_SQRT; break;
                case TOKEN_ABS: func = FUNC_ABS; break;
                default: func = FUNC_SIN; break;
            }
            advance(parser);
            expect(parser, TOKEN_LPAREN);
            ASTNode* argument = parse_expression(parser);
            expect(parser, TOKEN_RPAREN);
            node = create_node(NODE_FUNCTION);
            node->data.function.func = func;
            node->data.function.argument = argument;
            break;
        }
        default:
            parser_error(parser, "Unexpected token");
            return NULL;
    }
    
    // Handle postfix factorial
    if (node && parser->current_token.type == TOKEN_FACTORIAL) {
        advance(parser);
        ASTNode* fact = create_node(NODE_UNARY_OP);
        fact->data.unary.op = OP_FACTORIAL;
        fact->data.unary.operand = node;
        node = fact;
    }
    
    return node;
}

// Parse exponentiation (right-associative)
static ASTNode* parse_exponent(Parser* parser) {
    ASTNode* left = parse_primary(parser);
    if (!left || parser->has_error) return left;
    
    if (parser->current_token.type == TOKEN_POWER) {
        advance(parser);
        ASTNode* right = parse_exponent(parser);
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = OP_POWER;
        node->data.binary.left = left;
        node->data.binary.right = right;
        return node;
    }
    return left;
}

// Parse * and /
static ASTNode* parse_term(Parser* parser) {
    ASTNode* left = parse_exponent(parser);
    if (!left || parser->has_error) return left;
    
    while (parser->current_token.type == TOKEN_MULTIPLY ||
           parser->current_token.type == TOKEN_DIVIDE) {
        BinaryOp op = parser->current_token.type == TOKEN_MULTIPLY 
                      ? OP_MULTIPLY : OP_DIVIDE;
        advance(parser);
        ASTNode* right = parse_exponent(parser);
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = op;
        node->data.binary.left = left;
        node->data.binary.right = right;
        left = node;
    }
    return left;
}

// Parse + and -
static ASTNode* parse_additive(Parser* parser) {
    ASTNode* left = parse_term(parser);
    if (!left || parser->has_error) return left;
    
    while (parser->current_token.type == TOKEN_PLUS ||
           parser->current_token.type == TOKEN_MINUS) {
        BinaryOp op = parser->current_token.type == TOKEN_PLUS 
                      ? OP_ADD : OP_SUBTRACT;
        advance(parser);
        ASTNode* right = parse_term(parser);
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = op;
        node->data.binary.left = left;
        node->data.binary.right = right;
        left = node;
    }
    return left;
}

ASTNode* parse_expression(Parser* parser) {
    return parse_additive(parser);
}

void free_ast(ASTNode* node) {
    if (!node) return;
    switch (node->type) {
        case NODE_BINARY_OP:
            free_ast(node->data.binary.left);
            free_ast(node->data.binary.right);
            break;
        case NODE_UNARY_OP:
            free_ast(node->data.unary.operand);
            break;
        case NODE_FUNCTION:
            free_ast(node->data.function.argument);
            break;
        default:
            break;
    }
    free(node);
}`
  },
  {
    name: 'evaluator.h',
    language: 'c',
    description: 'Header file for the evaluator module. Defines the result structure and evaluation function interface.',
    content: `#ifndef EVALUATOR_H
#define EVALUATOR_H

#include "parser.h"
#include <stdbool.h>

// Evaluation result
typedef struct {
    double value;
    bool is_error;
    char error_message[256];
} EvalResult;

// Function declarations
EvalResult evaluate(ASTNode* node);
double compute_factorial(int n);
const char* get_error_message(void);

#endif // EVALUATOR_H`
  },
  {
    name: 'evaluator.c',
    language: 'c',
    description: 'AST evaluator implementation. Recursively walks the tree computing values, with error handling for domain errors and overflow.',
    content: `#include "evaluator.h"
#include <math.h>
#include <stdio.h>
#include <float.h>

static char g_error_message[256] = "";

static EvalResult make_error(const char* message) {
    EvalResult result;
    result.value = 0;
    result.is_error = true;
    strncpy(result.error_message, message, 255);
    strncpy(g_error_message, message, 255);
    return result;
}

static EvalResult make_result(double value) {
    EvalResult result;
    result.value = value;
    result.is_error = false;
    result.error_message[0] = '\\0';
    return result;
}

double compute_factorial(int n) {
    if (n < 0) return NAN;
    if (n > 170) return INFINITY;
    if (n <= 1) return 1;
    double result = 1;
    for (int i = 2; i <= n; i++) result *= i;
    return result;
}

EvalResult evaluate(ASTNode* node) {
    if (node == NULL) return make_error("NULL node");
    
    switch (node->type) {
        case NODE_NUMBER:
            return make_result(node->data.number_value);
        case NODE_CONSTANT:
            return make_result(node->data.constant_value);
        case NODE_BINARY_OP: {
            EvalResult left = evaluate(node->data.binary.left);
            if (left.is_error) return left;
            EvalResult right = evaluate(node->data.binary.right);
            if (right.is_error) return right;
            
            double result;
            switch (node->data.binary.op) {
                case OP_ADD:      result = left.value + right.value; break;
                case OP_SUBTRACT: result = left.value - right.value; break;
                case OP_MULTIPLY: result = left.value * right.value; break;
                case OP_DIVIDE:
                    if (fabs(right.value) < DBL_EPSILON)
                        return make_error("Division by zero");
                    result = left.value / right.value;
                    break;
                case OP_POWER:
                    result = pow(left.value, right.value);
                    break;
                default:
                    return make_error("Unknown operator");
            }
            if (isinf(result)) return make_error("Overflow");
            if (isnan(result)) return make_error("Undefined (NaN)");
            return make_result(result);
        }
        case NODE_UNARY_OP: {
            EvalResult operand = evaluate(node->data.unary.operand);
            if (operand.is_error) return operand;
            if (node->data.unary.op == OP_NEGATE)
                return make_result(-operand.value);
            if (node->data.unary.op == OP_FACTORIAL) {
                if (operand.value < 0 || floor(operand.value) != operand.value)
                    return make_error("Factorial needs non-negative integer");
                return make_result(compute_factorial((int)operand.value));
            }
            return make_error("Unknown unary op");
        }
        case NODE_FUNCTION: {
            EvalResult arg = evaluate(node->data.function.argument);
            if (arg.is_error) return arg;
            double result;
            switch (node->data.function.func) {
                case FUNC_SIN:  result = sin(arg.value); break;
                case FUNC_COS:  result = cos(arg.value); break;
                case FUNC_TAN:  result = tan(arg.value); break;
                case FUNC_ASIN:
                    if (arg.value < -1 || arg.value > 1)
                        return make_error("asin: domain [-1,1]");
                    result = asin(arg.value); break;
                case FUNC_ACOS:
                    if (arg.value < -1 || arg.value > 1)
                        return make_error("acos: domain [-1,1]");
                    result = acos(arg.value); break;
                case FUNC_ATAN: result = atan(arg.value); break;
                case FUNC_LOG:
                    if (arg.value <= 0)
                        return make_error("log: need positive");
                    result = log10(arg.value); break;
                case FUNC_LN:
                    if (arg.value <= 0)
                        return make_error("ln: need positive");
                    result = log(arg.value); break;
                case FUNC_SQRT:
                    if (arg.value < 0)
                        return make_error("sqrt: need non-negative");
                    result = sqrt(arg.value); break;
                case FUNC_ABS:  result = fabs(arg.value); break;
                default: return make_error("Unknown function");
            }
            return make_result(result);
        }
        default:
            return make_error("Unknown node type");
    }
}

const char* get_error_message(void) {
    return g_error_message;
}`
  },
  {
    name: 'main.c',
    language: 'c',
    description: 'Main entry point with REPL, bracket matching visualization with ANSI colors, and coordination of all modules. Shows real-time bracket status with color coding.',
    content: `#include <stdio.h>
#include <string.h>
#include "tokenizer.h"
#include "parser.h"
#include "evaluator.h"

#define MAX_INPUT 1024

/* ─── Bracket Analysis ─────────────────────────────────────── */
typedef struct {
    int open_count;
    int close_count;
    int unclosed;       /* '(' that need ')' */
    int extra_close;    /* ')' with no matching '(' */
    int is_balanced;
} BracketInfo;

BracketInfo analyze_brackets(const char* expr) {
    BracketInfo info = {0, 0, 0, 0, 0};
    int stack[256];
    int top = -1;
    
    for (int i = 0; expr[i] != '\\0'; i++) {
        if (expr[i] == '(') {
            info.open_count++;
            if (top < 255) stack[++top] = i;
        } else if (expr[i] == ')') {
            info.close_count++;
            if (top >= 0) {
                top--; /* matched */
            } else {
                info.extra_close++;
            }
        }
    }
    
    info.unclosed = top + 1;
    info.is_balanced = (info.unclosed == 0 && info.extra_close == 0);
    return info;
}

/* Print bracket status with ANSI colors */
void print_bracket_status(const char* expr) {
    BracketInfo info = analyze_brackets(expr);
    if (info.open_count == 0 && info.close_count == 0) return;
    
    printf("  \\033[90m─── Bracket Status ───\\033[0m\\n");
    printf("  \\033[90m(\\033[0m opened: \\033[%sm%d\\033[0m", 
           info.unclosed > 0 ? "91" : "92", info.open_count);
    printf("  |  \\033[90m)\\033[0m closed: \\033[%sm%d\\033[0m",
           info.extra_close > 0 ? "93" : "92", info.close_count);
    
    if (info.is_balanced) {
        printf("  |  \\033[92m✓ Balanced\\033[0m\\n");
    } else if (info.unclosed > 0) {
        printf("  |  \\033[91m⚠ Need %d more ')'\\033[0m\\n", info.unclosed);
        /* Visual stack indicator */
        printf("  \\033[91m");
        for (int i = 0; i < info.unclosed && i < 20; i++) {
            printf("▌");
        }
        printf("\\033[0m\\n");
    } else {
        printf("  |  \\033[93m⚠ %d extra ')'\\033[0m\\n", info.extra_close);
    }
    printf("  \\033[90m─────────────────────\\033[0m\\n");
}

/* Print expression with colored brackets */
void print_colored_expression(const char* expr) {
    int stack[256], top = -1;
    int matched_open[1024] = {0};
    int matched_close[1024] = {0};
    int len = strlen(expr);
    
    /* First pass: find matched pairs */
    for (int i = 0; i < len; i++) {
        if (expr[i] == '(') {
            if (top < 255) stack[++top] = i;
        } else if (expr[i] == ')') {
            if (top >= 0) {
                matched_open[stack[top--]] = 1;
                matched_close[i] = 1;
            }
        }
    }
    
    /* Second pass: print with colors */
    printf("  ");
    for (int i = 0; i < len; i++) {
        if (expr[i] == '(' || expr[i] == ')') {
            if (matched_open[i] || matched_close[i])
                printf("\\033[92m%c\\033[0m", expr[i]); /* green = matched */
            else if (expr[i] == '(')
                printf("\\033[91m%c\\033[0m", expr[i]); /* red = unclosed */
            else
                printf("\\033[93m%c\\033[0m", expr[i]); /* orange = extra */
        } else {
            printf("%c", expr[i]);
        }
    }
    printf("\\n");
}

/* ─── Help ─────────────────────────────────────────────────── */
void print_help(void) {
    printf("\\n");
    printf("\\033[96m╔══════════════════════════════════════════════════╗\\033[0m\\n");
    printf("\\033[96m║\\033[0m     \\033[1mScientific Calculator - Help\\033[0m               \\033[96m║\\033[0m\\n");
    printf("\\033[96m╠══════════════════════════════════════════════════╣\\033[0m\\n");
    printf("\\033[96m║\\033[0m  Operators: + - * / ^ !                    \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m  Functions: sin cos tan asin acos atan     \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m             log ln sqrt abs                \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m  Constants: pi  e                          \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m                                              \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m  \\033[92mBracket Colors:\\033[0m                                 \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m    \\033[92m( )\\033[0m = Matched/Balanced                      \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m    \\033[91m(\\033[0m   = Unclosed (needs closing)              \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m    \\033[93m)\\033[0m   = Extra (no matching open)              \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m                                              \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m  Commands: help tokens ast quit              \\033[96m║\\033[0m\\n");
    printf("\\033[96m╚══════════════════════════════════════════════════╝\\033[0m\\n");
    printf("\\n");
}

/* ─── Main ─────────────────────────────────────────────────── */
int main(void) {
    char input[MAX_INPUT];
    char last_input[MAX_INPUT] = "";
    
    printf("\\n");
    printf("\\033[96m╔══════════════════════════════════════════════════╗\\033[0m\\n");
    printf("\\033[96m║\\033[0m     \\033[1mScientific Calculator (C Language)\\033[0m           \\033[96m║\\033[0m\\n");
    printf("\\033[96m║\\033[0m     Tokenizer → Parser → AST → Evaluator     \\033[96m║\\033[0m\\n");
    printf("\\033[96m╚══════════════════════════════════════════════════╝\\033[0m\\n");
    printf("Type 'help' for commands, 'quit' to exit.\\n\\n");
    
    while (1) {
        printf("\\033[92mcalc>\\033[0m ");
        if (fgets(input, MAX_INPUT, stdin) == NULL) break;
        
        size_t len = strlen(input);
        if (len > 0 && input[len-1] == '\\n') input[--len] = '\\0';
        if (len == 0) continue;
        
        if (strcmp(input, "quit") == 0) { printf("Goodbye!\\n"); break; }
        if (strcmp(input, "help") == 0) { print_help(); continue; }
        if (strcmp(input, "tokens") == 0) {
            if (strlen(last_input)) show_tokens(last_input);
            else printf("  No previous expression.\\n\\n");
            continue;
        }
        if (strcmp(input, "ast") == 0) {
            if (strlen(last_input)) show_ast(last_input);
            else printf("  No previous expression.\\n\\n");
            continue;
        }
        
        strncpy(last_input, input, MAX_INPUT - 1);
        
        /* Show colored expression and bracket status */
        print_colored_expression(input);
        print_bracket_status(input);
        
        /* Check bracket balance */
        BracketInfo binfo = analyze_brackets(input);
        if (!binfo.is_balanced) {
            if (binfo.unclosed > 0)
                printf("  \\033[91mError: Missing %d closing bracket%s\\033[0m\\n\\n",
                       binfo.unclosed, binfo.unclosed > 1 ? "s" : "");
            else
                printf("  \\033[93mError: %d extra closing bracket%s\\033[0m\\n\\n",
                       binfo.extra_close, binfo.extra_close > 1 ? "s" : "");
            continue;
        }
        
        /* Parse and evaluate */
        Parser parser;
        parser_init(&parser, input);
        ASTNode* ast = parse_expression(&parser);
        
        if (parser.has_error) {
            printf("  \\033[91mParse error: %s\\033[0m\\n\\n", parser.error_message);
            free_ast(ast);
            continue;
        }
        if (parser.current_token.type != TOKEN_EOF) {
            printf("  \\033[91mUnexpected '%s'\\033[0m\\n\\n", parser.current_token.lexeme);
            free_ast(ast);
            continue;
        }
        
        EvalResult result = evaluate(ast);
        free_ast(ast);
        
        if (result.is_error) {
            printf("  \\033[91mError: %s\\033[0m\\n\\n", result.error_message);
        } else {
            if (result.value == (int)result.value && fabs(result.value) < 1e15)
                printf("  \\033[92m= %d\\033[0m\\n\\n", (int)result.value);
            else
                printf("  \\033[92m= %.10g\\033[0m\\n\\n", result.value);
        }
    }
    return 0;
}`
  },
  {
    name: 'Makefile',
    language: 'makefile',
    description: 'Build system for compiling all C source files into the calculator executable.',
    content: `# Scientific Calculator - Makefile
CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -g
LDFLAGS = -lm

SRCS = main.c tokenizer.c parser.c evaluator.c
OBJS = $(SRCS:.c=.o)
TARGET = calculator

all: $(TARGET)

$(TARGET): $(OBJS)
\t$(CC) $(CFLAGS) -o $@ $^ $(LDFLAGS)

%.o: %.c
\t$(CC) $(CFLAGS) -c $< -o $@

clean:
\trm -f $(OBJS) $(TARGET)

run: $(TARGET)
\t./$(TARGET)

.PHONY: all clean run`
  }
];

export default function SourceViewer() {
  const [selectedFile, setSelectedFile] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceFiles[selectedFile].content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      {/* File tabs */}
      <div className="flex flex-wrap gap-1 mb-4 bg-gray-900 rounded-lg p-2 border border-gray-700">
        {sourceFiles.map((file, i) => (
          <button
            key={file.name}
            onClick={() => setSelectedFile(i)}
            className={`px-3 py-2 rounded-md text-xs font-mono transition-all ${
              selectedFile === i
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* File description */}
      <div className="bg-gray-800 rounded-lg p-3 mb-3 border border-gray-700">
        <p className="text-gray-300 text-sm">
          <span className="text-indigo-400 font-semibold">{sourceFiles[selectedFile].name}</span>
          {' — '}{sourceFiles[selectedFile].description}
        </p>
      </div>

      {/* Code display */}
      <div className="relative rounded-lg overflow-hidden border border-gray-700">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 z-10 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs px-3 py-1 rounded transition-colors"
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
        <SyntaxHighlighter
          language={sourceFiles[selectedFile].language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0.5rem',
            fontSize: '0.8rem',
            maxHeight: '500px',
            padding: '1rem',
          }}
          showLineNumbers
          lineNumberStyle={{ color: '#4a5568', minWidth: '2.5em' }}
        >
          {sourceFiles[selectedFile].content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
