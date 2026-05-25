# App Store Review Notes

## Apple App Review

### Demo Account
Not required. The game functions fully without login. Guest mode is available immediately on first launch. Account creation is optional and only required for cloud save and tournament participation.

### In-App Purchases

| Item | Type | Price Range |
|------|------|------------|
| Gem Packs | Consumable | $0.99 - $49.99 |
| Monthly Vault | Auto-Renewable Subscription | $4.99/month |

### Loot Box / Gacha Disclosure
Card pull odds are displayed in the Shop tab before any purchase is made. Players can view exact drop rates for Standard, Prime, and Apex rarity cards prior to spending gems. This complies with Apple's guideline 3.1.1 regarding transparency of randomized virtual items.

### Age Rating
- **Recommended:** 12+
- **Reason:** Simulated gambling (card pull/gacha mechanics with randomized outcomes)
- **No:** realistic violence, profanity, mature themes, horror, alcohol/drug references, sexual content, medical information, user-generated content

### Privacy and Tracking
- No IDFA usage for tracking purposes
- No third-party tracking SDKs
- Firebase Analytics for internal crash reporting and performance monitoring only
- No data sold to third parties
- Privacy Nutrition Labels completed accurately in App Store Connect

### Special Instructions for Reviewers
"Game plays fully offline. All core gameplay is accessible without an internet connection. Cloud save is optional and requires Firebase Authentication (email or anonymous auth). Tournament mode requires account creation to submit scores. In-app purchase gem packs are consumable currency used to pull cards and purchase cosmetic skins. The Monthly Vault subscription provides daily gem rewards and is cancellable at any time."

### Export Compliance
- No encryption beyond standard HTTPS for API calls
- Uses Apple's built-in App Transport Security
- ECCN classification: Not required (mass-market encryption exemption applies)

---

## Google Play Review

### Content Rating
- IARC questionnaire completed
- **Target rating:** Everyone 12+ / PEGI 12
- Simulated gambling content (gacha/card pulls) flagged in questionnaire
- No real-money gambling

### Data Safety
- Data safety section completed per GOOGLE_PLAY_DATA_SAFETY.md
- Data collected: device identifiers (analytics), purchase history (transactions)
- Data shared: none
- Data handling: encrypted in transit, deletion available on request

### Advertising
- AdMob integrated for optional rewarded video ads
- COPPA-compliant ad serving configured
- No personalized ads for users under 18
- Ad content filtering enabled (no gambling, alcohol, or dating ads)

### Target Audience and Content
- **Target audience:** 13+ (not designed for children under 13)
- **Not a children's app:** Game contains gacha mechanics and in-app purchases
- **Families Policy:** Not applicable (not enrolled in Designed for Families program)
- **Teacher Approved:** Not applicable

### News / Government Apps
Not applicable.

### App Access
- No special access required for review
- Game launches directly into gameplay
- No login wall or paywall blocking core features

### Country/Region Availability
- Available worldwide
- Belgium: gacha/loot box mechanics may require review for compliance with local gambling regulations
- Netherlands: same consideration as Belgium
- Note: monitor regulatory changes in these regions

### Monetization Declaration
- In-app purchases: Yes
- Ads: Yes (rewarded video, optional)
- Subscription: Yes (Monthly Vault, auto-renewable)
- All declared in Play Console monetization section
