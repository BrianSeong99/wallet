# Component Consolidation Map

Three visual generations coexist, distinguishable by color vocabulary:

- **Gen-3 (newest, canonical)** — `src/components/ui/*` + parts of `src/lib/ui/*`. Semantic
  tokens (`accent-primary`, `text-primary-token`, `surface-*`, `status-*`).
- **Gen-2 (current default)** — `src/components/*`. `primary-500`, `heading-gray`, framer-motion.
- **Gen-1 (legacy)** — `src/app/atoms/*` + old screens. `primary-orange`, raw `gray-XXX`, react-modal, tippy.
- **Bypass** — `src/screens/earn-flow/*`: ad-hoc `<div>`/`<button>` + raw hex, bypassing tokens entirely.

Legend: **SURVIVE** = canonical · **MERGE** = fold into survivor behind its API · **RETIRE** = delete/replace.

## Buttons — 6 impls → 1 + icon
| Impl | File | Verdict |
|---|---|---|
| `Button` (framer, token-based, 59 consumers) | `components/Button.tsx` | **SURVIVE** (canonical) |
| `FormSubmitButton` (`rounded-10`, gradient hover) | `app/atoms/FormSubmitButton.tsx` | **MERGE** → `size`/loading state |
| `FormSecondaryButton` (**outlined** `border-2 border-primary-orange`, `rounded-3xl`) | `app/atoms/FormSecondaryButton.tsx` | **MERGE** → **filled** secondary variant (drop the border + legacy orange) |
| shadcn `button` (cva+Radix, rich variants; bridge only, 3 files) | `lib/ui/button.tsx` | **DECIDE in/out** — don't leave two "the button" |
| `CircleButton` (icon-only) | `components/CircleButton.tsx` | **SURVIVE** (icon standard) |
| ~18 ad-hoc `<button>` (earn-flow, onboarding, `SelectAmount`, `ChooseGuardian`) | screens | **RETIRE** |
| `CleanButton`, `CopyButton` (field utilities) | `app/atoms/*` | SURVIVE (utilities) |

**Design rule — no outlined buttons.** Actions are filled-primary (orange), filled-secondary (`surface-2`), or borderless-ghost (text + accent). Borders are for structural separation (cards/rows/dividers), never tap targets — extends to chips and pills.

**Pattern — InfoSheet is the only "additional info" surface.** Explanatory / utility content
(what a Guardian is, why a fee applies, what an APY risk means, address-format help) always
appears as a **fit-to-content bottom sheet** on the app's single overlay primitive
(`lib/ui/drawer`, vaul). Never an inline card, never a second modal language.

*Why a sheet, specifically:* it overlays the current screen so the thing being explained stays
visible behind it — **context preservation**, which is Benji's tray argument. It is explicitly
**not** justified by reachability; NN/g refutes that rationale for bottom sheets, and citing it
would be folklore.

*When NOT to use it:* a **blocking decision** that must be answered → dialog (not swipe-dismissible).
**Long reference content** → routed page. A **one-line clarification** → inline hint text, no
overlay at all.

*Anatomy (from the shipped `GuardianInfoDrawer`):* 6px accent top border · centred 26px title ·
hero illustration · centred intro · 6px accent rule · divider-separated rows with coloured
circular badges · one full-width dismiss button · `padding-bottom: max(16px, safe-area)`.
Overlay is transparent — no dim scrim — because the sheet does not block the flow.

**Scrim spec — dim is load-bearing, blur is depth.** `rgba(0,0,0,.40)` light / `.55` dark, plus
`backdrop-filter: blur(4px)`. The guidance is **40–60% black** to isolate foreground content, so
the app's own primitive at `bg-black/30` (light) is **below the floor** — `/50` dark is fine.
Keep the blur radius small: large `backdrop-filter` is paint-bound, and it must **never be
animated**. Blur alone is not a substitute — the dim is what guarantees legibility.

**Note the badge contrast trap:** a small glyph on the accent fill must use `--on-accent-sm`
(near-black, 5.78:1). The shipped component uses `text-pure-white` on `primary-500`, which is
**2.9:1 and fails** — the spec here is deliberately stricter than the current implementation.

**Design rule — one action zone.** The primary action sits in a **fixed bottom action zone** — full-width primary, `gutter 24 · bottom max(16px, env(safe-area-inset-bottom))`, CTA min-height 52px — at the **same Y on every screen**, so it never jumps as the user moves between screens (today's builds drift). Scrollable screens use a sticky footer; short screens pin it. Migration: normalize every screen's footer to this zone during the per-screen re-skin.

**Secondary/ghost actions sit directly BENEATH the primary.** This line previously said
"above"; that was wrong and contradicted both `index.html` and all 49 rendered screens.
Beneath is correct for two reasons: it matches the shipped Welcome screen, and on
irreversible actions it is a safety property — an accidental tap at the very bottom edge
hits *Cancel*, never "send funds permanently". The layout-stability worry that motivated
"above" doesn't apply, because the zone's height is fixed by its own padding, not by its
contents.

## Password strength — four tiers, one component

`data-tier="low|medium|strong"` on a `.strength` wrapper drives **both** the filled-segment
count and the label colour; the absent attribute is the empty/default state. Shipped copy:
`low` / `medium` / `veryStrong` ("Very strong!") plus the `8chars1number` hint. Because the
tier is also spelled out in words, colour is never the sole carrier (**SC 1.4.1**, Level A).

Amber is the **new `--warn` token**, *not* `--pend`. Reusing `--pend` failed in dark mode:
`--accent` (hue 21°), `--pend` (15°) and the then-current `--neg` (9°) were all the same
orange at the same lightness (L .300 / .252 / .265), so *low* and *medium* rendered
identically **and both read as brand colour**. Dark `--neg` moved to `#F5736B` (hue 3.5°)
and `--warn` is `#8A5A00` light / `#E8B33F` dark. Pending, warning, error and success are
four distinct meanings — the status set is four values, not three.

No error ring while a password is being typed: incomplete is not invalid, and premature
error styling is its own defect. Rings (`--neg`, 1.5px) are for settled validation
failures only — mismatch, bad seed word.

## Two shipped bugs found in the import path

`src/screens/onboarding/import-wallet-flow/ImportSeedPhrase.tsx`:

1. **`:85` renders `t('importSeedPhraseError')` and that key does not exist in
   `public/_locales/en/en.json`** — the error paragraph resolves to the raw key or to
   nothing.
2. **`:31` `errorsMap` already computes per-word validity** against the word list, but is
   only reduced to a single boolean; the individual fields are never marked.

Net effect today: a mistyped seed word gives a **dead Continue button and no explanation**.
The fix is nearly free since the per-word data already exists — ring the offending field and
name the index in the message ("Word 3 isn't in the Miden word list").

Separately, `VerifySeedPhrase.tsx` has **no error state at all** — no `error`/`invalid`
handling anywhere in the file. A screen whose only job is to catch a mistake currently
cannot tell you that you made one. That needs a new i18n key, so it is a product decision,
not a spec gap.

## Dead onboarding enum members — do not build

| `OnboardingStep` member | Status |
|---|---|
| `SelectWalletType` | Not a screen. `onWelcomeAction` maps `'select-wallet-type'` straight to `{id:'choose-protection'}` (`navigator.tsx:126-132`). |
| `SelectTransactionType` | Component exists (`create-wallet-flow/SelectTransactionType.tsx`) but **routed: 0, navigated-to: 0**. |
| `BiometricSetup` | No component, not routed. |

## Headers — 5 → 2
| Impl | File | Verdict |
|---|---|---|
| `TabHeader` (top-level tab pages, `text-[28px]`) | `components/ui/TabHeader.tsx` | **SURVIVE** (tab pages) |
| `ScreenHeader` (back/close, `text-[1.75rem]`) | `components/ScreenHeader.tsx` | **SURVIVE** (back/close) |
| `NavigationHeader` (centered, `text-xl` medium) | `components/NavigationHeader.tsx` | **MERGE** → ScreenHeader |
| `EarnFlowHeader` (+ inline re-impl in `EarnVaultDetail`) | `screens/earn-flow/components.tsx` | **RETIRE** → TabHeader/ScreenHeader |
| onboarding `Header` (progress dots only) | `screens/onboarding/*` | keep (distinct role) |

Reconcile the three title sizes (1.75rem extrabold / xl medium / 28px bold) into the type scale.

## Navigation & tabs
| Impl | File | Verdict |
|---|---|---|
| `BottomNav` (React, `accent-primary` active) | `components/ui/BottomNav.tsx` | **SURVIVE** (+ native overlay on mobile — keep both renderers) |
| `SegmentedActionBar` (home Send/Receive/Swap) | `components/ui/SegmentedActionBar.tsx` | **SURVIVE** (action bar, not a tab set) |
| `TabPicker` (animated pill, token-based) | `components/TabPicker.tsx` | **SURVIVE** (tabs) |
| `TabSwitcher` (woozie links) | `app/atoms/TabSwitcher.tsx` | **MERGE** → TabPicker |
| `ImportTabSwitcher` (`primary-orange` underline) | `app/atoms/ImportTabSwitcher.tsx` | **RETIRE** |

Factor the shared animated-pill mechanic (TabPicker + SegmentedActionBar) into one primitive.

### The action bar is feature-gated — draw the shipped state, spec the future one

`TabLayout.tsx:103-137` composes it as **overview · send · receive · [earn] · [swap]**, where the
last two are conditional on `isEarnEnabled()` and `isSwapEnabled()` (`src/lib/feature-flags.ts`).
Today those are **false** and **true**, so the shipped bar is **four** segments ending in **Swap**.

An earlier version of these mocks drew Earn and omitted Swap — i.e. it drew the gated-off feature
and left out the enabled one. Corrected: every screen shows the four-segment shipped state, and
only the Earn screens (themselves tagged *gated off*) show the five-segment earn-enabled state.

**Measured constraint for when Earn ships.** Five segments overflow the **360pt extension popup by
9.1pt**. The collapsed chips are already on their 44pt tap-target floor and cannot compress, so the
gap is the only slack: **7px → 4px below 380pt** reclaims 12pt and fits at 312/312 with the smallest
chip at 44.7pt. Verified at 360 / 375 / 402 / 440 × 4 and 5 segments.

Narrowing the page gutter would also have worked, and was rejected: it moves every other component
on the screen to fix one. In the mocks the rule is scoped to `.phone.ext` because a media query
cannot see a fixed-width frame; in production key it off a container query or `isExtension()`.

This defect only appears when the flag flips, so it would have shipped *with* Earn — which is the
argument for specifying gated features rather than deleting them from the system.

## Cards / surfaces
| Impl | File | Verdict |
|---|---|---|
| `BalanceCard` (two-tone, `card-*` tokens, font-fit) | `components/ui/BalanceCard.tsx` | **SURVIVE** (unique hero) — de-hardcode `bg-[#A8BBA3]`, `#FFFFFF4D`, `#F6F4F261`. **Dark mode → near-black** (`#101010`/`#000` + hairline); card colors are light-mode only. |
| `PromptCard` (`bg-surface-input rounded-10`) | `components/ui/PromptCard.tsx` | **SURVIVE** |
| `DetailCard` + `DetailRow` (bordered) | `lib/ui/DetailCard.tsx` | **SURVIVE** — fix hardcoded badge `#CC5200`/`#FFF3EB` |
| `CardItem` vs `ListItem` (near-duplicate rows) | `components/{CardItem,ListItem}.tsx` | **MERGE** ListItem → CardItem |
| earn ad-hoc cards (`rounded-2xl border-[#EFEFF2]`) | `screens/earn-flow/*` | **RETIRE** → CardItem/DetailCard |

## Form fields & amount entry
| Impl | File | Verdict |
|---|---|---|
| `AmountInput` (already shared send+swap) | `components/AmountInput.tsx` | **SURVIVE** (canonical amount) |
| `InputAmount` (centered, fiat toggle — overlaps) | `components/InputAmount.tsx` | **MERGE** → AmountInput (centered/fiat mode) |
| `AssetField` + `PlainAssetInput` (dup BigNumber clamp) | `app/atoms/*` | **MERGE** → one validation hook |
| `FormField` (heavyweight legacy field) | `app/atoms/FormField.tsx` | SURVIVE until form stack modernized |
| `Input` / `CurrencyInput` | `components/Input.tsx` | **MERGE** → FormField or one token-based text field |
| `SearchInput` | `components/ui/SearchInput.tsx` | **SURVIVE** (search) |

## Sheets / modals — 3 libraries → 1
| Impl | File | Verdict |
|---|---|---|
| **vaul** drawer | `lib/ui/drawer.tsx` | **SURVIVE** (all bottom sheets) |
| react-modal `CustomModal`/`ModalWithTitle` | `app/atoms/CustomModal.tsx` | **RETIRE** → vaul dialog mode |
| bespoke `TransactionProgressModal` (14KB, 1 consumer) | `components/TransactionProgressModal.tsx` | **RETIRE** → overlay primitive |
| `lib/ui/dialog.tsx` (constate alert/confirm — *not* shadcn) | `lib/ui/dialog.tsx` | keep as state provider |
| tippy.js | `lib/ui/useTippy.tsx` | keep (tooltips only) |
| @popperjs `Popper` (1 consumer `IconifiedSelect`) | `lib/ui/Popper.tsx` | **MERGE** → drawer/select |

Note: there is **no shadcn Dialog/Sheet** anywhere despite the shadcn button/badge + `tw-animate-css` dep.

## Chips / badges / status — 7 → 2
| Impl | File | Verdict |
|---|---|---|
| `Chip` (interactive filter) | `components/Chip.tsx` | **SURVIVE** (interactive) |
| shadcn `badge` (off-palette tokens) | `lib/ui/badge.tsx` | **MERGE** — remap to `status-*` then canonical static badge |
| `PriceChangeBadge` (hardcoded colors) | `components/explore/PriceChangeBadge.tsx` | **MERGE** → status-* |
| `AccountTypeBadge` (returns `null`) | `app/atoms/AccountTypeBadge.tsx` | **RETIRE** (dead) |
| `OpenInExplorerChip` (numeric-shade prop API) | `app/atoms/OpenInExplorerChip.tsx` | **MERGE** → variant props |
| inline hex pills (balance delta, earn `bg-[#DDD4CE]`) | screens | **RETIRE** → badge primitive |

## List rows
| Impl | File | Verdict |
|---|---|---|
| `AssetListItem` (+ `AssetRow` wrapper) | `components/ui/AssetListItem.tsx` | **SURVIVE** (assets) |
| `ActivityRow` (tx, colored icon square, status dot) | `components/ui/ActivityRow.tsx` | **SURVIVE** (transactions) |
| `DetailRow` ↔ `ReviewRow` (overlapping key/value) | `lib/ui/DetailCard.tsx`, `components/review/ReviewRow.tsx` | **MERGE** → one key/value row |

## Also: duplicate primitive families
- **Checkbox ×3** — `components/Checkbox.tsx`, `app/atoms/Checkbox.tsx`, `app/atoms/FormCheckbox.tsx` → **one** token-based.
- **Toggle ×2** — `components/Toggle.tsx` (`PRIMARY_HEX`), `app/atoms/ToggleSwitch.tsx` (`ACCENT_HEX`) → **one**.

## Priority order (for the migration's P2)
1. Amount entry (`InputAmount → AmountInput`, unify validation).
2. Buttons (`Button` sole source; retire `FormSecondaryButton` + ad-hoc; decide shadcn in/out).
3. Overlays (standardize vaul; retire react-modal + `TransactionProgressModal`).
4. Headers (`NavigationHeader → ScreenHeader`; keep `TabHeader`).
5. Rows/cards (`ListItem → CardItem`, `DetailRow ↔ ReviewRow`).
6. Palette hygiene (remap shadcn badge/button tokens; delete dead `AccountTypeBadge`; de-hardcode earn-flow).
