package com.medicscientist.calculator.calculator

/**
 * Parser - Recursive descent parser that builds an AST
 * Equivalent to parser.c in the C version
 */

sealed class ASTNode {
    data class NumberNode(val value: Double) : ASTNode()
    data class ConstantNode(val value: Double) : ASTNode()
    
    data class BinaryOpNode(
        val op: BinaryOp,
        val left: ASTNode,
        val right: ASTNode
    ) : ASTNode()
    
    data class UnaryOpNode(
        val op: UnaryOp,
        val operand: ASTNode
    ) : ASTNode()
    
    data class FunctionNode(
        val func: FunctionType,
        val argument: ASTNode
    ) : ASTNode()
}

enum class BinaryOp { ADD, SUBTRACT, MULTIPLY, DIVIDE, POWER }
enum class UnaryOp { NEGATE, FACTORIAL }
enum class FunctionType { SIN, COS, TAN, ASIN, ACOS, ATAN, LOG, LN, SQRT, ABS }

class Parser(private val tokens: List<Token>) {
    private var position = 0
    var hasError = false
    var errorMessage = ""
    
    private val currentToken: Token
        get() = if (position < tokens.size) tokens[position] else Token(TokenType.EOF)
    
    private fun advance() {
        if (position < tokens.size) position++
    }
    
    private fun expect(type: TokenType): Boolean {
        if (currentToken.type == type) {
            advance()
            return true
        }
        hasError = true
        errorMessage = "Expected $type but got ${currentToken.type}"
        return false
    }
    
    private fun parsePrimary(): ASTNode? {
        if (hasError) return null
        
        return when (currentToken.type) {
            TokenType.NUMBER -> {
                val node = ASTNode.NumberNode(currentToken.value)
                advance()
                node
            }
            TokenType.PI, TokenType.E -> {
                val node = ASTNode.ConstantNode(currentToken.value)
                advance()
                node
            }
            TokenType.LPAREN -> {
                advance()
                val node = parseExpression()
                expect(TokenType.RPAREN)
                node
            }
            TokenType.MINUS -> {
                advance()
                val operand = parsePrimary() ?: return null
                ASTNode.UnaryOpNode(UnaryOp.NEGATE, operand)
            }
            TokenType.PLUS -> {
                advance()
                parsePrimary()
            }
            TokenType.SIN, TokenType.COS, TokenType.TAN,
            TokenType.ASIN, TokenType.ACOS, TokenType.ATAN,
            TokenType.LOG, TokenType.LN, TokenType.SQRT, TokenType.ABS -> {
                val funcType = when (currentToken.type) {
                    TokenType.SIN -> FunctionType.SIN
                    TokenType.COS -> FunctionType.COS
                    TokenType.TAN -> FunctionType.TAN
                    TokenType.ASIN -> FunctionType.ASIN
                    TokenType.ACOS -> FunctionType.ACOS
                    TokenType.ATAN -> FunctionType.ATAN
                    TokenType.LOG -> FunctionType.LOG
                    TokenType.LN -> FunctionType.LN
                    TokenType.SQRT -> FunctionType.SQRT
                    TokenType.ABS -> FunctionType.ABS
                    else -> FunctionType.SIN
                }
                advance()
                if (!expect(TokenType.LPAREN)) return null
                val argument = parseExpression() ?: return null
                if (!expect(TokenType.RPAREN)) return null
                ASTNode.FunctionNode(funcType, argument)
            }
            else -> {
                hasError = true
                errorMessage = "Unexpected token: ${currentToken.type} ('${currentToken.lexeme}')"
                null
            }
        }?.let { node ->
            // Check for postfix factorial
            if (currentToken.type == TokenType.FACTORIAL) {
                advance()
                ASTNode.UnaryOpNode(UnaryOp.FACTORIAL, node)
            } else {
                node
            }
        }
    }
    
    private fun parseExponent(): ASTNode? {
        val left = parsePrimary() ?: return null
        if (currentToken.type == TokenType.POWER) {
            advance()
            val right = parseExponent() ?: return null // Right-associative
            return ASTNode.BinaryOpNode(BinaryOp.POWER, left, right)
        }
        return left
    }
    
    private fun parseTerm(): ASTNode? {
        var left = parseExponent() ?: return null
        while (currentToken.type == TokenType.MULTIPLY || currentToken.type == TokenType.DIVIDE) {
            val op = if (currentToken.type == TokenType.MULTIPLY) BinaryOp.MULTIPLY else BinaryOp.DIVIDE
            advance()
            val right = parseExponent() ?: return null
            left = ASTNode.BinaryOpNode(op, left, right)
        }
        return left
    }
    
    fun parseExpression(): ASTNode? {
        var left = parseTerm() ?: return null
        while (currentToken.type == TokenType.PLUS || currentToken.type == TokenType.MINUS) {
            val op = if (currentToken.type == TokenType.PLUS) BinaryOp.ADD else BinaryOp.SUBTRACT
            advance()
            val right = parseTerm() ?: return null
            left = ASTNode.BinaryOpNode(op, left, right)
        }
        return left
    }
    
    fun parse(): ASTNode? {
        val ast = parseExpression()
        if (currentToken.type != TokenType.EOF && !hasError) {
            hasError = true
            errorMessage = "Unexpected token after expression: '${currentToken.lexeme}'"
        }
        return ast
    }
}
