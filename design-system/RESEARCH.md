# Research corpus — Bread Wallet / Crust

Everything the design system is grounded in, with sources. Written down so it survives
conversation boundaries. **Evidence is graded** — the point of this file is to stop
preference and platform requirement being treated as equal weight.

| Tag | Meaning |
|---|---|
| `[SPEC]` | Hard, normative platform/standards requirement. Non-negotiable. |
| `[CONSENSUS]` | Strong expert agreement, authoritative but not empirical. |
| `[EVIDENCE]` | Peer-reviewed / measured study. |
| `[CONTESTED]` | Opinion, folklore, or disputed. Use with judgement, cite as opinion. |

---

# 1. Practitioner & product references

## 1.1 Benji Taylor — the richest methodology source

**Who:** Benji Taylor. Head of Design at **Base (Coinbase)** → CPO at **Aave Labs** → hired by
**X/xAI to lead design (Mar 2026)** ahead of X Money. Designer behind **Family**, widely called
the best-designed crypto wallet. (Family was discontinued Feb 2026 — see the caveat below.)

- Site/portfolio: https://benji.org/
- **Essay — the key source:** https://benji.org/family-values
- X: https://x.com/benjitaylor · Dip (co-founded): https://dip.org
- Press: [CoinDesk on the X hire](https://www.coindesk.com/business/2026/03/25/elon-musk-s-x-hires-crypto-savvy-design-lead-as-x-money-payments-push-inches-closer)

Methodology, all from *Family Values*:

1. **North star: Simplicity, Fluidity, Delight.** "Simplicity ensures accessibility, fluidity
   maintains continuity of experience, and delight fosters meaningful connections." Usable as a
   literal per-screen review rubric. `[CONSENSUS]`
2. **Progressive disclosure over feature-dumping.** "The fundamentals would be at your
   fingertips, but everything else would appear as it became most relevant." `[CONSENSUS]`
3. **The dynamic tray, not full-screen navigation.** Trays "overlay content directly onto the
   current interface," which "maintains a seamless connection between actions" — full-screen
   transitions "displace users from where they just were." → prefer bottom sheets that keep
   context visible. `[CONSENSUS]`
4. **Motion is for clarity, not decoration:**
   - *Directional consistency* — "If you tap on a tab on the left, the transition moves left."
   - *No redundant re-animation* — elements already on screen "should remain consistent."
   - *Deliberate size change* — tray height varies between steps so "the progression … [is]
     unmistakably clear."
5. **Morphing typography.** Animating `Continue` → `Confirm` by keeping the shared "Con"
   "reinforce[s] the user's awareness of their action."
6. **The Delight–Impact Curve — the most transferable idea.** "Delight increases as feature
   usage frequency decreases." Frequent actions get *subtle* enhancements; rare high-stakes ones
   get *big* moments. "Mastering delight is mastering selective emphasis." → **budget animation
   effort inversely to frequency.** `[CONSENSUS]`
7. **Motion as a trust signal.** Glitchy motion makes users doubt "whether the app truly
   understands what I'm trying to do." Matters disproportionately in a wallet.
8. **Context-adaptive theming.** Trays inherit the theme of the flow they're in → components
   read their surrounding context rather than hard-coding colour. (This is the ancestor of our
   `[data-surface]` scopes.)

**Caveat `[CONTESTED]`:** his "craft over launch speed, polish everything equally" is a values
bet, not established practice — and it coincided with Family's discontinuation. Adopt the spirit;
the Delight–Impact Curve is the disciplined version. **Skip** Dip's "interface excellence" — it is
currently branding with no published substance.

## 1.2 Coinbase — the richest *system* source

Coinbase open-sourced **CDS**. https://cds.coinbase.com/getting-started/introduction ·
https://cds.coinbase.com/getting-started/colors

- **Cross-platform parity is the organizing principle** — one React + React Native library,
  "identical source code across platforms where possible." Validates our iOS/Android/extension
  shared-token approach *structurally*, not just visually. `[CONSENSUS]`
- **Semantic colour tokens in 4 categories** — Foreground, Background, Line, Accent. ~40+
  semantic tokens over a **101-step raw ramp** per hue.
- **Semantic tokens auto-swap for light/dark** — same token name, different raw value per theme.
  **Components never reference raw colour.** This is the direct cure for our 191 hardcoded hexes.
- **WCAG 2.1 AA enforced in the system:** 4.5:1 text, 3:1 non-text. `[SPEC]`
- Atomic static CSS compiled at build time, in a dedicated cascade layer.
- **Gap:** CDS is thin publicly on spacing/type scales and has no motion doctrine. For motion,
  Benji's essay is far richer.

## 1.3 Cash App — visual benchmark for big-balance minimalism

Sources: [designyourway on fonts](https://www.designyourway.net/blog/what-font-does-cash-app-use/) ·
[BUCK case study](https://buck.co/work/cash-app-visual-identity)

- Brand grotesque is **CashMarket** (custom, Angus R. Shamal / ARS Type) — high x-height for
  mobile legibility, subtle rounded terminals, tight tracking (~0.01em).
- **In-app it uses platform-native SF Pro / Roboto for body/UI**, reserving the brand face for
  headline/balance moments. → **brand font for the balance, system font for UI.** `[CONSENSUS]`
- **Correction this settled for us:** the big numerals are a **high-x-height grotesque, NOT a
  monospace.** No evidence of a monospaced numeric face. This is why Crust uses Nunito with
  tabular figures for amounts and reserves Geist Mono for addresses/hashes only.
- Craft rationale worth keeping: "rounded corners reduce visual tension, important for an app
  people use for real money," and type should signal "trust without feeling like a bank."

## 1.4 Robinhood — colour restraint

Source: [PORTO ROCHA case study](https://www.portorocha.com/robinhood)

- Explicit rejection of the "rainbow approach" for **black, white and mature neutrals + one
  electric signature** ("Robin Neon"). Stated thesis: *"in a sea of fintech sameness, less is
  more."* → validates our single structural orange. `[CONSENSUS]`
- Type: **Robinhood Phonic** (Schick Toikka) + **Martina Plantijn** serif (Klim) for
  "authority with approachability." **Skip the serif pairing** — it's a wealth-platform signal,
  wrong tone for a lightweight consumer wallet.
- Data treatment deliberately "easy to replicate and scale" — restraint as a *systems* decision.

## 1.5 Phantom — the highest-ROI wallet-specific source

Source: [925studios teardown](https://www.925studios.co/blog/phantom-wallet-design-breakdown)

Doctrine: **"design the fear moments first, absorb complexity instead of exposing it, write in
plain language."** Concretely: human-readable transaction previews instead of raw signature
prompts; multichain is **invisible by default** (the wallet picks the network). `[CONSENSUS]`

## 1.6 Twitter/X — modest signal

Uses **Chirp** (Grilli Type, 2021) — "a balance between American Gothic and European Grotesque,"
slightly compressed with even rhythm, tuned for dense timeline text.
[FontsArena](https://fontsarena.com/blog/what-font-does-twitter-use/). Takeaway is type
*selection*, not methodology.

## 1.7 Adopt vs skip — summary

**Adopt:** semantic token architecture with auto light/dark (Coinbase) · WCAG AA enforced in
tokens · shared cross-platform component model · tray/bottom-sheet over full-screen nav (Benji) ·
motion-for-clarity rules (Benji) · Delight–Impact Curve (Benji) · design the fear moments first +
plain-language previews + hide chains (Phantom) · near-monochrome + one confident accent
(Robinhood) · rounded corners for money apps + brand font for balance / system font for UI (Cash App).

**Skip:** "interface excellence" as a framework (no substance) · "polish everything equally"
(values bet, not practice) · commissioning a custom typeface (right for billion-user brands,
over-investment for v1) · rainbow palettes and heavy 3D/illustration · serif headline pairing.

**Weighting note:** Cash App and Robinhood public material is mostly brand-studio case studies,
which lean promotional — use them as **visual benchmarks**, not documented methodology. Benji is
the methodology source; Coinbase the system source; Phantom the wallet-safety source.

---

# 2. Standards & accessibility `[SPEC]`

Verified against primary sources (W3C).

| Constraint | Value | Source |
|---|---|---|
| Text contrast | **4.5:1**; 3:1 only for large text (≥18pt, or ≥14pt bold ≈ 24px / 18.66px bold) | WCAG SC 1.4.3 (AA) |
| Non-text contrast | **3:1** for UI components, **each state**, focus indicators, meaning-bearing icons | WCAG SC 1.4.11 (AA) |
| Pointer target | **24×24 CSS px** | WCAG 2.2 SC 2.5.8 (AA) |
| Pointer target (enhanced) | 44×44 — **AAA**, platform convention, *not* an AA requirement | WCAG SC 2.5.5 (AAA) |
| Colour alone | Never the sole carrier of information or state | WCAG SC 1.4.1 (Level **A**) |

**Two corrections this produced:**

1. **"Touch targets must be 44×44" is the most-misquoted number in mobile design.** It is AAA.
   The AA floor is 24×24. Keep 44 as convention; do not cite it as a requirement.
2. **Borderless has a limit.** SC 1.4.11 means removing a border obliges replacing it with a
   fill/shadow/spacing that *still identifies the component at 3:1* — and shadow-only separation
   frequently fails. Our no-outline rule is safe on **filled** buttons; it cannot extend to
   low-contrast borderless surfaces.

**Critical gap flagged by the verification pass:** it produced **zero** primary-source claims from
Apple HIG, Material 3, or financial-typography literature. So the **4px spacing grid**, the
**4-value radius scale**, the **tabular-figures rationale**, safe-area/tab-bar conventions and
45–75ch line length are **`[CONTESTED]` convention**, not standard. They may still be good — they
are simply not standards, and must not be presented with WCAG's authority.

## 2.1 Wallet-specific — the strongest evidence tier `[EVIDENCE]`

Peer-reviewed studies of real wallet users (CHI 2021, CHI 2025, SOUPS 2020). **This tier outranks
every colour and font debate in this system** — it is where users actually lose money.

- **Error prevention on the address path.** Address entry/verification is the highest-consequence
  input. Truncation must never hide the discriminating characters.
- **Irreversibility / finality cues before confirm**, in plain language, at the moment of
  confirming — not buried in onboarding.
- **Fee disclosure at confirm time**, not after.
- **Seed phrases must not look like passwords.** Password-like affordances (masking, strength
  meters, autofill) actively mislead. Recovery phrases need their own distinct treatment.
- **Personality recedes as stakes rise.** Seed display, signing, address entry, destructive
  actions and warnings drop the soft treatment. NN/g: *"you cannot impose joy"* — cheerfulness
  where someone may lose money reads as tone-deaf.

## 2.2 Minimalism is a usability argument, not taste `[CONSENSUS]`

Nielsen heuristic **#8** (every irrelevant unit competes with and diminishes the relevant ones)
and Rams **#10** ("less, but better"). Nielsen **#4** (consistency) backs the fixed action-zone
position.

---

# 3. Function before personality

**Aarron Walter, *Designing for Emotion*** — hierarchy of user needs: **Functional → Reliable →
Usable → Pleasurable.** NN/g adopts it and states the operative principle:
**"a product can be delightful only if it is usable."**
https://www.nngroup.com/articles/theory-user-delight/

- **Surface delight** (isolated flourishes) vs **deep delight** (emerges when all needs are met).
- **Negativity bias** — users remember failures over successes; decoration can't offset a broken base.
- **Don Norman's three levels** (visceral/behavioural/reflective) are **simultaneous, not
  sequential** — most summaries get this wrong. Reflective tolerance covers *annoyance*; it does
  **not** cover lost funds. Do not use Norman to justify aesthetics over the signing path.
- **Matt Ström-Awn, "Delight comes last"** — designers reach for delight because of
  **attribute-substitution bias**: visible enjoyable work (colour, animation) substitutes for the
  hard invisible work (IA, usability). *This is the failure mode a personality layer invites.*

### The rule

> **Personality is a layer, never a load-bearing member.** If any element of the aesthetic is the
> *only* thing communicating state, hierarchy or affordance, it has stopped being personality and
> become a defect.

**Falsifiable test:** strip the palette to black-on-white — the interface must remain fully usable
and unambiguous. **Corollary:** run usability tests on a **grayscale build** of send/sign/recovery,
because the aesthetic-usability effect makes users praise visuals while failing the task.

## 3.1 The aesthetic-usability effect cuts against us

[NN/g](https://www.nngroup.com/articles/aesthetic-usability-effect/) — attractive interfaces are
*perceived* as more usable (Kurosu & Kashimura 1995, 252 participants). Two caveats that matter
for a wallet:

- **It masks only *minor* problems.** "Sent to the wrong address" is not minor — the tolerance
  budget beauty buys does not extend to irreversible loss.
- **It corrupts your own usability testing.** Participants praise visuals while failing tasks,
  hiding defects precisely when you need to find them.

---

# 4. Colour — muted Japanese-prestige, done accessibly

## 4.1 The structural move

Decouple **hue identity** from **contrast duty** — the Radix 12-step model
(https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale):
steps 1–2 app backgrounds, 3–5 component backgrounds, 6–8 borders, 9–10 solid fills,
**11–12 the only text steps**.

> **Personality lives in steps 1–9 (grounds, tints, fills). Accessibility lives in 11–12 (inks).**

## 4.2 Ground and neutrals

Kenya Hara / MUJI: white is "emptiness … ready to be filled"; *emptiness* differs from
*simplicity*. → a warm, paper-like ground rather than `#FFFFFF`, which reads sterile on screen.

**Keep neutrals hue-matched to the ground (H 30–40°), never pure grey.** Pure `#888` next to a
warm ground reads as a rendering bug, not restraint.

## 4.3 The hard numbers

**For a muted accent (S 20–40%) on a light warm ground: L ≈ 55% is the ceiling for anything
needing 3:1, and L ≈ 45% for anything needing 4.5:1. Tints live at L 92–95%.
There is no "cute" pastel that survives above L 60% in a load-bearing role.**

**The cutest colours fail first.** Sakura pink `#C58C8C` = **2.62:1** — fails SC 1.4.11. Darkened
to pass it becomes dusty rose. **Resolution: demote pink to tint-only** — surfaces, badge
backgrounds, illustration; never state. Give state duty to teal/green/red, which survive darkening.

**Expect a visible discontinuity between decorative and functional neutrals — that discontinuity
is correct, not a system flaw.**

## 4.4 Premium vs cheap

- **Premium:** generous space (*ma*), one dominant accent, cuteness via *geometry* (soft radii,
  optical letter-spacing) and restraint, warmth from the **ground**.
- **Cheap:** multiple pastels at equal weight, saturation used to signal friendliness, decoration
  where space should be.

*Ma* (間): purposeful negative space as **active presence** — the gap carries expression like
silence between notes. https://en.wikipedia.org/wiki/Ma_(negative_space)

## 4.5 Sourcing caveat `[CONTESTED]`

**Traditional Japanese colour (*wairo*) hexes are NOT canonical** and popular sources disagree
badly (shironeri is given as both `#F5F0E8` and `#FFDDCA`). Treat *wairo* as a source of **hue
relationships and naming, not a spec**. Anchor to https://nipponcolors.com/ then re-derive
lightness for UI. Most "Japanese palette" search results are SEO colour-aggregator content —
weight low.

## 4.6 Colour alone is disqualified — where wallets fail hardest

WCAG 1.4.1 (Level A). ~8–10% of men cannot reliably distinguish red from green, and **a muted
palette makes this worse** because you have deliberately compressed chromatic distance. Always
pair colour with icon/text/shape on: gain/loss, send vs receive, **mainnet vs testnet** (a muted
teal vs muted green distinction is a real loss vector), pending/confirmed/failed, and warnings.

## 4.7 WCAG 2.x under-serves muted palettes

WCAG 2.x is a static luminance ratio; it over-credits dark pairs and under-models saturated
colours on light grounds. APCA models polarity, surround, saturation and weight
(https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html). **Recommendation
`[CONTESTED]`:** ship WCAG 2.1 AA as the compliance gate (what auditors check), tune with APCA as
a perceptual sanity check; where they disagree, the stricter wins on send/sign/recovery.

---

# 5. Units, viewport, Dynamic Type `[SPEC]`

**"Use rem and you get Dynamic Type for free" is FALSE in WKWebView.** The root font-size never
changes in response to iOS Larger Text, and Capacitor does not wire it up. (Ionic ships rem
everywhere and still had to add opt-in Dynamic Font Scaling — direct evidence.)
`-webkit-text-size-adjust` is **not** Dynamic Type; it controls text *inflation* on
non-mobile-optimised pages.

**Android is the inverse:** WebView applies the OS font scale **by default**, but scales **text
only** — rem *spacing* does not grow, and `px` gets multiplied too.

### Unit policy by category

| Category | Unit |
|---|---|
| Font size, line-height (unitless), text-adjacent spacing | `rem` |
| **Layout padding, gutters, radii, hairlines** | **`px`** |
| Inline icons | `em` |
| Touch targets | `max(44px, …)` — a floor, never a scaling value |
| Media queries | `rem` |

No `clamp()` fluid type in a mobile app — pointless across 320–430px and a 1.4.4 hazard unless
min/max are in rem.

**Never set `font-size` on `html`** (no `10px`, no `62.5%`) — beyond breaking third-party rem CSS,
it **structurally forecloses** Dynamic Type.

**Real Dynamic Type recipe:** read the scale natively — `UIFontMetrics.default.scaledValue(for:17)/17`
(iOS), `Configuration.fontScale` (Android) — **clamp ~0.85–1.6**, inject as
`:root{font-size:calc(100% * var(--font-scale,1))}`, re-inject on
`UIContentSizeCategory.didChangeNotification` / `onConfigurationChanged`. **Also call
`setTextZoom(100)` on Android** or you double-scale. Unclamped AX5 (~310%) destroys a 12-word seed
grid.

**Viewport:** `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5,
user-scalable=yes, viewport-fit=cover`. **Do NOT copy the Ionic/Capacitor starter's
`user-scalable=no`** — Safari ignores it, but **WKWebView honours it**
(`ignoresViewportScaleLimits` defaults false), making it a genuine lockout and an AA failure.

**Inputs must compute ≥16px** (`max(16px,1rem)`) or iOS auto-zooms the viewport on focus.

**Extension popup:** ≤800×600 (Chrome & Firefox); set width on `body`, not `:root` (Firefox
ignores `:root`); never apply the `-apple-system-body` trick there (desktop Safari resolves it to
a 13px root).

**Minimums:** Apple body 17pt / floor 11pt; Material `body-large` 16sp / floor 11sp. Never put an
amount, address fragment or fee in the 11–12px range.

---

# 6. Bottom action zone `[SPEC]` + `[CONSENSUS]`

| Property | Value |
|---|---|
| Bottom padding | **`max(16px, env(safe-area-inset-bottom))`** |
| Top padding / gutter | 16px |
| CTA min-height | **52px** (floor 48) |
| CTA width | bar width (screen − 32px) |
| Separator over scrolling content | 24px gradient fade + 1px hairline @8–12% |
| Scroll container padding-bottom | `52 + 16 + max(16, env())` |
| Swipe/drag CTAs | +8px extra clearance |

**`max()` not `+`.** Additive is fine on iOS but gives **64dp of dead space on Android 3-button
nav** (48dp inset). `max()` degrades correctly: 34px iPhone, 24–48px Android, **16px on SE and in
the extension popup**.

**Safe-area insets:** iPhone 17-class **34pt bottom** portrait, **62pt top**; home-button iPhones
**0**; extension popup **0**. `env()` returns 0 without `viewport-fit=cover`.

**Why flush-to-edge is wrong, precisely:** (1) `env()` with no `max()` floor resolves to **0** on
several targets → CTA on the physical edge; (2) it sits in the un-blockable iOS home-gesture
region and Android's **mandatory** bottom gesture zone (`setSystemGestureExclusionRects()` does
not work there) so drags/long-presses get eaten; (3) it is a thumb **stretch** zone.

**Superseded advice `[CONTESTED]`:** the widely-quoted 2017 HIG line "a full-width button aligned
to the bottom of the safe area looks best" is **out of date**. Current HIG says **avoid full-width
buttons** and inset from the screen edges.

**Fabricated stat — do not cite:** the "96% vs 61% thumb-zone tap accuracy" figure circulating in
2025–26 blogs is attributed to NN/g but appears in **no** NN/g publication.

**Thumb-zone evidence is weaker than usually claimed `[CONTESTED]`:** Hoober's field study
(~1,333 observations) gives **49% one-handed**, 36% cradled, 15% two-thumbed, ~75% thumb-driven.
But **NN/g explicitly contradicts** the naive reading: *"A common (but largely incorrect)
rationale for using bottom sheets is that they improve reachability"* — and states the **middle**
of the screen is the most easily tappable area. Bottom-anchoring is defensible convention, not
settled science.

---

# 7. Screen composition

Three zones: **chrome** (fixed top, `safe-top 62px`) → **content** (absorbs all slack) →
**action zone** (pinned bottom).

- **Slack belongs to the content zone, never below it.** Top-anchoring content and pooling the
  remainder above the buttons is the most common way a step screen reads as unfinished.
- **Optical centring** — content sits ~7% above true centre; the eye reads geometric centre as low.
- **Negative space must be composed** (*ma*). A void that fell out of the layout algorithm is not
  *ma*, it's a bug.
- **Measure:** centred body copy caps at **30ch**.
- **Hero illustration:** 30–38% of screen width (≈120–150px at 402pt). Undersized heroes are why
  surrounding space reads as empty.

**Machine-checkable:** for a screen with a pinned action zone, the slack above the content block
and below it should be roughly balanced. Large asymmetry (>55% skew) = top-anchored = defect.
*(A naive "largest gap" metric does NOT work — it flags short screens with pinned CTAs, which are
correct.)*

## 6.9 Derive the spec from the shipped state machine, never invent it `[SPEC]`

The design system is the spec, so a mock that contradicts the product is worse than a missing
mock — anyone building from it regresses working behaviour. This happened here:

| I had drawn | The app actually ships |
|---|---|
| a **7-step** progress bar, numbered inconsistently | `totalSteps = protectionChoiceSkipped ? 3 : 4`, driven by a `STEP_TO_PROGRESS` map |
| no seed **verification** | `VerifySeedPhrase.tsx`, asking first + last word |
| no passcode **mismatch** state | `passcodesDoNotMatch` in red, replacing the helper line |
| no **forgot passcode** | `onForgotPasswordClick` in `Unlock.tsx` |
| no **import** path | `import-from-seed` → `import-select-recovery-method` |
| no **create-password** fallback | reached when `checkHardwareSecurityAvailable()` is false |
| a biometric shortcut on passcode-confirm | **no bottom action at all** (I had copied Figma over the app) |

**Rules that follow:**
1. **Read the router/state machine first.** Step counts, ordering and branch conditions come from
   code (`STEP_TO_PROGRESS`, `totalSteps`), not from counting screenshots.
2. **A detour must not move the progress bar.** An explainer opened off step 3 stays 3/N.
   A bar that reports a different step for a modal is lying, and a lying bar is worse than none.
3. **Enumerate the enum.** Diff the `OnboardingStep` enum against the screens drawn; anything in
   the enum with no screen is a coverage gap, including error and loading states.
4. **When Figma and the implementation disagree, say so — do not silently pick.** Flag it as a
   divergence for the designer. Copying Figma over shipped behaviour is how a spec starts
   describing a product that does not exist.

## 7.0 Audit icons, not just text `[SPEC]`

SC 1.4.11 requires **3:1 for meaningful non-text elements**, but a text-only contrast pass
never sees them. A contrast audit that walks text nodes will report a screen "clean" while an
icon on it is literally invisible. **Measure rendered icon pixels too** (rasterise to a canvas,
take the mean colour of opaque pixels, compare against the composited background).

**The `<img>` + `currentColor` trap.** An `<img>` has **no CSS context**, so an SVG authored with
`fill="currentColor"` renders **black** no matter what `color` the surrounding page sets — it
cannot inherit. On a dark surface it disappears entirely. Same outcome for a baked dark hex
(`#484848`) wordmark. Fixes, in order of preference: inline the SVG, use `mask-image` with
`background-color: currentColor`, or — for monochrome marks only — `filter: invert(1)` in dark.
**Never invert brand-coloured marks or multi-colour illustrations**; that corrupts the brand.

**Exemptions when auditing** (WCAG 1.4.11 carve-outs): brand logotypes and purely decorative
graphics. A mean-colour ratio is also meaningless for a multi-tone illustration — exclude those
rather than "fixing" them.

## 7.1 Vertical zoning & keypad placement — the graded verdict

A dedicated verification pass (10 findings, adversarial 3-vote) settled this. **It demolished the
usual justification for "controls belong at the bottom."** Read the tags carefully.

### Hard specs `[SPEC]`

1. **Touch targets: 44×44pt (iOS) / 48×48dp (Android) is the *tappable-region* floor.**
   Nuance most people get wrong: Apple's Accessibility page lists 44×44pt as the *default* control
   size and 28×28pt as the *minimum* — but the Buttons page still requires "a hit region of at
   least 44×44 pt." So **28pt is the smallest permissible *visual frame*, never a tap target.**
   Apple also adds ~12pt padding around bezelled elements, ~24pt around bezel-less.
2. **WCAG 2.2 SC 2.5.8 implies a 24px centre-to-centre pitch floor** — the 24px-circle rule is
   geometrically equivalent to 24px minimum pitch between undersized targets. This is a *legal
   floor only*; for a keypad the 44/48 platform guidance is far stricter and clears it automatically.
3. **Apple's "avoid controls at the bottom of a window" is macOS-scoped** — the stated mechanism is
   users dragging windows below the screen edge. It is **not** iOS guidance and does **not** conflict
   with bottom-anchored iOS controls. iOS's only edge rule is the orthogonal *"avoid full-width buttons."*
4. **Material 3 normatively places bottom chrome at the bottom** — the navigation bar "should always
   be placed at the bottom of the product and span the full length of the window" (compact <600dp
   and medium 600–839dp only); the **docked toolbar** (M3's replacement for the deprecated bottom app
   bar) is bottom-only and full-width. **A docked toolbar and a bottom nav bar must never co-exist.**

### The folklore correction `[CONTESTED]` — this corrects *me*

5. **Apple's HIG contains NO thumb-zone, reachability, one-handed-reach, or "interactive controls
   belong at the bottom" guidance.** Its stated rationale for control sizing/spacing is
   dexterity/mobility and mis-tap avoidance — **not reach**. Its *only* explicit vertical-importance
   rule points the **other way**: put the most important items near the **top** and leading edge,
   justified by reading order.
6. **Material 3's ergonomic rationale is one unsourced adjective.** The nav bar is "positioned at
   the bottom of windows for convenient access" — and a full-page grep for
   `thumb|reach|ergonom|research|study|one-hand` returns **zero hits**, no citations, no linked
   studies. **Cite M3 as platform convention, never as empirical support for a thumb-zone claim.**

> **Therefore: bottom-anchor a keypad because it is platform convention plus a plausible ergonomic
> inference — NOT because a spec or a study says so. Tag it `[CONSENSUS]`, never `[SPEC]`.**
> My earlier "iOS does it for thumb reach" justification was partly folklore.

### What the grip evidence actually says `[CONSENSUS]`

7. **Hoober 2013 (UXmatters)** — 1,333 observations of people using phones in public over two months
   ending 8 Jan 2013; 780 involved touching the screen. Of those 780: **49% one-handed, 36% cradled
   (two hands, one touching), 15% two-handed.** Within cradling, 72% used a thumb.
8. **Rigid thumb-zone maps (green/yellow/red overlays) are not supported by their own primary
   source.** Hoober reports grip "is not a static state. Users change the way they're holding their
   phone very often — sometimes every few seconds," and **explicitly declines** to endorse banishing
   low-priority or destructive functions to the hard-to-reach upper-left. His prescription is
   *procedural*: test on a physical device. No demographics, no tablets, and it predates the
   4″→6.9″ expansion.

### Do not cite `[UNVERIFIED]`

9. Large parts of the standard mobile-ergonomics canon produced **no surviving evidence**:
   - The **"96% vs 61% tap accuracy"** figure — no primary source located anywhere.
   - **NN/g's "the middle of the screen is most tappable"** — *this also fails verification.* I cited
     it earlier as a counterweight; it is not established either. Both directions of the
     bottom-vs-middle argument are weaker than they are usually presented.
   - **Wroblewski's and Hurff's thumb-zone maps** — folklore until independently sourced.

### Derived geometry `[DERIVED — low confidence, not measured]`

10. For a 6-digit passcode keypad on **402×874pt**, computed from the confirmed specs (not measured
    from native implementations): 3×4 grid, **circular keys 76pt diameter**, column centres at
    x = 100.5 / 201 / 301.5 (pitch 100.5pt, ~24.5pt clear gap between key edges ≈ 4× the WCAG pitch
    floor). **No confirmed claim supplied real native keypad metrics** — treat as a starting point,
    not a spec. *Our implementation uses 92pt-tall rectangular keys, which clears every floor above.*

### The reconciled composition rule

- **Centre** the content block on step screens with **no input surface** (welcome, explainer,
  success, illustration+heading steps).
- **Bottom-anchor the whole input cluster** (label → dots → keypad) on any screen whose primary
  interaction is a **keypad or keyboard**. Move the cluster as a unit — bottom-anchoring the input
  alone just relocates the void.
- Keypad should occupy **~45–48% of screen height**; below ~30% it floats and the surrounding space
  reads as dead.

---

# 8. Reference index

Benji Taylor: https://benji.org/family-values ·
Coinbase CDS: https://cds.coinbase.com/getting-started/introduction ·
Phantom teardown: https://www.925studios.co/blog/phantom-wallet-design-breakdown ·
Robinhood: https://www.portorocha.com/robinhood ·
Cash App: https://buck.co/work/cash-app-visual-identity ·
Radix Colors: https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale ·
NN/g delight: https://www.nngroup.com/articles/theory-user-delight/ ·
NN/g aesthetic-usability: https://www.nngroup.com/articles/aesthetic-usability-effect/ ·
Ström-Awn: https://mattstromawn.com/writing/delight-comes-last/ ·
WebAIM contrast: https://webaim.org/articles/contrast/ ·
W3C use of colour: https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html ·
APCA: https://git.apcacontrast.com/documentation/APCA_in_a_Nutshell.html ·
Ionic Dynamic Font Scaling: https://ionicframework.com/docs/layout/dynamic-font-scaling ·
Comeau on units: https://www.joshwcomeau.com/css/surprising-truth-about-pixels-and-accessibility/ ·
Roselli on base font size: https://adrianroselli.com/2024/03/the-ultimate-ideal-bestest-base-font-size-that-everyone-is-keeping-a-secret-especially-chet.html ·
Capacitor safe areas: https://capawesome.io/blog/capacitor-edge-to-edge-and-safe-areas-guide/ ·
Hoober: https://alistapart.com/article/how-we-hold-our-gadgets/ ·
Hara: https://www.designboom.com/design/kenya-hara-designing-design/

---

## 8. Bottom navigation — surveyed 2026-07-26

### 8.1 What is actually specified `[SPEC]`

**Apple HIG, Tab bars** (Liquid Glass guidance added 2025-07-28) —
https://developer.apple.com/design/human-interface-guidelines/tab-bars
- "Use a tab bar to support navigation, **not to provide actions**."
- "**Include tab labels** to help with navigation... Use single words whenever possible."
- "**Prefer filled symbols or icons** for consistency with the platform."
- "**Don't disable or hide tab bar buttons**" — doing so "makes your app's interface appear unstable."
- iOS 26: the bar "floats above content", a floating inset capsule sized to its contents,
  inset ~21pt, labels 11pt, collapsing on scroll. APIs `tabBarMinimizeBehavior`,
  `tabViewBottomAccessory`.

**Material 3, Navigation bar** — https://m3.material.io/components/navigation-bar/guidelines
- "three to five destinations"; "should ... **span the full length of the window**."
- "**All navigation items require a label text**"; explicit *Don't*: "Don't remove the labels."
- "Don't use a navigation bar for fewer than three destinations."
- Filled icon active / outlined inactive; icons need **3:1** against the container.
- FAB "**right-aligned above** the navigation bar"; "Don't cover the navigation bar with a FAB."
- Android: nav bar 80dp (M3 Expressive 64dp), active indicator 56x32, icon 24dp.
- `LABEL_VISIBILITY_AUTO` resolves to **always-labelled at <=3 items**.

**WCAG** — SC 2.5.8 (AA) 24x24; SC 2.5.5 (AAA) 44x44; 1.4.3 4.5:1 text; 1.4.11 3:1 non-text.

### 8.2 Three genuine conflicts — do not average them `[CONTESTED]`

1. **Shape: iOS 26 vs Material 3 are opposed.** iOS 26 = floating inset capsule. M3 =
   full-width edge-to-edge, and **M3 has no floating navigation-bar component at all**
   (M3 Expressive added floating *toolbars*, not nav bars). A floating capsule on Android
   is therefore off-spec for Material 3 — a legitimate brand choice, but tag it
   `[CONSENSUS]`, never `[SPEC]`.
2. **Does the iOS 26 bar show labels?** MacStories says glyphs "rather than text labels";
   learnui.design says 11pt labels. The **HIG is normative and says label them**. MacStories
   is describing the minimized state / visual emphasis.
3. **M3's item-count floor.** We have exactly three — *at* the floor. Fine now; revisit if a
   tab is removed.

### 8.3 Claims to stop repeating `[UNVERIFIED]`

- **"88% task success with labels vs 60% without"** (and "34% for app-unique icons"),
  attributed to a UserTesting study across dozens of blogs. **No primary source reachable.**
  Do not put this in a spec.
- **NN/g's "Icon Usability"** asserts labels should always be visible but contains **no study
  sizes or statistics** — `[CONSENSUS]`, not `[EVIDENCE]`.
- **"3–5 items = 20–30% faster navigation"** — SEO content with fabricated-looking citations.
- **Baymard figures** on menus/headers circulating in blogs are not traceable to Baymard,
  which is e-commerce *web* checkout research.
- Thumb-zone heatmaps: already graded folklore in 7.1. Leave them there.

**Honest summary of the evidence tier: there is no good empirical study of bottom-nav labels
vs no-labels.** The labels decision rests on two platform specs agreeing, not on data --
**and a survey of shipping apps contradicts the spec.** See 8.8. An earlier draft of this
section called labels "not close"; that was wrong, or at least overstated. It was written
from platform guidance before the app survey landed.

### 8.4 Practitioner input `[CONSENSUS]`

- **Benji Taylor (Family)** — after confirmation "a spinner moves into the bottom navigation
  to indicate where the user can now find their pending transaction on the activity tab"
  (https://benji.org/family-values). **Adopted**: our `showDot` becomes a pending-state
  destination, not just an alert.
- **Ryan Wesley** on the iOS 26 search tab: it "fails to afford itself as a tab"; "the line
  between navigation and action is blurring — and with it, the predictability that makes iOS
  feel coherent" (https://ryanwesley.com/ios-26-tab-bar-beef/).
- **Dmytro Hanin** — avoid a "glass sandwich" of accessory + tab bar + floating buttons, and
  avoid "actions disguised as tabs ('+', 'Scan', 'Pay')".
- **Phantom** moved primary nav to *top* tabs with a lower-**right** composite money action.
  **Cash App**'s centre item is a *destination tab*, not a FAB.
- **Coinbase CDS publishes only a top NavigationBar; Robinhood's rebrand case study has no
  navigation detail.** Nobody publishes a mobile bottom tab bar in a public design system —
  which is why this section leans on platform spec rather than peer design systems.

### 8.5 Library verdict — none `[EVIDENCE]`

Radix docs: "Tabs should not be used for page navigation." shadcn has no bottom-nav block
(requests #5730 and #8847 unanswered). Base UI / Headless UI Tabs are tabpanel widgets.
Ionic's `IonTabBar` can run standalone but `@ionic/core` is ~20MB unpacked and
`@ionic/react-router` still peer-deps React Router 5. `@react-navigation/bottom-tabs` needs
the RN bridge and cannot run in a WebView.

**Decisive constraint:** the mobile nav is redrawn as a native overlay (`UIWindow` /
Android View), so the deliverable is a **portable spec** — geometry plus spring constants —
not a DOM component. (Note: those native files are not in this worktree; CLAUDE.md documents
them, so they live on another branch. The constraint is forward-looking.)

**Avoid framer-motion `layoutId` here.** With three equal-width items the problem is a single
translation. `layoutId` on a `position: fixed` bar needs `layoutRoot` or the pill jumps once
content scrolls; it corrects `border-radius` only when set via `style`, not a utility class;
and DOM projection has no UIKit/Android analogue. Use one persistent indicator translated by
index with `springs.pill` (320/30, already documented as "footer tabbar pill"):
`SpringForce().setStiffness(320f).setDampingRatio(0.839f)` /
`.spring(response: 0.351, dampingFraction: 0.839)`.

### 8.6 Codebase defects confirmed while researching this

All verified directly, not taken on the agent's word:
- `BottomNav.tsx:34` fires `shadow-[0_4px_12px...,0_12px_40px...]` in **both** themes,
  contradicting SPEC.md's "dark uses surface-step + rule contrast, not shadow."
- `BottomNav.tsx:59` switches `font-semibold -> font-bold` on active, reflowing the label.
- Active accent `#E77537` on `#FBFBFB` = **2.90:1** — fails 1.4.3 and 1.4.11, light-theme only.
- `SegmentedActionBar.tsx:49-57` uses `role="tablist"` / `role="tab"` / `aria-selected` while
  `TabLayout.tsx:151` calls `navigate(to)` — it changes routes, so those roles misreport to
  assistive tech. (`BottomNav`'s `aria-current="page"` is correct.) It also uses
  `duration: 0.24, easeInOut` instead of `springs.pill`, against SPEC.md's springs-first rule.
- `springs.ts:14` comments `standard` as "response 0.4 / 0.85", but `k=322, c=32` back-solves
  to **response 0.350 / zeta 0.891**. Harmless until someone ports it to Swift.

### 8.7 The project skill has nothing on navigation

`ui-ux-pro-max --domain ux "bottom navigation tab bar mobile"` returns back-button behaviour,
sticky-nav padding and mobile keyboards; `--domain product` returns unrelated archetypes.
**There are no navigation rules in that skill to comply with** — worth knowing before anyone
cites it as authority.

### 8.8 What shipping apps ACTUALLY do — surveyed 2026-07-26

Method note worth keeping: **modern App Store / Play galleries almost always crop the tab bar
out** (confirmed for Family, Coinbase, Robinhood, Cash App, Revolut). What worked instead was
frame-grabbing videos from designers' own essays, reading open-source repos, accessibility
reviews, and official press renders.

| App | Tabs | Labels | Shape | Active state | Centre FAB |
|---|---|---|---|---|---|
| **Family** | 3 | **none** | floating inset capsule | solid black filled icon | no — separate black `+` bottom-**right** |
| **Rainbow** | 4 | **none** | floating glass capsule, 52pt, r=26 | translucent accent pill slides behind icon (spring) | no |
| **Robinhood** | 5 | **none** | full-width, flush, opaque | white filled icon | no |
| **Monzo** | 4 | always | floating capsule (iOS) / full-width (Android) | grey pill **and** blue tint | no |
| **Wise** | 4 | always | floating capsule | **pill only** — icons never recolour | no |
| **Cash App** | 5 | always (Money's label **is the balance**) | full-width | not sourced | no |
| **MetaMask** | 5 | always | full-width, 54pt | filled-icon swap only | **yes**, 56pt, `+` rotates 45° |
| **Venmo** | 5 | always | full-width opaque | colour only | **yes** |
| **Phantom** | 4 at the **top** | text | bottom holds only Search | — | `+` bottom-right |
| **Coinbase** | 4-5 | labels | full-width | not sourced | no (middle slot = dapp browser) |

**The labels conflict is real and unresolved.** Platform spec (HIG + M3) says label every item.
But **the three wallets this team most admires -- Family, Rainbow, Robinhood -- all ship
icon-only.** Family was verified by frame-grabbing the videos in Benji Taylor's own essay
(https://benji.org/media/family-values/34.mp4 at ~96%): left grey clock outline, centre solid
black wallet glyph, right grey compass outline, evenly spaced, no labels. Rainbow is verifiable
from source (`src/navigation/SwipeNavigator.tsx`, `src/components/tab-bar/dimensions.ts`).

Our position: **keep labels**, but on a narrower argument than "the spec says so" -- it is our
specific label set that needs them. Of *Home / Explore / Activity*, only Home has a
conventional glyph; "Explore" is exactly the ambiguous case. An icon-only variant is built in
Components so the trade-off is visible rather than asserted. If the tab set ever became
Wallet / Activity / Settings, icon-only would be defensible.

**Two patterns worth stealing, both verified:**

1. **Family's dynamic tray.** The same floating capsule slot is reused as the **primary action
   button** mid-flow -- `11.mp4` and `34.mp4` show it rendering "Continue" and a Face-ID
   confirm as a full-width pill in the tab bar's exact position. Taylor: components "housed
   within trays that can effortlessly expand, contract, and adapt in response to a user's
   actions... Trays can appear on the fly and function as a condensed version of the app."
   This is a bigger idea than a nav restyle and interacts with our one-action-zone rule.
   **Deferred, not rejected** -- it would mean the nav and the action zone become one surface.
2. **Rainbow's Activity tab becomes a spinner with a pending-transaction count**
   (`src/components/tab-bar/ActivityTabIcon.tsx`), the same idea as Family's migrating
   spinner. Corroborates the badge treatment we adopted -- and suggests the next step is a
   count, not just a dot.

**Wise's pill-only active state deserves a second look.** Because its icons never recolour,
the ink can sit at full contrast in both themes -- which would have sidestepped the problem
that forced our wash/well flip entirely. Built as alternate D.

**Honest gaps in this survey:** Revolut's entire visual treatment is unverified (it crops the
bar from all ~25 store screenshots; a 5-tab naming is confirmed from four separate help
articles, but shape/blur/active state are not). Coinbase's current bar is not first-party
sourced. Cash App's and Coinbase's chrome (shape, blur, active state) is unsourced even where
structure is solid. Robinhood's observed capture is ~early-2023 and one 2026 review disagrees
on tab naming. Family's tab *names* beyond "activity tab" are read from glyphs. Phantom, Gate
and Cash App help pages 403 or sign-in-wall on fetch, so those quotes come from the search
index rather than a first-hand read.

### 8.9 Slack — a shipped Liquid Glass nav, and first-party evidence on labels

Slack shipped a **Liquid Glass redesign for iOS 26 on 18 Nov 2025**
(https://slack.com/blog/news/redesigning-slack-ios26). This is the most useful data point in
the whole survey because it is a mature product doing exactly what we just built, and because
Slack has now shipped *both* highlight treatments, which maps onto our own two options.

**Two current answers, split by platform** — any claim that "Slack's nav looks like X" is wrong
without saying which:

| | 2023 design (Android, pre-iOS-26 iPhone) | iOS 26 design |
|---|---|---|
| Container | full-width, opaque `#FFFFFF`, 1px `#F2F2F2` hairline | **floating translucent capsule** + a detached circular Search button |
| Active state | **neutral ink `#1D1C1D`**, outlined→filled icon, heavier label. **No pill, no brand colour in the nav at all** | **capsule highlight `#EEEEEE`–`#F0F0F0` + filled icon + purple tint `#762B7D`** |
| Content | bar divides it | runs *under* the bar — "Extended content to reach the top and bottom vertical edges" |

**The tint is a tuned step of the brand ramp, not the brand hex.** Measured `#762B7D`, while the
same render shows header `#5D1E61` and the brand Aubergine `#611F69`. That is precisely the
principle behind our `--accent-ink`: don't put the raw brand colour on the nav, put a step
tuned to the surface. Ours moves darker because our orange is light-on-white; Slack's moves
lighter because their purple is dark-on-white. Same move, opposite direction.

**Theme-independence, proven for the 2023 design:** across six workspace themes the bar stays
white and the active ink measures exactly `#1D1C1D` every time — only the *badge dots* take the
theme accent. Whether the iOS 26 purple is theme-derived is unverified (one sample).

**On labels — this is the strongest evidence we have, and it is first-party:**

> "we even experimented with label-less tabs. But we soon realized it came at the expense of
> two of Slack's non-negotiables: accessibility and comprehension."
> — https://slack.design/articles/re-designing-slack-ios26 *(Re-designing Slack on Mobile, Oct 2023)*

That is a named company reporting that they *tried* icon-only and reverted for comprehension.
It outranks both the platform spec and the Family/Rainbow/Robinhood counter-observation in
8.8, because it is an outcome rather than a preference. **The labels decision is now settled on
evidence, not on "the spec says so"** — and my earlier "not close" was right for the wrong
reason.

**Corroborations for things we already built:**
- Badges are **a dot at the icon's top-right, never a number**; numeric counts live in list
  rows. Matches our `.nbadge`.
- Content running under the bar is what makes the glass read — same conclusion we reached when
  the bar over empty space looked like a grey panel.
- The bar is **absent entirely on the search screen** (full-screen search + keyboard). Worth
  adopting: a full-screen input surface should drop the nav, not float it over the keyboard.

**One correction to our `.mini` variant.** `tabBarMinimizeBehavior` is Apple-provided, but
Slack appears **not** to use it: diffing Slack's own scrolled and unscrolled screenshots, the
active-tab highlight is byte-identical at the same coordinates, so their bar does not shrink on
scroll. So minimize-on-scroll is available, not idiomatic-by-default — ours stays demoed and
off, which is the right call.

**Deliberately not adopted: the detached circular Search button.** Slack put Search outside the
capsule as its own floating circle. That is the exact pattern Ryan Wesley criticised in 8.4 —
it "fails to afford itself as a tab" and blurs navigation with action. We have no fifth
destination, so there is nothing to gain and a known affordance cost.

**Unverified, do not let these get filled in:** any height from a spec (only a ~52pt derivation
from a marketing render), any animation duration or curve for the tab switch, the dark-mode
appearance of the bar or highlight on either platform, and whether the iOS 26 purple is
theme-derived. Slack's release notes never mention the nav change at all.

### 8.10 Instagram — two variants, and the tint is a choice not a requirement

Instagram runs **two nav designs concurrently** as of late July 2026:

| | A — flat bar (dominant) | B — Liquid Glass (iOS 26, still testing) |
|---|---|---|
| Container | full-width, edge-to-edge, opaque, content clipped at its top edge | **floating inset translucent capsule**, content visible through it |
| Active highlight | **filled glyph only — no pill, no underline, no dot** | **filled glyph + a neutral grey translucent capsule behind it** |
| Colour | pure black on white / pure white on near-black | same, neutral |

The screenshot Brian supplied is **variant B** — floating translucent capsule with a light pill
behind a filled Home glyph. That is why "the Liquid Glass navbar from Apple" was the right way
to describe what he wanted.

**The decisive finding: Instagram's Liquid Glass nav uses NO brand colour at all.** Confirmed
across four independent images, two of them Meta-supplied press assets. Active is neutral
high-contrast ink in both themes; contrast and glyph weight carry the state.

**So among shipping Liquid Glass adopters, the tint is a choice, not a property of the
material:** Slack tints its active glyph (`#762B7D`, 8.9), Instagram does not. Both ship the
same material. Our own measurement favours neutral — `--ink` on a neutral pill is 9.01:1 light
/ 12.63:1 dark, versus `--accent-ink` which passes with less headroom. Apple's HIG describes
"a colored glyph plus a highlighted shape", so the tinted version is HIG-faithful; the neutral
version is reference-faithful and measures better. **Both are built. This is a live decision,
not a settled one.**

**The gap that now matters most.** *Both* Instagram variants and Slack's 2023 bar use an
**outlined → filled glyph swap** as the primary active signal. Our icon set ships **one weight
per glyph**, so the single most-used active-state mechanism across every reference app is
unavailable to us. That elevates authoring filled variants of the three nav glyphs from a nice
-to-have to the top asset task — currently the pill is doing work the icon should share.

**Motion, honestly.** Instagram's *content* transition is a **horizontal paged slide that
tracks the drag** — verified by extracting frames from the video on Mosseri's own Threads post
(a frame at ~8.5s shows the feed sliding out left, Reels entering right, a hard seam, and a
synthetic touch dot mid-drag). It is not a crossfade. **Tap-driven icon animation, durations
and easing: not found anywhere.** No first-party motion spec exists for Instagram or Slack.
Our liquid squish is therefore derived from the material's behaviour and `springs.pill`, not
copied — worth stating plainly rather than implying provenance it does not have.

**Swiping between tabs is a first-party Instagram feature** (Mosseri, 2025-10-10: "you can now
swipe between tabs"). That corroborates our own `HomeSwipeContainer`, which already pages
between home panes — the pattern is validated, not a local invention.

**A trap worth recording.** Instagram's own in-app promo card for the redesign renders an
*illustration* of the nav as a white pill on a purple→magenta gradient field with a
gradient-stroked paper plane. That is marketing art, not app chrome. A Figma kit or blog
screenshot of that card would wrongly suggest the nav uses brand colour.

**Badges:** small solid red dot, no numeral, lower-right of the glyph. Third corroboration of
dot-not-number, after Slack and Rainbow.

**Not verifiable:** no first-party design spec exists at all — Instagram's Help Center article
on navigation is now an empty AI-chat shell, and there is no Newsroom or Meta design-blog post.
Bar height is unpublished (icon ≈22pt and ≈79pt item pitch are measurements off a real iPhone
screenshot). Exact dark hex is compression-contaminated. Hide-on-scroll is unestablished.
Sources conflict on whether Liquid Glass has rolled out globally or is still in test.
