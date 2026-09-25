#include "parser.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Initialize parser with input string
void parser_init(Parser* parser, const char* input) {
    tokenizer_init(&parser->tokenizer, input);
    parser->current_token = tokenizer_next(&parser->tokenizer);
    parser->has_error = false;
    parser->error_message[0] = '\0';
}

// Set parser error
static void parser_error(Parser* parser, const char* message) {
    if (!parser->has_error) {
        parser->has_error = true;
        strncpy(parser->error_message, message, 255);
        parser->error_message[255] = '\0';
    }
}

// Advance to next token
static void advance(Parser* parser) {
    parser->current_token = tokenizer_next(&parser->tokenizer);
}

// Expect a specific token type
static bool expect(Parser* parser, TokenType type) {
    if (parser->current_token.type == type) {
        advance(parser);
        return true;
    }
    char msg[256];
    snprintf(msg, sizeof(msg), "Expected %s but got %s", 
             token_type_to_string(type), token_type_to_string(parser->current_token.type));
    parser_error(parser, msg);
    return false;
}

// Create a new AST node
static ASTNode* create_node(NodeType type) {
    ASTNode* node = (ASTNode*)malloc(sizeof(ASTNode));
    if (node == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }
    node->type = type;
    return node;
}

// Forward declarations for recursive descent
static ASTNode* parse_primary(Parser* parser);
static ASTNode* parse_exponent(Parser* parser);
static ASTNode* parse_term(Parser* parser);
static ASTNode* parse_additive(Parser* parser);

// Parse primary expressions (numbers, constants, functions, parenthesized expressions)
static ASTNode* parse_primary(Parser* parser) {
    if (parser->has_error) return NULL;
    
    ASTNode* node = NULL;
    
    switch (parser->current_token.type) {
        case TOKEN_NUMBER: {
            node = create_node(NODE_NUMBER);
            node->data.number_value = parser->current_token.value;
            advance(parser);
            break;
        }
        
        case TOKEN_PI: {
            node = create_node(NODE_CONSTANT);
            node->data.constant_value = parser->current_token.value;
            advance(parser);
            break;
        }
        
        case TOKEN_E: {
            node = create_node(NODE_CONSTANT);
            node->data.constant_value = parser->current_token.value;
            advance(parser);
            break;
        }
        
        case TOKEN_LPAREN: {
            advance(parser); // consume '('
            node = parse_expression(parser);
            if (!expect(parser, TOKEN_RPAREN)) {
                free_ast(node);
                return NULL;
            }
            break;
        }
        
        case TOKEN_MINUS: {
            // Unary minus
            advance(parser);
            ASTNode* operand = parse_primary(parser);
            if (operand == NULL) return NULL;
            node = create_node(NODE_UNARY_OP);
            node->data.unary.op = OP_NEGATE;
            node->data.unary.operand = operand;
            break;
        }
        
        case TOKEN_PLUS: {
            // Unary plus (just skip it)
            advance(parser);
            node = parse_primary(parser);
            break;
        }
        
        // Functions
        case TOKEN_SIN:
        case TOKEN_COS:
        case TOKEN_TAN:
        case TOKEN_ASIN:
        case TOKEN_ACOS:
        case TOKEN_ATAN:
        case TOKEN_LOG:
        case TOKEN_LN:
        case TOKEN_SQRT:
        case TOKEN_ABS: {
            FunctionType func;
            switch (parser->current_token.type) {
                case TOKEN_SIN:  func = FUNC_SIN;  break;
                case TOKEN_COS:  func = FUNC_COS;  break;
                case TOKEN_TAN:  func = FUNC_TAN;  break;
                case TOKEN_ASIN: func = FUNC_ASIN; break;
                case TOKEN_ACOS: func = FUNC_ACOS; break;
                case TOKEN_ATAN: func = FUNC_ATAN; break;
                case TOKEN_LOG:  func = FUNC_LOG;  break;
                case TOKEN_LN:   func = FUNC_LN;   break;
                case TOKEN_SQRT: func = FUNC_SQRT; break;
                case TOKEN_ABS:  func = FUNC_ABS;  break;
                default:         func = FUNC_SIN;  break;
            }
            advance(parser); // consume function name
            
            if (!expect(parser, TOKEN_LPAREN)) {
                return NULL;
            }
            
            ASTNode* argument = parse_expression(parser);
            if (argument == NULL) return NULL;
            
            if (!expect(parser, TOKEN_RPAREN)) {
                free_ast(argument);
                return NULL;
            }
            
            node = create_node(NODE_FUNCTION);
            node->data.function.func = func;
            node->data.function.argument = argument;
            break;
        }
        
        default: {
            char msg[256];
            snprintf(msg, sizeof(msg), "Unexpected token: %s ('%s')", 
                     token_type_to_string(parser->current_token.type),
                     parser->current_token.lexeme);
            parser_error(parser, msg);
            return NULL;
        }
    }
    
    // Check for postfix factorial
    if (node != NULL && parser->current_token.type == TOKEN_FACTORIAL) {
        advance(parser);
        ASTNode* factorial_node = create_node(NODE_UNARY_OP);
        factorial_node->data.unary.op = OP_FACTORIAL;
        factorial_node->data.unary.operand = node;
        node = factorial_node;
    }
    
    return node;
}

// Parse exponentiation (right-associative)
static ASTNode* parse_exponent(Parser* parser) {
    ASTNode* left = parse_primary(parser);
    if (left == NULL || parser->has_error) return left;
    
    if (parser->current_token.type == TOKEN_POWER) {
        advance(parser);
        ASTNode* right = parse_exponent(parser); // Right-associative recursion
        if (right == NULL) {
            free_ast(left);
            return NULL;
        }
        
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = OP_POWER;
        node->data.binary.left = left;
        node->data.binary.right = right;
        return node;
    }
    
    return left;
}

// Parse multiplication and division
static ASTNode* parse_term(Parser* parser) {
    ASTNode* left = parse_exponent(parser);
    if (left == NULL || parser->has_error) return left;
    
    while (parser->current_token.type == TOKEN_MULTIPLY || 
           parser->current_token.type == TOKEN_DIVIDE) {
        BinaryOp op;
        if (parser->current_token.type == TOKEN_MULTIPLY) {
            op = OP_MULTIPLY;
        } else {
            op = OP_DIVIDE;
        }
        advance(parser);
        
        ASTNode* right = parse_exponent(parser);
        if (right == NULL) {
            free_ast(left);
            return NULL;
        }
        
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = op;
        node->data.binary.left = left;
        node->data.binary.right = right;
        left = node;
    }
    
    return left;
}

// Parse addition and subtraction
static ASTNode* parse_additive(Parser* parser) {
    ASTNode* left = parse_term(parser);
    if (left == NULL || parser->has_error) return left;
    
    while (parser->current_token.type == TOKEN_PLUS || 
           parser->current_token.type == TOKEN_MINUS) {
        BinaryOp op;
        if (parser->current_token.type == TOKEN_PLUS) {
            op = OP_ADD;
        } else {
            op = OP_SUBTRACT;
        }
        advance(parser);
        
        ASTNode* right = parse_term(parser);
        if (right == NULL) {
            free_ast(left);
            return NULL;
        }
        
        ASTNode* node = create_node(NODE_BINARY_OP);
        node->data.binary.op = op;
        node->data.binary.left = left;
        node->data.binary.right = right;
        left = node;
    }
    
    return left;
}

// Main entry point for parsing
ASTNode* parse_expression(Parser* parser) {
    return parse_additive(parser);
}

// Free AST memory
void free_ast(ASTNode* node) {
    if (node == NULL) return;
    
    switch (node->type) {
        case NODE_NUMBER:
        case NODE_CONSTANT:
            break;
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
    }
    
    free(node);
}

// Print AST for debugging
void print_ast(ASTNode* node, int indent) {
    if (node == NULL) return;
    
    for (int i = 0; i < indent; i++) printf("  ");
    
    switch (node->type) {
        case NODE_NUMBER:
            printf("Number: %.6f\n", node->data.number_value);
            break;
        case NODE_CONSTANT:
            printf("Constant: %.6f\n", node->data.constant_value);
            break;
        case NODE_BINARY_OP: {
            const char* ops[] = {"+", "-", "*", "/", "^"};
            printf("BinaryOp: %s\n", ops[node->data.binary.op]);
            print_ast(node->data.binary.left, indent + 1);
            print_ast(node->data.binary.right, indent + 1);
            break;
        }
        case NODE_UNARY_OP: {
            if (node->data.unary.op == OP_NEGATE) {
                printf("UnaryOp: -\n");
            } else {
                printf("UnaryOp: !\n");
            }
            print_ast(node->data.unary.operand, indent + 1);
            break;
        }
        case NODE_FUNCTION: {
            const char* funcs[] = {"sin", "cos", "tan", "asin", "acos", "atan", "log", "ln", "sqrt", "abs"};
            printf("Function: %s\n", funcs[node->data.function.func]);
            print_ast(node->data.function.argument, indent + 1);
            break;
        }
    }
}
