package com.medicscientist.calculator.calculator

/**
 * CalculatorEngine - Main entry point that coordinates tokenizer, parser, and evaluator
 */

data class BracketInfo(
    val openCount: Int,
    val closeCount: Int,
    val unclosed: Int,
    val extraClose: Int,
    val isBalanced: Boolean,
    val charStatus: List<CharStatus>
)

data class CharStatus(
    val char: Char,
    val status: BracketStatus
)

enum class BracketStatus {
    MATCHED, UNCLOSED_OPEN, UNCLOSED_CLOSE, NORMAL
}

data class CalcStep(
    val description: String,
    val expression: String,
    val result: String
)

object CalculatorEngine {
    
    fun analyzeBrackets(expr: String): BracketInfo {
        val stack = mutableListOf<Int>()
        val charStatus = mutableListOf<CharStatus>()
        val matchedOpen = mutableSetOf<Int>()
        val matchedClose = mutableSetOf<Int>()
        
        for (i in expr.indices) {
            when (expr[i]) {
                '(' -> {
                    stack.add(i)
                    charStatus.add(CharStatus('(', BracketStatus.UNCLOSED_OPEN))
                }
                ')' -> {
                    if (stack.isNotEmpty()) {
                        val openIdx = stack.removeAt(stack.lastIndex)
                        matchedOpen.add(openIdx)
                        matchedClose.add(i)
                        charStatus.add(CharStatus(')', BracketStatus.MATCHED))
                    } else {
                        charStatus.add(CharStatus(')', BracketStatus.UNCLOSED_CLOSE))
                    }
                }
                else -> {
                    charStatus.add(CharStatus(expr[i], BracketStatus.NORMAL))
                }
            }
        }
        
        // Mark remaining unclosed opens
        for (idx in stack) {
            charStatus[idx] = CharStatus('(', BracketStatus.UNCLOSED_OPEN)
        }
        
        val openCount = expr.count { it == '(' }
        val closeCount = expr.count { it == ')' }
        val unclosed = stack.size
        val extraClose = closeCount - matchedClose.size
        
        return BracketInfo(
            openCount = openCount,
            closeCount = closeCount,
            unclosed = unclosed,
            extraClose = extraClose,
            isBalanced = unclosed == 0 && extraClose == 0,
            charStatus = charStatus
        )
    }
    
    fun evaluate(expr: String): Result<String> {
        if (expr.isBlank()) return Result.success("")
        
        val bracketInfo = analyzeBrackets(expr)
        if (!bracketInfo.isBalanced) {
            return if (bracketInfo.unclosed > 0) {
                Result.failure(Exception("Missing ${bracketInfo.unclosed} closing bracket(s)"))
            } else {
                Result.failure(Exception("${bracketInfo.extraClose} extra closing bracket(s)"))
            }
        }
        
        val tokenizer = Tokenizer(expr)
        val tokens = tokenizer.tokenize()
        
        if (tokens.any { it.type == TokenType.ERROR }) {
            return Result.failure(Exception("Invalid token in expression"))
        }
        
        val parser = Parser(tokens)
        val ast = parser.parse()
        
        if (parser.hasError) {
            return Result.failure(Exception(parser.errorMessage))
        }
        
        val evalResult = Evaluator.evaluate(ast)
        
        if (evalResult.isError) {
            return Result.failure(Exception(evalResult.errorMessage))
        }
        
        val formatted = if (evalResult.value == evalResult.value.toLong().toDouble() && 
                           kotlin.math.abs(evalResult.value) < 1e15) {
            evalResult.value.toLong().toString()
        } else {
            "%.10g".format(evalResult.value).trimEnd('0').trimEnd('.')
        }
        
        return Result.success(formatted)
    }
    
    fun evaluateWithSteps(expr: String): Pair<List<CalcStep>, Result<String>> {
        val steps = mutableListOf<CalcStep>()
        val result = evaluate(expr)
        
        steps.add(CalcStep("Original expression", expr, expr))
        
        // Simplified step tracking - in production you'd track each operation
        if (result.isSuccess) {
            steps.add(CalcStep("Final result", expr, result.getOrNull() ?: ""))
        }
        
        return Pair(steps, result)
    }
}
