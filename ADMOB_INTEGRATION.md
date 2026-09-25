# AdMob / Google AdSense Integration Guide

## Overview

This calculator includes a complete advertising integration system using Google AdSense (web) / AdMob (mobile) with multiple ad formats:

- **Banner Ads** - Top and bottom of the page
- **Interstitial Ads** - Full-screen ads between calculations
- **Native Ads** - Inline ads that match the app's design
- **Ad Blocker Detection** - Warns users when ads are blocked

## Ad Components

### 1. Banner Ads (`BannerAd`)
- **Location**: Top and bottom of the page
- **Size**: 320x50 (standard banner) or 320x100 (large banner)
- **Rotation**: Automatically rotates through demo ads every 6 seconds
- **Features**: 
  - Smooth fade transitions
  - Call-to-action buttons
  - Ad indicator label
  - Progress dots showing current ad

### 2. Interstitial Ads (`InterstitialAd`)
- **Trigger**: Appears every 3 calculations (configurable)
- **Format**: Full-screen modal overlay
- **Features**:
  - 5-second countdown before close button appears
  - Cannot be dismissed early (standard mobile ad behavior)
  - Blur backdrop effect
  - Professional app promotion design

### 3. Native Ads (`NativeAd`)
- **Location**: Inline with content (after calculator, between sections)
- **Format**: Matches app design with app icon, rating, install button
- **Rotation**: Changes every 15 seconds
- **Features**:
  - Star rating display
  - Install count
  - Native app-store style layout

### 4. Ad Blocker Detection (`AdBlockerWarning`)
- **Detection**: Automatically detects if user has ad blocker
- **Display**: Yellow warning banner at top of page
- **Message**: Politely asks user to disable ad blocker

## Configuration

### File: `src/components/AdManager.tsx`

```typescript
export const AD_CONFIG = {
  // Your Google AdSense Publisher ID (get from adsense.google.com)
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX',
  
  // Ad Unit IDs (create these in your AdSense dashboard)
  AD_UNITS: {
    BANNER_TOP: '1234567890',
    BANNER_BOTTOM: '0987654321',
    INTERSTITIAL: '1122334455',
    NATIVE_INLINE: '5566778899',
  },
  
  // Timing configuration
  TIMING: {
    INTERSTITIAL_INTERVAL: 3,  // Show interstitial every N calculations
    BANNER_REFRESH: 60000,      // Refresh banner every 60 seconds
  },
  
  // Demo mode - shows placeholder ads instead of real ones
  DEMO_MODE: true,  // Set to false for production
};
```

## How to Enable Real Ads

### Step 1: Get Google AdSense Account
1. Go to [Google AdSense](https://adsense.google.com)
2. Sign up and get approved
3. Note your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 2: Create Ad Units
1. In AdSense dashboard, go to "Ads" → "By ad unit"
2. Create new ad units for each placement:
   - Banner Top (Display ad, 320x50 or responsive)
   - Banner Bottom (Display ad, 320x50 or responsive)
   - Interstitial (only for mobile apps via AdMob)
   - Native (In-feed or native style)
3. Copy the Ad Unit IDs

### Step 3: Update Configuration
```typescript
export const AD_CONFIG = {
  PUBLISHER_ID: 'ca-pub-YOUR_REAL_ID',  // Replace with your ID
  AD_UNITS: {
    BANNER_TOP: 'YOUR_TOP_UNIT_ID',
    BANNER_BOTTOM: 'YOUR_BOTTOM_UNIT_ID',
    INTERSTITIAL: 'YOUR_INTERSTITIAL_UNIT_ID',
    NATIVE_INLINE: 'YOUR_NATIVE_UNIT_ID',
  },
  TIMING: {
    INTERSTITIAL_INTERVAL: 3,  // Adjust based on user experience
    BANNER_REFRESH: 60000,
  },
  DEMO_MODE: false,  // IMPORTANT: Set to false for real ads
};
```

### Step 4: Add AdSense Script (for web)
Add this to your `index.html` `<head>` section:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_REAL_ID" crossorigin="anonymous"></script>
```

## AdMob for Mobile Apps

If you're building a mobile app (React Native, Capacitor, etc.), use AdMob instead:

### React Native Example
```bash
npm install react-native-google-mobile-ads
```

```javascript
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const interstitial = InterstitialAd.createForAdRequest(
  __DEV__ ? TestIds.INTERSTITIAL : 'ca-app-pub-XXXXXXXX/YYYYYYYY'
);

// Load and show
interstitial.load();
interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  // Ad closed, continue app
});
```

## Ad Placement Strategy

### Best Practices
1. **Don't overwhelm users** - Maximum 1 interstitial per 3-5 actions
2. **Natural breaks** - Show interstitials after completing tasks (calculations)
3. **Banner placement** - Top and bottom are standard, non-intrusive
4. **Native ads** - Blend with content for better engagement
5. **Respect users** - Always provide a way to close/dismiss ads

### Current Implementation
- **Banner Top**: Always visible, rotates every 60s
- **Banner Bottom**: Always visible, rotates every 60s
- **Interstitial**: Every 3 calculations (adjustable)
- **Native**: 2 placements (after calculator, between architecture sections)

## Testing

### Demo Mode (Current)
- Shows rotating placeholder ads
- No real ads are loaded
- Perfect for development and testing
- `DEMO_MODE: true` in config

### Production Mode
- Set `DEMO_MODE: false`
- Real ads will load from Google
- Requires approved AdSense account
- Test with test ads first (Google provides test ad units)

## Revenue Optimization Tips

1. **A/B Test Timing**: Try different interstitial intervals (2, 3, 5 calculations)
2. **Ad Refresh Rate**: 60s is standard, but 30-45s can increase impressions
3. **Ad Sizes**: Larger ads (320x100) typically earn more than 320x50
4. **User Engagement**: Keep users calculating longer = more ad impressions
5. **Geographic Targeting**: Ad revenue varies by country

## Compliance

### GDPR (Europe)
- Must show consent dialog before loading ads
- Use Google's consent management platform or alternatives

### CCPA (California)
- Provide "Do Not Sell My Personal Information" link
- Honor opt-out requests

### Children's Apps (COPPA)
- If targeting children under 13, cannot show personalized ads
- Must use non-personalized ads only

## Troubleshooting

### Ads Not Showing
1. Check `DEMO_MODE` is set to `false`
2. Verify Publisher ID is correct
3. Wait 24-48 hours after AdSense approval
4. Check browser console for errors
5. Ensure ad units are approved in AdSense dashboard

### Low Revenue
1. Increase ad refresh rate (30s instead of 60s)
2. Add more ad placements (but don't spam)
3. Target high-value keywords/content
4. Optimize for mobile (higher CPM rates)

### Ad Blocker Issues
1. Detect and politely warn users (already implemented)
2. Consider offering ad-free premium version
3. Use server-side ad insertion (advanced)

## File Structure

```
src/
├── components/
│   ├── AdManager.tsx       # All ad components and logic
│   ├── Calculator.tsx      # Main calculator (calls onCalculation)
│   ├── SourceViewer.tsx    # Source code viewer
│   └── ArchitectureDiagram.tsx
├── App.tsx                 # Integrates ads into layout
└── main.tsx
```

## API Reference

### `useAdManager()` Hook
```typescript
const {
  calculationCount,      // Number of calculations performed
  showInterstitial,      // Whether interstitial is visible
  interstitialReady,     // Whether interstitial should show
  adBlockDetected,       // Whether ad blocker is detected
  recordCalculation,     // Call when user calculates
  showInterstitialAd,    // Trigger interstitial display
  closeInterstitial,     // Close interstitial
} = useAdManager();
```

### Components

#### `<BannerAd position="top|bottom" size="banner|large-banner" />`
- Renders a rotating banner ad
- Auto-refreshes based on config

#### `<InterstitialAd isVisible={boolean} onClose={function} countdown={number} />`
- Full-screen modal ad
- Shows countdown before allowing close
- Typically triggered by `useAdManager`

#### `<NativeAd />`
- Inline native-style ad
- Rotates through different ads
- Matches app design

#### `<AdBlockerWarning />`
- Warning banner when ad blocker detected
- Polite message asking to disable

## Support

For AdSense issues: [Google AdSense Help](https://support.google.com/adsense)
For AdMob issues: [Google AdMob Help](https://support.google.com/admob)

---

**Note**: This is a demo implementation. For production use, ensure compliance with all applicable laws and Google's policies.
