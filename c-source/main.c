#include <stdio.h>
#include <string.h>
#include "tokenizer.h"
#include "parser.h"
#include "evaluator.h"

#define MAX_INPUT 1024

/* ─── Bracket Analysis ─────────────────────────────────────────── */
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
    
    for (int i = 0; expr[i] != '\0'; i++) {
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

/* Print bracket status with colors (ANSI) */
void print_bracket_status(const char* expr) {
    BracketInfo info = analyze_brackets(expr);
    
    if (info.open_count == 0 && info.close_count == 0) return;
    
    printf("  \033[90m─── Bracket Status ───\033[0m\n");
    printf("  \033[90m(\033[0m opened: \033[%sm%d\033[0m", 
           info.unclosed > 0 ? "91" : "92", info.open_count);
    printf("  |  \033[90m)\033[0m closed: \033[%sm%d\033[0m",
           info.extra_close > 0 ? "93" : "92", info.close_count);
    
    if (info.is_balanced) {
        printf("  |  \033[92m✓ Balanced\033[0m\n");
    } else if (info.unclosed > 0) {
        printf("  |  \033[91m⚠ Need %d more ')'\033[0m\n", info.unclosed);
        /* Visual stack */
        printf("  \033[91m");
        for (int i = 0; i < info.unclosed && i < 20; i++) {
            printf("▌");
        }
        if (info.unclosed > 20) printf("+%d", info.unclosed - 20);
        printf("\033[0m\n");
    } else {
        printf("  |  \033[93m⚠ %d extra ')'\033[0m\n", info.extra_close);
    }
    printf("  \033[90m─────────────────────\033[0m\n");
}

/* Print expression with colored brackets */
void print_colored_expression(const char* expr) {
    int stack[256];
    int top = -1;
    int matched_open[1024] = {0};
    int matched_close[1024] = {0};
    int len = strlen(expr);
    
    /* First pass: find matched pairs */
    for (int i = 0; i < len; i++) {
        if (expr[i] == '(') {
            if (top < 255) stack[++top] = i;
        } else if (expr[i] == ')') {
            if (top >= 0) {
                int open_idx = stack[top--];
                matched_open[open_idx] = 1;
                matched_close[i] = 1;
            }
        }
    }
    
    /* Second pass: print with colors */
    printf("  ");
    for (int i = 0; i < len; i++) {
        if (expr[i] == '(' || expr[i] == ')') {
            if (matched_open[i] || matched_close[i]) {
                printf("\033[92m%c\033[0m", expr[i]); /* green = matched */
            } else if (expr[i] == '(') {
                printf("\033[91m%c\033[0m", expr[i]); /* red = unclosed open */
            } else {
                printf("\033[93m%c\033[0m", expr[i]); /* orange = extra close */
            }
        } else {
            printf("%c", expr[i]);
        }
    }
    printf("\n");
}

/* ─── Help ─────────────────────────────────────────────────────── */
void print_help(void) {
    printf("\n");
    printf("\033[96m╔══════════════════════════════════════════════════════════╗\033[0m\n");
    printf("\033[96m║\033[0m           \033[1mScientific Calculator - Help\033[0m                   \033[96m║\033[0m\n");
    printf("\033[96m╠══════════════════════════════════════════════════════════╣\033[0m\n");
    printf("\033[96m║\033[0m  \033[93mOperators:\033[0m  + - * / ^ (power) ! (factorial)            \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m  \033[95mFunctions:\033[0m  sin cos tan asin acos atan                  \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m              log (base 10)  ln (natural)                 \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m              sqrt abs                                    \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m  \033[94mConstants:\033[0m  pi  e                                       \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m                                                          \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m  \033[92mBracket Colors:\033[0m                                         \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    \033[92m( )\033[0m = Matched/Balanced                               \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    \033[91m(\033[0m   = Unclosed (needs closing)                       \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    \033[93m)\033[0m   = Extra (no matching open)                       \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m                                                          \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m  \033[97mCommands:\033[0m                                                \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    help   - Show this help                              \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    tokens - Show tokenization of last expression        \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    ast    - Show AST of last expression                 \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m    quit   - Exit the calculator                         \033[96m║\033[0m\n");
    printf("\033[96m╚══════════════════════════════════════════════════════════╝\033[0m\n");
    printf("\n");
}

/* Show tokenization */
void show_tokens(const char* input) {
    printf("\n\033[96m--- Tokenization ---\033[0m\n");
    Tokenizer tokenizer;
    tokenizer_init(&tokenizer, input);
    
    Token token;
    int i = 0;
    do {
        token = tokenizer_next(&tokenizer);
        printf("  \033[90m[%2d]\033[0m \033[93m%-10s\033[0m  '%s'  (%.6f)\n", 
               i++, token_type_to_string(token.type), token.lexeme, token.value);
    } while (token.type != TOKEN_EOF && token.type != TOKEN_ERROR);
    
    printf("\033[96m--------------------\033[0m\n\n");
}

/* Show AST */
void show_ast(const char* input) {
    printf("\n\033[96m--- Abstract Syntax Tree ---\033[0m\n");
    Parser parser;
    parser_init(&parser, input);
    ASTNode* ast = parse_expression(&parser);
    
    if (parser.has_error) {
        printf("  \033[91mParse error: %s\033[0m\n", parser.error_message);
    } else {
        print_ast(ast, 1);
    }
    
    free_ast(ast);
    printf("\033[96m--------------------------\033[0m\n\n");
}

/* ─── Main ─────────────────────────────────────────────────────── */
int main(void) {
    char input[MAX_INPUT];
    char last_input[MAX_INPUT] = "";
    
    printf("\n");
    printf("\033[96m╔══════════════════════════════════════════════════╗\033[0m\n");
    printf("\003[96m║\033[0m     \033[1mScientific Calculator (C Language)\033[0m             \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m     Architecture: Tokenizer → Parser → AST     \033[96m║\033[0m\n");
    printf("\033[96m║\033[0m                  → Evaluator → Result           \033[96m║\033[0m\n");
    printf("\033[96m╚══════════════════════════════════════════════════╝\033[0m\n");
    printf("\n");
    printf("Type '\033[93mhelp\033[0m' for available functions and operators.\n");
    printf("Type '\033[93mquit\033[0m' to exit.\n\n");
    
    while (1) {
        printf("\033[92mcalc>\033[0m ");
        
        if (fgets(input, MAX_INPUT, stdin) == NULL) {
            break;
        }
        
        /* Remove trailing newline */
        size_t len = strlen(input);
        if (len > 0 && input[len - 1] == '\n') {
            input[len - 1] = '\0';
            len--;
        }
        
        if (len == 0) continue;
        
        /* Handle commands */
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
                printf("  No previous expression.\n\n");
            }
            continue;
        }
        
        if (strcmp(input, "ast") == 0) {
            if (strlen(last_input) > 0) {
                show_ast(last_input);
            } else {
                printf("  No previous expression.\n\n");
            }
            continue;
        }
        
        /* Save for tokens/ast commands */
        strncpy(last_input, input, MAX_INPUT - 1);
        last_input[MAX_INPUT - 1] = '\0';
        
        /* Show colored expression */
        print_colored_expression(input);
        
        /* Show bracket status */
        print_bracket_status(input);
        
        /* Check bracket balance before parsing */
        BracketInfo binfo = analyze_brackets(input);
        if (!binfo.is_balanced) {
            if (binfo.unclosed > 0) {
                printf("  \033[91mError: Missing %d closing bracket%s ')'\033[0m\n\n", 
                       binfo.unclosed, binfo.unclosed > 1 ? "s" : "");
            } else {
                printf("  \033[93mError: %d extra closing bracket%s ')'\033[0m\n\n",
                       binfo.extra_close, binfo.extra_close > 1 ? "s" : "");
            }
            continue;
        }
        
        /* Parse and evaluate */
        Parser parser;
        parser_init(&parser, input);
        ASTNode* ast = parse_expression(&parser);
        
        if (parser.has_error) {
            printf("  \033[91mParse error: %s\033[0m\n\n", parser.error_message);
            free_ast(ast);
            continue;
        }
        
        if (parser.current_token.type != TOKEN_EOF) {
            printf("  \033[91mParse error: Unexpected '%s'\033[0m\n\n", 
                   parser.current_token.lexeme);
            free_ast(ast);
            continue;
        }
        
        EvalResult result = evaluate(ast);
        free_ast(ast);
        
        if (result.is_error) {
            printf("  \033[91mError: %s\033[0m\n\n", result.error_message);
        } else {
            if (result.value == (int)result.value && fabs(result.value) < 1e15) {
                printf("  \033[92m= %d\033[0m\n\n", (int)result.value);
            } else {
                printf("  \033[92m= %.10g\033[0m\n\n", result.value);
            }
        }
    }
    
    return 0;
}
