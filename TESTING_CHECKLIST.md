# Manual QA Testing Checklist

**Version: v0.7.23**
**Created: 2026-05-24**

## Instructions
- Test on: Chrome mobile (DevTools), Safari iOS, Chrome Android
- Mark each item: PASS / FAIL / BLOCKED / SKIP
- Note device and OS version for any FAIL

---

## 1. Home Screen

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 1.1 | "CORE SURGE" title renders centered | | |
| 1.2 | "Endless Tower Defense" subtitle visible | | |
| 1.3 | Username badge shows below tagline | | |
| 1.4 | Tier selector shows current tier (T1 default) | | |
| 1.5 | Tier down arrow decreases tier (min T1) | | |
| 1.6 | Tier up arrow increases tier (up to max unlocked) | | |
| 1.7 | Locked tiers show unlock hint | | |
| 1.8 | "BEGIN DEFENSE" button starts battle | | |
| 1.9 | Daily objective panel displays current goal | | |
| 1.10 | Home panels show real data (progress, milestones, loadout) | | |
| 1.11 | HUD shows Coins / Gems / Best / Runs with correct values | | |
| 1.12 | Gems "+" shortcut navigates to Store | | |
| 1.13 | Submenu 7-icon grid renders all buttons | | |
| 1.14 | Tapping submenu button switches content area | | |
| 1.15 | Isometric battlefield preview shows equipped core + background | | |

## 2. Battle Screen

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 2.1 | Battle starts and enemies spawn | | |
| 2.2 | Tower fires projectiles at nearest enemy | | |
| 2.3 | Damage numbers appear on hit | | |
| 2.4 | Enemy HP bars update on damage | | |
| 2.5 | Core HP bar decreases when enemies attack | | |
| 2.6 | Wave counter increments after all enemies killed | | |
| 2.7 | Cash earned per kill (visible in HUD) | | |
| 2.8 | Kill counter updates (e.g., "5/10") | | |
| 2.9 | Speed toggle cycles through x1/x2/x3 | | |
| 2.10 | Stats button shows live battle statistics | | |
| 2.11 | Upgrade panel renders below battlefield | | |
| 2.12 | Tap upgrade button purchases 1 level | | |
| 2.13 | Hold upgrade button triggers rapid buy | | |
| 2.14 | Buy multiplier pill (x1/x10/x100/Max) works | | |
| 2.15 | Offense upgrades: Damage, Fire Rate, Crit Chance, Crit Power | | |
| 2.16 | Offense upgrades: Multishot Chance/Power/Targets | | |
| 2.17 | Offense upgrades: Bounce Chance/Power/Targets | | |
| 2.18 | Defense upgrades: Core HP, Armor, Range, Lifesteal, Regen | | |
| 2.19 | Economy upgrades: Cash Bonus, Wave Bonus, Combo, Boss Bounty | | |
| 2.20 | Heal button restores HP (costs cash) | | |
| 2.21 | "END RUN NOW" pill shows coin reward preview | | |
| 2.22 | Tapping end run pill ends the run and awards coins | | |
| 2.23 | Boss spawns every N waves with boss banner | | |
| 2.24 | Gems drop on boss kills | | |
| 2.25 | Projectile sprites correct (cyan spear normal, gold star crit) | | |
| 2.26 | Enemy sprites rotate to face tower | | |
| 2.27 | Range ring displays around tower | | |
| 2.28 | Multishot fires multiple projectiles simultaneously | | |
| 2.29 | Bounce shots chain between enemies | | |
| 2.30 | Coin pickup VFX appears | | |

## 3. Death / End-Run Screen

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 3.1 | "Core Lost" title displays on death | | |
| 3.2 | End stats show waves survived, kills, coins earned | | |
| 3.3 | Username displays on end card | | |
| 3.4 | Coins credited to balance | | |
| 3.5 | "Back to Menu" button returns to home | | |
| 3.6 | Voluntary end-run shows same card with correct rewards | | |

## 4. Research Tab

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 4.1 | Research panel opens from submenu/nav | | |
| 4.2 | Mockup header image renders (research_hdr.png) | | |
| 4.3 | 4 sub-tabs visible: Offense / Defense / Economy / Utility | | |
| 4.4 | Tapping sub-tab filters rank rows | | |
| 4.5 | Starter ranks show: Damage, Fire Rate, Core Integrity, Armor, Range, Cash Bonus | | |
| 4.6 | Family unlock cards show name and cost | | |
| 4.7 | Locked families show "Coming Soon" or lock indicator | | |
| 4.8 | Buying a family unlock reveals its ranks | | |
| 4.9 | Rank rows show current level and upgrade cost | | |
| 4.10 | Buying a rank increases level and deducts coins | | |
| 4.11 | Rank icon hex-tiles colored by category | | |
| 4.12 | Max rank reached shows "MAX" indicator | | |

## 5. Cards / Loadout

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 5.1 | Card grid renders all owned cards | | |
| 5.2 | Card details panel shows on tap (name, rarity, effect) | | |
| 5.3 | Equip button adds card to loadout slot | | |
| 5.4 | Unequip button removes card from slot | | |
| 5.5 | Card levels display correctly | | |
| 5.6 | Empty loadout slots show "+" | | |
| 5.7 | Slot count matches unlocked slots (default 3) | | |
| 5.8 | Standard/Prime/Apex rarity visually distinct | | |
| 5.9 | Card effects apply in battle when equipped | | |

## 6. Shop / Store

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 6.1 | Store panel opens and products display | | |
| 6.2 | Card pack prices shown (20 gems single, 180 gems 10-pull) | | |
| 6.3 | Slot unlock prices listed correctly | | |
| 6.4 | Gem balance shown in HUD | | |
| 6.5 | Purchase button responds to tap | | |
| 6.6 | Gem balance updates after purchase | | |
| 6.7 | Starter pack banner visible with decoration | | |
| 6.8 | "Watch ad" daily reward button present | | |
| 6.9 | Ad simulation overlay shows (30s countdown) | | |
| 6.10 | BLOCKED: Real IAP purchases (RevenueCat keys are placeholders) | | |

## 7. Tournament

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 7.1 | Tournament panel opens | | |
| 7.2 | Bracket display renders (synthetic competitors) | | |
| 7.3 | Tier/band selection works | | |
| 7.4 | Leaderboard shows player rankings | | |
| 7.5 | Entry count displayed (3 per cycle) | | |
| 7.6 | BLOCKED: Real multiplayer (requires cloud auth) | | |

## 8. Goals / Milestones

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 8.1 | Goals panel opens | | |
| 8.2 | Milestone list renders with descriptions | | |
| 8.3 | Tier hex progression strip shows T1-T18 | | |
| 8.4 | Current tier highlighted differently | | |
| 8.5 | Claimed milestones visually distinct from unclaimed | | |
| 8.6 | Claim button works on completed milestones | | |
| 8.7 | Reward credited after claim | | |
| 8.8 | Ready-to-claim badge appears on hex | | |

## 9. Skins

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 9.1 | Skins panel opens | | |
| 9.2 | All 6 core skins displayed | | |
| 9.3 | All 4 background skins displayed | | |
| 9.4 | Tapping skin equips it | | |
| 9.5 | Equipped skin shows on battlefield | | |
| 9.6 | Background changes to match equipped bg skin | | |
| 9.7 | Skin selection persists across runs | | |
| 9.8 | Theme preview in Settings updates | | |

## 10. Settings

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 10.1 | Settings panel opens | | |
| 10.2 | Version string shows "v0.7.23" | | |
| 10.3 | All toggle switches respond to tap | | |
| 10.4 | Cloud settings panel renders | | |
| 10.5 | Username/profile section shows current name | | |
| 10.6 | Username change validates (3-16 chars, alphanumeric + _ -) | | |
| 10.7 | Theme preview block shows current background + core | | |
| 10.8 | BLOCKED: Cloud sign-in (apiKey missing) | | |
| 10.9 | BLOCKED: Billing/subscription panel (RevenueCat placeholder) | | |

## 11. Navigation

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 11.1 | Bottom nav shows 5 tabs: HOME / BATTLE / RESEARCH / LOADOUT / MORE | | |
| 11.2 | HOME returns to main menu | | |
| 11.3 | BATTLE jumps to active battle (if running) | | |
| 11.4 | RESEARCH opens research panel | | |
| 11.5 | LOADOUT opens cards/loadout panel | | |
| 11.6 | MORE opens bottom sheet with STORE/GOALS/TOURNEY/SKINS/SETTINGS | | |
| 11.7 | Nav works during battle (opens overlay) | | |
| 11.8 | "Return to Battle" bar shows live HP/wave during overlay | | |
| 11.9 | Tapping "Return to Battle" closes overlay | | |
| 11.10 | Battle continues while overlay is open | | |

## 12. Save / Load

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 12.1 | Game state persists across page refresh | | |
| 12.2 | Coins, gems, ranks all retained | | |
| 12.3 | Equipped skins retained | | |
| 12.4 | Card collection retained | | |
| 12.5 | Username retained | | |
| 12.6 | Save version is tower_save_v8 | | |
| 12.7 | Old save formats auto-migrate without data loss | | |
| 12.8 | Corrupt localStorage handled gracefully (no crash) | | |

## 13. PWA / Service Worker

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 13.1 | Install banner appears on eligible browsers | | |
| 13.2 | "Install" button triggers browser install prompt | | |
| 13.3 | "Later" dismisses banner | | |
| 13.4 | Service worker registers successfully | | |
| 13.5 | Game loads offline after first visit | | |
| 13.6 | Offline toast shows when connection lost | | |
| 13.7 | manifest.webmanifest loads without errors | | |

## 14. Edge Cases

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 14.1 | Zero gems - cannot purchase (no negative balance) | | |
| 14.2 | Max level upgrade shows MAX, button disabled | | |
| 14.3 | Empty loadout - battle still works (no card bonuses) | | |
| 14.4 | First-time player - default save created, T1 only | | |
| 14.5 | Corrupt save data - game resets gracefully | | |
| 14.6 | Rapid button mashing - no duplicate purchases | | |
| 14.7 | Browser tab backgrounded - game pauses or handles gracefully | | |
| 14.8 | Screen rotation - layout adapts (if supported) | | |
| 14.9 | Very small screen (320px width) - no layout overflow | | |
| 14.10 | Very large screen (tablet) - game scales appropriately | | |
| 14.11 | Gem orb spawn timing (first at 2min, then every 6-8min) | | |
| 14.12 | Dev panel opens and all debug functions work | | |

## 15. Performance

| # | Test Case | Status | Notes |
|---|-----------|--------|-------|
| 15.1 | 60fps during normal gameplay (< 20 enemies) | | |
| 15.2 | No visible jank during wave transitions | | |
| 15.3 | Menu scrolling is smooth | | |
| 15.4 | No memory leaks after 50+ waves | | |
| 15.5 | Initial load time < 3 seconds on 4G | | |

---

## Sign-Off

| Role | Name | Date | Result |
|------|------|------|--------|
| QA Tester | | | |
| Developer | | | |
| Product Owner | | | |
