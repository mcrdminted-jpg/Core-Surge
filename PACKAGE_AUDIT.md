# Core Surge - Package.json Audit

## Current package.json

```json
{
  "name": "core-surge",
  "version": "0.7.23",
  "scripts": {
    "typecheck": "node scripts/typecheck.js",
    "build": "node scripts/build.js",
    "start": "node scripts/serve.js",
    "preview": "node scripts/serve.js"
  },
  "dependencies": {
    "@capacitor/android": "^7.2.0",
    "@capacitor/cli": "^7.2.0",
    "@capacitor/core": "^7.2.0",
    "@capacitor/ios": "^7.2.0",
    "@revenuecat/purchases-capacitor": "^11.1.2"
  }
}
```

## Findings

### 1. No devDependencies Section

Should include at minimum:
- `eslint` - code linting
- `esbuild` or `webpack` - production bundling/minification
- `postcss` - CSS processing for production builds
- `prettier` - code formatting consistency

### 2. No Test Framework Declared

No testing library (jest, vitest, mocha, etc.) in dependencies or scripts. No `test` script defined.

### 3. Duplicate Scripts

`"start"` and `"preview"` both point to `node scripts/serve.js`. One should be removed or differentiated (e.g., preview could serve the built output while start serves with live reload).

### 4. Missing Mobile Scripts

`sessions.md` references Capacitor commands that should be scripted:
- `cap sync` - sync web assets to native projects
- `cap open android` - open Android Studio
- `cap open ios` - open Xcode
- `cap run android` - build and run on device

Recommended additions:
```json
"cap:sync": "npx cap sync",
"cap:android": "npx cap open android",
"cap:ios": "npx cap open ios",
"cap:run:android": "npx cap run android"
```

### 5. Capacitor Config

`capacitor.config.json` has:
- `appId`: `com.mcrdminted.coresurge`
- This matches the intended bundle ID for both App Store and Play Store

### 6. @capacitor/cli in dependencies

`@capacitor/cli` should be in `devDependencies` since it is a build/dev tool, not a runtime dependency.
