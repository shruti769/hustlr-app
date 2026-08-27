# HUSTLR

React Native (Expo Router) build of the HUSTLR resale-flipping app, transcribed
screen-for-screen from the design prototype.

## Run it

```bash
npm install
npx expo start        # then press i (iOS), a (Android), or w (web)
```

## Structure

```
src/
  app/                        # expo-router routes — the file tree IS the nav tree
    _layout.tsx               # fonts, dark theme, AppProvider, toast
    index.tsx                 # cold start → /login
    (auth)/                   # no bottom nav
      login.tsx  signup.tsx  forgot.tsx
    (app)/                    # signed in — persistent bottom nav
      _layout.tsx             # Stack + <BottomNav/>; tabs cross-fade, rest push
      home.tsx  deals.tsx  fliptok.tsx  inventory.tsx  profile.tsx   ← the 5 tabs
      deal/[id].tsx           # deal detail
      add-listing.tsx  leaderboard.tsx  watchlist.tsx  notifications.tsx
      prize.tsx  plans.tsx  dashboard.tsx  calculator.tsx
      tracker.tsx  trends.tsx  analyser.tsx  quick.tsx  screens.tsx
  components/
    icons.tsx                 # SVG icons, paths traced from the prototype
    ui/                       # Screen, BottomNav, Toast, Card, Field, Button,
                              # Chip, GlowCard, PhotoSlot, TopBar, Touch, brand
  constants/
    theme.ts                  # every colour + radius in the design
    type.ts                   # archivo() / mono() — CSS `font:` shorthand → RN
  data/mock.ts                # all screen content; swap for an API later
  hooks/use-back.ts           # pop, or fall back to the current tab
  store/app-store.tsx         # app state (watchlist, likes, calc, plan, toast…)
```

### Design system

Two helpers keep type identical to the prototype's CSS. `archivo(size, weight,
{ ls, lh, color })` and `mono(...)` take letter-spacing in **em** and
line-height as a **multiplier**, exactly as written in the design, and resolve
them to the pixel values React Native expects.

Colours live only in `constants/theme.ts`. No screen hardcodes a hex.

Fonts are Archivo (400–900) and JetBrains Mono (400–800), loaded at the root
layout; the app renders nothing until they are ready, so there is no flash of
fallback type.

### Navigation

The bottom nav is rendered by `(app)/_layout.tsx` *outside* the navigator, so it
stays mounted while screens transition — the prototype's fixed chrome. Tapping a
tab `replace`s the route (tabs cross-fade in 150ms); everything else `push`es and
slides in from the right. `useTab(id)` marks which tab a screen belongs to so the
nav stays lit while you browse sub-screens.

### Screen directory

`/screens` (Profile → **All screens**) lists every route. The prototype reached
Dashboard, Calculator, Price Tracker, Market Trends, Quick Analyser and Analyse
Listing through its side index rather than from inside the app, so this screen
gives them a real entry point.
