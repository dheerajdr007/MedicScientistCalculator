#include <stdio.h>
#include <string.h>
#include "tokenizer.h"
#include "parser.h"
#include "evaluator.h"

#define MAX_INPUT 1024

// Print usage/help
void print_help(void) {
    printf("\n");
    printf("╔══════════════════════════════════════════════════════════╗\n");
    printf("║           Scientific Calculator - Help                   ║\n");
    printf("╠══════════════════════════════════════════════════════════╣\n");
    printf("║  Operators:  + - * / ^ (power) ! (factorial)            ║\n");
    printf("║  Functions:  sin cos tan asin acos atan                  ║\n");
    printf("║              log (base 10)  ln (natural)                 ║\n");
    printf("║              sqrt abs                                    ║\n");
    printf("║  Constants:  pi  e                                       ║\n");
    printf("║  Parentheses: ( )                                        ║\n");
    printf("║                                                          ║\n");
    printf("║  Examples:                                               ║\n");
    printf("║    2 + 3 * 4          -> 14                             ║\n");
    printf("║    sin(pi/2)          -> 1                              ║\n");
    printf("║    sqrt(16) + 2^3     -> 12                             ║\n");
    printf("║    log(100)           -> 2                              ║\n");
    printf("║    5!                 -> 120                            ║\n");
    printf("║    cos(pi) + 1        -> 0                              ║\n");
    printf("║                                                          ║\n");
    printf("║  Commands:                                               ║\n");
    printf("║    help   - Show this help                              ║\n");
    printf("║    tokens - Show tokenization of last expression        ║\n");
    printf("║    ast    - Show AST of last expression                 ║\n");
    printf("║    quit   - Exit the calculator                         ║\n");
    printf("╚══════════════════════════════════════════════════════════╝\n");
    printf("\n");
}

// Show tokenization of an expression
void show_tokens(const char* input) {
    printf("\n--- Tokenization ---\n");
    Tokenizer tokenizer;
    tokenizer_init(&tokenizer, input);
    
    Token token;
    int i = 0;
    do {
        token = tokenizer_next(&tokenizer);
        printf("  Token[%d]: type=%-10s  lexeme='%s'  value=%.6f\n", 
               i++, token_type_to_string(token.type), token.lexeme, token.value);
    } while (token.type != TOKEN_EOF && token.type != TOKEN_ERROR);
    
    printf("--------------------\n\n");
}

// Show AST of an expression
void show_ast(const char* input) {
    printf("\n--- Abstract Syntax Tree ---\n");
    Parser parser;
    parser_init(&parser, input);
    ASTNode* ast = parse_expression(&parser);
    
    if (parser.has_error) {
        printf("  Parse error: %s\n", parser.error_message);
    } else {
        print_ast(ast, 1);
    }
    
    free_ast(ast);
    printf("--------------------------\n\n");
}

// Evaluate an expression and return result
double evaluate_expression(const char* input, bool* success) {
    Parser parser;
    parser_init(&parser, input);
    
    ASTNode* ast = parse_expression(&parser);
    
    if (parser.has_error) {
        printf("  Parse error: %s\n", parser.error_message);
        *success = false;
        free_ast(ast);
        return 0;
    }
    
    // Check if we consumed all tokens
    if (parser.current_token.type != TOKEN_EOF) {
        printf("  Parse error: Unexpected token '%s' after expression\n", 
               parser.current_token.lexeme);
        *success = false;
        free_ast(ast);
        return 0;
    }
    
    EvalResult result = evaluate(ast);
    free_ast(ast);
    
    if (result.is_error) {
        printf("  Evaluation error: %s\n", result.error_message);
        *success = false;
        return 0;
    }
    
    *success = true;
    return result.value;
}

int main(void) {
    char input[MAX_INPUT];
    char last_input[MAX_INPUT] = "";
    
    printf("\n");
    printf("╔══════════════════════════════════════════════════╗\n");
    printf("║     Scientific Calculator (C Language)           ║\n");
    printf("║     Architecture: Tokenizer -> Parser -> AST     ║\n");
    printf("║                  -> Evaluator -> Result           ║\n");
    printf("╚══════════════════════════════════════════════════╝\n");
    printf("\n");
    printf("Type 'help' for available functions and operators.\n");
    printf("Type 'quit' to exit.\n\n");
    
    while (1) {
        printf("calc> ");
        
        if (fgets(input, MAX_INPUT, stdin) == NULL) {
            break;
        }
        
        // Remove trailing newline
        size_t len = strlen(input);
        if (len > 0 && input[len - 1] == '\n') {
            input[len - 1] = '\0';
            len--;
        }
        
        // Skip empty input
        if (len == 0) continue;
        
        // Handle commands
        if (strcmp(input, "quit") == 0 || strcmp(input, "exit") == 0) {
            printf("Goodbye!\n");
            break;
        }
        
        if (strcmp(input, "help") == 0) {
            print_help();
            continue;
        }
        
        if (strcmp(input, "tokens") == 0) {
            if (strlen(last_input) > 0) {
                show_tokens(last_input);
            } else {
                printf("  No previous expression to tokenize.\n\n");
            }
            continue;
        }
        
        if (strcmp(input, "ast") == 0) {
            if (strlen(last_input) > 0) {
                show_ast(last_input);
            } else {
                printf("  No previous expression to parse.\n\n");
            }
            continue;
        }
        
        // Save input for tokens/ast commands
        strncpy(last_input, input, MAX_INPUT - 1);
        last_input[MAX_INPUT - 1] = '\0';
        
        // Evaluate expression
        bool success;
        double result = evaluate_expression(input, &success);
        
        if (success) {
            // Print result with appropriate precision
            if (result == (int)result && fabs(result) < 1e15) {
                printf("  = %d\n\n", (int)result);
            } else {
                printf("  = %.10g\n\n", result);
            }
        } else {
            printf("\n");
        }
    }
    
    return 0;
}
