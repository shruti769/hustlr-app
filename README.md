# HUSTLR

React Native (Expo) build of the HUSTLR resale-flipping app, ported
screen-for-screen from the design prototype, with a Supabase backend.

## Run it

```bash
npm install
npx expo start        # then press i (iOS), a (Android), or w (web)
```

Without Supabase keys the app runs on the prototype's built-in demo data, so it
always opens. Add keys (below) to switch to real accounts and data.

## Connect Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Create the schema. Either:
   - **SQL Editor:** paste `supabase/migrations/20261026000000_hustlr_init.sql` and run it, or
   - **CLI:** `supabase link --project-ref <ref>` then `supabase db push`.
3. Copy `.env.example` to `.env.local` and fill in **Project Settings → API**:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
   ```
4. Restart `npx expo start` (env vars are read at bundle time).

If the shared content ever goes missing (empty Hot Deals, Flip Tok or Store),
run `supabase/seed.sql` in the SQL Editor. It only fills empty tables, so it is
safe to run again, then pull down on any screen in the app to refresh.

**Email confirmation:** Supabase asks new users to confirm their email by
default, so after sign-up the app shows "Check your inbox". To skip that while
developing, turn off **Authentication → Providers → Email → Confirm email**.

### What lives where

| Table / function | Holds |
|---|---|
| `profiles` | Name, handle, region, plan, and the arcade wallet (credits, streak, spins, Pawn Empire). Created by a trigger at sign-up. |
| `deals`, `flips`, `leaderboard_entries`, `market_trends`, `store_items` | Shared content, readable by any signed-in user. Seeded by the migration. |
| `watchlist`, `inventory_items`, `tracked_items`, `notifications` | Per-user data, locked to the owner by row-level security. |
| `weekly_puzzles`, `puzzle_guesses` | Price It Right. The answer price is never readable by clients. |
| `prize_wins` | $100 Prize Spin wins, for an admin to pay out. |
| `check_in()`, `spin_wheel()`, `submit_guess()`, `buy_store_item()`, `pawn_sync()`, `buy_upgrade()`, `pawn_cash_out()` | Every change to credits, spins or Pawn cash. Clients cannot write those columns directly. |

New users get a starter watchlist, four price alerts and two welcome
notifications. Add a new Price It Right item each week by inserting a row into
`weekly_puzzles` (dashboard or SQL).

## Structure

```
src/
  app/                 # expo-router entry: fonts + providers, renders HustlrApp
  lib/supabase.ts      # Supabase client (null when no keys → demo mode)
  hustlr/
    app.tsx            # shell: header, body, tab bar, Arcade button, web phone frame
    store.tsx          # navigation, auth, data loading, every action
    model.ts           # data types, DB row → UI mapping, money/date formatting
    data.ts            # static config: titles, wheel, upgrades, plans, images
    demo.ts            # the prototype's data, used without Supabase
    theme.ts           # colour tokens and font helpers, resolved from the prototype
    ui.tsx  chrome.tsx # shared components, header / tabs / FAB
    screens/           # auth, main (deals, inventory…), tools, arcade
supabase/migrations/   # schema, security, game rules, seed data
```

Navigation mirrors the prototype: a single state machine (`go` / `back` in
`store.tsx`) with a fixed header and tab bar, and the Android back button wired
to `back`.
