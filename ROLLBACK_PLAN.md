# Rollback Plan
**Created**: 2026-05-25 by Cowork Agent (Task 98)

---

## Purpose

If a critical bug is found after deployment, this plan enables reverting to the last known-good version within 5 minutes.

---

## Deployment Architecture

- **Web (PWA)**: Cloudflare Workers at `tower-game.mcrdminted.workers.dev`
- **Firebase Hosting**: `core-surge---tower-defense.web.app` (configured but not primary)
- **Native iOS**: App Store (TestFlight for beta)
- **Native Android**: Google Play (Internal Testing track for beta)

---

## Web Rollback (Cloudflare Workers)

### Method 1: Redeploy Previous Version
```bash
# From project root, check out previous known-good commit
git log --oneline -5    # find the good commit hash
git checkout <good-hash> -- dist/

# Redeploy
npx wrangler deploy
```

### Method 2: Cloudflare Dashboard
1. Go to dash.cloudflare.com > Workers & Pages > tower-game
2. Click "Deployments" tab
3. Find the previous deployment
4. Click "Rollback to this deployment"
5. Confirm

### Method 3: Firebase Hosting (if using)
```bash
# List recent deploys
firebase hosting:channel:list

# Rollback to previous release
firebase hosting:rollback
```

---

## Native App Rollback

### iOS (TestFlight / App Store)
- **TestFlight**: Upload previous IPA build, set as active build
- **App Store**: Cannot rollback once approved. Must submit new version with fix.
- **Mitigation**: Keep 2 builds ready in TestFlight at all times

### Android (Google Play)
- **Internal Testing**: Upload previous AAB, promote to track
- **Production**: Staged rollout can be halted. Full rollback requires new version upload.
- **Mitigation**: Use staged rollout (10% -> 25% -> 50% -> 100%) for all releases

---

## Database Rollback (Firestore)

### Player Saves
- Firestore has no built-in point-in-time recovery on Spark/Blaze plan
- **Mitigation**: Cloud Function should timestamp every save write
- If bad data is written, query by timestamp and restore previous version

### Tournament Data
- Tournament brackets are regenerated every 72 hours
- If corrupted: delete current bracket doc, let next cycle regenerate

---

## Feature Flags (Kill Switch)

If a feature is broken but the rest of the game works, disable it without redeploying:

```javascript
// In cloud.js or a remote config:
const FEATURE_FLAGS = {
  cloudSaveEnabled: true,
  tournamentEnabled: true,
  adsEnabled: true,
  iapEnabled: true,
  analyticsEnabled: true
};
```

**Recommendation**: Store feature flags in Firebase Remote Config so they can be toggled without code deployment.

---

## Rollback Decision Tree

```
Bug reported in production
    |
    ├── Crash rate > 5%? → IMMEDIATE rollback (Method 2, < 2 min)
    |
    ├── Data corruption? → Disable cloud save flag + investigate
    |
    ├── IAP broken? → Disable IAP flag + submit hotfix
    |
    ├── Gameplay-only bug? → Hotfix within 24h, no rollback needed
    |
    └── Visual/cosmetic? → Fix in next scheduled release
```

---

## Communication Plan

If rollback is triggered:
1. Post in Discord: "We're aware of [issue] and are rolling back to the previous version. Your progress is safe."
2. Update App Store "What's New" if native rollback needed
3. Email support template ready (see SUPPORT_EMAIL_TEMPLATES.md)

---

## Testing After Rollback

After any rollback, verify:
- [ ] Game loads and reaches home screen
- [ ] Battle starts and enemies spawn
- [ ] Save/load works (localStorage)
- [ ] Cloud save syncs (if cloud enabled)
- [ ] IAP products display correctly
- [ ] No console errors in DevTools
