# Lessons Learned - Core Surge Development
**Created**: 2026-05-25 by Cowork Agent (Task 100)

---

## What Worked

### 1. Three-Agent Architecture
Splitting work into Cowork (docs/QA), Claude Code (frontend/build), and Codex (backend/native) created clear lane boundaries. Nobody stepped on each other's files. The dependency matrix in each agent file prevented conflicts.

### 2. Session Logging (sessions.md)
Mandatory session entries let each agent pick up exactly where the last left off. Without this, the 300-task system would have had constant duplication and missed context.

### 3. Deep Code Audit Before Feature Work
Running a full QA pass (Tasks 61-80) before pushing new features caught the balance overcorrection early. If we had gone straight to beta, players would have hit an unplayable wall.

### 4. Document-First Compliance
Writing Privacy Policy, ToS, COPPA, GDPR, and loot box disclosure docs early (Tasks 21-40) means these are ready when needed for store submission rather than being a last-minute scramble.

### 5. Mathematical Verification of Balance
Running actual Python simulations of the coin/rank economy (Task 71) proved the balance was broken with hard numbers, not opinions. This is the right way to tune game economies.

### 6. Single Build Pipeline
scripts/build.js producing a single minified bundle (181KB) from 11 source files simplified deployment and made the game genuinely fast to load.

---

## What Didn't Work

### 1. Codex Stalling at 0%
100 tasks assigned, zero completed across 4+ sessions. The Firebase credentials blocker is real, but Codex could have worked on compliance implementation, security hardening, or analytics scaffolding that don't require live Firebase. Root cause: no forcing function to ensure Codex actually executes.

**Fix for next project:** Set hard deadlines per agent. If an agent is blocked, it must work on non-blocked tasks or escalate within 24 hours.

### 2. Balance Overcorrection (v0.7.25)
Claude Code raised costMul to fix "too fast progression" but didn't reduce maxRank proportionally. Result: went from "too easy" to "mathematically impossible." The fix created a worse problem than the original bug.

**Fix for next project:** Any balance change must include a mathematical simulation showing the player can actually reach the target progression percentage. No blind tuning.

### 3. Task Lists Not Aligned to Actual Work
Claude Code shipped v0.7.24/25/26 with ~25-30 tasks worth of real work but has 0 tasks formally checked off because the work didn't map 1:1 to the task list items. This makes progress tracking misleading.

**Fix for next project:** Tasks should describe outcomes, not processes. "Ship X feature" not "Begin working on X." Let agents check off tasks as they complete the outcomes regardless of approach.

### 4. Firebase Credentials as Single Point of Failure
One missing step (running `firebase apps:create web` in the console) blocks ALL cloud features, auth, leaderboards, analytics, and crash reporting. This dependency wasn't escalated aggressively enough.

**Fix for next project:** Identify the single unblock item in week 1. Make it the owner's (Andy's) responsibility with a hard deadline. Don't let it drift.

### 5. No CI/CD Pipeline
Manual deploys to Cloudflare Workers work but there's no automated test-on-push, no deploy-on-merge, no build status badges. This means quality gates are manual and therefore optional.

**Fix for next project:** CI/CD (GitHub Actions) should be task #1, not task #9. Everything after that benefits from automated validation.

---

## What to Change for the Next Project

1. **Firebase/Supabase setup on Day 1.** Backend credentials must exist before any agent starts tasks that depend on them.

2. **Mandatory simulation for any economy change.** No balance tuning without running the math through to endgame.

3. **Weekly agent sync checkpoint.** If any agent is at 0% after one week, escalate and reassign work.

4. **CI/CD before features.** Automated testing and deployment should be the foundation, not an afterthought.

5. **Smaller maxRank values from the start.** 10-25 ranks per stat with meaningful per-rank impact is better than 100-400 ranks that feel like grinding. Design for "every purchase matters."

6. **Task completion = outcome delivered.** Don't penalize agents for solving problems differently than the task list anticipated.

7. **Single source of truth for product IDs, prices, and entity names.** The mismatch between data.js product IDs and capacitor.config.json appId caused confusion. One file should be authoritative.

8. **Legal review scheduled, not aspirational.** Privacy Policy and ToS are drafted but "recommend legal review" has been noted 3 times without action. Schedule it or accept the risk explicitly.

---

## Key Metrics at Project Close (Cowork Phase)

- Total documentation files created: 83+
- Total tasks across all agents: 300 (100 per agent)
- Cowork completion: 100/100
- Claude Code effective completion: ~30/100
- Codex completion: 0/100
- Bundle size: 181KB minified (well under 500KB target)
- Known bugs remaining: 5 critical, several medium/low
- Launch conditions met: 0/17
- Launch date status: AT RISK (June 14), recommend June 28

---

## Final Note

The Cowork agent proved that documentation, QA, and coordination are not overhead. They're how you catch problems early and keep a multi-agent system from diverging. The balance overcorrection caught at Task 71 would have been a beta-killing bug if it shipped to testers unverified.

The bottleneck now is execution: Claude Code needs to implement the balance fix, and Codex needs to start. The docs, specs, and plans are all in place.
