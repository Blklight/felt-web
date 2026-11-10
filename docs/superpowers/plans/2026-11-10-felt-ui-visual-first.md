# felt-web visual-first Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the felt visual identity, game components (card, chip, seat, table, pot, board, action bar, timer), a showcase category and layout-only screens, all driven by fake snapshots shaped like the server `view`.

**Architecture:** Keep the `tpl-ui` Next.js template. Game components are pure presentational React components fed by a typed `TableView`; no network, no rules. Colors live in semantic Tailwind v4 tokens in `globals.css` (felt green surface using `.background-texture`, sober neon accents). Texts come from `en` / `pt-br` dictionaries read through a small hook over the existing `useLanguageStore`.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, TypeScript strict, Tailwind v4, Base UI (shadcn `base-vega`), Zustand, Vitest + Testing Library, Biome, Bun.

**Spec:** `docs/superpowers/specs/2026-11-10-felt-ui-visual-first-design.md`

## Global Constraints

- Follow `AGENTS.md`: no obvious comments, no `process.env` in components except `NEXT_PUBLIC_*`, do not hand-edit `src/components/ui/`, `bun run typecheck && bun run lint && bun run test` before finishing each task.
- Read `node_modules/next/dist/docs/` before touching Next config/APIs (Next 16 differs from training data).
- No new dependencies without telling the user first.
- `cacheComponents: true`: no `new Date()` / `Math.random()` in render of Client Components; timers take props, fixtures use fixed numbers.
- UI languages: English and Portuguese (`"en"`, `"pt-br"`); all user-visible strings go through the dictionary.
- Game components never decide rules; action buttons come only from `you.legalActions`.
- Cards: alt text per card ("Ace of spades" / "Ás de espadas"), keyboard-operable actions with visible focus, AA contrast, nothing conveyed by color alone (suit shapes always drawn; optional four-color deck).
- Respect `prefers-reduced-motion` and light/dark.
- No casino wording ("bet", "casino", "jackpot") in brand/copy; game UI says raise/call/pot.
- Hosting: GitHub Pages, `output: "export"`, `trailingSlash: true`, `images.unoptimized`; table lives at `/table` reading `?code=` client-side.
- Neon starting values: purple `#7c5cff`, cyan `#7cf4ff`; felt texture via existing `.background-texture`.

## Review Focus

- Table with 2, 3, 4, 5, 6 seats and with empty seats: no overlap, all seats rendered (Task 7).
- `legalActions` empty (not my turn / spectator): action bar shows no buttons and no crash (Task 8).
- Raise bounds: slider clamps to `min`/`max`, `min === max` (all-in only) does not break (Task 8).
- Hidden card `"??"` never renders rank/suit text or alt text revealing a card (Task 4).
- Language switch to `en` and back keeps every key defined in both dictionaries (Task 3).
- Very long player names and 7-digit stacks truncate instead of breaking the seat layout (Task 6).

---

### Task 1: Project bootstrap and static-export decision

**Files:**
- Modify: `.gitignore` (add `.superpowers/`), `next.config.ts`, `src/app/layout.tsx` (metadata title `felt`, description, `lang` follows language later), `package.json` name `felt-web`
- Create: `.env.example` only if needed (`NEXT_PUBLIC_BASE_PATH`, empty)

**Interfaces:**
- Produces: a repo where `bun run build` emits `out/`.

- [ ] **Step 1:** Run `bun install`; confirm `node_modules/next/dist/docs/` exists and read the guides on `output: "export"` and `cacheComponents`.
- [ ] **Step 2:** Run `bun run typecheck && bun run lint && bun run test` on the untouched template and note the baseline.
- [ ] **Step 3:** Set `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }` in `next.config.ts`, mirroring `../cringedeck/next.config.ts`.
- [ ] **Step 4:** Run `bun run build`. Expected: succeeds and creates `out/`. If it fails because of `cacheComponents`/`partialPrefetching`, remove those two options and re-run; record the outcome in the spec's "Restrições" section.
- [ ] **Step 5:** Add `.superpowers/` to `.gitignore`; update title/description to `felt`.
- [ ] **Step 6:** Commit `chore: static export, felt metadata`.

### Task 2: Visual tokens

**Files:**
- Modify: `src/app/globals.css`
- Test: none in jsdom; verified by build, lint and showcase (Task 9)

**Interfaces:**
- Produces Tailwind-usable tokens (names fixed here): `--color-felt`, `--color-felt-deep`, `--color-felt-rim`, `--color-bone` (card face), `--color-ink` (card black suit), `--color-suit-red`, `--color-neon-violet`, `--color-neon-cyan`, plus utility classes `.felt-surface` (felt gradient + `background-texture`) and `.neon-glow` (box-shadow using `--color-neon-violet`). Dark and light both defined.

- [ ] **Step 1:** Add the tokens to `@theme` and the semantic values to `:root` and `.dark`. Felt greens near `#17493a` to `#0b241c`; bone `#faf6ea`; red `#b3261e` (AA on bone).
- [ ] **Step 2:** Add `.felt-surface` (radial gradient + the existing `background-texture` image) and `.neon-glow`, plus a `@media (prefers-reduced-motion: reduce)` guard for any pulse animation used for the active turn.
- [ ] **Step 3:** Run `bun run lint && bun run build`. Expected: pass.
- [ ] **Step 4:** Commit `feat: felt visual tokens`.

### Task 3: i18n (en + pt-br)

**Files:**
- Create: `src/i18n/dictionaries.ts`, `src/i18n/use-t.ts`
- Modify: `src/store/useLanguageStore.ts` (type `language` as `"en" | "pt-br"`)
- Test: `tests/i18n/dictionaries.test.ts`, `tests/i18n/use-t.test.tsx`

**Interfaces:**
- Produces: `type Language = "en" | "pt-br"`; `dictionaries: Record<Language, Record<MessageKey, string>>`; `type MessageKey = keyof typeof en`; `useT(): (key: MessageKey, vars?: Record<string, string | number>) => string` reading `useLanguageStore`. Initial keys: action labels (`action.fold|check|call|raise|allIn|hit|stand|double`), `pot`, `timer.seconds`, rank/suit names (`rank.A…K`, `suit.s|h|d|c`), `card.hidden`, `card.label` (`"{rank} of {suit}"` / `"{rank} de {suit}"`), nav and screen titles, `about.noRealMoney`.

- [ ] **Step 1:** Test `dictionaries.test.ts`: `Object.keys(dictionaries.en)` equals `Object.keys(dictionaries["pt-br"])` and no value is empty.
- [ ] **Step 2:** Test `use-t.test.tsx`: with language `pt-br` `t("action.fold")` returns the Portuguese label; after `setLanguage("en")` it returns the English one; `{rank}` placeholders interpolate.
- [ ] **Step 3:** Run both tests, expect FAIL.
- [ ] **Step 4:** Implement dictionaries and `useT`.
- [ ] **Step 5:** Run tests, expect PASS; commit `feat: en/pt-br dictionaries and useT`.

### Task 4: Protocol-shaped types, fixtures and card model

**Files:**
- Create: `src/dev/view-types.ts`, `src/dev/fixtures.ts`, `src/lib/cards.ts`
- Test: `tests/lib/cards.test.ts`

**Interfaces:**
- Produces in `view-types.ts` (mirrors plan §3.6, to be replaced by synced `protocol.ts` later):
  `Rank`, `Suit` (`"s"|"h"|"d"|"c"`), `CardCode = \`${Rank}${Suit}\` | "??"`,
  `LegalAction = { type: "fold"|"check"|"call"|"raise"|"all-in"|"hit"|"stand"|"double"; min?: number; max?: number; amount?: number }`,
  `SeatView = { seat: number; name: string; avatarId: string; stack: number; bet: number; cards: CardCode[]; status: "active"|"folded"|"all-in"|"out"|"empty"; isDealer: boolean; isTurn: boolean }`,
  `TableView = { game: "blackjack"|"poker"; phase: string; seats: SeatView[]; board: CardCode[]; pots: number[]; secondsLeft: number | null; you: { seat: number | null; legalActions: LegalAction[] } }`.
- Produces in `cards.ts`: `parseCard(code: CardCode): { hidden: true } | { hidden: false; rank: Rank; suit: Suit }`; `suitColor(suit: Suit): "red" | "black"`.
- Produces in `fixtures.ts`: `pokerTable(seatCount: 2|3|4|5|6): TableView`, `blackjackTable: TableView`, `spectatorTable: TableView` (empty `legalActions`), and one fixture with a 40-character name and a 9,999,999 stack.

- [ ] **Step 1:** Tests: `parseCard("As")` → rank `A`, suit `s`; `parseCard("Td")` → rank `T`, suit `d`; `parseCard("??")` → `{ hidden: true }`; `suitColor("h")` is `"red"`, `suitColor("c")` is `"black"`.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Write fixtures (no `Date`, no `Math.random`). Commit `feat: view types, card model, fixtures`.

### Task 5: Card component

**Files:**
- Create: `src/components/cards/playing-card.tsx`, `src/components/cards/card-back.tsx`, `src/components/cards/hand.tsx`
- Test: `tests/components/playing-card.test.tsx`

**Interfaces:**
- Consumes: `parseCard`, `suitColor`, `useT`.
- Produces: `PlayingCard({ code: CardCode; fourColor?: boolean; className?: string })` (SVG; hidden code renders `CardBack` with `role="img"` and `aria-label` from `card.hidden`); `Hand({ cards: CardCode[]; fourColor?: boolean })` (overlapping row). Suit shapes always drawn; `fourColor` changes suit fill (spades black, hearts red, diamonds blue, clubs green). Card back uses neon violet pattern with `.neon-glow`. Face cards (`J`, `Q`, `K`) get original simple SVG art (a crest letter plus suit motif is enough for this slice).

- [ ] **Step 1:** Tests: `"As"` has accessible name "Ace of spades" (en) and "Ás de espadas" (pt-br); `"??"` has name matching `card.hidden` and the DOM contains no rank text; `fourColor` gives a different fill for diamonds than the default; `Hand` renders one image per card.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Commit `feat: playing card components`.

### Task 6: Chips, seat, pot, board, timer

**Files:**
- Create: `src/components/chips/chip.tsx`, `src/components/chips/chip-stack.tsx`, `src/components/table/seat.tsx`, `src/components/table/pot.tsx`, `src/components/table/board.tsx`, `src/components/table/timer.tsx`
- Test: `tests/components/seat.test.tsx`, `tests/components/chips.test.tsx`

**Interfaces:**
- Produces: `Chip({ value: number })` (color by value tier, value printed so color is never the only signal); `ChipStack({ amount: number })` (greedy breakdown into denominations `[1000, 500, 100, 25, 5, 1]`, capped to 6 visible chips, exports `breakdown(amount: number): number[]` for testing); `Seat({ seat: SeatView; isYou?: boolean; fourColor?: boolean })` (name truncated with `title`, stack with thousands separator, dealer button, `aria-current="true"` when `isTurn`, neon ring when `isTurn`, empty seat renders a "free seat" placeholder from the dictionary); `Pot({ pots: number[] })`; `Board({ cards: CardCode[] })` (always reserves 5 slots in poker); `Timer({ secondsLeft: number | null })` (`role="timer"`, no animation when reduced motion).

- [ ] **Step 1:** Tests: `breakdown(0)` is `[]`; `breakdown(25)` is `[25]`; `breakdown(1775)` has at most 6 entries, is sorted descending, starts with `1000`, and its sum never exceeds 1775. Seat: a 40-character name renders with a `title` attribute equal to the full name; `isTurn` sets `aria-current`; `status: "empty"` renders the free-seat text; stack `9999999` renders `9,999,999` (en) / `9.999.999` (pt-br) via `Intl.NumberFormat`.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Commit `feat: chips, seat, pot, board, timer`.

### Task 7: Table layout

**Files:**
- Create: `src/components/table/table.tsx`, `src/components/table/seat-positions.ts`
- Test: `tests/components/table.test.tsx`, `tests/components/seat-positions.test.ts`

**Interfaces:**
- Consumes: `Seat`, `Pot`, `Board`, `Timer`, `TableView`.
- Produces: `seatPositions(count: number): { x: number; y: number }[]` (percent coordinates on an ellipse, index 0 at bottom center, no two positions closer than 15 percentage points for `count` 2 to 6); `Table({ view: TableView; fourColor?: boolean })` on `.felt-surface`; mobile layout keeps the ellipse but shrinks seats (container-query or breakpoint classes).

- [ ] **Step 1:** Tests: `seatPositions(n)` returns `n` points for 2…6, all within 0–100, pairwise distance ≥ 15; `Table` with `pokerTable(n)` renders exactly `n` seat regions for each n in 2…6; with empty seats still renders the free-seat placeholders; `Table` shows pot and board cards.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Commit `feat: table layout`.

### Task 8: Action bar and bet slider

**Files:**
- Create: `src/components/table/action-bar.tsx`, `src/components/chips/bet-slider.tsx`
- Test: `tests/components/action-bar.test.tsx`

**Interfaces:**
- Consumes: `LegalAction`, `useT`, existing `src/components/ui/slider.tsx` and `button.tsx`.
- Produces: `ActionBar({ actions: LegalAction[]; onAction: (action: { type: LegalAction["type"]; amount?: number }) => void })`; one button per legal action, in order; `raise` shows `BetSlider({ min: number; max: number; value: number; onChange: (v: number) => void })` and submits the chosen amount; `call` shows `action.amount` in its label.

- [ ] **Step 1:** Tests: `actions=[]` renders no buttons; `[fold, call(amount 50)]` renders "Fold" and "Call 50" buttons and clicking Call fires `onAction({ type: "call", amount: 50 })`; `raise` with `min 100, max 1000` clicking Raise after slider keyboard `End` fires amount `1000`; `Home` fires `100`; `min === max` renders a single all-in style button and no slider; all buttons reachable by `Tab`.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Commit `feat: action bar and bet slider`.

### Task 9: Showcase category "Game"

**Files:**
- Create: `src/components/showcase/demos/game.tsx`
- Modify: `src/components/showcase/registry.ts`
- Test: `tests/components/game-showcase.test.tsx`

**Interfaces:**
- Produces: `gameCategory: ShowcaseCategory` with `id: "game"` and items `playing-card`, `chips`, `seat`, `table-poker` (with a 2–6 seat selector), `table-blackjack`, `action-bar`, `four-color-toggle`; registered in `categories`.

- [ ] **Step 1:** Test: every item of `gameCategory` renders its demo without throwing, and slugs are unique across `categories`.
- [ ] **Step 2:** Run, expect FAIL; implement demos using fixtures; run, expect PASS.
- [ ] **Step 3:** Run `bun run dev`, open `/components`, check each demo at phone width and desktop in light and dark; fix visual issues.
- [ ] **Step 4:** Commit `feat: game showcase category`.

### Task 10: Layout-only screens

**Files:**
- Create: `src/app/table/page.tsx`, `src/app/profile/page.tsx`, `src/app/about/page.tsx`, `src/components/screens/lobby.tsx`, `table-screen.tsx`, `profile-screen.tsx`, `about-screen.tsx`, `src/components/language-switch.tsx`
- Modify: `src/app/page.tsx` (lobby), `src/components/layout-base.tsx` (felt surface background and nav)
- Test: `tests/components/screens.test.tsx`

**Interfaces:**
- Produces: Lobby with create room (game select, blinds, `capToShortestStack` switch), join by 5-letter code (alphabet without `0/O/1/I`; invalid input shows an error, no navigation), quick game button; links go to `/table?code=XXXXX`. `/table` reads `code` with `useSearchParams` inside `<Suspense>` and renders `Table` + `ActionBar` with fixtures. Profile shows name, avatar, balance and recovery-code placeholders (no storage). About shows how-to-play and the no-real-money notice. `LanguageSwitch` toggles `en`/`pt-br` and updates `document.documentElement.lang`.

- [ ] **Step 1:** Tests: code input rejects `"AB0O1"` and accepts `"KQ7XZ"`-style codes from the allowed alphabet (assert on exported `isValidRoomCode(code: string): boolean`); `/table` screen without `code` shows a message instead of crashing; About screen contains the no-real-money text in both languages.
- [ ] **Step 2:** Run, expect FAIL; implement; run, expect PASS.
- [ ] **Step 3:** Manual pass in `bun run dev` on phone width and desktop, light and dark.
- [ ] **Step 4:** Commit `feat: lobby, table, profile and about screens`.

### Task 11: GitHub Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml` (adapt `../cringedeck/.github/workflows/deploy.yml`), `public/CNAME` containing `felt.blklight.dev`

- [ ] **Step 1:** Adapt the sibling workflow: install with Bun, run typecheck, lint, test, build, publish `out/` to Pages on `main`.
- [ ] **Step 2:** Run `bun run build` locally; confirm `out/table/index.html` exists and `out/CNAME` is present.
- [ ] **Step 3:** Commit `ci: deploy to GitHub Pages`. Do not push or enable Pages without the user's say-so.

### Task 12: Final verification

- [ ] **Step 1:** Run `bun run typecheck && bun run lint && bun run test && bun run build`. Expected: all pass.
- [ ] **Step 2:** Serve `out/` statically and walk `/`, `/table?code=KQ7XZ`, `/profile`, `/about`, `/components` in both languages and both themes; confirm reduced-motion by toggling the OS/browser setting.
- [ ] **Step 3:** Report what was done and what remains (network, accounts, rules, animations, sounds, avatar SVG set).
