# Token Proposal — current → canonical

Maps today's tangle onto the Crust token set. Left = what exists in `tailwind.config.ts` /
`src/main.css` / hardcoded in components. Right = the single canonical token. **P0/P1 of the
migration is largely a mechanical rewrite using this table.**

Scale of the problem (measured on `earn-integration`): **191 hardcoded hexes**, **131 CSS color
vars** + an entire imported Tailwind palette (`src/utils/colors.ts` → `tailwind-colors`) +
`getRandomColor()`, **11+ radii**, **~350 arbitrary `-[…]` utilities** (96 one-off `text-[…]`).

## ⚠️ Accessibility audit result — the light palette was failing WCAG AA

Measured with the WCAG 2.1 sRGB formula (computed, not eyeballed). **Light mode was failing
broadly; dark mode passed.** Failures found: white on `#E77537` primary button **3.00:1**
(needs 4.5), accent-as-text **2.90:1**, `ink-2` **4.03:1**, `ink-3`/placeholder **2.38:1**,
`status-positive` **3.07:1**, `tx-swap` + white glyph **2.10:1** (needs 3.0).

**Structural fix — decouple hue identity from contrast duty** (the Radix / Coinbase model):
personality lives in grounds, tints and fills; accessibility lives in the inks.

| Role | Light | Dark | Why |
|---|---|---|---|
| `--accent` — **FILL** | `#E77537` | `#E77537` | **The Bread logo orange stays.** The bug was never the orange — it was *white text on it* (3.00:1). |
| `--on-accent` — label on that fill | `#FFFFFF` | `#FFFFFF` | **White stays** (it's the shipped brand treatment). White on brand orange = **exactly 3.00:1**, which conforms under SC 1.4.3 *only as large text* (≥18pt / ≥14pt bold = **18.66px bold**). ⇒ the primary CTA label is spec'd at **19px/700**; below that the button silently becomes non-conformant. |
| `--accent-critical` | `#D9661F` | `#D9661F` | Deeper fill for **irreversible actions** (send/sign confirm) — white on it = 3.58:1, buying real margin where 3.00:1's zero margin is unacceptable. |
| `--accent-ink` — **TEXT** | `#A84A1A` | `#E77537` | brand orange *as text* on paper is only 2.90:1, so links/small marks use a darker ink (5.55:1). In dark, the brand hue already clears at 5.86:1, so it collapses back. |
| `--accent-hover` | `#D3651F` | `#F08B57` | fill hover |
| `--ink-2` / `--ink-3` | `#5F5F5F` / `#6E6E6E` | unchanged | both clear 4.5:1; placeholders are **not** exempt |
| `--pos` / `--pend` / `--neg` | `#4A6B44` / `#A8421F` / `#A33421` | unchanged | 5.8–6.6:1 as text |
| `--warn` | `#8A5A00` light / `#E8B33F` dark | **new** | 5.7:1 / 9.2:1 — see note below |
| `--tx-*` | pastel fills `#A8BBA3 #A3BCCF #C9BAD9 #BDB9CC #CDB0DE` | same | soft squares keep the personality… |
| `--tx-glyph` | `#3F3F3F` | `#1C1A18` | …and the **dark glyph** carries the contrast (5.2–5.8:1). **Never a white glyph on these.** |

Note the accent is **theme-resolved**: the same token name holds a different value per theme so
contrast is satisfied by the system, not by the designer remembering. Accent text on
`--accent-wash` is 4.46:1 — that one pairing must use `--accent-hover`.

## ⚠️ Balance-card surface was too light to carry muted text

The shipping `--surface-balance` `#6F6F6F` with `--surface-balance-fg-muted rgba(255,255,255,.55)`
composites to `#BEBEBE` = **2.70:1** — the "Total Balance" label *and* the account number both
fail AA on the app's hero component. No opacity works on that surface: even 90% white only
reaches 4.45:1.

**Fix — darken the surface so a muted tier can exist at all:**

| Token | Was | Now | Result |
|---|---|---|---|
| `--balance` (light) | `#6F6F6F` | **`#4F4F4F`** | white **8.19:1**, muted **5.00:1** ✅ |
| `--balance-deep` (light) | `#5C5C5C` | **`#3D3D3D`** | bottom strip |
| `--balance-fg-muted` | `.55` | **`.70`** | one rule in both themes |
| `--balance` (dark) | `#101010` | unchanged | white 19.03:1, muted **9.49:1** ✅ |

**Rule that falls out of this:** on a dark surface, hierarchy from *opacity* is only available if
the surface is dark enough. Below ~`#5C5C5C`, secondary text must come from **size/weight**, not alpha.

## Color — accent (brand orange, currently written 9 ways)

| Current | → Canonical |
|---|---|
| `accent-primary`, `primary-orange`, `pill-active`, `accent-orange`, `primary.500`, `orange.500`, `logoOrange.400/500`, raw `#E77537` | `--accent` `#E77537` |
| `accent-primary-hover`, `primary-orange-dark`, `orange.600`, `primary.600`, `#C95A21` | `--accent-hover` `#C95A21` |
| `primary-orange-lighter`, `orange.50`, `#FFF3EC`, `#FFF3EB` | `--accent-wash` |
| `primary-orange-light`, `primary-orange-disabled`, `orange.200/300` | *(drop — derive from accent + opacity)* |
| `text-on-accent`, `pure-white` on buttons | `--on-accent` `#FFFFFF` |
| **`blue.400`/`blue.700`** (resolve to orange!), `logoOrange.*`, `stroke.orange #ED8936` | **delete — naming rot** |

Devnet: the whole accent group swaps to slate — `--accent` `#7286A0`, driven by
`MIDEN_NETWORK=devnet` exactly as today. Keep this mechanism.

## Color — neutrals (five stray greys → one warm ramp)

| Current | → Canonical |
|---|---|
| `--color-app-bg`, `app-bg`, onboarding `#FBFBFB` | `--paper` |
| `--color-surface`, `white`, `bg-white`, `surface-solid` | `--surface` |
| `--color-surface-secondary`, `gray.25`, `surface-interactive`, `#F6F4F2`, `#F9F9F9` | `--surface-2` |
| `--color-surface-tertiary`, `gray.50`, `chip-bg`, `#EFEFF2`, `#F2F2F4`, `#ECEBE8` | `--surface-3` |
| `--color-text-primary`, `black`, `heading-gray`*, `text-primary-token`, `#3F3F3F` | `--ink` |
| `--color-text-secondary`, `text-secondary-token`, `gray-secondary`, `#484848`, `#808080` | `--ink-2` |
| `--color-text-muted`, `text-tertiary-token`, `placeholder-gray`, `#ABABAB`, `#9E9E9E`, `#C7C7CC` | `--ink-3` |
| `--rule-default`, `border-subtle`, `#00000017`, `border-faint` | `--rule` |
| `--rule-strong`, `--color-border`, `border-card`, `border-light` | `--rule-strong` |

`*heading-gray` currently maps to `--color-text-secondary` (`#484848`) but is used as primary
text across the app — normalize to `--ink`. Retire: `gray.{200,250,300,400,500,600,700,800,900}`,
`yellow.*`, `blue.*`, `primary-white`, `send-blue`, `primary-gray`, `border-faint`, and the entire
wholesale imported Tailwind palette + `getRandomColor()`.

## Color — status & transaction (mostly keep; de-duplicate)

| Current | → Canonical |
|---|---|
| `status-positive`, `receive-green`, `green.500`, `#90BA89`, `#1A9C52`, `#009B3A`, `#A8BBA3` (balance delta) | `--pos` |
| `status-pending`, `#E85D2F` | `--pend` |
| `status-negative`, `#FF5500`, `#CC5D5D`, `#C51A0A`, `bg-red-500/10` | `--neg` |
| `bg-yellow-500` (password-strength "medium") | `--warn` |

### The status set is FOUR values, not three

Dark mode exposed a three-way hue collision: `--accent` (hue 21°, L .300), `--pend`
(15°, L .252) and the original dark `--neg` `#E5654E` (9°, L .265) were all the same
orange at the same lightness. Consequences: an **error was indistinguishable from the
brand colour**, and the password meter's *low* and *medium* tiers rendered identically.
Contrast checking cannot catch this — every one of those values passes 4.5:1; the defect
is that three different *meanings* share one hue.

Resolution: dark `--neg` → `#F5736B` (hue 3.5°, true red), and a new `--warn` amber
(hue ~40°) for the warning tier. `--pend` keeps its burnt orange for pending
transactions, where accent-adjacency is appropriate. Pending, warning, error and success
are four meanings and now four tokens.
| `--tx-received/sent/swap/earn/faucet` | **keep as-is** (the one good sub-system) |
| `--surface-balance*` (light: graphite/color) | **keep in light; in DARK → near-black** `#101010` top / `#000` bottom + 8% hairline. The balance card is a *colored* surface only in light mode; in dark it sits in the theme instead of floating as an odd grey box. |
| `--card-*` picker (slate/orange/blue/green/purple) | **light-mode only.** In dark, every variant collapses to the near-black balance surface (no colored cards in dark). |
| balance hardcodes `#FFFFFF4D`, `#F6F4F261` | → `--surface-balance-rule` / `--surface-balance-handle` |

## Typography

| Current | → Canonical |
|---|---|
| `fontFamily.sans/serif/mono/inter = ['Inter']` | `--ui: Inter`, `--display: Nunito`, **`--mono: 'Geist Mono'`** |
| `--font-heading`, `--font-onboarding-heading` (Nunito, Google-Fonts runtime) | `--display: Nunito` **self-hosted** |
| body Inter via Google Fonts runtime | `--ui: Inter` **self-hosted** |
| *(no mono in use; `fonts/GeistMono` bundled but unreferenced)* | `--mono: Geist Mono` for balances/amounts/addresses/hashes, `font-feature-settings:'tnum'` |
| 96 one-off `text-[…]` sizes | named scale: `display-xl/lg`, `title`, `body`, `label`, `numeric-hero/numeric`, `address` (see `index.html › Typography`) |
| stale `// Custom font families with Geist` comment | remove |

## Radius (11+ → 4)

| Current | → Canonical |
|---|---|
| `rounded-5`, `rounded-[3px]`, `radius-sm-token` (8), `rounded-sm`, `rounded-md`, `--radius-md 0.375rem` | `radius-sm` **8px** |
| `rounded-10`, `rounded-[10px]`, `rounded-[14px]`, `radius-md-token` (12), `rounded-lg`, `rounded-xl` | `radius-md` **12px** |
| `rounded-[20px]`, `rounded-[22px]`, `radius-lg-token` (16), `rounded-2xl`, `rounded-3xl`, `rounded-4xl` | `radius-lg` **16px** |
| `rounded-full` | `radius-full` **999px** |

## Spacing (~350 arbitrary → 4px scale)

| Current | → Canonical |
|---|---|
| `px-6` (page gutter, most common) | `space-6` 24px — the only gutter |
| one-offs: `h-9.5`, `w-9.5`, `py-4.5`, `pt-8`/`pt-6` toggles, `max-w-92.5`, `max-w-420`, `w-44.25`, `w-18.75`, `h-30.5` | nearest of `space-1..12` (4/8/12/16/20/24/32/40/48) |
| `spacing.15` (3.75rem), `spacing.35` (8.75rem) | keep only if a real pattern needs them; else retire |

## Shadow / elevation

| Current | → Canonical |
|---|---|
| ad-hoc `shadow-*`, `xs-white`, `top-light` | `flat` (none, rule border) · `--shadow-1` (e1) · `--shadow-2` (e2) |
| `shadow.outline` (3px accent) | `--focus-ring` — keep, apply on all interactives |
