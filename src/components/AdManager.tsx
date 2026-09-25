import { useState, useEffect, useCallback } from 'react';

// ─── Ad Configuration ────────────────────────────────────────────────
// Replace these with your actual AdSense/AdMob publisher IDs
export const AD_CONFIG = {
  // Google AdSense Publisher ID (replace with your own)
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad Unit IDs for different placements
  AD_UNITS: {
    BANNER_TOP: '1234567890',
    BANNER_BOTTOM: '0987654321',
    INTERSTITIAL: '1122334455',
    NATIVE_INLINE: '5566778899',
  },
  
  // Ad timing configuration
  TIMING: {
    INTERSTITIAL_INTERVAL: 3, // Show interstitial every N calculations
    BANNER_REFRESH: 60000,     // Refresh banner every 60 seconds (ms)
  },
  
  // Demo mode - shows placeholder ads instead of real ones
  DEMO_MODE: true,
};

// ─── Ad Types ────────────────────────────────────────────────────────
export type AdType = 'banner' | 'interstitial' | 'native';

export interface AdConfig {
  unitId: string;
  type: AdType;
  size?: 'banner' | 'large-banner' | 'rectangle' | 'leaderboard';
}

// ─── Ad Manager Hook ─────────────────────────────────────────────────
export function useAdManager() {
  const [calculationCount, setCalculationCount] = useState(0);
  const [showInterstitial, setShowInterstitial] = useState(false);
  const [interstitialReady, setInterstitialReady] = useState(false);
  const [adBlockDetected, setAdBlockDetected] = useState(false);

  // Track calculations for interstitial timing
  const recordCalculation = useCallback(() => {
    setCalculationCount(prev => {
      const newCount = prev + 1;
      // Check if it's time to show interstitial
      if (newCount % AD_CONFIG.TIMING.INTERSTITIAL_INTERVAL === 0) {
        setInterstitialReady(true);
      }
      return newCount;
    });
  }, []);

  // Show interstitial ad
  const showInterstitialAd = useCallback(() => {
    if (interstitialReady) {
      setShowInterstitial(true);
      setInterstitialReady(false);
    }
  }, [interstitialReady]);

  // Close interstitial
  const closeInterstitial = useCallback(() => {
    setShowInterstitial(false);
  }, []);

  // Detect ad blocker
  useEffect(() => {
    const testAd = document.createElement('div');
    testAd.className = 'adsbygoogle';
    testAd.style.cssText = 'position:absolute;top:-9999px;left:-9999px;width:1px;height:1px;';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      if (testAd.offsetHeight === 0 || testAd.clientHeight === 0) {
        setAdBlockDetected(true);
      }
      document.body.removeChild(testAd);
    }, 100);
  }, []);

  return {
    calculationCount,
    showInterstitial,
    interstitialReady,
    adBlockDetected,
    recordCalculation,
    showInterstitialAd,
    closeInterstitial,
  };
}

// ─── Banner Ad Component ─────────────────────────────────────────────
interface BannerAdProps {
  position: 'top' | 'bottom';
  size?: 'banner' | 'large-banner' | 'rectangle';
}

const DEMO_ADS = [
  { title: '🚀 Upgrade to Pro', desc: 'Remove ads & get scientific graphing', cta: 'Learn More', color: 'from-blue-600 to-indigo-700' },
  { title: '📐 Graphing Calculator', desc: 'Plot functions in 2D & 3D', cta: 'Try Now', color: 'from-purple-600 to-pink-600' },
  { title: '🎓 Math Tutor AI', desc: 'Get step-by-step solutions', cta: 'Start Free', color: 'from-green-600 to-teal-600' },
  { title: '⚡ Unit Converter', desc: 'Convert 1000+ units instantly', cta: 'Download', color: 'from-orange-600 to-red-600' },
  { title: '📊 Statistics Pro', desc: 'Advanced statistical analysis', cta: 'Explore', color: 'from-cyan-600 to-blue-600' },
];

export function BannerAd({ position, size = 'banner' }: BannerAdProps) {
  const [currentAd, setCurrentAd] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Rotate ads
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAd(prev => (prev + 1) % DEMO_ADS.length);
    }, AD_CONFIG.TIMING.BANNER_REFRESH / 10); // Faster rotation for demo
    return () => clearInterval(interval);
  }, []);

  // Refresh animation
  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [currentAd]);

  const ad = DEMO_ADS[currentAd];
  
  const sizeClasses = {
    'banner': 'h-14',
    'large-banner': 'h-20',
    'rectangle': 'h-64',
  };

  return (
    <div className={`relative w-full ${sizeClasses[size]} overflow-hidden rounded-lg`}>
      {/* Ad container */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${ad.color} flex items-center justify-between px-4 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{ad.title}</p>
          <p className="text-white/80 text-xs truncate">{ad.desc}</p>
        </div>
        <button className="bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors shrink-0 ml-2">
          {ad.cta}
        </button>
        
        {/* Ad label */}
        <span className="absolute top-1 left-1 text-[9px] text-white/50 bg-black/20 px-1 rounded">
          Ad
        </span>
      </div>
      
      {/* Position indicator */}
      <div className="absolute bottom-1 right-2 flex gap-1">
        {DEMO_ADS.map((_, i) => (
          <span
            key={i}
            className={`w-1 h-1 rounded-full transition-colors ${
              i === currentAd ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* AdSense placeholder (hidden in demo mode) */}
      {AD_CONFIG.DEMO_MODE ? null : (
        <ins
          className="adsbygoogle absolute inset-0"
          style={{ display: 'block' }}
          data-ad-client={AD_CONFIG.PUBLISHER_ID}
          data-ad-slot={position === 'top' ? AD_CONFIG.AD_UNITS.BANNER_TOP : AD_CONFIG.AD_UNITS.BANNER_BOTTOM}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}

// ─── Interstitial Ad Component ───────────────────────────────────────
interface InterstitialAdProps {
  isVisible: boolean;
  onClose: () => void;
  countdown?: number;
}

export function InterstitialAd({ isVisible, onClose, countdown = 5 }: InterstitialAdProps) {
  const [timeLeft, setTimeLeft] = useState(countdown);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(countdown);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdown]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm mx-4 bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
          <span className="text-gray-400 text-xs">Advertisement</span>
          {canClose ? (
            <button
              onClick={onClose}
              className="text-gray-300 hover:text-white text-sm font-bold px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              ✕ Close
            </button>
          ) : (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-gray-500 border-t-transparent animate-spin"></span>
              Skip in {timeLeft}s
            </span>
          )}
        </div>

        {/* Ad content */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-6 text-center">
            <div className="text-5xl mb-4">🧮</div>
            <h3 className="text-white text-xl font-bold mb-2">Scientific Calculator Pro</h3>
            <p className="text-gray-300 text-sm mb-4">
              Unlock advanced features: graphing, matrix operations, equation solver, and more!
            </p>
            <div className="space-y-2 text-left">
              {[
                '📈 2D & 3D Function Graphing',
                '🔢 Matrix & Vector Operations', 
                '📝 Equation Solver',
                '🚫 No Advertisements',
                '🌙 Dark/Light Themes',
              ].map((feature, i) => (
                <p key={i} className="text-gray-200 text-xs">{feature}</p>
              ))}
            </div>
            <button className="mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-6 py-2.5 rounded-full hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg">
              Get Pro - Free Trial
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-800 border-t border-gray-700 text-center">
          <p className="text-gray-500 text-xs">
            {AD_CONFIG.DEMO_MODE ? '📋 Demo Ad - No real ad shown' : 'Powered by Google AdMob'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Native Inline Ad Component ──────────────────────────────────────
export function NativeAd() {
  const [adIndex, setAdIndex] = useState(0);

  const nativeAds = [
    {
      icon: '📱',
      title: 'Calculator Widget',
      desc: 'Add calculator to your home screen',
      rating: '4.8',
      installs: '1M+',
    },
    {
      icon: '🎯',
      title: 'Math Flashcards',
      desc: 'Practice mental math daily',
      rating: '4.6',
      installs: '500K+',
    },
    {
      icon: '📏',
      title: 'Geometry Tools',
      desc: 'Measure angles, areas & volumes',
      rating: '4.7',
      installs: '2M+',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex(prev => (prev + 1) % nativeAds.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const ad = nativeAds[adIndex];

  return (
    <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700 relative">
      <span className="absolute top-1 right-2 text-[9px] text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">
        Ad
      </span>
      <div className="flex items-center gap-3">
        <div className="text-3xl shrink-0">{ad.icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">{ad.title}</p>
          <p className="text-gray-400 text-xs truncate">{ad.desc}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-yellow-400 text-xs">★ {ad.rating}</span>
            <span className="text-gray-500 text-xs">{ad.installs}</span>
          </div>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors shrink-0">
          Install
        </button>
      </div>
    </div>
  );
}

// ─── Ad Blocker Warning ──────────────────────────────────────────────
export function AdBlockerWarning() {
  return (
    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-center">
      <p className="text-yellow-400 text-xs">
        ⚠️ Ad blocker detected. Please consider disabling it to support free development.
      </p>
    </div>
  );
}
