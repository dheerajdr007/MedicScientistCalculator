#include "evaluator.h"
#include <math.h>
#include <stdio.h>
#include <float.h>

// Global error message buffer
static char g_error_message[256] = "";

// Set error
static EvalResult make_error(const char* message) {
    EvalResult result;
    result.value = 0;
    result.is_error = true;
    strncpy(result.error_message, message, 255);
    result.error_message[255] = '\0';
    strncpy(g_error_message, message, 255);
    g_error_message[255] = '\0';
    return result;
}

// Make success result
static EvalResult make_result(double value) {
    EvalResult result;
    result.value = value;
    result.is_error = false;
    result.error_message[0] = '\0';
    return result;
}

// Compute factorial (iterative to avoid stack overflow)
double compute_factorial(int n) {
    if (n < 0) return NAN;
    if (n > 170) return INFINITY; // Overflow protection
    if (n == 0 || n == 1) return 1;
    
    double result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// Evaluate an AST node recursively
EvalResult evaluate(ASTNode* node) {
    if (node == NULL) {
        return make_error("NULL node");
    }
    
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
                case OP_ADD:
                    result = left.value + right.value;
                    break;
                case OP_SUBTRACT:
                    result = left.value - right.value;
                    break;
                case OP_MULTIPLY:
                    result = left.value * right.value;
                    break;
                case OP_DIVIDE:
                    if (fabs(right.value) < DBL_EPSILON) {
                        return make_error("Division by zero");
                    }
                    result = left.value / right.value;
                    break;
                case OP_POWER:
                    result = pow(left.value, right.value);
                    break;
                default:
                    return make_error("Unknown binary operator");
            }
            
            // Check for overflow/underflow
            if (isinf(result)) {
                return make_error("Result overflow (infinity)");
            }
            if (isnan(result)) {
                return make_error("Result is NaN (undefined)");
            }
            
            return make_result(result);
        }
        
        case NODE_UNARY_OP: {
            EvalResult operand = evaluate(node->data.unary.operand);
            if (operand.is_error) return operand;
            
            switch (node->data.unary.op) {
                case OP_NEGATE:
                    return make_result(-operand.value);
                case OP_FACTORIAL: {
                    if (operand.value < 0 || floor(operand.value) != operand.value) {
                        return make_error("Factorial requires a non-negative integer");
                    }
                    if (operand.value > 170) {
                        return make_error("Factorial argument too large (max 170)");
                    }
                    double result = compute_factorial((int)operand.value);
                    return make_result(result);
                }
                default:
                    return make_error("Unknown unary operator");
            }
        }
        
        case NODE_FUNCTION: {
            EvalResult arg = evaluate(node->data.function.argument);
            if (arg.is_error) return arg;
            
            double result;
            switch (node->data.function.func) {
                case FUNC_SIN:
                    result = sin(arg.value);
                    break;
                case FUNC_COS:
                    result = cos(arg.value);
                    break;
                case FUNC_TAN:
                    result = tan(arg.value);
                    break;
                case FUNC_ASIN:
                    if (arg.value < -1 || arg.value > 1) {
                        return make_error("asin domain error: argument must be in [-1, 1]");
                    }
                    result = asin(arg.value);
                    break;
                case FUNC_ACOS:
                    if (arg.value < -1 || arg.value > 1) {
                        return make_error("acos domain error: argument must be in [-1, 1]");
                    }
                    result = acos(arg.value);
                    break;
                case FUNC_ATAN:
                    result = atan(arg.value);
                    break;
                case FUNC_LOG:
                    if (arg.value <= 0) {
                        return make_error("log domain error: argument must be positive");
                    }
                    result = log10(arg.value);
                    break;
                case FUNC_LN:
                    if (arg.value <= 0) {
                        return make_error("ln domain error: argument must be positive");
                    }
                    result = log(arg.value);
                    break;
                case FUNC_SQRT:
                    if (arg.value < 0) {
                        return make_error("sqrt domain error: argument must be non-negative");
                    }
                    result = sqrt(arg.value);
                    break;
                case FUNC_ABS:
                    result = fabs(arg.value);
                    break;
                default:
                    return make_error("Unknown function");
            }
            
            if (isnan(result)) {
                return make_error("Function returned NaN");
            }
            
            return make_result(result);
        }
        
        default:
            return make_error("Unknown node type");
    }
}

// Get the last error message
const char* get_error_message(void) {
    return g_error_message;
}
