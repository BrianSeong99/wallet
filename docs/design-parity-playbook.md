# Design-parity playbook — keeping the app and the Crust design system in sync

How to check that what ships matches `design-system/`, and what to do when it doesn't.

The design system is **read-only** from the app's side. If the system is wrong, that is a
finding to raise, not a file to edit.

## The core problem this solves

The app drifted from its design system three times before, and each time the drift was
invisible to the thing that should have caught it. So parity is checked **three ways**,
because each one is blind to what the others see:

| Method | Sees | Blind to |
|---|---|---|
| **Static audit** (`scripts/design-parity-audit.mjs`) | every source file, including code that never renders | whether it *looks* right; anything computed at runtime |
| **Runtime harness** (`yarn test:design-parity`) | real computed styles, real geometry, real alignment | screens it can't navigate to; rules never exercised |
| **Your eyes** on the side-by-side report | everything the other two structurally cannot express | nothing — but doesn't scale and isn't repeatable |

**A clean run of the first two means "no measurable divergence", never "matches the design".**
That is the same posture `SPEC.md` takes about its own harness, and it was earned: the
design-system session shipped a screen where every numeric check passed while the account
cards had merged into one black block.

## The invariants

These are the things that must be true. Each is checked by the audit unless noted.

### Colour
1. No raw hex in `src/screens/` or `src/components/`. Colour comes from tokens.
2. Every colour token flips with the theme. A value that is identical in light and dark is
   a bug unless it is deliberately fixed-palette (`pure-white`, brand marks).
3. Role separation holds: `--accent` is a **fill**, `--accent-ink` is **text**, `--on-accent`
   is a label on the fill and is only valid at `--t-cta` size, `--on-accent-sm` is for small
   labels on the fill. Never white small text on the accent — it is 2.9:1.
4. Status tokens are the **ink** role. A solid pill is `background: var(--status); color: var(--paper)`
   — `--paper`, not white, because the page colour inverts per theme.

### Type
5. Every font size is a step on the ramp: **11 / 12 / 13 / 14 / 15 / 16 / 18 / 19 / 20 / 26 / 28 / 32 / 72**.
   (Extended from the system's nine — see "Recorded divergences".)
6. The primary CTA label is `--t-cta` (19px) / 700 **and may never be smaller** while the
   label is white. This is an accessibility constraint, not styling: white on the brand
   orange is exactly 3.00:1, conforming only as large text. Margin is zero.
7. Nothing below **11px** (the Apple floor).
8. Addresses, hashes and ids use `--mono` (Geist Mono). Nothing else does.
9. Numbers use tabular + lining figures (`tnum`/`lnum`) — a figure setting, not a font.

### Shape, spacing, elevation
10. Radii collapse to **8 / 12 / 16 / full**. No arbitrary `rounded-[…]`.
11. The page gutter is **24px** and is the only gutter.
12. Vertical rhythm lives on the **container** (`--stack-tight` 8 / `--stack` 12 /
    `--stack-loose` 16), never as outer margin on a component. A component needing a
    different gap expresses it as `calc(tier - var(--stack))` so the tier stays visible.
13. Elevation is flat / `shadow-e1` / `shadow-e2`. Dark mode uses surface-step and rule
    contrast, not shadow.

### Interaction and layout *(runtime harness — the audit cannot see these)*
14. The primary action sits in a fixed bottom action zone at the **same Y on every screen**,
    gutter 24, `padding-bottom: max(16px, env(safe-area-inset-bottom))`, CTA min-height 52px.
    The `max()` matters: bare `env()` resolves to **0** on SE and in the extension popup.
15. Secondary/ghost sits **beneath** the primary. On an irreversible action an accidental
    tap at the bottom edge must hit Cancel, never "send funds permanently".
16. Every interactive element is **≥44pt** (SC 2.5.5). This is an absolute px floor — in
    `rem` it drops below 44 when a user *shrinks* text.
17. Nothing interactive within `max(16px, safe-bottom)` of the bottom edge.
18. No outlined tap targets. Filled or ghost only; borders are structural separation.

### Icons
19. Icons follow the ink via `currentColor`, **except** the four action glyphs
    (`send-new`, `receive-new`, `convert`, `earn`), which keep their own hue — that is what
    makes an Activity row and its action-bar glyph read as the same thing.
20. Those four use the **darkened** `--act-*` values in light. The shipped pastels measure
    2.37–2.42:1 on the inactive chip, and a collapsed segment is icon-only with no label to
    fall back on, so SC 1.4.11's 3:1 genuinely applies.

## The loop

```bash
node scripts/design-parity-audit.mjs      # static — fast, run constantly
yarn test:design-parity                   # runtime — renders + measures, writes the report
open test-results/design-parity/report.html   # then LOOK at it, both themes
```

For iOS, the runtime harness targets the extension (the only real browser target — see the
header comment in `playwright/design-parity/parity.spec.ts` for why faking Capacitor was
rejected). Check the native build with the simulator and diff the screenshots:

```bash
yarn mobile:ios:run
xcrun simctl io booted screenshot /tmp/after.png
```

### When the audit reports OPEN

In order of preference:

1. **Fix the app.** Default assumption — the system is the spec.
2. **Record a deliberate divergence.** Add it to `KNOWN_DIVERGENCES` in the audit script
   *with the reason*. An entry without a reason is just a suppressed failure. Brand marks
   and the QR background are legitimate examples: they are identity and function, not
   surfaces.
3. **Raise it against the design system.** If the app is right and the system is wrong,
   say so — do not edit `design-system/`. Several findings have already gone this way (the
   type ramp, `color-mix`, the `--t-caption`/`--text-caption` contradiction).

### The rule for tests

If a change breaks a test that asserts a class or colour, update the **selector** in the
same commit and keep the assertion's meaning. Never weaken or delete it. A test asserting
`bg-[#C7C7CC]` is asserting "the filled state" — it should keep asserting that, against the
new token.

## Traps that have already cost time

- **Not every `#hex` is a colour.** `#217`, `#364`, `#253` are PR references in comments.
  A blind `sed` corrupts them. Inspect matches in context.
- **Not every colour is drift.** Third-party brand marks and QR contrast must stay fixed.
- **A token can be declared and still not reach the element.** Parent-scoped rules
  (`.parent .thing`) look like components and silently do nothing when reused. Two consumers
  make it a component.
- **`text-balance` is not a font size.** Tailwind v4 ships it as a `text-wrap` utility, and
  a `balance` *colour* token in the same namespace wins over a `balance` font size. The step
  is `text-numeric-hero`.
- **`color-mix()` is unusable** under the current `.browserslistrc` (Safari ≥14; it needs
  16.4+). Use `rgb(var(--accent-rgb) / <alpha>)`.
- **Freeze motion before measuring.** `getComputedStyle` returns the *interpolated* value
  mid-transition. The design system's own harness once read a 15.7:1 pair as 2.54:1 this way
  and it survived three investigations.
- **Switch theme in a separate `evaluate()` call** from the measurement, or you read stale
  computed styles.
- **The safe-area floor is per frame.** An iPhone reserves 34pt; the extension popup
  reserves nothing. A global 34 produces false positives on every extension screen.

## Excluded surfaces

Both are carved out of the audit's app-surface checks, with the reason recorded in the
script rather than left implicit:

- `src/screens/send-flow/` — under review in a separate session.
- `src/screens/earn-flow/` — a P3 outlier, rebuilt wholesale; tokenising it first is work
  thrown away. It is also flag-off (`isEarnEnabled() === false`), so it is invisible today —
  hidden, not deleted, because the feature is built and routed.
