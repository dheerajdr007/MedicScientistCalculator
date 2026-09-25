package com.medicscientist.calculator.calculator

import org.junit.Assert.*
import org.junit.Test

/**
 * Unit tests for the Calculator Engine
 */
class CalculatorEngineTest {
    
    @Test
    fun testBasicAddition() {
        val result = CalculatorEngine.evaluate("2 + 3")
        assertTrue(result.isSuccess)
        assertEquals("5", result.getOrNull())
    }
    
    @Test
    fun testBasicSubtraction() {
        val result = CalculatorEngine.evaluate("10 - 4")
        assertTrue(result.isSuccess)
        assertEquals("6", result.getOrNull())
    }
    
    @Test
    fun testBasicMultiplication() {
        val result = CalculatorEngine.evaluate("3 * 4")
        assertTrue(result.isSuccess)
        assertEquals("12", result.getOrNull())
    }
    
    @Test
    fun testBasicDivision() {
        val result = CalculatorEngine.evaluate("20 / 4")
        assertTrue(result.isSuccess)
        assertEquals("5", result.getOrNull())
    }
    
    @Test
    fun testOrderOfOperations() {
        val result = CalculatorEngine.evaluate("2 + 3 * 4")
        assertTrue(result.isSuccess)
        assertEquals("14", result.getOrNull())
    }
    
    @Test
    fun testParentheses() {
        val result = CalculatorEngine.evaluate("(2 + 3) * 4")
        assertTrue(result.isSuccess)
        assertEquals("20", result.getOrNull())
    }
    
    @Test
    fun testPower() {
        val result = CalculatorEngine.evaluate("2 ^ 3")
        assertTrue(result.isSuccess)
        assertEquals("8", result.getOrNull())
    }
    
    @Test
    fun testRightAssociativePower() {
        val result = CalculatorEngine.evaluate("2 ^ 3 ^ 2")
        assertTrue(result.isSuccess)
        assertEquals("512", result.getOrNull()) // 2^(3^2) = 2^9 = 512
    }
    
    @Test
    fun testFactorial() {
        val result = CalculatorEngine.evaluate("5!")
        assertTrue(result.isSuccess)
        assertEquals("120", result.getOrNull())
    }
    
    @Test
    fun testPi() {
        val result = CalculatorEngine.evaluate("pi")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(Math.PI, value, 0.0001)
    }
    
    @Test
    fun testE() {
        val result = CalculatorEngine.evaluate("e")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(Math.E, value, 0.0001)
    }
    
    @Test
    fun testSin() {
        val result = CalculatorEngine.evaluate("sin(pi / 2)")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(1.0, value, 0.0001)
    }
    
    @Test
    fun testCos() {
        val result = CalculatorEngine.evaluate("cos(0)")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(1.0, value, 0.0001)
    }
    
    @Test
    fun testSqrt() {
        val result = CalculatorEngine.evaluate("sqrt(16)")
        assertTrue(result.isSuccess)
        assertEquals("4", result.getOrNull())
    }
    
    @Test
    fun testLog() {
        val result = CalculatorEngine.evaluate("log(100)")
        assertTrue(result.isSuccess)
        assertEquals("2", result.getOrNull())
    }
    
    @Test
    fun testLn() {
        val result = CalculatorEngine.evaluate("ln(e)")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(1.0, value, 0.0001)
    }
    
    @Test
    fun testComplexExpression() {
        val result = CalculatorEngine.evaluate("sqrt(3^2 + 4^2)")
        assertTrue(result.isSuccess)
        assertEquals("5", result.getOrNull())
    }
    
    @Test
    fun testDivisionByZero() {
        val result = CalculatorEngine.evaluate("10 / 0")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message?.contains("Division by zero") == true)
    }
    
    @Test
    fun testUnbalancedBrackets() {
        val result = CalculatorEngine.evaluate("sin(pi / 2")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message?.contains("Missing") == true)
    }
    
    @Test
    fun testExtraClosingBracket() {
        val result = CalculatorEngine.evaluate("2 + 3)")
        assertTrue(result.isFailure)
        assertTrue(result.exceptionOrNull()?.message?.contains("extra") == true)
    }
    
    @Test
    fun testBracketAnalysis() {
        val info = CalculatorEngine.analyzeBrackets("sin(pi/4) + cos(")
        assertFalse(info.isBalanced)
        assertEquals(2, info.openCount)
        assertEquals(1, info.closeCount)
        assertEquals(1, info.unclosed)
        assertEquals(0, info.extraClose)
    }
    
    @Test
    fun testBalancedBrackets() {
        val info = CalculatorEngine.analyzeBrackets("sin(pi/4) + cos(pi/4)")
        assertTrue(info.isBalanced)
        assertEquals(2, info.openCount)
        assertEquals(2, info.closeCount)
        assertEquals(0, info.unclosed)
        assertEquals(0, info.extraClose)
    }
    
    @Test
    fun testNegativeNumber() {
        val result = CalculatorEngine.evaluate("-5 + 3")
        assertTrue(result.isSuccess)
        assertEquals("-2", result.getOrNull())
    }
    
    @Test
    fun testDecimalNumber() {
        val result = CalculatorEngine.evaluate("3.14 * 2")
        assertTrue(result.isSuccess)
        assertNotNull(result.getOrNull())
        val value = result.getOrNull()!!.toDouble()
        assertEquals(6.28, value, 0.01)
    }
    
    @Test
    fun testEmptyExpression() {
        val result = CalculatorEngine.evaluate("")
        assertTrue(result.isSuccess)
        assertEquals("", result.getOrNull())
    }
    
    @Test
    fun testWhitespace() {
        val result = CalculatorEngine.evaluate("  2  +  3  ")
        assertTrue(result.isSuccess)
        assertEquals("5", result.getOrNull())
    }
}
