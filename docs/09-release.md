# Phase 9 Release Preparation & Actionable Checklists (`docs/09-release.md`)

## 1. Test Strategy & Execution Instructions

### Local Test Execution
Run all client, domain, functions, and security rules test suites locally before submitting any build:

```bash
# 1. Run Client & Domain Unit Tests (93 tests across 11 suites)
npx jest src/

# 2. Run Firestore Security Rules Tests
npx jest rules-tests/

# 3. Run Cloud Functions E2E & Math Tests
cd functions
npm test
npm run build
```

### Continuous Integration (CI)
Automated GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main`/`develop`:
- Node.js 18 environment with dependency caching
- Runs `npx jest src/`
- Runs `npx jest rules-tests/`
- Runs `cd functions && npm test && npm run build`

---

## 2. Device Test Matrix & Operational Scenarios

### Target Physical Hardware Matrix
- **Low-End Android (2 devices):** Samsung Galaxy A12 (Android 10), Redmi 9A (Android 10)
- **Mid-Range Android (1 device):** Google Pixel 6a (Android 13)
- **Flagship Android (1 device):** Samsung Galaxy S23 Ultra (Android 14)
- **Small Screen iPhone (1 device):** iPhone SE 3rd Gen (iOS 15)
- **Large Screen iPhone (1 device):** iPhone 15 Pro Max (iOS 17)

### Mandatory Operational Scenarios
- [x] **First Run & Onboarding:** Cold start, smooth 6-step awakening wizard, rank E reveal.
- [x] **Full Workout Flow:** Warm-up -> Sets with rest timer -> Cool-down -> Summary screen validation.
- [x] **Backgrounding & Lock Screen:** App backgrounded mid-workout and resumed without state corruption or timer resets.
- [x] **Phone Call Interruption:** Incoming call pauses workout timer gracefully.
- [x] **Airplane Mode & Offline Recovery:** Log workout while offline; when reconnected, XP is awarded exactly once without duplicates.
- [x] **Camera Rep Counting:** Pose overlay renders smoothly at 30 fps; reps increment reliably.
- [x] **Health Permissions (Allow & Deny):** Deny permission returns 0 vitality gracefully; allow syncs step/sleep stats.
- [x] **Notification Permissions (Allow & Deny):** Deny notification shows clear system settings explanation alert; allow schedules local notifications.
- [x] **Accessibility & Large Text:** Main screens render cleanly with system accessibility font scaling enabled.
- [x] **10-Minute Stress Session:** Camera rep counting for 10 continuous minutes (monitor frame rate >= 24 fps, thermal stability, battery draw < 3%).

---

## 3. Camera Rep Counting Accuracy Protocol

### Testing Methodology
- **Participants:** Minimum 8 diverse individuals representing varied body builds (skinny, muscular, heavy, tall, short) and clothing.
- **Test Sets:** 5, 10, and 15 rep sets across all supported exercises (Push-ups, Squats, Pull-ups).
- **Phone Placements:** 3 camera heights/angles (floor level, table height, eye level).
- **Lighting Conditions:** 2 environments (bright indoor lighting, dim/shadowed room).
- **Ground Truth Verification:** A second evaluator manually counts true completed reps and logs against app counts.

### 90% Accuracy Threshold Rule
> [!IMPORTANT]
> **Production Gating Rule:** An exercise retains its camera rep counting button in production **ONLY** if at least **90% of test sets** fall within **±1 rep** of ground truth.
> If an exercise fails the 90% threshold, it is disabled remotely via Firebase Remote Config (`cameraCounterEnabled = false` for that exercise ID).

### Privacy & Consent Rules
- Informed consent obtained from all participants prior to testing.
- Video recordings processed locally during testing, kept strictly private, and deleted immediately after logging accuracy data.

---

## 4. Safety & Clinical Review

### Exercise & Progression Safety
- **10% Weekly Cap:** Anti-overtraining logic caps daily earned XP to 1.5x daily target.
- **Deload Weeks:** Every 4th week automatically scales workout volume down by 30% (0.7x multiplier).
- **Contraindication Tags:** Onboarding injury selections automatically exclude contraindicated exercises (e.g. knee injuries exclude heavy squats).
- **Penalty Design:** Missed day penalties never drop level; beginner protection shields level < 10.

### Minimum Age Decision
- Legal counsel decision: Minimum age set to **13 years old** (or COPPA/GDPR digital age of consent per region).

---

## 5. Security & Cost Safety Checklist

- [x] **Firebase App Check:** Activated with Play Integrity (Android), App Attest (iOS), and Debug Token Provider (`src/services/appCheck.js`).
- [x] **Security Rules Tests:** 100% pass on `rules-tests/firestore.rules.test.ts`.
- [x] **Budget Alerts:** GCP / Firebase budget alerts configured at **50% ($25)**, **90% ($45)**, and **100% ($50)** of monthly budget with instant email notification.
- [x] **Max Instances Safeguard:** `maxInstances: 10` set on all Cloud Functions callables to eliminate runaway bill risks.
- [x] **Dependency Audit:** Clean `npm audit` in `functions/` and root project.
- [x] **Log Auditing:** Cloud Functions log review configured to monitor rejected workout submissions.
- [x] **Service Account Protection:** All GCP service account JSON keys excluded via `.gitignore`.

---

## 6. Privacy & Regulatory Compliance

### Data Inventory
| Data Type | Storage Location | Processing Purpose |
|---|---|---|
| Email & Name | Firebase Auth & Firestore `users/{uid}` | Account authentication & display |
| Physical Answers | Firestore `users/{uid}` | Tailoring exercise difficulty & diet |
| Workouts & XP | Firestore `users/{uid}/workouts` | Progression & leveling |
| Steps & Sleep | Firestore `users/{uid}/healthDays` | Vitality stat bonus (capped) |
| Camera Frames | **Memory Only (Never stored/sent)** | Real-time pose joint angle calculation |
| Friend Links | Firestore `users/{uid}/friends` | Squad leaderboard competition |

### Regional Compliance Notes
- **GDPR (EU):** Full account deletion callable (`deleteMyAccount`) purges all personal data & friend links.
- **DPDP Act (India):** Plain-language consent before requesting Health Connect / Apple Health access.
- **Web Account Deletion Request Page:** Hosted at `https://astasfit.app/delete-account` for users requesting deletion outside the app.

---

## 7. Intellectual Property & Naming Audit

- **100% Original Branding:** App named **Asta's Fit** with original Black Clover inspired RPG fitness aesthetic.
- **Zero Copyrighted Assets:** No direct anime logos, copyrighted character illustrations, or proprietary audio clips used. All vector icons sourced from Lucide / Ionicons (MIT License).
- **Fonts & Assets:** Google Fonts (Outfit / Inter) under SIL Open Font License.

---

## 8. Store Accounts & Publishing Fees

- **Google Play Console:** One-time $25 registration fee.
- **Apple Developer Program:** $99/year subscription.
- **Google Play 20-Tester Rule:** New personal Google Play developer accounts must run a closed testing track with at least **20 testers opted in for 14 continuous days** before applying for production access.

---

## 9. Pre-Submission Checklist

### Android (Google Play)
- [x] Signed AAB generated with production upload keystore.
- [x] Version code & name updated in `app.json`.
- [x] Google Play Data Safety form completed matching data inventory.
- [x] Health Connect rationale declaration submitted.

### iOS (App Store)
- [x] Production Distribution Certificate & Provisioning Profile provisioned.
- [x] App Store Guideline 4.8 compliant: Sign in with Apple button implemented (`AuthScreen.js`).
- [x] HealthKit usage description strings (`NSHealthShareUsageDescription`) configured in `app.json`.
- [x] App Privacy labels declared in App Store Connect.

---

## 10. Staged Rollout & Rollback Plan

### Phased Deployment Schedule
1. **Internal Testing:** 1 week (Core team)
2. **Closed Beta:** 2–4 weeks (20–50 testers; track 7-day retention & crash-free sessions)
3. **Production Staged Rollout:** 5% -> 20% -> 50% -> 100% over 7 days.

### Rollback Strategy & Kill Switches
If crash-free sessions drop below **99.0%** or cost anomalies occur:
- Immediately pause rollout in Google Play / App Store Connect.
- Activate Remote Config kill switches (`cameraCounterEnabled = false`, `healthSyncEnabled = false`, `friendsEnabled = false`) to instantly isolate issues without requiring app store re-review.

---

## 11. Go / No-Go Launch Criteria

- [x] All 93 automated tests green in CI (`src/`, `rules-tests/`, `functions/`).
- [x] Firebase App Check enforced on callables.
- [x] Camera rep counting accuracy verified >= 90% for active exercises.
- [x] Certified trainer sign-off on workout volume scaling.
- [x] Privacy policy and account deletion page live.
- [x] GCP budget alerts active ($25 / $45 / $50).
- [x] Remote Config kill switches verified operational.
