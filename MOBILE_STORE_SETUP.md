# Core Surge Mobile Store Lane

This project is now pointed at the App Store / Google Play path instead of a web-only purchase path.

## Target stack

- Web game: existing HTML/CSS/JS app
- Native wrapper: Capacitor
- iPhone billing: Apple In-App Purchase
- Android billing: Google Play Billing
- Purchase abstraction: RevenueCat
- Cloud saves and auth: Firebase

## Current repo scaffolding

- `capacitor.config.json`
- mobile scripts in `package.json`
- `js/monetization.js`
- store product catalog in `js/data.js`
- generated native folders:
  - `android/`
  - `ios/`
- Firebase Hosting now points at `dist/` in `backend/firebase.json`

## Build flow

1. `npm install`
2. `npm run mobile:add:ios`
3. `npm run mobile:add:android`
4. `npm run mobile:sync`
5. `npm run mobile:open:ios`
6. `npm run mobile:open:android`

## RevenueCat setup

Use public SDK keys only in the app. Do not paste secret API keys into the repo.

Needed:

- Apple public SDK key
- Google public SDK key
- Matching product IDs in App Store Connect and Google Play Console
- Matching products / entitlements in RevenueCat

Suggested product IDs already scaffolded:

- `com.coresurge.starterpack`
- `com.coresurge.gems.small`
- `com.coresurge.gems.medium`
- `com.coresurge.monthlyvault`

## Apple requirements

- Add the In-App Purchase capability in Xcode
- Use StoreKit-backed products through RevenueCat
- Ship via App Store for downloads and updates

## Android requirements

- Use Google Play Billing through RevenueCat
- Verify the Android activity launch mode is `standard` or `singleTop`
- Ship via Google Play for downloads and updates

## Important notes

- Web preview will never process real native store purchases.
- Capacitor and RevenueCat packages are installed, and `npm run mobile:sync` now copies the live game build into both native projects.
- The shop now calls the native RevenueCat Capacitor plugin for purchase, catalog sync, and restore flows.
- Store products still need real App Store Connect, Google Play Console, and RevenueCat dashboard setup before sandbox billing can succeed.
- iPhone packaging still needs a Mac with Xcode and CocoaPods. This Windows machine can generate and sync the iOS project, but it cannot finish native iPhone builds locally.
- Firebase is for saves/auth/data, not App Store / Play payments.
