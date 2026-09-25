#ifndef PARSER_H
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
    FUNC_SIN,
    FUNC_COS,
    FUNC_TAN,
    FUNC_ASIN,
    FUNC_ACOS,
    FUNC_ATAN,
    FUNC_LOG,
    FUNC_LN,
    FUNC_SQRT,
    FUNC_ABS
} FunctionType;

// AST Node structure
typedef struct ASTNode {
    NodeType type;
    
    // Union to hold different node data
    union {
        // For NODE_NUMBER
        double number_value;
        
        // For NODE_BINARY_OP
        struct {
            BinaryOp op;
            struct ASTNode* left;
            struct ASTNode* right;
        } binary;
        
        // For NODE_UNARY_OP
        struct {
            UnaryOp op;
            struct ASTNode* operand;
        } unary;
        
        // For NODE_FUNCTION
        struct {
            FunctionType func;
            struct ASTNode* argument;
        } function;
        
        // For NODE_CONSTANT
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

#endif // PARSER_H
