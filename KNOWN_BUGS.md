# Core Surge - Known Bugs & Issues

## Critical

### Firebase apiKey and appId are empty strings
- **Location**: `js/cloud.js`
- **Impact**: All cloud features (auth, leaderboards, cloud saves) silently fail
- **Fix**: Retrieve values from Firebase Console and populate config

## Documentation Mismatches

### FRONTEND_INTEGRATION.md references wrong file
- States Firebase config is in `main.js` but it is actually in `cloud.js`
- Could mislead future development work

### BUILD_STATUS.md has false checkmarks
- Shows main.js Firebase integration as complete
- Firebase integration is NOT complete (missing credentials)

## Code Quality Issues

### Stale version comments in ui.js
- Contains references to v0.7.15, v0.7.16, v0.7.17
- Display string correctly shows v0.7.23
- Old comments should be cleaned up to avoid confusion

### No error boundary
- Unhandled JavaScript exceptions can crash the entire game
- Need a global error handler (window.onerror / unhandledrejection)
- Should gracefully recover or show error state rather than blank screen

### No input validation on username field
- Users can enter any string with no length/character restrictions
- Could allow XSS if displayed in leaderboards without sanitization
- Should validate: min/max length, allowed characters, profanity filter

### No rate limiting on card pulls (client-side)
- Rapid-fire pull requests could be exploited
- Server-side validation needed when cloud features are active
- Client should also throttle UI to prevent accidental double-pulls

## Infrastructure Issues

### service-worker.js may cache stale assets
- If assets are not versioned (cache-busted), users may see old code after updates
- Need cache versioning strategy or proper cache invalidation headers

### package.json missing mobile scripts
- `sessions.md` references Capacitor commands not in package.json
- Developers must know to run `npx cap sync` etc. manually
- Should be documented as npm scripts for consistency

### No 404/error page for Firebase Hosting
- Invalid routes will show default Firebase 404
- Should have custom error page matching game theme
- Configure in `firebase.json` rewrites/errorPage
