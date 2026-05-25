# Core Surge Critical Path to Launch

**Week 6 Launch Gate: June 14, 2026**

## Critical Dependencies (Must Complete Before Production)

### Build Track → Launch Track
- **Task #5 (UI Polish)** must complete before Task #12 (beta launch) — testers need polished UI
- **Task #7 (Asset Pipeline)** must complete before Task #9 (CI/CD) — CI needs bundling to work
- **Task #9 (CI/CD)** must complete before Task #12 — automated deployment required for beta distribution

### Compliance Track → Launch Track
- **Task #8 (Privacy/ToS/Loot Box)** must complete before Task #12 — beta users need legal docs
- **Task #10 (Firebase Auth UI)** must complete before Task #12 — cloud save for beta testing
- **Task #3 (Analytics)** must complete before production — compliance requirement for crash reporting

### Compliance Track → Build Track
- **Task #8 (Privacy/ToS)** should inform **Task #7 (Asset Pipeline)** — rate limiting may need enforcement in bundling

### Within Compliance Track (Sequential)
- **Task #8 (Week 1)** → **Task #10 (Week 2)** → **Task #3 (Week 3-4)** → **IARC rating (Week 5)** → **Week 6 sign-off**

## Critical Path Timeline

```
May 26   Task #5 (UI Polish) ───────────┐
                                        ├─→ Task #12 (Beta) [Jun 7]
May 28   Task #4 (RevenueCat) ──────┐   │
May 29   Task #7 (Asset Pipeline) ──┤   │
                                     ├─→ Task #9 (CI/CD) ─┤
May 30   Task #6 (Purchase Testing)  │                     │
                                     └─→ [Ready for deploy]┤
May 31   Task #8 (Compliance Wk1) ───────────┐             │
Jun 2    Task #9 (CI/CD) ──────────────────┐ ├─→ [Beta Ready]
Jun 5    Task #10 (Auth UI) ────────────────┤ │
         Task #11 (Testing) ────────────────┘ │
Jun 7    Task #12 (Beta Launch) ─────────────┘
Jun 14   Week 6 Launch Gate (All 3 tracks complete)
```

## Blocking Conditions for Week 6 Launch Gate

All of the following MUST be complete:

**Build Track:**
- [ ] JavaScript bundle <500KB minified + gzipped
- [ ] Lighthouse score >90 across all metrics
- [ ] 15-20 unit tests passing
- [ ] GitHub Actions CI/CD deployed to Firebase
- [ ] Service worker active and offline-capable

**Compliance Track:**
- [ ] Privacy Policy (GDPR/CCPA/COPPA compliant)
- [ ] Terms of Service (in-app purchases, dispute resolution)
- [ ] Loot box odds disclosure (in-game modal)
- [ ] Firebase Auth UI complete (email/password sign-up)
- [ ] Cloud save migration working (local → Firestore)
- [ ] 15+ analytics events instrumented
- [ ] Crashlytics error tracking active
- [ ] Data encryption enabled (TweetNaCl.js)
- [ ] Rate limiting enforced (10 pulls/min)
- [ ] IARC rating obtained (for both App Store and Play Store)
- [ ] App Store Connect submission approved
- [ ] Google Play Store submission approved

**Launch Track:**
- [ ] Closed beta (50-100 testers) active for 1+ week
- [ ] Day-1 retention ≥30%
- [ ] Crash rate <2%
- [ ] Monetization feedback positive (players willing to spend)
- [ ] Community channels active (Discord, Reddit)
- [ ] Marketing assets ready (screenshots, descriptions, trailer)

## No-Go Conditions

If ANY of these are true on June 14, launch is **DELAYED**:

1. Crash rate >2% in closed beta
2. IARC rating not obtained
3. App Store or Play Store submission rejected (not approved)
4. Privacy Policy not legally reviewed
5. Unresolved critical bug affecting core gameplay
6. Analytics not reporting correctly
7. Firebase Auth UI not working on native builds
8. Bundle size >500KB

## Rollback Procedure (If Critical Bug Found After Week 6 Sign-Off)

1. Codex: Hotfix in code
2. Claude Code: Rebuild and test locally
3. Cowork: Update LAUNCH_TRACKER.html status
4. Claude Code: Deploy hotfix to Firebase
5. Launch Team: Notify active players of patch
6. Codex: Update sessions.md with rollback details

## Success Metrics (Post-Launch Week 1)

- [ ] 10K+ downloads on day 1
- [ ] 30%+ day-1 retention (players return on day 2)
- [ ] <2% crash rate in production
- [ ] ≥3.5-star average rating on both stores
- [ ] <2% refund rate for purchases
- [ ] Zero critical compliance violations
