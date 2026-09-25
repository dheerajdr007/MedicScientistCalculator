#ifndef TOKENIZER_H
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

#endif // TOKENIZER_H
