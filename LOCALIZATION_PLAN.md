# Localization Plan

## Core Surge: Endless Tower Defense

**Last Updated:** 2026-05-25

---

## Launch Languages (v1.0)

| Language | Code | Priority | Reason |
|----------|------|----------|--------|
| English (US) | en-US | PRIMARY | Default development language |

Core Surge launches English-only. All UI strings, store listings, legal documents, and in-game text are in US English.

---

## Post-Launch Phase 1 (v1.1-1.2, Months 2-3)

| Language | Code | Market Size | Est. Revenue Impact |
|----------|------|------------|-------------------|
| Spanish (Latin America) | es-419 | Large mobile gaming market | +8-12% downloads |
| Portuguese (Brazil) | pt-BR | Top 5 mobile gaming market | +5-8% downloads |
| French | fr | Strong iOS spending | +4-6% downloads |
| German | de | High ARPU market | +3-5% downloads |

---

## Post-Launch Phase 2 (v1.3-1.5, Months 4-6)

| Language | Code | Market Size | Notes |
|----------|------|------------|-------|
| Japanese | ja | Premium mobile market | High ARPU, requires cultural adaptation |
| Korean | ko | Strong strategy game market | Competitive genre fit |
| Simplified Chinese | zh-Hans | Largest mobile market | Requires separate publishing partner for China |
| Traditional Chinese | zh-Hant | Taiwan/Hong Kong market | Can share translation base with zh-Hans |

---

## Localization Scope per Language

### Tier 1: Must Localize
- All in-game UI text (buttons, labels, tooltips)
- Card names and descriptions (25 cards)
- Enemy type names (12 types)
- Skin names (7 skins)
- Family names and stat descriptions
- Tutorial/onboarding text
- Error messages and notifications

### Tier 2: Should Localize
- App Store/Google Play listing (description, keywords, what's new)
- Screenshot captions
- Push notification text
- Support FAQ

### Tier 3: Can Defer
- Privacy Policy and Terms of Service (English with translation link)
- Community Guidelines
- Press Kit
- Developer documentation

---

## String Management Strategy

### Current State
- All strings are hardcoded in index.html and JS files
- No i18n framework in place

### Required Implementation (Before Phase 1)
1. Extract all user-facing strings into a JSON locale file (en-US.json)
2. Implement a lightweight i18n loader in main.js
3. Add language selector to Settings screen
4. Handle right-to-left (RTL) layouts if Arabic is added later
5. Handle variable-length strings in UI (German strings are ~30% longer than English)

### String File Structure
```
locales/
  en-US.json    (source of truth)
  es-419.json
  pt-BR.json
  fr.json
  de.json
  ja.json
  ko.json
  zh-Hans.json
  zh-Hant.json
```

---

## Translation Workflow

1. Export en-US.json as source
2. Send to translation service (options: Crowdin, Lokalise, POEditor)
3. Translators work in platform with context screenshots
4. QA pass: verify all strings fit UI, no truncation, correct pluralization
5. Import translated JSON files
6. In-app testing per language
7. Submit updated store listings per language

---

## Budget Estimates

| Item | Per Language | Notes |
|------|------------|-------|
| Game strings (~500 strings) | $200-400 | Professional translation |
| Store listing | $50-100 | Short form content |
| QA/testing | $100-200 | Verify in-app rendering |
| **Total per language** | **$350-700** | |

Phase 1 (4 languages): $1,400-2,800
Phase 2 (4 languages): $1,400-2,800 (Japanese/Korean may cost more)

---

## Considerations

- **Number formatting:** Use locale-aware formatters for coin/gem counts (1,000 vs 1.000)
- **Date formatting:** Respect locale date formats in tournament timers
- **Pluralization:** Handle plural rules per language (English: 1/other, Japanese: none, Arabic: complex)
- **Font support:** Verify game fonts support CJK characters. May need fallback fonts for Japanese/Korean/Chinese.
- **Text expansion:** German and French text is 20-30% longer than English. UI must accommodate.
- **Cultural sensitivity:** Card art and enemy designs should be reviewed for cultural issues per market.
