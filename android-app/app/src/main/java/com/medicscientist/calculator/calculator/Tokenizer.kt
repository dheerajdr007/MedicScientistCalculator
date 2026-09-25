package com.medicscientist.calculator.calculator

/**
 * Tokenizer - Converts input string into a stream of tokens
 * Equivalent to tokenizer.c in the C version
 */

enum class TokenType {
    NUMBER,
    PLUS,
    MINUS,
    MULTIPLY,
    DIVIDE,
    POWER,
    LPAREN,
    RPAREN,
    SIN, COS, TAN,
    ASIN, ACOS, ATAN,
    LOG, LN,
    SQRT, ABS,
    FACTORIAL,
    PI, E,
    EOF,
    ERROR
}

data class Token(
    val type: TokenType,
    val value: Double = 0.0,
    val lexeme: String = ""
)

class Tokenizer(private val input: String) {
    private var position = 0
    private val length = input.length

    private fun skipWhitespace() {
        while (position < length && input[position].isWhitespace()) {
            position++
        }
    }

    private fun readNumber(): Token {
        val start = position
        while (position < length && (input[position].isDigit() || input[position] == '.')) {
            position++
        }
        val lexeme = input.substring(start, position)
        return Token(TokenType.NUMBER, lexeme.toDouble(), lexeme)
    }

    private fun readIdentifier(): Token {
        val start = position
        while (position < length && input[position].isLetter()) {
            position++
        }
        val lexeme = input.substring(start, position)
        
        val type = when (lexeme.lowercase()) {
            "sin" -> TokenType.SIN
            "cos" -> TokenType.COS
            "tan" -> TokenType.TAN
            "asin" -> TokenType.ASIN
            "acos" -> TokenType.ACOS
            "atan" -> TokenType.ATAN
            "log" -> TokenType.LOG
            "ln" -> TokenType.LN
            "sqrt" -> TokenType.SQRT
            "abs" -> TokenType.ABS
            "pi" -> TokenType.PI
            "e" -> TokenType.E
            else -> TokenType.ERROR
        }
        
        val value = when (type) {
            TokenType.PI -> Math.PI
            TokenType.E -> Math.E
            else -> 0.0
        }
        
        return Token(type, value, lexeme)
    }

    fun nextToken(): Token {
        skipWhitespace()
        
        if (position >= length) {
            return Token(TokenType.EOF, lexeme = "EOF")
        }
        
        val current = input[position]
        
        return when (current) {
            '+' -> { position++; Token(TokenType.PLUS, lexeme = "+") }
            '-' -> { position++; Token(TokenType.MINUS, lexeme = "-") }
            '*' -> { position++; Token(TokenType.MULTIPLY, lexeme = "*") }
            '/' -> { position++; Token(TokenType.DIVIDE, lexeme = "/") }
            '^' -> { position++; Token(TokenType.POWER, lexeme = "^") }
            '(' -> { position++; Token(TokenType.LPAREN, lexeme = "(") }
            ')' -> { position++; Token(TokenType.RPAREN, lexeme = ")") }
            '!' -> { position++; Token(TokenType.FACTORIAL, lexeme = "!") }
            else -> {
                if (current.isDigit() || current == '.') {
                    readNumber()
                } else if (current.isLetter()) {
                    readIdentifier()
                } else {
                    position++
                    Token(TokenType.ERROR, lexeme = current.toString())
                }
            }
        }
    }

    fun tokenize(): List<Token> {
        val tokens = mutableListOf<Token>()
        while (true) {
            val token = nextToken()
            tokens.add(token)
            if (token.type == TokenType.EOF || token.type == TokenType.ERROR) {
                break
            }
        }
        return tokens
    }
}
