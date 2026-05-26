# Compliance, Security & Analytics Implementation
**Target: Weeks 1-6 | Assigned: Codex | Priority: CRITICAL (blocking app store publication)**

## Overview
Core Surge v0.7.23 has 0% analytics integration, 50% privacy/security foundation, and 0% formal compliance documentation. These are hard blockers for app store submission. Work is staged by criticality: privacy policy (Week 1, blocks everything), Firebase Auth UI (Week 2), analytics (Week 3-4), security hardening (Week 4-5), IARC rating (Week 5).

---

## Week 1: Privacy & Legal Foundation (CRITICAL BLOCKER)

### Task 1.1 - Privacy Policy Draft (URGENT)
- **Current state:** None exists; Firebase Auth will process user data; analytics will track events
- **Regulatory drivers:** GDPR (EU users), CCPA (CA users), COPPA (potential child users)
- **What must be included:**
  1. **Data collection:**
     - What: username, play stats (waves, damage dealt, Scrap earned), device ID, Firebase Auth UID
     - Why: game progression tracking, tournament matchmaking, analytics
     - How long: retain for 2 years post-account deletion (GDPR compliance)
  2. **Third-party services:**
     - Firebase: authentication, realtime database, analytics (list each)
     - Ad networks: (specify once added; e.g., AdMob, IronSource)
     - Crash reporting: (once integrated; e.g., Sentry, Firebase Crashlytics)
  3. **User rights:**
     - Right to access: user can request dump of their data
     - Right to delete: user can request account deletion (anonymize saves, purge Firebase)
     - Right to opt-out: analytics opt-out, ad personalization opt-out
  4. **COPPA considerations:**
     - Game rated E for Everyone but no explicit child protection yet
     - If targeting <13: parental consent flow, no behavioral ads, no data sale
     - Decision needed: is Core Surge positioning as child-safe? (recommend yes)
  5. **CCPA specifics (CA only):**
     - List all "personal information" collected
     - Include opt-out link for "sale of personal information" (even if not selling)
  6. **Contact & enforcement:**
     - Privacy contact email (support@coresurge.game or similar)
     - GDPR DPA contact (if processing EU data)
- **Deliverable:** `PRIVACY_POLICY.md` (2-3 pages, plain English)
- **Legal review:** Have non-lawyer developer review; flag uncertainty for legal counsel later
- **Verification:** Covers all Firebase features used; readable by non-technical person

### Task 1.2 - Terms of Service Draft
- **Scope (prioritize):**
  1. **Account & username rules:**
     - Players can choose username at signup
     - Names violating community guidelines (slurs, harassment) can be reset
     - Account deletion: data purged within 30 days
  2. **In-app purchases & refunds:**
     - Gems are non-refundable (consumable currency)
     - Defective purchases (double-charge): contact support within 7 days
     - Apple/Google refund policy applies (they handle refunds)
  3. **Prohibited behavior:**
     - Cheating/hacking: account ban without warning
     - Harassment in tournament names/chat: account suspension
     - Monetization abuse (gift card fraud): legal action
  4. **Liability limitation:**
     - Game provided "as is" without warranty
     - Company not liable for lost progress, service outages
     - Maximum liability: refund of gems purchased (not account value)
  5. **Age restriction & legal disclaimers:**
     - User must be 13+ (or get parental consent if COPPA applies)
     - Loot box odds disclosed (pull odds: 2% apex, 20% prime, 78% standard)
     - State/country-specific legal notices (Belgium: loot boxes regulated)
- **Deliverable:** `TERMS_OF_SERVICE.md` (1-2 pages)
- **Verification:** Covers account lifecycle, purchases, bans, age/legal

### Task 1.3 - Loot Box Disclosure & Compliance
- **Regulatory landscape:**
  - Belgium: requires odds disclosure + player spending limits
  - UK (post-IARC): industry working toward best practices
  - US: no federal regulation but FTC scrutiny increasing
- **Current implementation in Core Surge:**
  - Card pulls: 20 gems per single pull (fixed price)
  - Pull odds: PULL_ODDS in data.js: standard 78%, prime 20%, apex 2%
  - Bundle: 180 gems for 10 pulls (saves 20 gems vs 10×20)
  - Decision: Is this a "loot box"? (Yes: randomized reward for money)
- **Required disclosures:**
  1. Add to game UI: "Odds: Apex 2%, Prime 20%, Standard 78%" on card pull screen
  2. Add to Terms: Exact odds listed
  3. Belgium specific: Add spending limit prompt ("You've spent €X this month, continue?")
  4. Track total spend per user (data needed for compliance)
- **Deliverable:** 
  - Odds prominently displayed in card pull UI
  - `LOOT_BOX_COMPLIANCE.md` documenting odds + jurisdiction handling
  - Spending tracker in save.js (totalGemsSpentThisMonth field)
- **Verification:** Odds visible without digging through code; spending limit enforced for Belgium

---

## Week 2: Authentication & User Identity

### Task 2.1 - Firebase Auth UI Implementation
- **Current state:** Firebase imported but no login/signup UI; save.js uses username (local string)
- **Goal:** User authentication tied to Firebase Auth (Google/Apple/Email options)
- **Steps:**
  1. Add Firebase Auth UI screen to index.html (before main menu):
     - Email/password signup
     - Email/password login
     - Google Sign-In button
     - Apple Sign-In button (for iOS)
     - Guest option (for first-time players to try without account)
  2. Update save.js:
     - Replace username (string) with Firebase UID (tied to auth)
     - Move save files to Firestore user collection (not localStorage alone)
     - Keep localStorage as cache; Firestore as source of truth
  3. Update game.js:
     - Track user.uid in all multiplayer contexts (tournament, leaderboard)
     - Pass uid to cloud.js for tournament ranking
  4. Test scenarios:
     - New user signs up → Firebase auth + Firestore document created
     - User logs out → return to login screen
     - User loses network → offline save to localStorage, sync on reconnect
     - User guest plays → saves stored locally, offer convert to account
  5. Privacy: Add "agree to Privacy Policy" checkbox at signup
- **Deliverable:** Auth screen in index.html + Firebase Auth SDK configured + Firestore user collection
- **Verification:** 
  - Can signup with email, login, logout
  - User progress persists across sessions
  - Tournament shows real user IDs (not "Player_XXXX")
  - Offline mode still works

### Task 2.2 - Account Recovery & Data Deletion
- **Goal:** Users can reset password and request data deletion (GDPR compliance)
- **Steps:**
  1. Add "Forgot Password?" link on login screen
     - Firebase Auth handles email reset flow
     - User receives reset email, sets new password
  2. Add "Delete Account" option in Settings (screen-menu Settings tab)
     - Requires password confirmation
     - Shows warning: "This cannot be undone"
     - Removes Firebase Auth user + Firestore document + all tournament history
     - Keeps localStorage save (user can export as backup before deleting)
  3. Add "Export My Data" (GDPR data subject request):
     - User clicks "Download My Data" in Settings
     - Triggers cloud function to package: user doc + all game saves + tournament history
     - Exports as JSON file
  4. Log all deletions for GDPR audit trail
- **Deliverable:** 
  - "Forgot Password" on login screen
  - "Delete Account" + "Export Data" in Settings
  - Cloud function for data export
- **Verification:** 
  - Forgot password email arrives and works
  - Deleting account removes from Firestore but allows offline play
  - Data export is valid JSON with all user info

---

## Week 3: Analytics & Event Tracking (0% → 80%)

### Task 3.1 - Analytics SDK Integration
- **Current state:** No event tracking; no crash reporting
- **Goal:** Track gameplay metrics to understand user behavior, monetization, retention
- **Choose platform:** Amplitude, Mixpanel, Firebase Analytics, or Segment
  - **Recommendation:** Firebase Analytics (free tier, integrated with Firebase, sufficient for launch)
- **Core events to track:**
  1. **Session events:**
     - `app_open`: user opens game (uid, deviceId, version)
     - `session_start`: battle begins (tier, run_id, is_offline)
     - `session_end`: user quits (tier, duration_ms, waves_reached, scrap_earned)
  2. **Monetization events:**
     - `gem_purchase`: user buys gems (amount, iad_product_id, currency, price_usd)
     - `card_pull`: user pulls card (tier, card_id, pull_type: single/bundle)
     - `unlock_purchase`: user buys unlock (unlock_type, cost_gems)
     - `slot_unlock`: user unlocks card slot (slot_number, cost_gems)
     - Track: total revenue (sum of gem_purchase), ARPPU (avg revenue per paying user)
  3. **Engagement events:**
     - `card_equip`: user changes deck (cards_equipped)
     - `rank_purchase`: user buys a rank (rank_id, cost_scrap)
     - `tournament_join`: user enters tournament (band, league)
     - `milestone_claimed`: user claims milestone reward (milestone_name)
  4. **Churn signals:**
     - `daily_active_user`: logged in today (uid)
     - `monthly_active_user`: logged in this month
     - `session_sequence`: sessions per week (retention curve)
- **Steps:**
  1. Add Firebase Analytics SDK to index.html
  2. Wrap game.js critical points with `logEvent()` calls
  3. Create analytics helper: `logSessionStart()`, `logCardPull()`, `logMonetization()`, etc.
  4. Test: check Firebase Analytics console for event flow (24h delay)
  5. Privacy: Add opt-out toggle in Settings (saves to localStorage, passed to Firebase)
- **Deliverable:** 
  - Firebase Analytics configured
  - 15+ core events emitting
  - Analytics helper module in `js/analytics.js`
  - Privacy opt-out in Settings screen
- **Verification:** 
  - Play 3 battles, see events in Firebase console
  - Opt-out prevents events from being sent
  - Revenue event triggers when gems purchased

### Task 3.2 - Dashboard & Monitoring Setup
- **Goal:** Track game health in real-time
- **Metrics to monitor:**
  1. **DAU/MAU:** daily/monthly active users (Firebase)
  2. **Retention:** % of players returning 1-day, 7-day, 30-day (Firebase cohorts)
  3. **Revenue:** gems purchased, ARPPU, LTV (lifetime value)
  4. **Performance:** avg session duration, waves reached, churn rate
  5. **Errors:** crash rate, error logs (Firebase Crashlytics)
- **Tool:** Firebase Console dashboard (native; free; sufficient for launch)
- **Steps:**
  1. Create dashboard in Firebase Console
  2. Add key metrics as tiles: DAU, MAU, avg session time, revenue
  3. Set alerts: if crash rate > 5%, send Slack/email
  4. Weekly export: email DAU/MAU/revenue to founder (Slack webhook)
  5. Document where to find metrics (for post-launch monitoring)
- **Deliverable:** Firebase dashboard configured + Slack webhook for alerts
- **Verification:** 
  - Dashboard shows accurate event counts
  - Slack receives test alert
  - Weekly metrics email sends

### Task 3.3 - Crash Reporting & Error Tracking
- **Current state:** No crash reporting; errors may go unnoticed
- **Goal:** Catch bugs post-launch before users hit them
- **Setup:**
  1. Add Firebase Crashlytics to index.html
  2. Wrap game.js in try-catch for critical functions:
     - getDamage(), getStormThreadData(), performPull(), etc.
     - Log error to Crashlytics: `firebase.crashlytics().recordError(error)`
  3. Test: intentionally throw error, verify it appears in Crashlytics console
  4. Configure alerts: if crash rate spikes, email developer
- **Deliverable:** 
  - Crashlytics SDK integrated
  - 5+ critical functions wrapped with error logging
  - Alert configured in Crashlytics
- **Verification:** 
  - Throw test error, see in console within 1 minute
  - Crash rate visible in dashboard

---

## Week 4: Security Hardening

### Task 4.1 - Data Encryption & Secure Storage
- **Current state:** Save data stored unencrypted in localStorage; passes through network unencrypted (HTTPS mitigates)
- **Goal:** Encrypt sensitive player data
- **What to encrypt:**
  1. **High priority:** 
     - Card inventory (equippedCards array)
     - Gems balance
     - Rank progress
  2. **Medium priority:**
     - Username
     - Play stats
  3. **Low priority:** 
     - Settings (theme, volume, etc.)
- **Implementation:**
  1. Use TweetNaCl.js or libsodium.js for encryption
  2. Derive encryption key from Firebase UID + device ID (constant per user/device)
  3. Encrypt save before writing to localStorage
  4. Decrypt on load (transparent to game code)
  5. For Firestore: use server-side encryption (Firebase default) + client-side for extra paranoia
- **Deliverable:** 
  - `js/crypto.js` with encrypt/decrypt functions
  - save.js uses crypto.js for sensitive fields
  - Documentation of encryption strategy
- **Verification:** 
  - Open localStorage, save data is not readable plaintext
  - Game runs normally (encryption transparent)
  - Decryption fails if key is wrong (test with wrong device ID)

### Task 4.2 - Network Security & API Protection
- **Current state:** Cloud.js stubs exist; no rate limiting, no request validation
- **Goal:** Prevent cheating, abuse, DoS
- **Steps:**
  1. **Input validation:**
     - Tournament entries: validate tier is 1-18, player exists
     - Card pulls: validate gems balance before deducting
     - Rank purchases: validate coins balance, rank not already maxed
     - All validated server-side (cloud functions) not client-only
  2. **Rate limiting:**
     - Limit pulls: 10 per minute per user (prevent gem exploit)
     - Limit tournament entries: 1 per band per cycle
     - Limit API calls: 100 per minute per user (general)
  3. **HTTPS & TLS:**
     - Firebase Hosting enforces HTTPS
     - Verify service worker uses HTTPS only (no mixed content)
     - Test: try loading over HTTP, should redirect to HTTPS
  4. **CORS & CSP:**
     - Set Content-Security-Policy header (Firebase Hosting config)
     - Only allow resources from first-party + Firebase domains
     - Block inline scripts (use nonce for allowed inline)
- **Deliverable:** 
  - Cloud functions with input validation + rate limiting
  - HTTP headers configured in firebase.json
  - Security checklist: HTTPS, CSP, CORS verified
- **Verification:** 
  - Try pulling with insufficient gems (validation rejects)
  - Pull >10 times in 60s (rate limit rejects)
  - Load game over HTTP (redirects to HTTPS)
  - Check response headers for CSP

### Task 4.3 - Dependency & Vulnerability Audit
- **Goal:** Catch known vulnerabilities in libraries before release
- **Steps:**
  1. Run `npm audit` to check Node dependencies
     - Flags any security issues in build tools, dev dependencies
  2. Check runtime dependencies (Firebase SDK, etc.):
     - Visit npm.com/package/<name>, review recent security advisories
     - Subscribe to Firebase security notices
  3. Audit code for common vulnerabilities:
     - No hardcoded API keys (check git history)
     - No use of eval() or Function()
     - No DOM.innerHTML with user input (prevent XSS)
     - No localStorage used for secrets (already encrypted via crypto.js)
  4. Fix critical issues before release; document known low-severity issues
- **Deliverable:** 
  - `SECURITY_AUDIT.md` listing vulnerabilities found + mitigation
  - npm audit clean (no critical/high issues)
  - Code audit checklist completed
- **Verification:** 
  - `npm audit` returns zero critical/high issues
  - No hardcoded secrets in codebase
  - XSS test: try injecting <script> in username, verify it's escaped

---

## Week 5: App Store Compliance & Rating

### Task 5.1 - IARC Rating Questionnaire
- **Current state:** No IARC rating (blocking Google Play & Apple App Store submission)
- **Context:** 
  - IARC is International Age Rating Coalition
  - Used by Google Play, Apple App Store, Windows, Amazon to assign age ratings
  - Based on questionnaire about content: violence, profanity, age-gating, etc.
- **Core Surge specifics:**
  - Violence: Towers shoot enemies; minimal gore; particle effects; E for Everyone appropriate
  - In-app purchases: Yes (gems, card pulls, cosmetics)
  - No user-generated content (usernames moderated, tournament results auto-generated)
  - No real-time multiplayer chat (no voice/text between players during matches)
- **Steps:**
  1. Go to iarccertification.com
  2. Answer questionnaire (30-40 questions):
     - Game type, content descriptors, violence level, mature content, etc.
  3. Get provisional rating (ESRB, IARC, etc.)
  4. Submit to game stores as part of app listing
- **Timeline:** IARC issues rating within 1-2 business days
- **Deliverable:** IARC certificate (screenshot or email) + rating applied to app listing
- **Verification:** IARC site shows Core Surge with assigned ratings

### Task 5.2 - App Store Listing Compliance
- **Google Play:**
  - Required: Privacy Policy (URL, in-app + on store)
  - Required: Content rating questionnaire (IARC)
  - Required: Screenshot compliance (no content claims that don't match game)
  - Required: Permissions (network, device ID, camera if used, etc.)
  - Optional but recommended: Video (30s gameplay trailer)
- **Apple App Store:**
  - Same as Google Play + additional:
  - Required: COPPA/age gating (if targeting <17 year-olds; recommend yes for E for Everyone)
  - Terms of Service URL
  - Privacy Policy URL
  - Contact info (support email)
- **Steps:**
  1. Prepare store assets:
     - Icon (1024x1024 PNG, no rounded corners)
     - Screenshots (2-5, showing core gameplay, card menu, tournament)
     - Description (<4000 chars)
     - Keywords (tower defense, strategy, card game, etc.)
  2. Draft store listing copy (sell the game; highlight unique features)
  3. Link privacy policy & ToS (hosted on website or Firebase Hosting)
  4. Test: submit to beta track (Google Play internal test, TestFlight on iOS)
  5. Fix any rejections from store review team
- **Deliverable:** Complete store listing + approved on both platforms
- **Verification:** 
  - Game appears on Google Play store (beta or production)
  - Game appears on Apple App Store TestFlight
  - All required fields filled without warnings

---

## Week 6: Documentation & Ongoing Compliance

### Task 6.1 - Compliance Documentation Package
- **Deliverable:** Single folder with:
  1. `PRIVACY_POLICY.md` (signed, dated)
  2. `TERMS_OF_SERVICE.md` (signed, dated)
  3. `LOOT_BOX_COMPLIANCE.md` (odds, spending limits, jurisdictions)
  4. `SECURITY_AUDIT.md` (vulnerabilities, mitigations)
  5. `DATA_DELETION_PROCEDURE.md` (how to comply with GDPR/CCPA requests)
  6. `IARC_CERTIFICATE.pdf`
  7. `FIREBASE_CONFIG.md` (Auth, Firestore rules, data retention policy)
- **Purpose:** 
  - For audits (app stores, regulators, legal)
  - For new developers joining project
  - For post-launch compliance monitoring
- **Verification:** All docs internally consistent; no contradictions

### Task 6.2 - Ongoing Compliance Monitoring
- **Post-launch checklist (weekly):**
  - [ ] Crashlytics: any spike in errors?
  - [ ] Analytics: any unusual patterns (e.g., users exploiting gems)?
  - [ ] Privacy requests: any GDPR/CCPA data subject requests received? (process within 30 days)
  - [ ] Security alerts: npm audit, Firebase security notices
  - [ ] Store reviews: any rejection feedback from Google/Apple?
- **Quarterly review:**
  - Update privacy policy if data practices change
  - Audit dependencies for new vulnerabilities
  - Check if new regulations apply (e.g., new country launch)
  - Review analytics for retention/churn trends (informs next update)
- **Deliverable:** `COMPLIANCE_CHECKLIST.md` for ongoing use
- **Responsibility:** Assign owner (founder or designated team member)

---

## Success Criteria
- [ ] Privacy Policy covers all Firebase features + data handling
- [ ] Terms of Service covers purchases, bans, age restrictions
- [ ] Loot box odds prominently displayed + jurisdiction-specific rules
- [ ] Firebase Auth UI functional (Google, Apple, Email signup/login)
- [ ] Account deletion + data export working
- [ ] 15+ core analytics events emitting and visible in Firebase
- [ ] Crash reporting active (errors logged to Crashlytics)
- [ ] Sensitive data encrypted (card inventory, gems, ranks)
- [ ] Network security: rate limiting + input validation + HTTPS only
- [ ] npm audit clean (no critical/high security issues)
- [ ] IARC rating obtained and applied to store listing
- [ ] App Store listings complete on Google Play + Apple App Store (beta)
- [ ] Compliance documentation package complete + reviewed
- [ ] Weekly monitoring checklist assigned

---

## Dependencies
- **Blockers on Claude Code:** Firebase Hosting + auth SDK must be deployed (BUILD_PIPELINE Week 3) before Task 2.1 can fully test
- **Parallel tracks:** Can start privacy policy (Task 1.1) immediately; analytics (Task 3) can start Week 1 but won't fully test until Task 2 complete
- **External dependencies:** IARC certification (1-2 days), app store approval (3-5 days post-submission)

---

## Risk Factors
- Privacy Policy ambiguity: recommend legal review before launch (budget for 2-4 hours lawyer time)
- GDPR/CCPA compliance: if unsure, consult DPA (data protection authority) or lawyer
- App store rejections: common for loot box disclosure; IARC helps; build in 1-2 week buffer for resubmission
- Firebase Crashlytics delay: events logged but visible in console with 1-2 hour delay (not real-time)
- COPPA implications: if targeting <13, parental consent flow is complex; decide early if this is in-scope for launch
