package com.medicscientist.calculator.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.medicscientist.calculator.calculator.BracketStatus
import com.medicscientist.calculator.calculator.CalculatorEngine
import com.medicscientist.calculator.ui.theme.*

// ─── Calculator Button Data ──────────────────────────────────────────
data class CalcButton(
    val label: String,
    val value: String,
    val type: ButtonType,
    val span: Int = 1
)

enum class ButtonType {
    NUMBER, OPERATOR, FUNCTION, CONSTANT, PAREN_OPEN, PAREN_CLOSE,
    CLEAR, BACKSPACE, EQUALS, SPECIAL
}

// ─── Main Calculator Screen ──────────────────────────────────────────
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CalculatorScreen(
    onCalculation: () -> Unit = {}
) {
    var display by remember { mutableStateOf("") }
    var lastError by remember { mutableStateOf<String?>(null) }
    var showHistory by remember { mutableStateOf(false) }
    var showSteps by remember { mutableStateOf(false) }
    var history by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var calcSteps by remember { mutableStateOf<List<Pair<String, String>>>(emptyList()) }
    var livePreview by remember { mutableStateOf<String?>(null) }
    
    val bracketInfo = remember(display) { CalculatorEngine.analyzeBrackets(display) }
    
    // Live preview
    LaunchedEffect(display) {
        if (display.isNotBlank() && bracketInfo.isBalanced) {
            val result = CalculatorEngine.evaluate(display)
            livePreview = result.getOrNull()?.takeIf { it != display }
        } else {
            livePreview = null
        }
    }
    
    val buttons = listOf(
        // Row 1: Scientific functions
        CalcButton("sin(", "sin(", ButtonType.FUNCTION),
        CalcButton("cos(", "cos(", ButtonType.FUNCTION),
        CalcButton("tan(", "tan(", ButtonType.FUNCTION),
        CalcButton("π", "pi", ButtonType.CONSTANT),
        
        // Row 2: More functions
        CalcButton("asin(", "asin(", ButtonType.FUNCTION),
        CalcButton("acos(", "acos(", ButtonType.FUNCTION),
        CalcButton("atan(", "atan(", ButtonType.FUNCTION),
        CalcButton("e", "e", ButtonType.CONSTANT),
        
        // Row 3: More functions
        CalcButton("log(", "log(", ButtonType.FUNCTION),
        CalcButton("ln(", "ln(", ButtonType.FUNCTION),
        CalcButton("√(", "sqrt(", ButtonType.FUNCTION),
        CalcButton("|x|", "abs(", ButtonType.FUNCTION),
        
        // Row 4: Numbers
        CalcButton("7", "7", ButtonType.NUMBER),
        CalcButton("8", "8", ButtonType.NUMBER),
        CalcButton("9", "9", ButtonType.NUMBER),
        CalcButton("÷", "/", ButtonType.OPERATOR),
        
        // Row 5: Numbers
        CalcButton("4", "4", ButtonType.NUMBER),
        CalcButton("5", "5", ButtonType.NUMBER),
        CalcButton("6", "6", ButtonType.NUMBER),
        CalcButton("×", "*", ButtonType.OPERATOR),
        
        // Row 6: Numbers
        CalcButton("1", "1", ButtonType.NUMBER),
        CalcButton("2", "2", ButtonType.NUMBER),
        CalcButton("3", "3", ButtonType.NUMBER),
        CalcButton("−", "-", ButtonType.OPERATOR),
        
        // Row 7: Bottom
        CalcButton("(", "(", ButtonType.PAREN_OPEN),
        CalcButton("0", "0", ButtonType.NUMBER),
        CalcButton(")", ")", ButtonType.PAREN_CLOSE),
        CalcButton("+", "+", ButtonType.OPERATOR),
        
        // Row 8: Control
        CalcButton("^", "^", ButtonType.OPERATOR),
        CalcButton(".", ".", ButtonType.NUMBER),
        CalcButton("n!", "!", ButtonType.OPERATOR),
        CalcButton("⌫", "", ButtonType.BACKSPACE),
        
        // Row 9: Final
        CalcButton("C", "", ButtonType.CLEAR),
        CalcButton("ANS", "", ButtonType.SPECIAL),
        CalcButton(")×", "", ButtonType.SPECIAL),
        CalcButton("=", "", ButtonType.EQUALS),
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(CalculatorBackground)
            .padding(8.dp)
    ) {
        // ─── Display Area ────────────────────────────────────────
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = when {
                    lastError != null -> Color(0xFF3D1111)
                    !bracketInfo.isBalanced -> Color(0xFF3D2D11)
                    else -> CalculatorDisplay
                }
            )
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Previous expression
                if (history.isNotEmpty()) {
                    Text(
                        text = "${history.first().first} =",
                        color = CalculatorTextSecondary,
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        textAlign = TextAlign.End,
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                // Main expression with colored brackets
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .heightIn(min = 48.dp),
                    contentAlignment = Alignment.CenterEnd
                ) {
                    if (showSteps && calcSteps.isNotEmpty()) {
                        // Steps overlay
                        StepsOverlay(steps = calcSteps) { showSteps = false }
                    } else {
                        // Normal display
                        Column(horizontalAlignment = Alignment.End) {
                            ColoredExpression(display, bracketInfo)
                            
                            // Live preview
                            if (livePreview != null && lastError == null) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(top = 4.dp)
                                ) {
                                    Text(
                                        "= ",
                                        color = CalculatorTextSecondary,
                                        fontSize = 14.sp
                                    )
                                    Text(
                                        livePreview!!,
                                        color = BracketMatched.copy(alpha = 0.7f),
                                        fontSize = 16.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                            
                            // Error message
                            if (lastError != null) {
                                Text(
                                    "⚠ $lastError",
                                    color = BracketUnclosed,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
                
                // Bracket status bar
                if (bracketInfo.openCount > 0 || bracketInfo.closeCount > 0) {
                    BracketStatusBar(bracketInfo)
                }
            }
        }
        
        // ─── Settings Row ────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 4.dp, vertical = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (showSteps) {
                TextButton(onClick = { showSteps = false }) {
                    Text("✕ Hide Steps", color = Color(0xFF818CF8), fontSize = 12.sp)
                }
            } else {
                Spacer(modifier = Modifier.width(1.dp))
            }
            
            TextButton(onClick = { showHistory = !showHistory }) {
                Text(
                    "${if (showHistory) "▼" else "▶"} History (${history.size})",
                    color = CalculatorTextSecondary,
                    fontSize = 12.sp
                )
            }
        }
        
        // ─── History Panel ───────────────────────────────────────
        AnimatedVisibility(
            visible = showHistory,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = CalculatorDisplay)
            ) {
                Column(modifier = Modifier.padding(8.dp)) {
                    if (history.isEmpty()) {
                        Text(
                            "No history yet",
                            color = CalculatorTextSecondary,
                            fontSize = 12.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth().padding(8.dp)
                        )
                    } else {
                        history.take(10).forEach { (expr, result) ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        display = expr
                                        lastError = null
                                        showSteps = false
                                    }
                                    .padding(vertical = 4.dp, horizontal = 8.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    expr,
                                    color = CalculatorTextSecondary,
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f)
                                )
                                Text(
                                    "= $result",
                                    color = BracketMatched,
                                    fontSize = 12.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }
        }
        
        // ─── Button Grid ─────────────────────────────────────────
        Spacer(modifier = Modifier.weight(1f))
        
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            buttons.chunked(4).forEach { row ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    row.forEach { button ->
                        CalculatorButton(
                            button = button,
                            bracketInfo = bracketInfo,
                            modifier = Modifier.weight(1f),
                            onClick = {
                                when (button.type) {
                                    ButtonType.CLEAR -> {
                                        display = ""
                                        lastError = null
                                        showSteps = false
                                    }
                                    ButtonType.BACKSPACE -> {
                                        val funcPatterns = listOf(
                                            "sin(", "cos(", "tan(", "asin(", "acos(",
                                            "atan(", "log(", "ln(", "sqrt(", "abs("
                                        )
                                        val removed = funcPatterns.firstOrNull { display.endsWith(it) }
                                        display = if (removed != null) {
                                            display.dropLast(removed.length)
                                        } else {
                                            display.dropLast(1)
                                        }
                                        lastError = null
                                    }
                                    ButtonType.EQUALS -> {
                                        if (display.isNotBlank()) {
                                            val result = CalculatorEngine.evaluate(display)
                                            result.fold(
                                                onSuccess = { value ->
                                                    val (steps, _) = CalculatorEngine.evaluateWithSteps(display)
                                                    calcSteps = steps.map { it.description to it.result }
                                                    showSteps = true
                                                    lastError = null
                                                    history = listOf(display to value) + history.take(49)
                                                    display = value
                                                    onCalculation()
                                                },
                                                onFailure = { error ->
                                                    lastError = error.message
                                                }
                                            )
                                        }
                                    }
                                    ButtonType.SPECIAL -> {
                                        when (button.label) {
                                            "ANS" -> {
                                                if (history.isNotEmpty()) {
                                                    display = history.first().second
                                                }
                                            }
                                            ")×" -> {
                                                val info = CalculatorEngine.analyzeBrackets(display)
                                                if (info.unclosed > 0) {
                                                    display += ")".repeat(info.unclosed)
                                                }
                                            }
                                        }
                                    }
                                    else -> {
                                        display += button.value
                                        lastError = null
                                        showSteps = false
                                    }
                                }
                            }
                        )
                    }
                }
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
    }
}

// ─── Calculator Button ───────────────────────────────────────────────
@Composable
fun CalculatorButton(
    button: CalcButton,
    bracketInfo: com.medicscientist.calculator.calculator.BracketInfo,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val backgroundColor = when (button.type) {
        ButtonType.NUMBER -> CalculatorButtonNumber
        ButtonType.OPERATOR -> CalculatorButtonOperator
        ButtonType.FUNCTION -> CalculatorButtonFunction
        ButtonType.CONSTANT -> Color(0xFF7C3AED)
        ButtonType.PAREN_OPEN -> {
            if (bracketInfo.unclosed > 0) Color(0xFF1A3D1A) else CalculatorButtonNumber
        }
        ButtonType.PAREN_CLOSE -> {
            when {
                bracketInfo.extraClose > 0 -> Color(0xFF3D2D11)
                bracketInfo.unclosed > 0 -> Color(0xFF1A3D1A)
                else -> CalculatorButtonNumber
            }
        }
        ButtonType.CLEAR -> CalculatorButtonClear
        ButtonType.BACKSPACE -> Color(0xFFB45309)
        ButtonType.EQUALS -> CalculatorButtonEquals
        ButtonType.SPECIAL -> Color(0xFF0E7490)
    }
    
    val textColor = when (button.type) {
        ButtonType.PAREN_OPEN -> if (bracketInfo.unclosed > 0) BracketMatched else CalculatorTextPrimary
        ButtonType.PAREN_CLOSE -> when {
            bracketInfo.extraClose > 0 -> BracketExtra
            bracketInfo.unclosed > 0 -> BracketMatched
            else -> CalculatorTextPrimary
        }
        else -> CalculatorTextPrimary
    }
    
    val fontSize = when (button.type) {
        ButtonType.FUNCTION -> 11.sp
        ButtonType.EQUALS -> 20.sp
        else -> 16.sp
    }
    
    Button(
        onClick = onClick,
        modifier = modifier
            .aspectRatio(1.6f)
            .then(
                if (button.type == ButtonType.PAREN_OPEN || button.type == ButtonType.PAREN_CLOSE) {
                    Modifier
                } else {
                    Modifier
                }
            ),
        shape = RoundedCornerShape(12.dp),
        colors = ButtonDefaults.buttonColors(containerColor = backgroundColor),
        contentPadding = PaddingValues(4.dp)
    ) {
        Text(
            text = button.label,
            color = textColor,
            fontSize = fontSize,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1
        )
    }
}

// ─── Colored Expression Display ──────────────────────────────────────
@Composable
fun ColoredExpression(
    expr: String,
    bracketInfo: com.medicscientist.calculator.calculator.BracketInfo
) {
    if (expr.isEmpty()) {
        Text(
            "0",
            color = CalculatorTextSecondary,
            fontSize = 32.sp,
            fontFamily = FontFamily.Monospace,
            textAlign = TextAlign.End,
            modifier = Modifier.fillMaxWidth()
        )
        return
    }
    
    // Build annotated string with bracket colors
    val annotated = androidx.compose.ui.text.buildAnnotatedString {
        bracketInfo.charStatus.forEach { status ->
            val color = when (status.status) {
                BracketStatus.MATCHED -> BracketMatched
                BracketStatus.UNCLOSED_OPEN -> BracketUnclosed
                BracketStatus.UNCLOSED_CLOSE -> BracketExtra
                BracketStatus.NORMAL -> CalculatorTextPrimary
            }
            withStyle(
                androidx.compose.ui.text.SpanStyle(color = color)
            ) {
                append(status.char)
            }
        }
    }
    
    Text(
        text = annotated,
        fontSize = 24.sp,
        fontFamily = FontFamily.Monospace,
        textAlign = TextAlign.End,
        maxLines = 3,
        overflow = TextOverflow.Ellipsis,
        modifier = Modifier.fillMaxWidth()
    )
}

// ─── Bracket Status Bar ──────────────────────────────────────────────
@Composable
fun BracketStatusBar(
    bracketInfo: com.medicscientist.calculator.BracketInfo
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Open count
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("(", color = CalculatorTextSecondary, fontSize = 11.sp)
            Text(
                "${bracketInfo.openCount}",
                color = if (bracketInfo.unclosed > 0) BracketUnclosed else BracketMatched,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Text(" open", color = CalculatorTextSecondary, fontSize = 11.sp)
        }
        
        Text("|", color = Color(0xFF4B5563), fontSize = 11.sp)
        
        // Close count
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(")", color = CalculatorTextSecondary, fontSize = 11.sp)
            Text(
                "${bracketInfo.closeCount}",
                color = if (bracketInfo.extraClose > 0) BracketExtra else BracketMatched,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
            Text(" closed", color = CalculatorTextSecondary, fontSize = 11.sp)
        }
        
        Text("|", color = Color(0xFF4B5563), fontSize = 11.sp)
        
        // Status
        if (bracketInfo.isBalanced) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(BracketMatched)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Balanced ✓", color = BracketMatched, fontSize = 11.sp)
            }
        } else if (bracketInfo.unclosed > 0) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(BracketUnclosed)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    "Need ${bracketInfo.unclosed} more )",
                    color = BracketUnclosed,
                    fontSize = 11.sp
                )
            }
        } else {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(BracketExtra)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    "${bracketInfo.extraClose} extra )",
                    color = BracketExtra,
                    fontSize = 11.sp
                )
            }
        }
        
        // Visual stack
        if (bracketInfo.unclosed > 0) {
            Row(
                modifier = Modifier.padding(start = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                repeat(minOf(bracketInfo.unclosed, 8)) {
                    Box(
                        modifier = Modifier
                            .width(4.dp)
                            .height(14.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(BracketUnclosed.copy(alpha = 0.6f))
                    )
                }
            }
        }
    }
}

// ─── Steps Overlay ───────────────────────────────────────────────────
@Composable
fun StepsOverlay(
    steps: List<Pair<String, String>>,
    onDismiss: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1A1A2E))
    ) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "📊 Calculation Steps",
                    color = Color(0xFF818CF8),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold
                )
                TextButton(onClick = onDismiss) {
                    Text("✕", color = CalculatorTextSecondary, fontSize = 12.sp)
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            steps.forEachIndexed { index, (desc, result) ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        "${index + 1}.",
                        color = Color(0xFF818CF8),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.width(24.dp)
                    )
                    Column(modifier = Modifier.weight(1f)) {
                        Text(desc, color = CalculatorTextSecondary, fontSize = 10.sp)
                        Text(
                            result,
                            color = if (index == steps.lastIndex) BracketMatched else Color(0xFF22D3EE),
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
