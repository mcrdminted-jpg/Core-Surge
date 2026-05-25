# Advertising Policy

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-24
**Primary Ad Network:** Google AdMob

---

## Ad Network

- **Primary:** Google AdMob
- **Future Mediation Partners:** Unity Ads, AppLovin (added later for fill rate optimization)
- **SDK:** Google Mobile Ads SDK (integrated via Capacitor plugin)

---

## Ad Types and Placements

### Rewarded Video Ads

- **Trigger:** Offered after battle ends with a prompt: "Watch ad for 2x coins"
- **Behavior:** Completely optional and player-initiated (player taps a button to watch)
- **Reward:** 2x coin multiplier on battle earnings, OR bonus card pull, OR small gem bonus (varies by promotion)
- **Placement:** Post-battle results screen only
- **Never shown:** During gameplay, during card pulls, during tutorials

### Banner Ads

- **Size:** 320x50 (standard banner)
- **Placement:** Bottom of menu screens only (main menu, collection, shop browse)
- **Hidden during:** Active battle, card pull animations, loading screens, settings, age gate
- **Refresh rate:** Every 60 seconds
- **Behavior:** Non-intrusive, does not overlap interactive UI elements

### Interstitial Ads

- **Type:** Full-screen static or video
- **Trigger:** Shown between battles (after results screen is dismissed, before returning to menu)
- **Restrictions:** Never shown on a user's first session, never shown during gameplay
- **Close button:** Always visible, standard size, standard position (top-right corner)

---

## Frequency Caps

| Ad Type | Per-Instance Cooldown | Daily Maximum |
|---|---|---|
| Rewarded Video | 1 per 2 minutes | 10 per day |
| Interstitial | 1 per 3 minutes | 5 per day |
| Banner | Always visible on menus | Refresh every 60 seconds |

- Frequency caps are enforced client-side with server-side validation
- Daily caps reset at midnight UTC
- If a user reaches the daily cap, no more ads of that type are requested

---

## Ad-Free Options

- **IAP Bonus:** Any in-app purchase (gem pack or subscription) grants 24 hours of ad-free experience (banners and interstitials removed, rewarded still available if player wants)
- **Monthly Vault Subscription:** Subscribers get permanent ad-free experience while subscription is active
- **Premium Ad-Free Pack:** Consider offering a one-time $4.99 permanent ad removal IAP (future consideration)

---

## Child Safety (COPPA Compliance)

- Users identified as under 13 receive COPPA-compliant ad serving
- `tagForChildDirectedTreatment` set to `true` for under-13 users in AdMob configuration
- No personalized or behaviorally targeted ads for under-13 users
- Contextual ads only for under-13 users
- No ads that visually mimic game UI elements (buttons, rewards, notifications)
- No ads with misleading close buttons or deceptive interactive elements
- All ad content must comply with Google AdMob family policy

---

## Revenue Estimates

| Ad Type | Estimated RPM (Revenue Per 1000 Impressions) |
|---|---|
| Rewarded Video | $3.00 - $8.00 |
| Banner | $0.50 - $2.00 |
| Interstitial | $2.00 - $5.00 |

- RPM varies significantly by region (US/EU highest, SEA/LATAM lower)
- Rewarded video typically generates the highest revenue due to high engagement and completion rates
- Actual RPM will be tracked and optimized post-launch

---

## Development and Testing

### Test Ad Unit IDs (Use During Development)

Use Google's official test ad unit IDs to avoid policy violations during development:

- **Android Banner:** `ca-app-pub-3940256099942544/6300978111`
- **Android Interstitial:** `ca-app-pub-3940256099942544/1033173712`
- **Android Rewarded:** `ca-app-pub-3940256099942544/5224354917`
- **iOS Banner:** `ca-app-pub-3940256099942544/2934735716`
- **iOS Interstitial:** `ca-app-pub-3940256099942544/4411468910`
- **iOS Rewarded:** `ca-app-pub-3940256099942544/1712485313`

**Never use production ad unit IDs in development builds.** Doing so risks AdMob policy violations and account suspension.

---

## Mediation (Future Optimization)

After initial launch and baseline RPM data:

1. **Unity Ads:** Add as secondary fill for rewarded video (strong gaming audience)
2. **AppLovin / MAX:** Consider for mediation layer to optimize across multiple networks
3. **Meta Audience Network:** Evaluate based on user demographics
4. **A/B test:** Compare fill rates and RPM across networks before full rollout

---

## User Experience Rules

1. **Never interrupt active gameplay** with any ad
2. **Never force users to watch ads** to progress (rewarded ads are always optional)
3. **Always provide a visible close button** on interstitials (standard size, standard position)
4. **No misleading "X" buttons** that redirect to app stores or websites
5. **No ad stacking** (showing multiple ads back-to-back)
6. **No pre-roll ads** (no ads before the game loads or before gameplay starts)
7. **Respect user attention:** If a user just completed a long battle (10+ waves), do not show an interstitial
8. **Loading indicator:** Show a brief loading indicator before interstitial ads so the transition is not jarring
9. **Sound:** Ads should respect the user's in-game sound/mute settings where possible
10. **Orientation:** Ads must display in the correct orientation (portrait for Core Surge)

---

## Monitoring and Compliance

- Monitor AdMob policy center weekly for violations
- Track ad revenue, fill rate, and eCPM in AdMob dashboard
- Monitor user reviews for ad-related complaints
- If ad complaints exceed 5% of reviews, reduce interstitial frequency
- Quarterly review of ad strategy and revenue performance
