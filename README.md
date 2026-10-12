# ⚔️ Asta's Fit — Anime RPG Fitness & AI Hunter Workout App

[![React Native](https://img.shields.io/badge/React%20Native-0.76.7-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-52-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-v13-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-00F0FF.svg)](LICENSE)

An immersive, gamified mobile fitness application inspired by **Solo Leveling** and **Black Clover**. Transform your real-world workouts into an epic Hunter progression system featuring AI camera rep detection, custom physique transformations, daily guild quests, and full offline vitality synchronization.

---

## ⚡ Key Features

- **🎮 RPG Hunter Leveling & Rank Trials**
  - Progress from Rank E to Rank S through real physical workouts.
  - Earn XP for every repetition and set logged.
  - Face high-stakes Rank Promotion Trials and avoid anti-slacking penalty tasks with Streak Shields.

- **🤖 AI Camera Rep Counting (Vision / ML Kit)**
  - Real-time skeleton joint angle calculation and rep detection for push-ups, squats, and pull-ups.
  - Real-time form scoring and audio feedback overlay with 30 FPS smooth rendering.

- **🧬 Physique Transformation Engine**
  - Choose your current silhouette and target dream physique (Toned Athletic, Titan, Lean Cut).
  - Algorithmic exercise filtering matching available equipment (dumbbells, barbells, bodyweight) and injury contraindications.

- **📊 Comprehensive Analytics & Health Tracking**
  - Syncs daily steps and sleep data through **Android Health Connect** and **Apple HealthKit**.
  - Volume progression graphs, weekly XP velocity, and muscle group split breakdowns.

- **⚔️ Guild Social & Squad Leaderboards**
  - Compete with friends on seasonal squad leaderboards.
  - Live activity feed and Hunter status sharing.

- **💬 Hunter AI Assistant ("Nero")**
  - Floating tactical companion for on-demand workout advice, form guidance, and nutrition recommendations.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: [React Native](https://reactnative.dev/) with [Expo SDK 52](https://expo.dev/)
- **State Management & Core Logic**: React Context (`HunterContext`) + Repository Pattern
- **Cloud & Backend**: Firebase Authentication, Cloud Firestore Security Rules, Google Cloud Functions
- **Hardware Integrations**:
  - `expo-camera` / ML Pose Estimation
  - `react-native-health-connect` (Android Health Connect)
  - `expo-haptics` (Tactile feedback)
  - `expo-av` (Prologue video playback)
- **Design System**: Tailored cyberpunk obsidian `#0A0D14` theme with neon cyan `#00F0FF` and fiery gold accents.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [EAS CLI](https://docs.expo.dev/build/introduction/) (for production builds)

### Installation

```bash
# Clone the repository
git clone git@github.com:sakthivelTJ/astas-fit.git
cd astas-fit

# Install dependencies
npm install

# Start the Expo development server
npm start
```

### Building Standalone APK (Android)

```bash
# Log in to your Expo account
npx eas login

# Build direct standalone APK
npx eas build -p android --profile preview
```

---

## 🧪 Testing

```bash
# Run unit tests across all client domains & components
npx jest src/

# Run security rules verification
npx jest rules-tests/
```

---

## 👤 Author

**Sakthivel T**
- GitHub: [@sakthivelTJ](https://github.com/sakthivelTJ)
- Email: sakthiveltj2004@gmail.com
