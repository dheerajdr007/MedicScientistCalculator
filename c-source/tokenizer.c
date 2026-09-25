#include "tokenizer.h"
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
    tokenizer->current_token.lexeme[0] = '\0';
}

// Skip whitespace characters
static void skip_whitespace(Tokenizer* tokenizer) {
    while (tokenizer->position < tokenizer->length && 
           isspace(tokenizer->input[tokenizer->position])) {
        tokenizer->position++;
    }
}

// Check if current position starts a function name
static bool is_function_start(char c) {
    return isalpha(c);
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
    token.lexeme[len] = '\0';
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
    token.lexeme[len] = '\0';
    token.value = 0;
    
    // Match function names and constants
    if (strcmp(token.lexeme, "sin") == 0) {
        token.type = TOKEN_SIN;
    } else if (strcmp(token.lexeme, "cos") == 0) {
        token.type = TOKEN_COS;
    } else if (strcmp(token.lexeme, "tan") == 0) {
        token.type = TOKEN_TAN;
    } else if (strcmp(token.lexeme, "asin") == 0) {
        token.type = TOKEN_ASIN;
    } else if (strcmp(token.lexeme, "acos") == 0) {
        token.type = TOKEN_ACOS;
    } else if (strcmp(token.lexeme, "atan") == 0) {
        token.type = TOKEN_ATAN;
    } else if (strcmp(token.lexeme, "log") == 0) {
        token.type = TOKEN_LOG;
    } else if (strcmp(token.lexeme, "ln") == 0) {
        token.type = TOKEN_LN;
    } else if (strcmp(token.lexeme, "sqrt") == 0) {
        token.type = TOKEN_SQRT;
    } else if (strcmp(token.lexeme, "abs") == 0) {
        token.type = TOKEN_ABS;
    } else if (strcmp(token.lexeme, "pi") == 0) {
        token.type = TOKEN_PI;
        token.value = 3.14159265358979323846;
    } else if (strcmp(token.lexeme, "e") == 0) {
        token.type = TOKEN_E;
        token.value = 2.71828182845904523536;
    } else {
        token.type = TOKEN_ERROR;
    }
    
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
        case '+':
            token.type = TOKEN_PLUS;
            token.value = 0;
            strcpy(token.lexeme, "+");
            tokenizer->position++;
            break;
        case '-':
            token.type = TOKEN_MINUS;
            token.value = 0;
            strcpy(token.lexeme, "-");
            tokenizer->position++;
            break;
        case '*':
            token.type = TOKEN_MULTIPLY;
            token.value = 0;
            strcpy(token.lexeme, "*");
            tokenizer->position++;
            break;
        case '/':
            token.type = TOKEN_DIVIDE;
            token.value = 0;
            strcpy(token.lexeme, "/");
            tokenizer->position++;
            break;
        case '^':
            token.type = TOKEN_POWER;
            token.value = 0;
            strcpy(token.lexeme, "^");
            tokenizer->position++;
            break;
        case '(':
            token.type = TOKEN_LPAREN;
            token.value = 0;
            strcpy(token.lexeme, "(");
            tokenizer->position++;
            break;
        case ')':
            token.type = TOKEN_RPAREN;
            token.value = 0;
            strcpy(token.lexeme, ")");
            tokenizer->position++;
            break;
        case '!':
            token.type = TOKEN_FACTORIAL;
            token.value = 0;
            strcpy(token.lexeme, "!");
            tokenizer->position++;
            break;
        default:
            if (isdigit(current) || current == '.') {
                token = read_number(tokenizer);
            } else if (is_function_start(current)) {
                token = read_identifier(tokenizer);
            } else {
                token.type = TOKEN_ERROR;
                token.value = 0;
                token.lexeme[0] = current;
                token.lexeme[1] = '\0';
                tokenizer->position++;
            }
            break;
    }
    
    tokenizer->current_token = token;
    return token;
}

// Peek at next token without consuming it
Token tokenizer_peek(Tokenizer* tokenizer) {
    int saved_position = tokenizer->position;
    Token saved_token = tokenizer->current_token;
    
    Token next = tokenizer_next(tokenizer);
    
    tokenizer->position = saved_position;
    tokenizer->current_token = saved_token;
    
    return next;
}

// Convert token type to string representation
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
        case TOKEN_ASIN:      return "ASIN";
        case TOKEN_ACOS:      return "ACOS";
        case TOKEN_ATAN:      return "ATAN";
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
}
