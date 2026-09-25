package com.medicscientist.calculator.calculator

import kotlin.math.*

/**
 * Evaluator - Recursively evaluates the AST
 * Equivalent to evaluator.c in the C version
 */

data class EvalResult(
    val value: Double,
    val isError: Boolean = false,
    val errorMessage: String = ""
)

object Evaluator {
    
    fun evaluate(node: ASTNode?): EvalResult {
        if (node == null) {
            return EvalResult(0.0, true, "NULL node")
        }
        
        return when (node) {
            is ASTNode.NumberNode -> EvalResult(node.value)
            is ASTNode.ConstantNode -> EvalResult(node.value)
            
            is ASTNode.BinaryOpNode -> {
                val left = evaluate(node.left)
                if (left.isError) return left
                
                val right = evaluate(node.right)
                if (right.isError) return right
                
                val result = when (node.op) {
                    BinaryOp.ADD -> left.value + right.value
                    BinaryOp.SUBTRACT -> left.value - right.value
                    BinaryOp.MULTIPLY -> left.value * right.value
                    BinaryOp.DIVIDE -> {
                        if (abs(right.value) < 1e-15) {
                            return EvalResult(0.0, true, "Division by zero")
                        }
                        left.value / right.value
                    }
                    BinaryOp.POWER -> left.value.pow(right.value)
                }
                
                if (result.isInfinite()) {
                    return EvalResult(0.0, true, "Result overflow (infinity)")
                }
                if (result.isNaN()) {
                    return EvalResult(0.0, true, "Result is NaN (undefined)")
                }
                
                EvalResult(result)
            }
            
            is ASTNode.UnaryOpNode -> {
                val operand = evaluate(node.operand)
                if (operand.isError) return operand
                
                when (node.op) {
                    UnaryOp.NEGATE -> EvalResult(-operand.value)
                    UnaryOp.FACTORIAL -> {
                        if (operand.value < 0 || operand.value != floor(operand.value)) {
                            return EvalResult(0.0, true, "Factorial requires non-negative integer")
                        }
                        if (operand.value > 170) {
                            return EvalResult(0.0, true, "Factorial argument too large (max 170)")
                        }
                        EvalResult(computeFactorial(operand.value.toInt()))
                    }
                }
            }
            
            is ASTNode.FunctionNode -> {
                val arg = evaluate(node.argument)
                if (arg.isError) return arg
                
                val result = when (node.func) {
                    FunctionType.SIN -> sin(arg.value)
                    FunctionType.COS -> cos(arg.value)
                    FunctionType.TAN -> tan(arg.value)
                    FunctionType.ASIN -> {
                        if (arg.value < -1 || arg.value > 1) {
                            return EvalResult(0.0, true, "asin domain error: [-1, 1]")
                        }
                        asin(arg.value)
                    }
                    FunctionType.ACOS -> {
                        if (arg.value < -1 || arg.value > 1) {
                            return EvalResult(0.0, true, "acos domain error: [-1, 1]")
                        }
                        acos(arg.value)
                    }
                    FunctionType.ATAN -> atan(arg.value)
                    FunctionType.LOG -> {
                        if (arg.value <= 0) {
                            return EvalResult(0.0, true, "log domain error: positive")
                        }
                        log10(arg.value)
                    }
                    FunctionType.LN -> {
                        if (arg.value <= 0) {
                            return EvalResult(0.0, true, "ln domain error: positive")
                        }
                        ln(arg.value)
                    }
                    FunctionType.SQRT -> {
                        if (arg.value < 0) {
                            return EvalResult(0.0, true, "sqrt domain error: non-negative")
                        }
                        sqrt(arg.value)
                    }
                    FunctionType.ABS -> abs(arg.value)
                }
                
                if (result.isNaN()) {
                    return EvalResult(0.0, true, "Function returned NaN")
                }
                
                EvalResult(result)
            }
        }
    }
    
    private fun computeFactorial(n: Int): Double {
        if (n < 0) return Double.NaN
        if (n > 170) return Double.POSITIVE_INFINITY
        if (n <= 1) return 1.0
        var result = 1.0
        for (i in 2..n) {
            result *= i
        }
        return result
    }
}
