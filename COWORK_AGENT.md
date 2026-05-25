# COWORK AGENT - Core Surge Task Manager & Coordinator
**Agent:** Cowork (Claude Desktop)
**Role:** File management, documentation, memory, coordination, quality assurance, session logging
**Lane:** Does NOT write game code. Does NOT deploy. Manages files, creates documents, tracks progress, verifies work, keeps all agents synced.

---

## MANDATORY SESSION LOGGING RULE

**After EVERY response to Andy, append a timestamped entry to `sessions.md` with:**
1. Date and agent name
2. What was done (files created, edited, reviewed)
3. What changed
4. What the next agent should know
5. Any blockers discovered

**Format:**
```
## YYYY-MM-DD - Cowork - [Short Title]
**What I did:** [bullet list]
**Files touched:** [list]
**What other agents need to know:** [critical info]
**Blockers:** [any]
```

**Read sessions.md FIRST every time you start a new conversation to see what other agents have done since your last session.**

---

## HOW TO USE THIS FILE

Andy will say: "Read your agents.md and run next 5 tasks"
1. Read this file
2. Find the first 5 unchecked tasks (marked with `[ ]`)
3. Execute them in order
4. Mark each completed with `[x]` and add completion date
5. Update sessions.md after finishing

---

## TASK LIST

### Phase 1: Project Foundation & Documentation (Tasks 1-20)

- [x] **Task 1:** Read all existing .md files in Tower Mobile App Game/ and create a master INDEX.md listing every document, its purpose, and last-updated date (completed 2026-05-25)
- [x] **Task 2:** Audit sessions.md for accuracy - flag any claims that don't match actual file state (completed 2026-05-25, see SESSIONS_AUDIT.md)
- [x] **Task 3:** Create CHANGELOG.md tracking every version change from v0.7.22 forward (completed 2026-05-25)
- [x] **Task 4:** Create ARCHITECTURE.md documenting the full file structure (js/, css/, assets/, backend/, ios/, android/) with one-line descriptions of each file's purpose (completed 2026-05-25)
- [x] **Task 5:** Create GAME_DESIGN_DOCUMENT.md covering: core loop, progression systems, monetization model, target audience, platform targets (completed 2026-05-25)
- [ ] **Task 6:** Review all reference mockup images in REFERENCE NOT EXACTLY HOW I WANT/ and create DESIGN_NOTES.md summarizing the visual direction they establish
- [ ] **Task 7:** Create BALANCE_SPREADSHEET.md documenting: upgrade costs per family, rank unlock thresholds, gem earn rates, card pull odds, tournament tier requirements
- [ ] **Task 8:** Audit package.json and capacitor.config.json for correctness - verify all declared dependencies match what's actually used
- [ ] **Task 9:** Create ENV_SETUP.md documenting every environment variable, API key, and config value needed across all environments (dev, staging, prod)
- [ ] **Task 10:** Create KNOWN_BUGS.md with any issues visible from code review (console errors, missing null checks, edge cases)
- [ ] **Task 11:** Review Firebase service account JSON and verify project ID, region, and account details match what's in backend/firebase-config.js
- [ ] **Task 12:** Create ASSET_MANIFEST.md listing every file in assets/ with dimensions, format, and which game system uses it
- [ ] **Task 13:** Audit index.html for accessibility issues (missing alt tags, ARIA labels, color contrast)
- [ ] **Task 14:** Create TESTING_CHECKLIST.md - manual QA checklist covering every game screen and interaction
- [ ] **Task 15:** Review CRITICAL_PATH.md and update based on actual current state (what's really done vs claimed done)
- [ ] **Task 16:** Create DATA_DICTIONARY.md documenting every key in the save file (tower_save_v8) with data types and valid ranges
- [ ] **Task 17:** Audit all CSS files for unused rules, duplicate selectors, or conflicting styles
- [ ] **Task 18:** Create FONT_AND_COLOR_GUIDE.md documenting the design system (colors, fonts, spacing, border styles used across all CSS)
- [ ] **Task 19:** Review DEPLOYMENT_CHECKLIST.md and verify each step is still accurate given current backend state
- [ ] **Task 20:** Create DEPENDENCY_MATRIX.md showing which tasks block which across all three agents

### Phase 2: Compliance & Legal Documents (Tasks 21-40)

- [ ] **Task 21:** Draft PRIVACY_POLICY.md covering GDPR, CCPA, COPPA requirements for Core Surge
- [ ] **Task 22:** Draft TERMS_OF_SERVICE.md covering account rules, purchase policy, liability limits, age requirements
- [ ] **Task 23:** Create LOOT_BOX_DISCLOSURE.md documenting exact drop rates for every card rarity tier
- [ ] **Task 24:** Create DATA_RETENTION_POLICY.md specifying what data is stored, where, and how long
- [ ] **Task 25:** Create GDPR_DATA_REQUEST_PROCESS.md - step-by-step for handling user data access/deletion requests
- [ ] **Task 26:** Create COPPA_COMPLIANCE_CHECKLIST.md - verify every COPPA requirement is met or planned
- [ ] **Task 27:** Create AD_POLICY.md documenting: ad networks used, ad frequency caps, no ads to minors policy, ad placement rules
- [ ] **Task 28:** Create IARC_QUESTIONNAIRE_PREP.md - pre-fill answers for the IARC age rating questionnaire
- [ ] **Task 29:** Create REFUND_POLICY.md covering gem purchases, subscription cancellation, dispute resolution
- [ ] **Task 30:** Create COMMUNITY_GUIDELINES.md for Discord/Reddit - rules for player behavior, moderation policy
- [ ] **Task 31:** Create SECURITY_DISCLOSURE_POLICY.md - how to report vulnerabilities, response timeline
- [ ] **Task 32:** Create APP_STORE_PRIVACY_QUESTIONNAIRE.md - pre-fill Apple's privacy nutrition label questions
- [ ] **Task 33:** Create GOOGLE_PLAY_DATA_SAFETY.md - pre-fill Google Play's data safety section
- [ ] **Task 34:** Create COOKIE_POLICY.md (for web version) documenting localStorage usage and any tracking
- [ ] **Task 35:** Create THIRD_PARTY_SERVICES.md listing every external service (Firebase, RevenueCat, AdMob) with data they receive
- [ ] **Task 36:** Create ACCESSIBILITY_STATEMENT.md documenting current accessibility support and planned improvements
- [ ] **Task 37:** Review Privacy Policy draft against actual Firebase Auth data flow and update
- [ ] **Task 38:** Review Terms of Service draft against actual monetization implementation and update
- [ ] **Task 39:** Create IN_APP_PURCHASE_COMPLIANCE.md documenting Apple and Google's IAP rules and how Core Surge complies
- [ ] **Task 40:** Create CONTENT_RATING_JUSTIFICATION.md explaining why specific IARC ratings were selected

### Phase 3: App Store Preparation (Tasks 41-60)

- [ ] **Task 41:** Write Apple App Store description (short description 170 chars, full description, keywords)
- [ ] **Task 42:** Write Google Play Store description (short 80 chars, full description, keywords)
- [ ] **Task 43:** Create APP_STORE_SCREENSHOT_SPEC.md listing required screenshot sizes for every device class (iPhone 6.7", 6.1", 5.5", iPad, Android phone, Android tablet)
- [ ] **Task 44:** Write screenshot captions for each store screenshot (5-8 per platform)
- [ ] **Task 45:** Create APP_ICON_SPEC.md documenting required icon sizes (1024x1024 Apple, 512x512 Google) and design requirements
- [ ] **Task 46:** Write promotional text for App Store (170 chars, rotatable)
- [ ] **Task 47:** Create FEATURE_GRAPHIC_SPEC.md for Google Play (1024x500 requirements)
- [ ] **Task 48:** Write "What's New" text for v1.0 launch
- [ ] **Task 49:** Create STORE_CATEGORY_SELECTION.md justifying category choice (Games > Strategy)
- [ ] **Task 50:** Create APPLE_REVIEW_NOTES.md - notes for App Store reviewers explaining gameplay, IAP, and how to test
- [ ] **Task 51:** Create GOOGLE_PLAY_REVIEW_NOTES.md - similar notes for Google Play review team
- [ ] **Task 52:** Document required Apple developer account setup steps (certificates, provisioning profiles, bundle ID)
- [ ] **Task 53:** Document required Google Play developer account setup steps (signing key, package name, target API)
- [ ] **Task 54:** Create LOCALIZATION_PLAN.md - which languages to support at launch, which post-launch
- [ ] **Task 55:** Write support email templates for common player issues (lost progress, purchase problems, account deletion)
- [ ] **Task 56:** Create SUPPORT_FAQ.md for player-facing support page
- [ ] **Task 57:** Create PRESS_KIT.md with game description, key features, team info, contact info
- [ ] **Task 58:** Write social media launch announcement templates (Twitter, Reddit, Discord)
- [ ] **Task 59:** Create BETA_FEEDBACK_FORM.md with questions for beta testers
- [ ] **Task 60:** Create POST_LAUNCH_CONTENT_CALENDAR.md planning first 8 weeks of updates

### Phase 4: Quality Assurance & Verification (Tasks 61-80)

- [ ] **Task 61:** Cross-check CLAUDE_CODE_AGENT.md tasks against BUILD_PIPELINE_IMPLEMENTATION.md for consistency
- [ ] **Task 62:** Cross-check CODEX_AGENT.md tasks against COMPLIANCE_SECURITY_ANALYTICS.md for consistency
- [ ] **Task 63:** Verify every file referenced in sessions.md actually exists in the project folder
- [ ] **Task 64:** Verify capacitor.config.json appId matches what's in Apple/Google developer accounts
- [ ] **Task 65:** Verify Firebase project ID in all config files matches actual Firebase project
- [ ] **Task 66:** Audit README.md for accuracy against current project state
- [ ] **Task 67:** Review all TODO/FIXME comments in JS files and add to KNOWN_BUGS.md
- [ ] **Task 68:** Verify service worker caches correct files and version string matches
- [ ] **Task 69:** Check manifest.webmanifest for correct icons, name, theme_color, display mode
- [ ] **Task 70:** Verify save.js version migration handles all edge cases (corrupt data, missing fields, version skips)
- [ ] **Task 71:** Review game balance: are any upgrades clearly overpowered or underpowered based on cost/effect ratios?
- [ ] **Task 72:** Verify tournament tier progression math is correct (promotion/demotion thresholds, league placement)
- [ ] **Task 73:** Check all CSS media queries cover target device range (320px-1024px)
- [ ] **Task 74:** Verify no hardcoded API keys, secrets, or credentials exist in any JS file
- [ ] **Task 75:** Audit index.html script load order - verify dependencies load before dependents
- [ ] **Task 76:** Review firestore.rules for security holes (overly permissive reads/writes)
- [ ] **Task 77:** Verify backend/.env.example lists every required variable
- [ ] **Task 78:** Check that all image assets have reasonable file sizes (<500KB each)
- [ ] **Task 79:** Verify no console.log() debug statements remain in production-bound code
- [ ] **Task 80:** Create VERIFICATION_REPORT.md summarizing results of tasks 61-79

### Phase 5: Coordination & Session Management (Tasks 81-100)

- [ ] **Task 81:** After Claude Code completes any task, verify the files they changed exist and are non-empty
- [ ] **Task 82:** After Codex completes any task, verify the files they changed exist and are non-empty
- [ ] **Task 83:** When any agent marks a compliance task complete, verify the deliverable meets the spec in COMPLIANCE_SECURITY_ANALYTICS.md
- [ ] **Task 84:** When any agent marks a build task complete, verify the deliverable meets the spec in BUILD_PIPELINE_IMPLEMENTATION.md
- [ ] **Task 85:** Maintain LAUNCH_TRACKER.html with accurate completion percentages based on actual verified work
- [ ] **Task 86:** Update CRITICAL_PATH.md whenever a dependency is resolved or a new blocker appears
- [ ] **Task 87:** Create weekly PROGRESS_REPORT.md summarizing what all agents accomplished that week
- [ ] **Task 88:** Flag any task that has been "in progress" for more than 3 sessions without completion
- [ ] **Task 89:** When Firebase web app credentials are obtained, update all config files simultaneously
- [ ] **Task 90:** When IARC rating is obtained, update store listing docs and COMPLIANCE_SECURITY_ANALYTICS.md
- [ ] **Task 91:** Before beta launch, run full TESTING_CHECKLIST.md and document results
- [ ] **Task 92:** Before production launch, verify every item on CRITICAL_PATH.md blocking conditions list
- [ ] **Task 93:** After production launch, create LAUNCH_DAY_REPORT.md documenting metrics, issues, and immediate fixes needed
- [ ] **Task 94:** Monitor crash rate reports and update KNOWN_BUGS.md with any new issues
- [ ] **Task 95:** Track ad revenue metrics weekly and update relevant docs
- [ ] **Task 96:** Track IAP conversion metrics weekly and update relevant docs
- [ ] **Task 97:** Maintain memory files in Cowork memory system with key project decisions and state
- [ ] **Task 98:** Create ROLLBACK_PLAN.md documenting how to revert any deployment if critical bugs found
- [ ] **Task 99:** After every 10 completed tasks across all agents, do a full project health check
- [ ] **Task 100:** Create LESSONS_LEARNED.md documenting what worked, what didn't, and what to change for the next project

---

## DEPENDENCIES ON OTHER AGENTS

- **Blocked by Claude Code:** Tasks 81, 84 (need their build work to verify)
- **Blocked by Codex:** Tasks 82, 83 (need their compliance work to verify)
- **Blocks Claude Code:** Tasks 5 (game design doc informs UI decisions), 12 (asset manifest informs build pipeline)
- **Blocks Codex:** Tasks 21-28 (compliance docs inform implementation), 11 (Firebase config verification)
