package com.medicscientist.calculator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView
import com.google.android.gms.ads.MobileAds
import com.medicscientist.calculator.ads.AdManager
import com.medicscientist.calculator.ui.screens.CalculatorScreen
import com.medicscientist.calculator.ui.theme.ScientificCalculatorTheme
import kotlinx.coroutines.delay

class MainActivity : ComponentActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Initialize AdMob
        MobileAds.initialize(this) {}
        
        // Preload interstitial ad
        AdManager.loadInterstitial(this)
        
        setContent {
            ScientificCalculatorTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CalculatorApp()
                }
            }
        }
    }
}

@Composable
fun CalculatorApp() {
    var calculationCount by remember { mutableIntStateOf(0) }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF121212))
    ) {
        // ─── Top Banner Ad ───────────────────────────────────────
        AdBanner(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp)
        )
        
        // ─── Header ──────────────────────────────────────────────
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp)
        ) {
            Text(
                "Scientific Calculator",
                color = Color.White,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                "Tokenizer → Parser → AST → Evaluator",
                color = Color(0xFF9CA3AF),
                fontSize = 12.sp
            )
            if (calculationCount > 0) {
                Text(
                    "📢 Calculations: $calculationCount | Ad every ${3 - (calculationCount % 3)} more",
                    color = Color(0xFF818CF8),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }
        }
        
        // ─── Calculator ──────────────────────────────────────────
        CalculatorScreen(
            onCalculation = {
                calculationCount++
                AdManager.recordCalculation()
                
                // Check if we should show interstitial
                if (AdManager.shouldShowInterstitial()) {
                    // In a real app, you'd show the interstitial here
                    // For now, just reset the counter
                }
            }
        )
        
        // ─── Native Ad ───────────────────────────────────────────
        NativeAdBanner(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
        )
        
        // ─── Bottom Banner Ad ────────────────────────────────────
        AdBanner(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 8.dp)
        )
    }
}

// ─── AdMob Banner Ad View ────────────────────────────────────────────
@Composable
fun AdBanner(modifier: Modifier = Modifier) {
    // Using AndroidView to embed the actual AdMob banner
    androidx.compose.ui.viewinterop.AndroidView(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .clip(RoundedCornerShape(8.dp)),
        factory = { context ->
            AdView(context).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = AdManager.getBannerAdUnitId()
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}

// ─── Native Ad Component (Demo) ──────────────────────────────────────
@Composable
fun NativeAdBanner(modifier: Modifier = Modifier) {
    val ads = remember {
        listOf(
            Triple("📱", "Calculator Widget", "Add to home screen"),
            Triple("🎯", "Math Flashcards", "Practice daily"),
            Triple("📏", "Geometry Tools", "Measure angles & areas")
        )
    }
    var currentIndex by remember { mutableIntStateOf(0) }
    
    LaunchedEffect(Unit) {
        while (true) {
            delay(15000)
            currentIndex = (currentIndex + 1) % ads.size
        }
    }
    
    val (icon, title, desc) = ads[currentIndex]
    
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF2C2C2E))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(icon, fontSize = 28.sp)
            Spacer(modifier = Modifier.width(12.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    title,
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    desc,
                    color = Color(0xFF9CA3AF),
                    fontSize = 12.sp,
                    maxLines = 1
                )
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text("★ 4.8", color = Color(0xFFFBBF24), fontSize = 11.sp)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("1M+", color = Color(0xFF6B7280), fontSize = 11.sp)
                }
            }
            Button(
                onClick = {},
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4F46E5)),
                shape = RoundedCornerShape(20.dp),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp)
            ) {
                Text("Install", color = Color.White, fontSize = 12.sp)
            }
        }
        
        // Ad label
        Text(
            "Ad",
            color = Color(0xFF6B7280),
            fontSize = 9.sp,
            modifier = Modifier
                .align(Alignment.End)
                .padding(end = 8.dp, bottom = 4.dp)
        )
    }
}
