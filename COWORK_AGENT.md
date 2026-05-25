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
- [x] **Task 6:** Review all reference mockup images in REFERENCE NOT EXACTLY HOW I WANT/ and create DESIGN_NOTES.md (completed 2026-05-25)
- [x] **Task 7:** Create BALANCE_SPREADSHEET.md (completed 2026-05-25)
- [x] **Task 8:** Audit package.json and capacitor.config.json - see PACKAGE_AUDIT.md (completed 2026-05-25)
- [x] **Task 9:** Create ENV_SETUP.md (completed 2026-05-25)
- [x] **Task 10:** Create KNOWN_BUGS.md (completed 2026-05-25)
- [x] **Task 11:** Review Firebase config consistency - see FIREBASE_VERIFICATION.md (completed 2026-05-25)
- [x] **Task 12:** Create ASSET_MANIFEST.md with file sizes (completed 2026-05-25)
- [x] **Task 13:** Audit accessibility - see ACCESSIBILITY_AUDIT.md (completed 2026-05-25)
- [x] **Task 14:** Create TESTING_CHECKLIST.md with 100+ test cases (completed 2026-05-25)
- [x] **Task 15:** Review CRITICAL_PATH.md - see CRITICAL_PATH_UPDATE.md (completed 2026-05-25)
- [x] **Task 16:** Create DATA_DICTIONARY.md (completed 2026-05-25)
- [x] **Task 17:** Audit CSS files - see CSS_AUDIT.md (completed 2026-05-25)
- [x] **Task 18:** Create FONT_AND_COLOR_GUIDE.md (completed 2026-05-25)
- [x] **Task 19:** Review deployment checklist - see DEPLOYMENT_REVIEW.md (completed 2026-05-25)
- [x] **Task 20:** Create DEPENDENCY_MATRIX.md (completed 2026-05-25)

### Phase 2: Compliance & Legal Documents (Tasks 21-40)

- [x] **Task 21:** Draft PRIVACY_POLICY.md - 13 sections, GDPR/CCPA/COPPA compliant (completed 2026-05-25)
- [x] **Task 22:** Draft TERMS_OF_SERVICE.md - 15 sections, WA state law, arbitration clause (completed 2026-05-25)
- [x] **Task 23:** Create LOOT_BOX_DISCLOSURE.md - exact odds for all 25 cards, meets Apple 3.1.1 and Google requirements (completed 2026-05-25)
- [x] **Task 24:** Create DATA_RETENTION_POLICY.md - 7 data stores documented with retention periods (completed 2026-05-25)
- [x] **Task 25:** Create GDPR_DATA_REQUEST_PROCESS.md - SAR, erasure, rectification, portability procedures with template emails (completed 2026-05-25)
- [x] **Task 26:** Create COPPA_COMPLIANCE_CHECKLIST.md - verify every COPPA requirement is met or planned (completed 2026-05-25)
- [x] **Task 27:** Create AD_POLICY.md documenting: ad networks used, ad frequency caps, no ads to minors policy, ad placement rules (completed 2026-05-25)
- [x] **Task 28:** Create IARC_QUESTIONNAIRE_PREP.md - pre-fill answers for the IARC age rating questionnaire (completed 2026-05-25)
- [x] **Task 29:** Create REFUND_POLICY.md covering gem purchases, subscription cancellation, dispute resolution (completed 2026-05-25)
- [x] **Task 30:** Create COMMUNITY_GUIDELINES.md for Discord/Reddit - rules for player behavior, moderation policy (completed 2026-05-25)
- [x] **Task 31:** Create SECURITY_DISCLOSURE_POLICY.md - how to report vulnerabilities, response timeline (completed 2026-05-25)
- [x] **Task 32:** Create APP_STORE_PRIVACY_QUESTIONNAIRE.md - pre-fill Apple's privacy nutrition label questions (completed 2026-05-25)
- [x] **Task 33:** Create GOOGLE_PLAY_DATA_SAFETY.md - pre-fill Google Play's data safety section (completed 2026-05-25)
- [x] **Task 34:** Create COOKIE_POLICY.md (for web version) documenting localStorage usage and any tracking (completed 2026-05-25)
- [x] **Task 35:** Create THIRD_PARTY_SERVICES.md listing every external service (Firebase, RevenueCat, AdMob) with data they receive (completed 2026-05-25)
- [x] **Task 36:** Create ACCESSIBILITY_STATEMENT.md documenting current accessibility support and planned improvements (completed 2026-05-25)
- [x] **Task 37:** Review Privacy Policy draft against actual Firebase Auth data flow and update (completed 2026-05-25)
- [x] **Task 38:** Review Terms of Service draft against actual monetization implementation and update (completed 2026-05-25)
- [x] **Task 39:** Create IN_APP_PURCHASE_COMPLIANCE.md documenting Apple and Google's IAP rules and how Core Surge complies (completed 2026-05-25)
- [x] **Task 40:** Create CONTENT_RATING_JUSTIFICATION.md explaining why specific IARC ratings were selected (completed 2026-05-25)

### Phase 3: App Store Preparation (Tasks 41-60)

- [x] **Task 41:** Write Apple App Store description (short description 170 chars, full description, keywords) (completed 2026-05-25)
- [x] **Task 42:** Write Google Play Store description (short 80 chars, full description, keywords) (completed 2026-05-25)
- [x] **Task 43:** Create APP_STORE_SCREENSHOT_SPEC.md listing required screenshot sizes for every device class (completed 2026-05-25)
- [x] **Task 44:** Write screenshot captions for each store screenshot (5-8 per platform) (completed 2026-05-25)
- [x] **Task 45:** Create APP_ICON_SPEC.md documenting required icon sizes (1024x1024 Apple, 512x512 Google) and design requirements (completed 2026-05-25)
- [x] **Task 46:** Write promotional text for App Store (170 chars, rotatable) (completed 2026-05-25)
- [x] **Task 47:** Create FEATURE_GRAPHIC_SPEC.md for Google Play (1024x500 requirements) (completed 2026-05-25)
- [x] **Task 48:** Write "What's New" text for v1.0 launch (completed 2026-05-25)
- [x] **Task 49:** Create STORE_CATEGORY_SELECTION.md justifying category choice (Games > Strategy) (completed 2026-05-25)
- [x] **Task 50:** Create APPLE_REVIEW_NOTES.md - notes for App Store reviewers explaining gameplay, IAP, and how to test (completed 2026-05-25)
- [x] **Task 51:** Create GOOGLE_PLAY_REVIEW_NOTES.md - similar notes for Google Play review team (completed 2026-05-25)
- [x] **Task 52:** Document required Apple developer account setup steps (certificates, provisioning profiles, bundle ID) (completed 2026-05-25)
- [x] **Task 53:** Document required Google Play developer account setup steps (signing key, package name, target API) (completed 2026-05-25)
- [x] **Task 54:** Create LOCALIZATION_PLAN.md - which languages to support at launch, which post-launch (completed 2026-05-25)
- [x] **Task 55:** Write support email templates for common player issues (lost progress, purchase problems, account deletion) (completed 2026-05-25)
- [x] **Task 56:** Create SUPPORT_FAQ.md for player-facing support page (completed 2026-05-25)
- [x] **Task 57:** Create PRESS_KIT.md with game description, key features, team info, contact info (completed 2026-05-25)
- [x] **Task 58:** Write social media launch announcement templates (Twitter, Reddit, Discord) (completed 2026-05-25)
- [x] **Task 59:** Create BETA_FEEDBACK_FORM.md with questions for beta testers (completed 2026-05-25)
- [x] **Task 60:** Create POST_LAUNCH_CONTENT_CALENDAR.md planning first 8 weeks of updates (completed 2026-05-25)

### Phase 4: Quality Assurance & Verification (Tasks 61-80)

- [x] **Task 61:** Cross-check CLAUDE_CODE_AGENT.md tasks against BUILD_PIPELINE_IMPLEMENTATION.md for consistency (completed 2026-05-25, findings in KNOWN_BUGS.md)
- [x] **Task 62:** Cross-check CODEX_AGENT.md tasks against COMPLIANCE_SECURITY_ANALYTICS.md for consistency (completed 2026-05-25, findings in KNOWN_BUGS.md)
- [x] **Task 63:** Verify every file referenced in sessions.md actually exists in the project folder (completed 2026-05-25, 1 mismatch: backend/firebase.js should be backend/firebase-config.js)
- [x] **Task 64:** Verify capacitor.config.json appId matches what's in Apple/Google developer accounts (completed 2026-05-25, appId confirmed com.mcrdminted.coresurge but product IDs in data.js use wrong prefix)
- [x] **Task 65:** Verify Firebase project ID in all config files matches actual Firebase project (completed 2026-05-25, project ID consistent in cloud.js, missing .firebaserc file)
- [x] **Task 66:** Audit README.md for accuracy against current project state (completed 2026-05-25, 5 issues found, logged in KNOWN_BUGS.md)
- [x] **Task 67:** Review all TODO/FIXME comments in JS files and add to KNOWN_BUGS.md (completed 2026-05-25, none found - clean)
- [x] **Task 68:** Verify service worker caches correct files and version string matches (completed 2026-05-25, stale version + missing files, logged in KNOWN_BUGS.md)
- [x] **Task 69:** Check manifest.webmanifest for correct icons, name, theme_color, display mode (completed 2026-05-25, icon issues + deprecated purpose format, logged in KNOWN_BUGS.md)
- [x] **Task 70:** Verify save.js version migration handles all edge cases (completed 2026-05-25, no version checking, no rank capping, logged in KNOWN_BUGS.md)
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
