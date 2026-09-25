#ifndef EVALUATOR_H
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

#endif // EVALUATOR_H
