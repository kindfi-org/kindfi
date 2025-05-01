# KindFi Mobile App (Expo + NativeWind + Gluestack UI)

Welcome to the KindFi mobile app — a companion experience to the KindFi Web3 crowdfunding platform. This mobile app allows users to explore social impact campaigns, contribute securely, track campaign milestones, and launch new projects from anywhere.

This project is built with [Expo](https://expo.dev), [NativeWind](https://www.nativewind.dev), and [Gluestack UI](https://gluestack.io).

---

## Getting Started

1. Install dependencies  
   Using your preferred package manager:

Make sure you are inside mobile-app folder

```bash
bun install
```

2. Start the development server

```bash
bun run web or bun run ios or bun run android
```

You'll be prompted with options to open:

- Expo Go (iOS/Android)
- Android emulator
- iOS simulator
- Development builds

3. Link your development wallet (optional)  
   Connect your mobile test wallet if simulating live project interaction.

---

## Tech Stack

- React Native with Expo
- File-based routing via [Expo Router](https://expo.github.io/router/)
- Tailwind utility-first styling via [NativeWind](https://www.nativewind.dev)
- Reusable UI components via [Gluestack UI](https://gluestack.io)
- CSS-in-JS (via styled-components + gluestack)
- State and forms: react-hook-form, Zustand, local state, and form validations
- Animation: moti for smooth transitions

---

## Folder Structure

```
app/                    # App screens and routes
components/             # Shared UI and Feature components
  ├── hero/
  ├── projects/
  ├── onboarding/
  ├── forms/
assets/                 # Fonts, images, SVGs
constants/              # Static config values
hooks/                  # Custom hooks (e.g. use-theme)
app.config.ts           # Expo app configuration
tailwind.config.js      # NativeWind configuration
```

---

## Learn More

- [Expo Docs](https://docs.expo.dev/)
- [NativeWind Docs](https://www.nativewind.dev/)
- [Gluestack UI Docs](https://gluestack.io/docs/)
- [React Navigation](https://reactnavigation.org/)
- [React Hook Form](https://react-hook-form.com/)
- [Moti Animation](https://moti.fyi/)

---

## Community and Contributions

We welcome contributors building the future of impact.  
Join us at:

- [KindFi GitHub](https://github.com/kindfi)
- [OnlyDust](https://app.onlydust.com/) for open issues and bounties
- [KindFi Discord](https://discord.gg/kindfi) (Coming soon)
