# GDPR Data Request Process

**Core Surge: Endless Tower Defense**

**Effective Date:** May 24, 2026
**Last Updated:** May 24, 2026

This document outlines the internal process for handling data subject requests under the General Data Protection Regulation (GDPR). It covers Subject Access Requests, Right to Erasure, Right to Rectification, Right to Portability, Right to Restrict Processing, and Breach Notification procedures.

---

## 1. Subject Access Request (SAR)

### 1.1 How Users Submit a Request

Users can submit a Subject Access Request through:

1. **In-Game:** Settings > Account > Request My Data
2. **Email:** Send request to support@coresurge.game with subject line "Subject Access Request"

### 1.2 Identity Verification

Before processing any SAR, we must verify the requester's identity:

- **In-Game Request:** Verified automatically via Firebase Auth session token.
- **Email Request:** The request must come from the email address associated with the account. If there is any doubt, we will send a verification code to the registered email before proceeding.

### 1.3 Data Provided

The data export includes a JSON file containing:

```
{
  "exportDate": "YYYY-MM-DD",
  "exportVersion": "1.0",
  "account": {
    "uid": "Firebase UID",
    "email": "user@example.com",
    "createdAt": "ISO 8601 timestamp",
    "lastLogin": "ISO 8601 timestamp"
  },
  "profile": {
    "displayName": "PlayerName",
    "settings": { ... }
  },
  "gameSave": {
    "coins": 0,
    "gems": 0,
    "wavesCompleted": 0,
    "cardInventory": { ... },
    "cardLevels": { ... },
    "unlockedSlots": 0,
    "rankProgress": { ... }
  },
  "tournamentHistory": [
    {
      "tournamentId": "...",
      "date": "ISO 8601",
      "score": 0,
      "waveReached": 0,
      "placement": 0
    }
  ],
  "purchaseHistory": [
    {
      "transactionId": "...",
      "productId": "...",
      "date": "ISO 8601",
      "platform": "ios|android",
      "amount": "0.00",
      "currency": "USD"
    }
  ]
}
```

### 1.4 Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledge receipt | Within 3 business days |
| Provide data export | Within 30 calendar days of verified request |
| Extension (complex cases) | Up to 60 additional days with notification to user |

### 1.5 Template Response — SAR Acknowledgment

**Subject:** Your Data Request Has Been Received — Core Surge

Dear [User],

We have received your Subject Access Request submitted on [DATE]. We have verified your identity and are now preparing your data export.

You will receive your data in JSON format within 30 days. If we need additional time due to the complexity of the request, we will notify you within that period.

If you have any questions, please reply to this email.

Regards,
Core Surge Support Team
support@coresurge.game

---

### 1.6 Template Response — SAR Fulfillment

**Subject:** Your Data Export Is Ready — Core Surge

Dear [User],

Your data export is attached to this email as a JSON file. This file contains all personal data we hold about you in connection with Core Surge: Endless Tower Defense, including your account information, game progress, tournament history, and purchase history.

If you have questions about the data or believe any information is inaccurate, please contact us and we will assist you.

Regards,
Core Surge Support Team
support@coresurge.game

---

## 2. Right to Erasure (Right to Be Forgotten)

### 2.1 How Users Submit a Request

Users can request erasure through:

1. **In-Game:** Settings > Account > Delete Account
2. **Email:** Send request to support@coresurge.game with subject line "Deletion Request"

### 2.2 What Gets Deleted

| Data Store | Action |
|------------|--------|
| Firebase Auth | Account fully deleted (email, UID, password hash, metadata) |
| Firestore — Player Profile | Document deleted |
| Firestore — Game Saves | All save documents deleted |
| Firestore — Tournament Entries | Player's entries deleted; tournament results anonymized (UID replaced with "deleted_user") |
| localStorage (device) | User prompted to clear locally; we cannot remotely delete on-device data |

### 2.3 What Gets Anonymized (Not Deleted)

| Data Store | Action | Reason |
|------------|--------|--------|
| Firebase Analytics | Events already anonymized | Cannot be re-identified; anonymization is irreversible |
| Aggregated Leaderboard Data | Scores retained without identifying info | Statistical records only |

### 2.4 What Is Retained (Legal Requirement)

| Data Store | Retention Period | Legal Basis |
|------------|-----------------|-------------|
| Purchase Receipts (RevenueCat) | Per applicable tax law (up to 7 years) | Tax reporting and audit compliance |
| Fraud Records | As needed | Legitimate interest in fraud prevention |

### 2.5 Response Timeline

| Step | Timeline |
|------|----------|
| Acknowledge receipt | Within 3 business days |
| Deactivate account | Within 7 days |
| Complete deletion | Within 30 calendar days |

### 2.6 Template Response — Deletion Acknowledgment

**Subject:** Account Deletion Request Received — Core Surge

Dear [User],

We have received your request to delete your Core Surge account, submitted on [DATE].

Your account will be deactivated within 7 days, and all personal data will be permanently deleted within 30 days. Please note:

- This action is irreversible. Once deleted, your game progress cannot be recovered.
- Anonymized analytics data that cannot be traced back to you will not be deleted.
- Purchase records may be retained as required by tax law.

If you did not make this request, or if you wish to cancel the deletion, please reply to this email immediately.

Regards,
Core Surge Support Team
support@coresurge.game

---

### 2.7 Template Response — Deletion Confirmation

**Subject:** Your Account Has Been Deleted — Core Surge

Dear [User],

Your Core Surge account and all associated personal data have been permanently deleted as of [DATE].

If you wish to play again in the future, you are welcome to create a new account, though previous progress cannot be restored.

Thank you for playing Core Surge.

Regards,
Core Surge Support Team
support@coresurge.game

---

## 3. Right to Rectification

### 3.1 Self-Service Corrections

Users can correct the following data directly within the Game:

| Data Field | How to Correct |
|------------|----------------|
| Display Name (Username) | Settings > Account > Change Username |
| Email Address | Settings > Account > Change Email (via Firebase Auth re-authentication) |
| Password | Settings > Account > Change Password (via Firebase Auth) |

### 3.2 Assisted Corrections

For data that cannot be corrected through self-service, users can email support@coresurge.game with the correction details. We will verify identity and make the correction within 30 days.

### 3.3 Template Response — Rectification

**Subject:** Your Data Has Been Corrected — Core Surge

Dear [User],

We have updated the following information on your Core Surge account as requested:

- [FIELD]: Changed from [OLD VALUE] to [NEW VALUE]

This change took effect on [DATE]. If this is incorrect or if you need further changes, please contact us.

Regards,
Core Surge Support Team
support@coresurge.game

---

## 4. Right to Data Portability

### 4.1 Export Format

Data is exported in JSON format, which is machine-readable and can be processed by other services. The export follows the same structure described in Section 1.3 (Subject Access Request).

### 4.2 How to Request

Users can request a data export through:

1. **In-Game:** Settings > Account > Export My Data
2. **Email:** Send request to support@coresurge.game with subject line "Data Portability Request"

### 4.3 Delivery Method

- **In-Game Request:** JSON file is generated and offered for download directly within the app.
- **Email Request:** JSON file is sent as an attachment to the verified email address, or a secure download link is provided.

### 4.4 Response Timeline

Same as SAR: within 30 calendar days of a verified request.

### 4.5 Template Response — Data Portability

**Subject:** Your Data Export Is Ready — Core Surge

Dear [User],

As requested, we have prepared a portable export of your Core Surge data in JSON format. You can download it using the secure link below:

[SECURE DOWNLOAD LINK — expires in 7 days]

This file contains your account information, game progress, tournament history, and purchase history in a machine-readable format suitable for import into other services.

Regards,
Core Surge Support Team
support@coresurge.game

---

## 5. Right to Restrict Processing

### 5.1 What Restriction Means

When a user exercises their right to restrict processing, we will:

1. Disable cloud synchronization for their account
2. Switch the account to local-only mode (game data stored only on device)
3. Remove the user from active tournament matchmaking pools
4. Cease sending analytics events associated with their account
5. Continue serving non-personalized ads only

### 5.2 How to Request

Users can request restriction through:

1. **In-Game:** Settings > Account > Restrict Processing
2. **Email:** Send request to support@coresurge.game with subject line "Restrict Processing Request"

### 5.3 What Remains Active During Restriction

- The account remains active (not deleted)
- Local gameplay continues to function
- Existing data is stored but not actively processed
- The user can lift the restriction at any time through the same Settings menu

### 5.4 Response Timeline

Restriction is applied within 7 days of a verified request.

### 5.5 Template Response — Processing Restricted

**Subject:** Processing Restriction Applied — Core Surge

Dear [User],

As requested, we have restricted the processing of your personal data for your Core Surge account effective [DATE].

What this means for your gameplay:
- Cloud save sync has been disabled. Your game progress will be stored locally only.
- You have been removed from tournament matchmaking.
- Analytics collection for your account has been paused.
- You will only see non-personalized advertisements.

Your account remains active and you can continue playing locally. To restore full functionality, go to Settings > Account > Restore Processing in the Game, or reply to this email.

Regards,
Core Surge Support Team
support@coresurge.game

---

## 6. Data Protection Contact

### 6.1 Data Protection Officer

At our current scale of operations, the appointment of a formal Data Protection Officer (DPO) is not required under GDPR Article 37. However, all data protection inquiries are handled with the same level of care and compliance.

### 6.2 Contact for Data Protection Matters

All data protection requests, inquiries, and complaints should be directed to:

**Email:** support@coresurge.game
**Subject Line Prefix:** [DATA PROTECTION]
**Developer:** Andrew Evans Anglin

### 6.3 Supervisory Authority

Users in the EEA have the right to lodge a complaint with their local data protection supervisory authority if they believe their data rights have been violated. A list of EU supervisory authorities is available at: https://edpb.europa.eu/about-edpb/about-edpb/members_en

---

## 7. Data Breach Notification

### 7.1 Detection and Assessment

Upon discovering a potential data breach, we will:

1. Immediately assess the scope and severity of the breach
2. Determine what personal data was affected
3. Determine how many users were affected
4. Assess the risk to affected individuals

### 7.2 Notification to Supervisory Authority

If the breach is likely to result in a risk to the rights and freedoms of natural persons, we will notify the relevant supervisory authority within **72 hours** of becoming aware of the breach, as required by GDPR Article 33.

The notification will include:
- Nature of the breach
- Categories and approximate number of data subjects affected
- Categories and approximate number of personal data records affected
- Likely consequences of the breach
- Measures taken or proposed to address the breach

### 7.3 Notification to Affected Users

If the breach is likely to result in a **high risk** to the rights and freedoms of affected individuals, we will notify those individuals without undue delay, as required by GDPR Article 34.

User notification will include:
- Clear description of what happened
- What personal data was involved
- What we are doing to address the breach
- What the user can do to protect themselves
- Contact information for further questions

### 7.4 Template Response — Breach Notification to Users

**Subject:** Important Security Notice — Core Surge

Dear [User],

We are writing to inform you of a data security incident that may affect your Core Surge account.

**What Happened:**
On [DATE], we discovered [BRIEF DESCRIPTION OF BREACH]. We immediately [ACTIONS TAKEN TO CONTAIN].

**What Information Was Involved:**
[LIST OF AFFECTED DATA TYPES]

**What We Are Doing:**
- [ACTION 1: e.g., "We have secured the affected systems"]
- [ACTION 2: e.g., "We have engaged a security firm to investigate"]
- [ACTION 3: e.g., "We have notified the relevant data protection authority"]

**What You Can Do:**
- Change your Core Surge password immediately
- If you used the same password on other services, change those passwords as well
- Monitor your email for suspicious activity

We sincerely apologize for this incident and are committed to protecting your data. If you have questions or concerns, please contact us at support@coresurge.game.

Regards,
Core Surge Support Team
support@coresurge.game

---

### 7.5 Internal Breach Log

All breaches, including those assessed as not requiring notification, will be logged internally with:

- Date and time of detection
- Nature of the breach
- Data affected
- Number of users affected
- Assessment of risk level
- Actions taken
- Notification decisions and reasoning
- Resolution date

This log is maintained for a minimum of 5 years for accountability purposes under GDPR Article 5(2).

---

## 8. Request Tracking

All data subject requests are logged with the following fields:

| Field | Description |
|-------|-------------|
| Request ID | Unique identifier (e.g., DSR-2026-0001) |
| Request Type | SAR / Erasure / Rectification / Portability / Restriction |
| Date Received | Date the request was submitted |
| Verification Date | Date identity was verified |
| Due Date | 30 days from verification |
| Status | Received / Verified / In Progress / Complete |
| Completion Date | Date the request was fulfilled |
| Notes | Any relevant details or complications |

---

*This document was last updated on May 24, 2026.*
