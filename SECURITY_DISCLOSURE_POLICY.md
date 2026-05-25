# Security Disclosure Policy

**Core Surge: Endless Tower Defense**
**Last Updated:** May 24, 2026
**Developer:** Andy (Andrew Evans Anglin)

---

## Overview

We take the security of Core Surge seriously. This policy describes how security researchers can responsibly disclose vulnerabilities to us and what to expect in return.

---

## Scope

The following are in scope for responsible disclosure:

- Core Surge game client (web, iOS, Android builds)
- Firebase backend services as configured by us (Firestore rules, Cloud Functions, Authentication flows)
- Game APIs and endpoints we operate
- In-game payment and entitlement logic

## Out of Scope

The following are explicitly out of scope:

- Third-party services themselves (Firebase infrastructure, RevenueCat platform, Google AdMob platform) -- report these to the respective vendors
- Social engineering attacks against the developer or players
- Denial of Service (DoS/DDoS) attacks
- Vulnerabilities requiring physical access to a user's device
- Issues in outdated browser or OS versions no longer supported by the game
- Rate limiting issues below abuse threshold
- Spam or content policy violations

---

## How to Report

Email your findings to: **security@coresurge.game**

### What to Include

- **Vulnerability type** (e.g., authentication bypass, injection, data exposure)
- **Affected component** (e.g., web client, iOS build, Firestore rules, specific API endpoint)
- **Steps to reproduce** the vulnerability
- **Proof of concept** (screenshots, code snippets, or video)
- **Impact assessment** describing what an attacker could achieve
- **Suggested fix** if you have one

Please encrypt sensitive reports with our PGP key (available upon request).

---

## Response Timeline

| Stage | Timeframe |
|---|---|
| Acknowledgment of report | Within 48 hours |
| Initial assessment | Within 7 days |
| Fix for Critical severity | Within 30 days |
| Fix for High severity | Within 30 days |
| Fix for Medium severity | Within 90 days |
| Fix for Low severity | Within 90 days |

We will keep you informed of progress at each stage.

---

## Severity Classification

### Critical
- Data breach exposing player personal information
- Authentication bypass (accessing other players' accounts)
- Payment fraud (obtaining premium currency or items without payment)
- Remote code execution

### High
- Save data tampering (modifying another player's progression)
- Score or leaderboard manipulation
- Privilege escalation within game systems
- Bypassing entitlement checks for premium content

### Medium
- UI injection or cross-site scripting in web client
- Information disclosure (exposing non-sensitive internal data)
- Insecure direct object references with limited impact
- Session fixation

### Low
- Cosmetic issues with no security impact
- Non-exploitable bugs or theoretical vulnerabilities
- Missing security headers with no practical exploit path
- Verbose error messages exposing non-sensitive info

---

## Safe Harbor

We will not pursue legal action against security researchers who:

- Act in good faith and follow this policy
- Do not access, modify, or delete other players' data
- Do not disrupt game services or degrade the player experience
- Do not publicly disclose the vulnerability before we have addressed it
- Provide us reasonable time to fix the issue before any disclosure

---

## Recognition

- Researchers who responsibly disclose valid vulnerabilities will be credited in our CHANGELOG.md with their permission
- We do not currently operate a bug bounty program
- We reserve the right to start a bounty program in the future

---

## Contact

- **Security reports:** security@coresurge.game
- **General inquiries:** support@coresurge.game
