package com.medicscientist.calculator.ads

import android.content.Context
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback

/**
 * AdManager - Handles AdMob integration for the Android app
 */
object AdManager {
    
    // Replace with your actual AdMob Ad Unit IDs
    private const val BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111" // Test ID
    private const val INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712" // Test ID
    
    private var interstitialAd: InterstitialAd? = null
    private var calculationCount = 0
    private const val INTERSTITIAL_INTERVAL = 3 // Show every 3 calculations
    
    fun getBannerAdUnitId(): String = BANNER_AD_UNIT_ID
    
    fun recordCalculation() {
        calculationCount++
    }
    
    fun shouldShowInterstitial(): Boolean {
        return calculationCount > 0 && calculationCount % INTERSTITIAL_INTERVAL == 0
    }
    
    fun loadInterstitial(context: Context) {
        val adRequest = AdRequest.Builder().build()
        
        InterstitialAd.load(
            context,
            INTERSTITIAL_AD_UNIT_ID,
            adRequest,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitialAd = ad
                }
                
                override fun onAdFailedToLoad(error: LoadAdError) {
                    interstitialAd = null
                }
            }
        )
    }
    
    fun showInterstitial(
        context: Context,
        onDismissed: () -> Unit,
        onFailed: () -> Unit
    ) {
        val ad = interstitialAd
        if (ad != null) {
            ad.fullScreenContentCallback = object : FullScreenContentCallback() {
                override fun onAdDismissedFullScreenContent() {
                    interstitialAd = null
                    onDismissed()
                    loadInterstitial(context) // Preload next ad
                }
                
                override fun onAdFailedToShowFullScreenContent(error: AdError) {
                    interstitialAd = null
                    onFailed()
                    loadInterstitial(context)
                }
            }
            ad.show(context as android.app.Activity)
        } else {
            onFailed()
            loadInterstitial(context)
        }
    }
    
    fun resetCalculationCount() {
        calculationCount = 0
    }
}
