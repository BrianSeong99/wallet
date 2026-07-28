# Crust — implementing the design system into the app

Untracked briefing file. Written by the design-system session on 2026-07-26 so this
session starts with the context instead of rediscovering it. Delete it before any PR.

## Mission

Port the **Crust design system** into the real Bread Wallet app so Brian can test it on
the iOS simulator. Start with **design tokens** and the **onboarding** flow, then **home /
overview**.

This is the opposite posture to the session that produced the design system. That one was
**definition-only** and was forbidden from refactoring production components. **This session
edits production code.** Do not carry the old constraint over.

## Where things are

| | |
|---|---|
| This worktree | `/Users/bs/Develop/Miden/Projects/worktrees/crust-implementation` (branch `brian/crust-app-implementation`) |
| Design system source of truth | `design-system/index.html` — 62 screens, open it, don't just read it |
| Its docs | `design-system/SPEC.md`, `COMPONENTS.md`, `TOKENS.md`, `MIGRATION.md`, `RESEARCH.md` |
| Validation harness | `design-system/review.mjs` — run as `node design-system/review.mjs` from the worktree root |
| Design-system session's worktree | `../earn-integration` (branch `brian/crust-design-system`) — **read-only from here** |
| Upstream app mirror | `/Users/bs/Develop/Miden/0xMiden/wallet` — **do not touch**, standing rule |

`node_modules` is absent. Run `yarn install` first.

## Read these before writing code

1. `design-system/SPEC.md` — the rules and, importantly, the section on why the harness is
   necessary but not sufficient.
2. `design-system/COMPONENTS.md` — the consolidation map. It says which of the app's
   duplicate component families collapse into what, and why.
3. `design-system/TOKENS.md` — the token contract.
4. Root `CLAUDE.md` and `/Users/bs/.claude/CLAUDE.md`.

## Hard rules carried over

- **No AI attribution anywhere.** No `Co-Authored-By`, no "Generated with", no mention of
  Claude/AI in any commit, PR, issue or comment. Brian's identity only.
- **Never push without Brian asking.** Committing locally is fine.
- **One feature = one worktree + PR.** No mega-PRs.
- **No bordered/outlined buttons.** Filled or ghost only.
- Prefer established libraries over hand-rolled code.

## Design decisions that are settled — do not re-litigate

- Accent orange `#E77537`. **White-on-orange was rejected at 3.00:1.** Labels on accent are
  near-black `#1C1A18` (5.78:1), or white only at `--t-cta` 19px bold, where it conforms as
  large text. `--accent-ink #A84A1A` is the token for orange *text*.
- Type ramp is **9 fixed steps**. Spacing is `--stack-tight/--stack/--stack-loose`, applied
  to the container, not inside components.
- Everything is **rem**, except three things that are px on purpose: 44pt touch floors
  (SC 2.5.5 is an absolute minimum — in rem it drops below 44 when a user *shrinks* text),
  hairlines/outlines/shadows, and device chrome.
- Addresses and hashes use Geist Mono. Numbers use Nunito tabular figures.
- **Earn is flagged off** (`isEarnEnabled() === false`), **Swap is on**. Earn surfaces are
  hidden via `[data-earn-surface]`, **not deleted** — the feature is built and routed.
- Bottom nav is built on Apple Liquid Glass with a **neutral** active state.
- Dark account cards keep their hue rather than going near-black. The five dark values sit
  in a luminance band of only 0.150–0.183, because the white label needs 4.5:1 against the
  card *and* the selection ring needs 3:1 against the sheet.

## Known-good sequencing, and why it is not fully parallel

**Tokens must land first.** Every component depends on them, so this is a serial dependency,
not something to fan out. Get `src/main.css` + `tailwind.config.ts` onto the token contract,
verify the app still builds, commit. Only then parallelise.

After that, fan out **by file boundary with an explicit no-overlap list**. The design-system
session lost work three times to parallel edits colliding on one file. Two agents in the same
file will conflict; two agents in different directories will not. Give each agent the exact
list of files it owns and tell it to touch nothing else.

A reasonable split once tokens are in:
- onboarding screens (`src/screens/onboarding/**`)
- home + overview (`src/app/pages/Home*`, `src/components/ui/BalanceCard*`, `HomePrompts*`)
- shared primitives (`src/components/Button*`, `src/components/ui/*`)

Those three barely overlap. Send flow is deliberately **not** in the first wave — see below.

## Do not port the send flow yet

Two critique passes (UX and visual craft) were still running against the send flow when this
brief was written, and their findings may change it. Onboarding is described in the spec as
the north star and is settled; home is settled. Start there.

## Things the design system found in the shipped app that are still broken

These are real defects discovered while drawing, all verified in this codebase. Fixing them
is in scope for this session; several are cheap.

- `Button.tsx:107` calls `e.currentTarget.blur()` on every click, so a keyboard user is
  dumped to `<body>` on every step advance. SC 2.4.3.
- Primary button is `text-pure-white` on `#E77537` = **3.00:1**, failing SC 1.4.3 everywhere.
- `SelectRecipient.tsx` has no `<label>`, no `role="alert"`, no `aria-live`, no
  `aria-invalid`, no `aria-describedby`. The error is announced to nobody.
- `ReviewRow.tsx:58` uses `text-[#6B6862]`, an arbitrary hex that cannot participate in the
  CSS-var theme flip — it does not respond to dark mode.
- **Tapping a contact row deletes the contact** (`AddressBook.tsx:77`). No trash icon, no
  swipe, no menu, no confirmation affordance, and no edit function exists anywhere — so
  delete-and-retype is also the only way to fix a typo.
- Address book's empty state and its no-search-results state are the **same string**
  (`noContactsFound`), so a brand-new user gets a search-failure message.
- `/settings/address-book` is routable but renders the plain settings menu:
  `Settings.tsx:303` filters drawer tabs out of `activeTab`.
- `AddressBook` is typed `React.FC` with no props and silently drops the `onClose` Settings
  passes it, so saving a contact leaves the sheet open with no feedback.
- Shipped copy promises "we'll notify you when it's done" on send, but **nothing fires a
  notification on send completion** — the only caller of the notification layer is
  `NoteToastProvider.tsx:50`, for received notes. All the plumbing exists.
- `useFilteredContacts` calls `updateSettings` **inside a `useMemo`** — a write during
  render, un-awaited and unguarded.
- Missing from `en.json` but referenced in code via `defaultValue`: `totalPaid`, `sourceTx`,
  `transactionComplete`. Every non-English locale renders the raw key.
- Two address validators of different strictness: the address book does a real bech32
  round-trip, the send flow only checks a prefix.

## Cross-chain: do not build it

A code audit established the input side is **0% built** — `grep -rnwE "evm|EVM" src/` returns
nothing, there is no chain picker, no chain metadata, and no chain name exists in `en.json`.
`IBridgedSendExtraInputs` is structurally impossible to populate: `SendTransaction.extraInputs`
is hard-narrowed to `{ recallBlocks?: number }`. `BridgeSuccess` is complete but unreachable.
`IBridgeProvider = 'epoch' | 'agglayer'` — "Epoch" has no SDK counterpart at all.

Also: `node_modules/@miden-sdk/miden-sdk` is a hand-installed `0.15.6-b2agg.callback.1`
prerelease that is in neither `package.json` (which declares `0.15.5`) nor `yarn.lock`. It
exposes a real bridge API. **CI would install `0.15.5`.** Verify before scoping anything on it.

## Uncommitted work stranded in the other worktree

`../earn-integration` has four uncommitted files from a *third* session — a finished
accessibility fix to `SegmentedActionBar.tsx` (`role="tablist"` → nav landmark, i18n'd
`aria-label`, rewritten test, new `walletActions` key in `en.json`) plus a CHANGELOG entry.

It did **not** come across to this worktree, and this session will almost certainly touch
that file. Ask Brian how he wants it handled before editing `SegmentedActionBar.tsx`.

## Simulator

Use the iOS simulator tooling, not a hand-rolled build. Open the live panel **first**, before
building — it is cheap and surfaces the device-access prompt while Brian is at the keyboard.
Prior session notes on this are in memory under "wallet iOS sim setup": `DEVELOPER_DIR`
bypass, SPM not CocoaPods, `simctl` for screenshots.
