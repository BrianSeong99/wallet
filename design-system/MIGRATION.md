# Migration Plan — visual-only, behavior-preserving

Ground rules for every phase:
- **No** route, data-flow, intercom, or tested-behavior change. Pure visual/token work.
- Jest coverage stays ≥95% (branches/functions/lines/statements) throughout.
- One reviewable PR per slice; screenshot-diff gate on "no visual change" phases.
- No production UI change lands until the direction is approved.

## P0 — Token foundation *(no visual change)*
Introduce the Crust CSS variables in `src/main.css` alongside the existing ones and point
legacy names at them (e.g. `--color-text-secondary`/`heading-gray → --ink`). Self-host
Nunito, Inter and GeistMono (kill the runtime Google-Fonts dependency); wire `mono → Geist Mono`
in `tailwind.config.ts`. Nothing moves on screen — this makes later phases mechanical.
**Exit:** app pixel-identical; `TOKENS.md` mapping in place.

## P1 — Kill the drift *(pixel-diff clean)*
Codemod the **191 hardcoded hexes** and **~350 arbitrary `-[…]` utilities** to the nearest
token; collapse the radius set to `sm/md/lg/full`. Delete `getRandomColor()`, `blue.*`,
`logoOrange`, the six `primary-orange-*`, `send-blue`, and the wholesale imported Tailwind
palette (`src/utils/colors.ts` → `tailwind-colors`). Mostly find-and-replace behind a
screenshot-diff gate.
**Exit:** zero raw hex / arbitrary utilities in `screens/`+`components/`; one radius scale.

## P2 — Component consolidation *(per-family PRs, in order)*
One family per PR, each retiring duplicates behind the survivor's existing API (see `COMPONENTS.md`):
1. Amount entry — `InputAmount → AmountInput`; unify AssetField/PlainAssetInput validation.
2. Buttons — `components/Button` sole source; retire `FormSecondaryButton` + ad-hoc; decide shadcn in/out.
3. Overlays — standardize vaul; retire react-modal `CustomModal`/`ModalWithTitle` + bespoke `TransactionProgressModal`.
4. Headers — `NavigationHeader → ScreenHeader`; keep `TabHeader`.
5. Rows/cards — `ListItem → CardItem`; `DetailRow ↔ ReviewRow`.
6. Chips/badges + checkbox×3 + toggle×2 — one each; delete dead `AccountTypeBadge`.
**Exit:** one canonical component per job; Storybook catalog reflects it.

## P3 — De-bolt the outliers
- **Earn** (`screens/earn-flow/*`) — rebuild on the kit: drop the duplicated `EarnFlowHeader`
  (use `TabHeader`/`ScreenHeader`), replace ad-hoc hex `<div>`s with `CardItem`/`DetailCard`/
  `AmountInput`, and reconsider the Recharts dependency (used nowhere else).
- **Bridge** (`BridgeDeposit` + `EvmConnectModal`) — move off `lib/ui/button` onto the canonical
  Button + vaul sheet; align the Reown/AppKit surfaces to the pattern library.
- **Browser** (`app/pages/Browser/*`) — align chrome (capsule/URL bar, favourites grid) to the
  dApp-surface pattern; keep its self-contained state machine.
**Exit:** Earn/Bridge/Browser read as the same product as Home.

## P4 — Guardrails
Add lint rules: ban raw hex in `className`, ban arbitrary `rounded-[…]`/`text-[…]`, ban new
imports of retired components. Make Storybook the enforced catalog (CI check). The system
can't silently drift again.
**Exit:** drift is a build failure, not a review nit.

## Sequencing note
P0→P1 are safe to land immediately and independently of the design-direction debate (they only
remove drift and self-host fonts). P2→P4 depend on sign-off of the canonical choices in
`COMPONENTS.md`. Each of the three outliers in P3 can proceed in parallel once P2's shared
components exist.
