# Crust — Bread Wallet Design System (Specification)

> Visual-language definition for Bread Wallet. **Phase: definition only.** No production
> component is refactored by this document. The interactive companion is `index.html`
> (open in a browser; it is built from the tokens below and toggles light/dark).

## Thesis

Self-custody is money most people are afraid to hold. The visual language has one job:
make sovereign, private money feel **calm, legible, and trustworthy** — a well-made
everyday object, not a trading terminal. **The onboarding is the north star:** it is the
most unified, harmonious surface in the app (warm cream ground, rounded Nunito, soft
spot-illustrations, generous space, one orange), and the whole product is derived *from it*
so the app reads as **one warm family throughout**. Precision comes from tabular figures,
clear hierarchy and restraint — not a colder, more technical register.

**One system, three targets.** Bread ships as **iOS**, **Android**, and a **Chrome/Firefox
extension** (plus a Tauri desktop shell) from one React codebase. The visual language is
**identical across all of them**; only rendering mechanics differ (native bottom-nav overlay
on mobile; the extension's ~360–400px popup width; desktop pointer states). Every token,
component and screen applies everywhere.

This is **not a reskin.** The identity is already right (warm paper, graphite ink, one
orange, the playful "toast-B" mark) and a semantic token layer (`components/ui/*`,
`--surface-*`/`--tx-*`/`--status-*`) is already ~40% built. The app feels amateur because
**three half-built visual generations coexist and were never consolidated.** Crust finishes
that migration and enforces one language. Codename "Crust" = the firm, consistent shell that
protects the warm bread inside.

## Principles (each produces concrete decisions)

1. **Finish the system, don't restart it.** Elevate Gen-3 (`components/ui`) to canonical;
   merge Gen-2, retire Gen-1. One Button, one sheet, one header family, one token ramp.
2. **Warm paper, graphite ink, one orange.** One warm-neutral ramp replaces five stray greys.
   Orange is structural (primary action, active state, focus) — never decorative filler.
3. **Numbers are the product — set them in mono.** Balances/amounts/addresses/hashes in
   GeistMono, tabular figures. (GeistMono already ships in `fonts/`, unused.)
4. **Calm by default, warm on arrival.** Illustrated/playful register reserved for onboarding
   & empty states; transactional surfaces are restrained.
5. **Restraint is the aesthetic.** 4 radii, a 4px spacing grid, 2 elevation levels.
6. **Security you can read.** One address-truncation rule, one status color set, copy
   affordances everywhere.

**Not:** Coinbase (navy/electric-blue trading chrome), a neobank template (glassy gradients,
marketing type), a shadcn dashboard (zinc neutrals, generic radius), or an industrial theme.

## Visual DNA — preserved

- Warm paper `#FBFBFB` ground + warm graphite `#3F3F3F` ink (the warm undertone is Bread's temperature).
- Bread orange `#E77537` as the single accent. Devnet keeps the slate-grey `#7286A0` accent as the environment tell.
- Nunito display type + the illustrated toast-B mark for headings/onboarding/empty states.
- The Gen-3 semantic sub-systems (`--surface-balance*`, `--tx-*`, `--status-*`, the card-color picker).

## Foundations (summary — full swatches/specimens live in `index.html`)

- **Color:** `TOKENS.md` is the authority. One accent, one warm-neutral ramp
  (paper→surface→surface-2→surface-3→ink-3→ink-2→ink), a 3-value status set, the kept `tx-*` hues.
- **Type:** **Nunito** (display) · **Inter** (UI/body). Self-hosted (kills the runtime Google-Fonts
  dependency). **Numbers → Nunito** via the single `--num` token (decided): the balance joins the
  onboarding family rather than reading as a code readout — matching Cash App's brand-face-for-balance /
  system-face-for-UI split. **Geist Mono is reserved for addresses, hashes and ids only.** Tabular +
  lining *figures* (`tnum`/`lnum`) still apply — a figure setting, not a monospace font.
  Named scale in `index.html › Typography`.
- **Evidence grading:** see `index.html › Constraints & evidence`. Tier 1 = hard WCAG numbers,
  Tier 2 = peer-reviewed wallet-safety findings (the strongest tier), Tier 3 = expert consensus,
  Tier 4 = **convention, not standard** (our spacing grid and radius scale live here — label them honestly).
- **Spacing:** 4px base; scale 4/8/12/16/20/24/32/40/48; page gutter = 24 (`px-6`).
- **Radius:** `sm 8` (chips/inputs/icon-squares) · `md 12` (cards/rows/menus) · `lg 16`
  (balance hero/sheets/modals) · `full` (buttons/pills/avatars). Retires 7+ others.
- **Elevation:** flat (rule-bordered) · e1 raised (prompts, nav pill) · e2 overlay (sheets, modals,
  balance card). Dark mode uses surface-step + rule contrast, not shadow.
- **Motion:** `fast 150ms` · `base 200ms` · `spatial 320ms`; `ease-standard` for feedback,
  `ease-spatial` (`cubic-bezier(.22,1,.36,1)`) for things that travel. All respect `prefers-reduced-motion`.

## Implementation spec (research-corrected)

**Units — "everything in rem" was wrong.** `rem` alone does *not* deliver iOS Dynamic Type in
WKWebView; the root font-size never changes and Capacitor doesn't wire it up. Android WebView is
the inverse — it applies the OS font scale by default but scales **text only**.

| Category | Unit |
|---|---|
| Font size, line-height (unitless), text-adjacent spacing | `rem` |
| Layout padding, gutters, radii, hairlines | **`px`** |
| Inline icons | `em` |
| Touch targets | `max(44px, …)` |
| Media queries | `rem` |

No `clamp()` fluid type. **Never set `font-size` on `html`** (no `10px` / `62.5%`) — it forecloses
Dynamic Type. Real recipe: inject a clamped (~0.85–1.6) `--font-scale` natively
(`UIFontMetrics` / `Configuration.fontScale`) into `:root{font-size:calc(100% * var(--font-scale,1))}`,
and call `setTextZoom(100)` on Android to avoid double-scaling.

**Viewport:** `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5,
user-scalable=yes, viewport-fit=cover`. Do **not** copy the Ionic starter's `user-scalable=no` —
WKWebView honours it (unlike Safari), making it a genuine lockout and an AA failure.
Inputs must compute **≥16px** or iOS auto-zooms on focus.

**Bottom action zone:** `padding-bottom: max(16px, env(safe-area-inset-bottom))` — *not* additive
(which wastes 48dp on Android 3-button nav). CTA min-height **52px**. `env()` without a `max()`
floor resolves to **0** on SE and in the extension popup — the flush-to-edge bug.

**Viewports:** reference **iPhone 17 402×874**; must hold **SE 375×667 → Pro Max 440×956**, plus
the **extension popup 360×600 (hardest case — check it first)**.

## Deliverables in this folder

| File | What |
|---|---|
| `index.html` | Interactive site: thesis, audit, foundations, components, patterns, screens (current↔proposed), a11y, migration. |
| `SPEC.md` | This document. |
| `TOKENS.md` | Current-token → canonical-token map (color, type, radius, spacing). |
| `COMPONENTS.md` | Component consolidation map (survive / merge / retire) with file paths. |
| `MIGRATION.md` | Phased, visual-only, behavior-preserving migration plan. |
| `assets/` | Real Bread mark, current-state screenshots, self-hosted GeistMono. |

## Constraints honored

- No changes under `/0xMiden/wallet` (read-only mirror).
- No production component, route, data-flow, or tested behavior changed.
- Nothing committed or pushed without explicit approval.
- No AI attribution in any artifact.
