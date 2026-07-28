# Implementation worklist

What has to change in the app to put Crust on screen. One row per design-system screen: the
file that owns it, what class of work it is, and what is actually different.

Pair this with [SCREENS.md](SCREENS.md), which indexes the screens themselves.

## How to read the class column

| | Meaning |
|---|---|
| **A · Restyle** | The component already renders this state correctly. Tokens, type, spacing, radius. |
| **B · Restyle + fix** | It renders this state, but the mock corrects a real defect — wrong copy, failing contrast, a sub-44pt target, colour-only status, a missing label. |
| **C · New state** | The component exists; this state has never rendered. Add the branch. |
| **D · New screen** | No component exists. |
| **E · Blocked** | Needs a route, a backend change, an i18n key or an SDK capability before any UI work is possible. |

## The shape of the job

Across the 143 screens mapped, **6 are pure restyles.** That is the headline. This is not a
reskin: two thirds of the work is either a defect the mock corrects or a branch that has never
executed. Scheduling it as "apply the design system, screen by screen" will be wrong by an order
of magnitude on the second screen.

| Area | A | B | C | D | E | Screens |
|---|--:|--:|--:|--:|--:|--:|
| Home & Send | 1 | 14 | 7 | 4 | 3 | 31 (+2 multi-class) |
| Receive, Swap, Activity, Earn | 2 | 11 | 15 | 2 | 5 | 35 |
| Settings & Security | 1 | 14 | 8 | 4 | 14 | 41 |
| dApp browser & Global | 1 | 9 | 4 | 3 | 4 | 21 |
| **Total** | **5** | **48** | **34** | **13** | **26** | **128** |

Onboarding's 28 screens are covered separately in [ONBOARDING.md](ONBOARDING.md).

## Build the primitives first

Every area's report independently reached the same conclusion: a handful of shared components
carry most of the screens. Ordered by screens unlocked per unit of work.

| Primitive | Unlocks | The actual change |
|---|--:|---|
| `BalanceCard` | 10 | Already declares and implements `state?: 'default' \| 'loading' \| 'zero' \| 'hidden'`. `Explore.tsx:185-192` never passes it. **Three "gap" screens are one prop.** |
| `Button` | 19 | `Ghost` still carries `border border-border-button`, which the no-outlined-buttons rule removes. Also `Button.tsx:107` blurs on every click. |
| `Drawer` | 8 | Scrim is `bg-black/30`, under the 40% floor; `hideHandle` defaults `true` while every mock shows a handle. |
| `EmptyState` | 5 | Does not exist. Three mutually incompatible empties ship today. |
| Skeleton geometry | 5 | Does not exist. `ActivitySpinner` is the only loading affordance in the entire app. |
| `ActivityRow` | 5 | Cancel slot, reason/stage subtitle, real button semantics, and raise the `text-[10px]` status label. |
| Inline `Notice` | 6 | Every instance is ad hoc today. |
| `StatusPill` | 4 | `DetailCard.tsx:38` hardcodes `bg-green-600/20` for **every** status, so a failure renders red text on a green wash. |
| `ToggleSwitch` | every toggle | 40×22pt target, and `SettingToggle.tsx:17`'s `<label htmlFor>` binds to nothing because the component is only given `name`, never `id`. |

## Fix these before restyling anything on top of them

Restyling a screen whose state is computed wrongly means styling a lie. Each of these is a
separate PR from the design work, with a different reviewer.

1. **`yarn lint:i18n` does not lint anything.** `eslint src` without `--ext` defaults to `.js`,
   and `src/` holds three `.js` files. Verified by running it: **3 files, zero `.ts`/`.tsx`.**
   Every missing-key finding in this document exists because this gate has never run. Fix first —
   it is one flag, and it changes what CI will accept from every task below.
2. **`binance.ts:21`** `DEFAULT_PRICE = { price: 1 }` — an unpriced token is valued at $1.00/unit
   and summed into Total Balance. Widest blast radius here; wants its own decision on whether a
   stablecoin carve-out is kept.
3. **`History.tsx:140`** `includeFailed = false` — the only non-test caller. Failed transactions
   are in Dexie and reachable from no list.
4. **`get.ts:68`** `slice(offset, limit)` misuses `slice(start, end)`; `:62` sorts ascending;
   `hasMore` can never go false. Three coordinated one-liners.
5. **`Pending.tsx:38`, `TokenDetail.tsx:48`** discard `isLoading`, so the empty state doubles as
   loading and as error.
6. **`Pending.tsx:228-230`** navigates home on success, unmounting the component that owns
   `failedNoteIds`. Both Claim screens are unbuildable until this goes.
7. **`dapp.ts:503-504, 620-621, 748-749`** — the `Auto` permission path returns balances and
   private notes with no per-request prompt. Consented once, then silent.
8. **`DappConfirmationModal.tsx:49`** — `canApprove` short-circuits, so Confirm is enabled with a
   `null` signing account. One line.

## Things the design system implies that do not exist

- **No fee model at all.** `networkFee`, `estimateFee`, `txFee`, `gasFee`: zero hits in `src/`
  and `en.json`. Every fee row in Crust is a specification, not a description.
- **No in-app toast.** No `Toaster`, no library; `NoteToastProvider` renders `null`.
- **No resume listener**, so the wallet never re-locks on backgrounding.
- **No mobile/desktop consent path** for five of the eight dApp request types.
- **A third consent implementation** nobody has documented: desktop injects generated HTML at
  `lib/desktop/dapp-browser.ts:149`. Fixing the React modal does not fix desktop.
- **114 new `en.json` keys** for Settings and Security alone.

## Suggested order

1. `lint:i18n`, then the correctness fixes above. They are cheap and everything else sits on them.
2. Tokens into `main.css` + `tailwind.config.ts`. Serial dependency — nothing parallelises before it.
3. The primitives table, in order. Four small components unlock 20 of 35 screens in Receive and
   Activity alone.
4. Then screens, by flow, in parallel by file boundary.

Wire-ups worth doing early because they are nearly free: `encrypted-file-flow/` needs **one route
and one `TAB_GROUPS` row** for three complete, translated, tested screens; `About.tsx` needs
**one `TAB_GROUPS` entry** and lets you delete the hardcoded English `Settings.tsx:415`; hoisting
`ConnectivityIssueBanner` out of `Explore.tsx:141` into `TabLayout` fixes **three** screens.

## Proposals, not restyles

These mocks specify product decisions rather than shipped behaviour. Do not schedule them as UI
work: `Accounts · list`, `Account sheet`, `Send · other chain`, `Send · network`, the recents
list and address-family detection in `Send · recipient`, `Receive · request an amount`, and every
fee row. `Guardian · rotate review` is **contested**, not merely unbuilt — see ONBOARDING.md.

---



<!-- ===== impl-home-send ===== -->

# Crust implementation worklist — Home & overview (12) + Send flow (19)

Scope: the 31 screens listed below, mapped to the shipped component that must change.
Every file/line cited was opened and verified against
`/Users/bs/Develop/Miden/Projects/worktrees/earn-integration` on 2026-07-27. Repo untouched.

**Class key** — A restyle · B restyle + fix a real defect · C new state on an existing component ·
D new screen/component · E blocked on a route, backend, SDK or product decision.
**Size** — S under an hour · M half a day · L more than a day.

**Read this first — three mocks are proposals, not specs of shipped behaviour.**
`Accounts · list`, `Account sheet`, `Send · other chain` and `Send · network` describe product that
does not exist and in two cases contradicts the shipped data model. They must not be scheduled as
restyles. `Send · recipient` and its four sibling states are also *partly* proposal — the recents
list and address-family detection have no data source today. Each is flagged in-row.

---

## Home & overview

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by | Size |
|---|---|---|---|---|---|
| **Home / Overview** | `src/app/pages/Explore.tsx:138-158` (page shell), `:171-218` (`HomeOverview`) · `src/components/ui/BalanceCard.tsx:104-195` · `src/app/layouts/TabLayout.tsx:190-198` (segmented bar) · `src/app/templates/HomePrompts.tsx:46-61` · `src/components/AssetRow.tsx:24-52` → `src/components/ui/AssetListItem.tsx:24-76` · `src/components/ui/BottomNav.tsx` | **B** | De-hardcode `BalanceCard`: delta-pill `bg-[#A8BBA3]` at `:120`, dashed rule `border-t-[#FFFFFF4D]` at `:169`, more-button plate `bg-[#F6F4F261]` at `:187` → tokens. Bottom strip copy is `Account #: {truncated}` (`:180`); mock is the bare address in Geist Mono + an icon-only copy button. **The mock's balance card carries a sparkline (`svg.perf`) and a `today` period suffix on the delta — `BalanceCard` renders neither**, so the hero needs a new sparkline slot, not a restyle. `Explore.tsx:190` passes a **hard-coded** `delta={{absolute:'+0.00', percentage:'0.00%', direction:'positive'}}` — that fabricated green pill must be driven by real data or removed. Asset rows: `AssetRow.tsx:45` renders a `Sparkline` the mock's row does not have; `AssetListItem.tsx:51` sets `role="button"` with no `tabIndex`/key handler. `Explore.tsx:204` renders an always-on `SearchInput` that appears in **no** Home mock — confirm removal is intended before deleting. | Real 24h-delta source for the total (none today — `Balance.tsx:22-26` sums spot price only, no historical series) | **M** |
| **Home · first run** | `src/components/ui/BalanceCard.tsx:55` (`state` union), `:116` `isZero`, `:143` `'$0.00'` · caller `src/app/pages/Explore.tsx:185-192` · assets list `Explore.tsx:206-215` | **C** | `BalanceCard` already implements the `zero` variant; **the caller never passes `state`** (`Explore.tsx:185-192` sets `accountNumber/accountId/amount/currency/delta/onMore` only). Add `state={…}` and suppress delta+sparkline in the `zero` branch. Then add the empty-assets block: `Explore.tsx:206-215` maps `filteredTokens` with **no empty branch**. Mock copy: "Nothing here yet" / "Assets appear once someone sends to your address, or you claim a note." + a **secondary** (not primary) `Show my address` → `/receive`. **Trap:** `src/lib/miden/front/balance.ts:31-44` `buildDefaultZeroBalance()` injects a synthetic 0.00 MIDEN row as soon as the native asset id is cached, so `filteredTokens.length === 0` is usually **false** on first run. The empty branch must key off "every balance is zero", not array length. | New `en.json` keys: `homeEmptyTitle` = "Nothing here yet", `homeEmptyBody` = "Assets appear once someone sends to your address, or you claim a note.", `showMyAddress` = "Show my address" | **M** |
| **Home · loading** | `src/components/ui/BalanceCard.tsx:55`, `:114` `isLoading`, `:134-135` skeleton · `src/lib/miden/front/balance.ts:174-179` (returns `isLoading`) · `src/app/pages/Explore.tsx:42` · `src/app/templates/Balance.tsx:15-44` | **C** | Same shape as above and it **collides** with it: today a first read renders `$0.00`, pixel-identical to an empty wallet. The flag exists — `useAllBalances` returns `isLoading` at `balance.ts:174-179` — and `Explore.tsx:42` destructures `data` only. Either add `isLoading` there and thread it into `HomeOverview`, or give `Balance.tsx` a second render arg; `Balance` currently exposes no loading channel at all (`:22-26`). The shipped skeleton is `h-12 w-48 bg-white/15` (`BalanceCard.tsx:59`,`:135`) — it does not match the real amount's geometry, so it must be re-sized to the fitted font box or the card jumps when the value lands. Asset-row skeletons do **not** exist: `AssetListItem` has no loading variant — add one (icon plate + two bars). | — | **M** |
| **Home · balance hidden** | `src/components/ui/BalanceCard.tsx:55`, `:115` `isHidden`, `:143` `'••••••'`, `:152` (delta suppressed when hidden) · `src/components/ui/AssetListItem.tsx:59-73` · new pref module modelled on `src/lib/settings/card-color.ts:16-38` | **C** | The `hidden` variant exists and **there is no toggle anywhere in the app to reach it** (grep: no writer of `state="hidden"`). Three pieces of work: (1) an eye button in the card's label row — `BalanceCard.tsx:131` renders `Total Balance` as a bare `div`, so that row becomes a flex row with a 44pt control; (2) a persisted preference — copy the `useSyncExternalStore` + `localStorage` pattern from `lib/settings/card-color.ts:16-38`; (3) **masking must reach the asset rows** — `AssetListItem` renders `amount`/`price`/`delta` as plain strings (`:64`,`:71-72`), so either the caller passes pre-masked strings or the component gains a `masked` prop. Delta and sparkline go with the mask (`:152` already gates delta on `!isHidden`). | New `en.json` keys: `hideBalance` = "Hide balance", `showBalance` = "Show balance" (aria-labels) | **M** |
| **Home · unpriced asset** | `src/lib/prices/binance.ts:21` `DEFAULT_PRICE`, `:84-85` `getTokenPrice` · consumers `src/components/AssetRow.tsx:26,46` · `src/app/templates/Balance.tsx:22-26` · `src/app/pages/TokenDetail.tsx:55-56` · `src/components/ui/BalanceCard.tsx:130-165` (needs a footnote slot) | **B** | Shipped money bug, verified: `binance.ts:21` declares `{ price: 1, change24h: 0, percentageChange24h: 0 }` and `:85` returns `prices[symbol] ?? DEFAULT_PRICE`, so an unlisted token is valued at **$1.00/unit** and `Balance.tsx:23-26` sums that fiction into Total Balance. Fix is three-part: (1) `getTokenPrice` returns `undefined`/a `known:false` flag for a miss — **it has 4 call sites, all listed left, all must handle it**; (2) `AssetListItem` renders `—` for fiat and `No price` for the delta (currently `delta.value` is always a signed percentage, `AssetRow.tsx:28`); (3) `Balance` excludes unpriced tokens from the sum and reports the excluded count so `BalanceCard` can render the new `bnote` footnote line under the delta. | New `en.json` keys: `noPrice` = "No price", `unpricedAssetsExcluded` = "$count$ asset has no price and is not counted" (needs plural handling) | **M** |
| **Home · offline** | `src/components/ConnectivityIssueBanner.tsx:49-57` (network view), `:84-145` (render), `:91-105` (`onRetry`) · mounted **only** at `src/app/pages/Explore.tsx:141` · `src/components/ui/BalanceCard.tsx:131` (label row) · `src/lib/miden/front/balance.ts:66` (`balancesLastFetched`) | **B** | Copy is already correct and keyed (`connectivityNetworkTitle`/`Body` en.json:570-571, `connectivityRetry` :578) — this is a restyle plus three fixes. (1) The banner is Gen-2: `bg-white … rounded-t-3xl` (`:117`), `text-primary-500` CTA (`:131`), raw hexes `#FEA644`/`#5b8def`/`#9ca3af` (`:53`,`:68`,`:78`) → prompt-card surface + `--warn`. (2) **`onRetry` returns early unless `isExtension()`** (`:93-99`) — on mobile and desktop the button is live, tappable and does nothing. (3) The banner mounts at `Explore.tsx:141` and nowhere else (verified by grep) — go offline on Activity/Browser/Settings and there is no indication. Mock also changes the card label to `Total Balance · updated 14 min ago` (new `BalanceCard` prop; the timestamp source exists as `balancesLastFetched`, `balance.ts:66`) and suppresses delta + sparkline while offline. | New `en.json` key: `balanceUpdatedAgo` = "Updated $time$ ago". Hoisting the banner above `TabLayout` is a layout change, not a token change — call it out in review | **M** |
| **Home · node unreachable** | `src/components/ConnectivityIssueBanner.tsx:58-65` (node view) · `src/lib/miden/activity/connectivity-state.ts` (priority) · send entry points: `src/app/layouts/TabLayout.tsx` action bar, `src/screens/send-flow/SelectRecipient.tsx:91-98`, `src/screens/send-flow/ReviewTransaction.tsx:204` | **B** | Same banner component, `node` view, copy already keyed (en.json:572-573, `connectivityRetrySync` :579). The genuinely new piece is the consequence notice — "Sending is unavailable until the node responds." — rendered below the assets list, **plus actually gating send**. Nothing in the send flow currently checks connectivity; `ReviewTransaction.onSubmit` (`:127-176`) will happily enqueue against a dead node. Drawing the notice without the gate ships a lie. | New `en.json` key: `sendingUnavailableNodeDown` = "Sending is unavailable until the node responds." · **the gate itself is a behaviour change** — needs a product call on whether to block or warn | **L** (the gate, not the pixels) |
| **Home · notes to claim** | `src/app/hooks/useHistoryBadge.ts:12-28` (dead + inverted) · `src/app/pages/Explore.tsx:45` (`useClaimableNotes` already wired) · `src/components/ui/PromptCard.tsx:19-58` · `src/components/ui/BalanceCard.tsx:130-165` (footnote slot) | **C** | Home has no affordance for unclaimed notes. The data is already on the page — `Explore.tsx:45` holds `claimableNotes`. `useHistoryBadge` (`:12-28`) has **zero non-test callers** (grep: only its own test) and its logic is inverted — `:16` gates on `isAutoConsumeEnabled()`, so it returns `false` exactly when the user must act. Work: sum claimable amounts per faucet, render a `PromptCard` with a **CTA button** — `PromptCard` has no CTA slot today, it renders either a dismiss `×` or a chevron (`:33-43`) — and reuse the `bnote` footnote slot from *unpriced asset*. Non-dismissible already works (omit `onDismiss`), but it then renders a chevron, not nothing. | New `en.json` keys: `notesWaitingTitle` = "$count$ notes waiting to be claimed", `notesWaitingBody` = "$amount$ was sent to you. It is not spendable until you claim it.", `unclaimedNotCounted` = "$amount$ unclaimed, not counted" | **M** |
| **Accounts · list** | `src/components/ui/AccountsDrawer.tsx:41-106` · backend already present: `src/lib/store/index.ts:181-204` (`updateCurrentAccount`), `:160-179` (`createAccount`), exposed at `src/lib/miden/front/client.ts:129-142` | **D — PROPOSAL, product decision** | **Multi-account has no UI at all.** The shipped drawer is a card-colour picker (`:49-74`), a Settings link (`:76-88`) and a **disabled** "Add Account (Coming Soon)" whose `border border-dashed border-[#C7C7CC]` (`:96`) also breaks the no-bordered-controls rule. It lists no accounts. The mock is a full account switcher with per-card selection rings. The backend is ready (`updateCurrentAccount`, `createAccount`, both plumbed to `useMidenContext`) and **nothing in the UI calls either** — there is no create-account screen anywhere (`find src -name 'CreateAccount*'` → nothing). This is a feature build, not a reskin. | Product decision: does multi-account ship? If yes it also needs a create-account flow (wallet type, naming), which the mock does not draw. New `en.json` keys: `addAccount` (replacing `addAccountComingSoon` en.json:568) | **L** |
| **Account sheet** | `src/components/ui/AccountsDrawer.tsx` (entry point does not exist) · `src/lib/settings/card-color.ts:16-38` · `src/lib/store/index.ts:206-228` (`editAccountName`) | **D/E — PROPOSAL, needs a schema change** | Rename exists in the backend (`editAccountName`, `store/index.ts:206-228`, exposed `client.ts:143`) with **no UI caller**. The blocker is colour: `lib/settings/card-color.ts:16-30` persists **one global** `CARD_COLOR_STORAGE_KEY` string, and `BalanceCard.tsx:117` reads it via `useCardColor()` with no account parameter. Per-account colour means changing that module to a keyed map and migrating the existing value — and `AccountsDrawer.tsx:52-72` is the current writer. The entry chain the mock assumes (balance-card `⋯` → Accounts list → row `⋯` → this sheet) does not exist past the first hop: `BalanceCard.onMore` (`:182-191`) opens the colour drawer directly. | Per-account card-colour storage (schema change). Depends on **Accounts · list** landing first — this sheet has no reachable entry point without it | **L** |
| **Token detail** | `src/app/pages/TokenDetail.tsx:42-125`, `:111-113`, `:129-216` (`PriceChart`), `:225-257` (`TokenInfoCard`) · `src/components/NavigationHeader.tsx` | **B** | Section labels are **centred uppercase** at `:111-113` (`Recent Activity`), `:149` (`Token Price`) and `:231-233` (`Token Info`) — a treatment used nowhere else; every other section head is left-aligned sentence case. The contract row copies with **no confirmation of any kind**: `:241` is a raw `navigator.clipboard.writeText(tokenId)` inside a bare `<button>`, unlike every other copy affordance. Action buttons use `bg-send-blue`/`bg-receive-green` (`:89`,`:96`) → `--act-send`/`--act-receive`. `NavigationHeader` at `:69` is a **MERGE → ScreenHeader** per COMPONENTS.md. Timeframe pills at `:191-213` use `rounded-5` + `text-primary-500`. | — | **M** |
| **Token detail · price unavailable** | `src/lib/prices/binance.ts:127-129` (`fetchKlineData` → `[]`), `:21` `DEFAULT_PRICE` · `src/app/pages/TokenDetail.tsx:30` `FLAT_LINE_DATA`, `:137` fallback, `:150-160` badge, `:162` price | **B** | Not a void — a fabrication, and the **same root cause as Home · unpriced asset**. `fetchKlineData` returns `[]` both for an unlisted symbol (`:129`) and on network error (`:154-159`); `TokenDetail.tsx:137` swaps `[]` for `FLAT_LINE_DATA` (ten points of constant 1, `:30`), while `getTokenPrice` falls through to `$1` — so the screen draws a clean flat chart under `$1.000` (`:162`) with a green `+0.0%` badge (`:150-160`). Fix: when the price is unknown, replace chart + price + badge with the "Price data unavailable" panel; keep the timeframe tabs out of that branch. Do this in the same commit as the `getTokenPrice` signature change or the two screens disagree. | New `en.json` key: `priceDataUnavailable` = "Price data unavailable" | **S** (once the `getTokenPrice` change lands) |

---

## Send flow

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by | Size |
|---|---|---|---|---|---|
| **Send · recipient** | `src/screens/send-flow/SelectRecipient.tsx:52-101` (whole screen) · `src/screens/send-flow/SendManager.tsx:421-431` (props) · `src/app/icons/v2/qr-scan.svg` (exists, referenced by nothing) | **B + C + D** | Full redraw of a screen that breaks three form rules. The field is a **borderless auto-growing `<textarea>` at `text-[40px] font-bold` with no label** (`:58-74`) while the page heading `chooseRecipient` is `text-2xl` (`:55`) — the emptiest element is the loudest. Replace with a labelled 44pt field (**B**), add Paste and Scan beside it (**C**; Scan gated on `isScanAvailable()`), and add the Recent list (**D** — no recents feature exists; it is derivable from send history via `app/templates/history/`, but that is new plumbing). The Address Book pill (`:79-87`) becomes a row in that list. *Note:* the mock's rationale cites "32px mono placeholder"; shipped is **40px `font-heading`**, not mono — the defect holds, the numbers in the note are stale. | Recents needs a data source (derive from history) — **that part is a proposal**. New `en.json` keys: `paste` = "Paste", `scanQrCode` = "Scan a QR code" (aria), `recent` = "Recent", `allSavedContacts` = "All saved contacts" | **L** |
| **Send · recipient, new address** | `src/screens/send-flow/SelectRecipient.tsx:57-77` · `src/lib/miden/front/use-filtered-contacts.hook.ts:26-35` (`allContacts`), `src/lib/miden/front/address-book.ts:33-36` (`getContact`) | **D — partly proposal** | A live validation row under the field: truncated address, "Not in your contacts", green field ring, **Confirm stays enabled**. None of this exists — today the field either shows nothing or the red error (`:77`). The contact lookup is available (`getContact` at `address-book.ts:33-36`, already memoised over `allContacts`), so the row itself is buildable; the "saving happens afterwards" promise implies a **save-after-send flow that does not exist**. Build the row, drop the promise, or schedule the save flow separately. | New `en.json` keys: `notInYourContacts` = "Not in your contacts". Save-after-send is unbuilt — do not imply it in copy until it exists | **M** |
| **Send · recipient, other network** | `src/screens/send-flow/SendManager.tsx:365-379` (rejects everything non-Miden) · `public/_locales/en/en.json` (no chain names) | **E — PROPOSAL** | **Nothing here exists.** `grep -rnwE 'evm\|EVM' src/` returns nothing; there is no chain picker, no chain metadata, and **no chain name anywhere in `en.json`** — verified: the only hit for "ethereum" is `enterMidenOrEthereumAddress` (en.json:218), and Base/Arbitrum/Optimism/Polygon appear zero times. Today `SendManager.tsx:372-376` sets `invalidMidenAccountId` for any `0x…` string and `SelectRecipient.tsx:95` kills Confirm. | Bridge/backend capability, chain registry, chain logo assets, and ≥4 new `en.json` keys (`chainEthereum`, `chainBase`, `chainArbitrum`, `chainOptimism`) + `whichNetworkIsItOn`. **Product decision** | **L** (blocked, not big) |
| **Send · recipient, unsupported** | `src/screens/send-flow/SendManager.tsx:365-379` · `src/utils/miden.ts:1-16` | **D** | "Recognised but unsupported" ≠ "invalid". A well-formed Solana address currently answers `invalidMidenAccountId` = "Invalid Miden account ID" (en.json:446) — telling the user they made a mistake they did not make. Needs an address-family detector (base58 length/charset for Solana, `0x`+40 hex for EVM, etc.) beside `isValidMidenAddress` in `utils/miden.ts`, and a non-tappable, chevron-less status row. **This one is pure frontend — no backend dependency** — which makes it the cheapest of the four recipient-detection states. | New `en.json` key: `cannotSendToChain` = "Miden cannot send to $chain$" (+ family names) | **M** |
| **Send · recipient, typing** | `src/screens/send-flow/SelectRecipient.tsx:58-74` · `src/screens/send-flow/SendManager.tsx:365-379`, `:425` | **C** | Focus ring (`--focus-ring`), switch to Geist Mono once there is an address in the field, a `12 / 49` character counter, and a filtered matches list. Today the field has `caret-primary-500` and `outline-none` (`:66`,`:64`) — **no focus ring at all** — and is `font-heading` throughout. The Confirm gate is real and stays: `SendManager.tsx:425` computes `isValidAddress` from `validations.recipientAddress.isValidSync`. The match filtering rides on the same recents/contacts source as *Send · recipient*. | Depends on the recents source (same proposal). `keepTyping` key needed if the hint text is kept | **M** |
| **Send · recipient, invalid** | `src/screens/send-flow/SendManager.tsx:365-379` (sets the error) · `src/screens/send-flow/SelectRecipient.tsx:77` (renders it) | **B** | The shipped error, verbatim: `invalidMidenAccountId` (en.json:446), set on every keystroke that fails `isValidMidenAddress`. Two fixes, both cheap. (1) It renders `text-red-500 text-sm` at `:77` — the design audit measures that at **3.64:1**, under the 4.5:1 floor → `--neg` + the system's `.fld.err`/`.hint` treatment. (2) It is **announced to nobody**: no `role="alert"`, no `aria-live`, no `aria-invalid` on the field. `AmountInput.tsx:89-94` has the identical defect — fix both together. | — | **S** |
| **Send · scan** | `src/lib/qr/scanner.ts:36` `isScanAvailable`, `:45` `scanQRCode`, `:99` `checkCameraPermission` (all exported via `src/lib/qr/index.ts:2`, **zero callers**) · `src/lib/qr/format.ts:30-41`, `:49-58` · `src/utils/miden.ts:5-6` | **C + 2 shipped bugs** | The scanner is **built and wired to nothing** — verified by grep: no import of `scanQRCode`/`isScanAvailable` outside `lib/qr/`. Work is a viewfinder screen plus the call, gated on `isScanAvailable()` (= `isMobile()`), so it must not render in the extension. **Two bugs found while checking this.** (1) The two validators disagree on the mainnet prefix: `utils/miden.ts:5` uses `mm1`, `lib/qr/format.ts:58` tests `startsWith('m1')` — `'mm1…'.startsWith('m1')` is **false**, so scanning a valid mainnet QR is rejected. Invisible on testnet, breaks at launch. (2) `decodeAddress` (`format.ts:30-41`) strips only the `miden:` prefix, so an EIP-681 payload passes through untouched and its `@chainId` — the one thing that would answer the network question for free — is discarded. | `noQrCodeFound` already exists (en.json:633). New keys: `pointAtMidenQr` = "Point at a Miden QR code", `cancel` (verify) | **M** |
| **Send · other chain** | no owning file — nothing exists | **E — PROPOSAL** | Confirm-recipient screen with a network chip, grouped address, a privacy-cliff callout ("This transfer leaves Miden. On Base the amount and recipient are public.") and an Arrives / If-unclaimed panel. No chain picker, no chain metadata, no bridge route data, no fee/ETA source. Pasting this address today turns the field red. **Schedule only after a bridge decision.** | Bridge backend, chain registry, ETA/fee data source, chain assets, ≥6 new `en.json` keys. **Product decision** | **L** (blocked) |
| **Send · network** | no owning file — nothing exists | **E — PROPOSAL** | A sheet reached from the network chip, each row stating cost and arrival ("~12 min · higher fee" / "~1 hour · free route"). Names, logos and the chain palette are invented in the mock and would need real assets. Deliberately no preselected default. | Same as above: chain registry + route/fee data + ≥5 new `en.json` keys. **Product decision** | **L** (blocked) |
| **Send · amount** | `src/screens/send-flow/SelectAmount.tsx:124-150` · `src/components/AmountInput.tsx:44-108` · `src/screens/send-flow/SendManager.tsx:432-444` | **A/B** | Layout restyle of an already-correct screen. Mock replaces the orange `Miden` network pill (`SelectAmount.tsx:127-131`, `bg-primary-500 text-pure-white`) with a back header + "Send" title; collapses the two helper lines (`:99-105`, `Available …` and `approxFiatValue`) into one meta line; and drops the fixed **orange underline divider** at `AmountInput.tsx:101` (`h-2 rounded-full bg-primary-500 w-55` — a decorative use of a structural colour, and a fixed `w-55` under a variable-width value). Error styling `text-red-500` at `:75` and `:92` → `--neg` (same fix as *recipient, invalid*). Token chip `:72-94` → the mock's `tokchip`. | — | **S** |
| **Send · token picker** | `src/screens/send-flow/SelectToken.tsx:49-84`, **`:62-79` the map** · `src/lib/ui/drawer.tsx` (`hideHandle = true` default) · `src/components/AssetRow.tsx:24-52` | **C** | Two missing branches: `SelectToken.tsx:63-79` maps `filteredBalances` with **no empty branch and no loading branch**, so a search matching nothing — or balances still loading — renders an empty box. The sibling contacts drawer (`AccountsList.tsx:43-49`) *does* have an empty state, which makes the omission look accidental. Also: the mock shows a drag handle; `drawer.tsx` defaults `hideHandle = true`, so every sheet needs `hideHandle={false}` or the default flips. The mock adds a Cancel button in the bottom zone — shipped has none. Rows reuse `AssetRow`, so the sparkline removal from *Home / Overview* lands here for free. | New `en.json` keys: `noTokensFound` = "No tokens found" | **S** |
| **Send · review** | `src/screens/send-flow/ReviewTransaction.tsx:193-236` (rows at `:206`, `:208-213`, `:215-222`) · `src/components/review/ReviewRow.tsx:41-63`, `ReviewAmount.tsx`, `ReviewLayout.tsx` | **B** | Add the missing **From** row — rows today are To / Network / Expiration Date only (`:206-222`), and once multi-account ships, a send with no visible source account is a hazard. `from` already exists in `en.json:206`, so no new key. The `To` value is passed **untruncated** (`:206 value={to}`) while the mock shows `mtst1kq2…88xz` — apply the one truncation rule. `ReviewRow`'s label is a grey pill (`ReviewRow.tsx:11-20`) and its Edit link is `text-primary-500` (`:50`) → `--accent-ink`. The expiration row is the only tappable one and the mock gives it `min-height:44px` + a chevron; shipped exposes an "Edit" text link instead. | — | **S** |
| **Send · in progress** | `src/screens/generating-transaction/GeneratingTransaction.tsx:344-393` · `src/screens/generating-transaction/constants.ts:10-31` (steps) · `src/screens/generating-transaction/components.tsx:13`, `:159` | **A** | Closest match in the set — the four steps and their labels are already exactly the mock's ("Guardian approved", "Proof generated", "Submitting", "Syncing with Guardian", `constants.ts:10-31`; all four keys present in `en.json`), per-step timings ship (`:363-370` `meta`). Restyle only: step-card border `border-[#ECEBE8]` (`:359`) → `--rule`; title `text-[2rem]` (`:352`) → type scale; hero colours `SUCCESS_GREEN`/`PROCESSING_ORANGE`/`PENDING_STEP_COLOR` (`constants.ts:15-17`) → status tokens. Two deltas from the mock: the mock has **no** top header, shipped renders `ScreenHeader title={t('transactionProcessingHeader')}` at `:345` — and **`transactionProcessingHeader` is absent from `en.json`**, surviving on a `defaultValue` only; and the mock's dismiss is `btn-secondary` while shipped is Primary (`:389-391`). | `transactionProcessingHeader` missing from `en.json` (currently `defaultValue: 'Processing'`) — add it or delete the header per the mock | **S** |
| **Send · success** | `src/screens/generating-transaction/success/SendSuccess.tsx:26-60` · `src/screens/generating-transaction/success/receipt.ts:30-68` · `TransactionSuccessLayout.tsx` | **B** | Rows are `buildReceiptRows` verbatim — To → Total Paid → Source TX (`receipt.ts:36-65`), each appended only when its data exists, `Route` only for a bridged send (unreachable). No fee row anywhere, correctly. Restyle the tick, the summary pill and the two-button zone. **Real defect: `totalPaid`, `sourceTx` and `transactionComplete` are absent from `en.json`** (verified — `transactionRoute` *is* present at en.json:473, the other three are not), so they survive on `defaultValue` fallbacks at `receipt.ts:53`,`:60` and `SendSuccess.tsx:41` and every non-English locale shows the raw key. Also note the recipient renders **twice** — the pill (`SendSuccess.tsx:55`) and the To row (`receipt.ts:36-41`) — which the mock preserves; decide deliberately. | Add `en.json`: `totalPaid` = "Total Paid", `sourceTx` = "Source TX", `transactionComplete` = "Transaction Complete!" | **S** |
| **Contacts · picker** | `src/screens/send-flow/AccountsList.tsx:36-78` · ordering from `src/screens/send-flow/SendManager.tsx:87-108` · `src/components/CardItem.tsx` | **B** | Read-only picker: no add, no delete, **no search** — while the settings address book has one (`AddressBook.tsx:53-64`). Ordering is own-accounts-then-external (`SendManager.tsx:88-107`), and the settings list orders them **the reverse way** (`use-filtered-contacts.hook.ts:34` returns `[...external, ...accounts]`); neither sorts alphabetically nor separates the groups with a heading. Restyle: rows use a generic `Avatar image="/misc/avatars/miden-orange.png"` (`:57`) — the mock uses initials on `--tx-*` colour plates; the guardian badge is hardcoded `text-[#CC5200] bg-[#FFF3EB]` (`:61`) → status tokens; the selection tick is `IconName.CheckboxCircleFill` (`:58`) → the mock's filled shape. Fix the ordering disagreement in the same pass. | — | **M** |
| **Contacts · picker, empty** | `src/screens/send-flow/AccountsList.tsx:43-49` · `src/components/EmptyState.tsx:13-31` | **B** | Copy bug, drawn to show it, not to endorse it. The sheet is titled `contacts` = "Contacts" (en.json:443) but empties to `noOtherAccounts` / `noOtherAccountsDescription` (en.json:444-445, rendered at `AccountsList.tsx:47-48`) — a user with no saved *contacts* is told they have created no *accounts*, and given no way to add one from here. Right shape: contacts-worded empty state **plus an Add contact action**; `EmptyState` (`EmptyState.tsx:13-31`) has no action slot, so it gains one. | New `en.json` keys: `noContactsYet` = "No contacts yet", `noContactsYetDescription`, and reuse `addContact` (en.json:248) | **S** |
| **Address book** | `src/app/templates/AddressBook.tsx:17-86` (list), `:97-176` (form) · mounted at `src/app/pages/Settings.tsx:420-431`, tab def `:132-139` · `activeTab` filter `Settings.tsx:303-306` · `src/lib/miden/front/address-book.ts:13-42` | **B** | Mounted as a **drawer**, not a page: the tab carries `isDrawer: true` (`Settings.tsx:137`) and `activeTab` excludes drawer tabs (`:303-306`), so `/settings/address-book` is routable but renders the plain settings menu. Restyle is a Gen-1 teardown: `FormField` + `FormSubmitButton` with `bg-gray-25 border-gray-100 rounded-10` (`:147-149`,`:161-163`,`:167`) → the canonical field + `Button`. Three real defects: **tapping a row deletes the contact** (`:78` → `handleRemoveContactClick`) with no trash icon, swipe or menu, and **no way to *use* a contact from here at all** — note the mock's rationale says "no confirmation"; there **is** a `confirm()` dialog (`:23-37`, `deleteContactConfirm` en.json:253), so the defect is the affordance, not the guard. **There is no edit** — `address-book.ts:38-42` exports `addContact`/`removeContact`/`getContact` only, so fixing a typo means delete and retype. And `Settings.tsx:427` passes `onClose` while `AddressBook` is `React.FC` with **no props** (`:17`), so it is silently dropped and the sheet stays open after submit with no toast. | An `editContact` mutation does not exist (backend `updateSettings` can express it; the hook cannot) | **L** |
| **Address book · duplicate** | `src/app/templates/AddressBook.tsx:114-132` (`:128` the `setError`) · `src/lib/miden/front/address-book.ts:13-22` · `src/lib/miden/front/use-filtered-contacts.hook.ts:26-35` | **B** | Every failure lands on the **address** field: the bech32 rejection (`invalidAddress`, `:122`) and the duplicate check both funnel into `setError('address', …)` at `:128`. No form-level banner, no toast. Worth fixing while here: the duplicate check runs against `allContacts` (`address-book.ts:15`), which **includes the user's own wallet accounts** (`use-filtered-contacts.hook.ts:16-24, 34`) — so saving your own account as a contact fails with `contactWithTheSameAddressAlreadyExists` (en.json:250), which is accurate and baffling. Also the address field inherits the name field's `maxLength: 50` cap (`:155`, message `maximalAmount` en.json:61 = "Maximal: 50") and a testnet address is already **49 characters** — one prefix change away from unusable. | — | **S** |
| **Address book · empty** | `src/app/templates/AddressBook.tsx:67-70` | **B** | **Empty and no-search-results are the same string.** `:69` renders `noContactsFound` = "No contacts found" (en.json:255) for both, so a brand-new user with zero contacts gets a *search-failure* message under a search box they never typed into. Split the branch on `allContacts.length === 0` vs `filteredContacts.length === 0`. Note the inconsistency the mock highlights: the send-flow sheet gets a real icon-and-description empty state (`AccountsList.tsx:43-49`), this one gets a bare centred line of grey text. The unused key `addressBookDescription` = "Manage your contacts here" already sits at en.json:216, rendered by nothing. | Reuse the new `noContactsYet` keys from *Contacts · picker, empty* — one pair serves both | **S** |

---

## Shared primitives — the part that sets the build order

These are not per-screen. Each row lists the screens it unblocks **within this 31-screen slice**;
several also reach screens owned by other flows, noted where it matters.

| # | Primitive | File | Change | Screens fixed |
|--:|---|---|---|---|
| **P1** | `getTokenPrice` / `DEFAULT_PRICE` | `src/lib/prices/binance.ts:21`, `:84-85` | Stop returning `$1` for an unknown symbol. Signature change with **4 call sites**: `AssetRow.tsx:26`, `Balance.tsx:23`, `TokenDetail.tsx:55`, and `SelectToken` transitively. | **Home · unpriced asset · Home / Overview · Token detail · Token detail · price unavailable · Send · token picker** (5) — plus `Token detail · unknown token` and `Token detail · zero balance` in the Receive slice |
| **P2** | `BalanceCard` | `src/components/ui/BalanceCard.tsx:104-195` | (a) callers actually pass `state`; (b) new slots: sparkline, label-row control (eye), footnote line (`bnote`), timestamp suffix on the label; (c) de-hardcode `#A8BBA3` `:120`, `#FFFFFF4D` `:169`, `#F6F4F261` `:187`; (d) skeleton geometry `:135` matches the real amount box. | **Home / Overview · first run · loading · balance hidden · unpriced asset · offline · node unreachable · notes to claim · Accounts · list · Account sheet** (10) — the single highest-leverage component in the slice |
| **P3** | `AssetListItem` (+ `AssetRow`) | `src/components/ui/AssetListItem.tsx:24-76`, `src/components/AssetRow.tsx:24-52` | Loading (skeleton) variant, masked variant, `No price` / `—` variant, drop the row sparkline (`AssetRow.tsx:45`), fix `role="button"` with no `tabIndex`/keydown (`:51`). | **Home / Overview · loading · balance hidden · unpriced asset · Send · token picker** (5) |
| **P4** | Error treatment + field a11y | `src/screens/send-flow/SelectRecipient.tsx:63-77`, `src/components/AmountInput.tsx:74-94`, `src/app/atoms/FormField.tsx` | One `.fld.err` + `.hint` treatment on `--neg` (shipped `text-red-500` measures 3.64:1); add `role="alert"` / `aria-live` / `aria-invalid` everywhere an error renders. | **Send · recipient, invalid · Send · amount · Address book · duplicate · Send · recipient** (4) — plus every onboarding error screen |
| **P5** | `Drawer` (vaul) | `src/lib/ui/drawer.tsx` | Scrim `bg-black/30` light is **below the 40–60% floor** in COMPONENTS.md → `/40`; `hideHandle` defaults to `true` while every mock shows a handle; `max-h-[80vh]` vs the address book's 90%; add a bottom action zone with `max(16px, env(safe-area-inset-bottom))`. | **Send · token picker · Contacts · picker · Contacts · picker, empty · Address book · Address book · duplicate · Address book · empty · Accounts · list · Account sheet** (8) — and every sheet in the other flows |
| **P6** | `Button` | `src/components/Button.tsx:28-61`, `:118-132` | `Ghost` carries `border border-border-button` (`:60`) — the no-outlined-buttons rule kills it. Fixed `max-w-92.5 h-14` (`:122`) vs the spec's full-width 52px CTA in a fixed bottom zone. `bg-primary-500` primary + `text-pure-white` (`:33-35`) → `--accent` / `--on-accent`. | Every screen with a CTA — **19 of the 31** |
| **P7** | `PromptCard` | `src/components/ui/PromptCard.tsx:19-58` | **`variant` is declared in the interface (`:13`) and never destructured (`:19`)** — `variant="warning"` renders identically to default today. Add the variant styling, plus a CTA-button slot (currently only dismiss-`×` or chevron, `:33-43`). | **Home · offline · node unreachable · notes to claim · Home / Overview** (4) |
| **P8** | `ConnectivityIssueBanner` | `src/components/ConnectivityIssueBanner.tsx:84-145` | Restyle to the prompt-card surface, de-hardcode `#FEA644`/`#5b8def`/`#9ca3af`, fix the inert non-extension `onRetry` (`:93-99`), and hoist the mount out of `Explore.tsx:141`. | **Home · offline · node unreachable** (2) — plus `Activity · offline` in Global states |
| **P9** | `CardItem` ← `ListItem` | `src/components/CardItem.tsx`, `src/components/ListItem.tsx` | The COMPONENTS.md **MERGE**. Also: initials/colour-plate avatar mode (both mocks use it), a badge slot on `--status-*` instead of the hardcoded `#CC5200`/`#FFF3EB` (`AccountsList.tsx:61`). | **Contacts · picker · Address book · Send · recipient** (3) |
| **P10** | `CopyButton` | `src/app/atoms/CopyButton.tsx:36-49` | Confirmation is a **tippy tooltip on `mouseenter`** (`:38-48`) — invisible on touch, i.e. two of three targets. Replace with the toast used elsewhere. Then `TokenDetail.tsx:241`'s raw `navigator.clipboard.writeText` has somewhere to go. | **Home / Overview · Token detail · Token detail · price unavailable · Account sheet** (4) |
| **P11** | `EmptyState` | `src/components/EmptyState.tsx:13-31` | No action slot; `text-text-muted` description; no `className` on the icon plate. | **Contacts · picker, empty · Home · first run · Send · token picker · Address book · empty** (4) |
| **P12** | Address truncation | `src/utils/string.ts` (`truncateAddress`) | Call sites disagree: `truncateAddress(address, false, 8)` (`Explore.tsx:186`), `(id)` (`AccountsList.tsx:56`), `(address, true, 12)` (`AddressBook.tsx:75`), `(a, true, 6, 4, 4)` (`receipt.ts:39`), `(a, false, 8, 8)` (`SendSuccess.tsx:30`), untruncated (`ReviewTransaction.tsx:206`). One rule, per SPEC.md. | **Home / Overview · Send · review · Send · success · Contacts · picker · Address book · Account sheet** (6) |
| **P13** | Container vertical rhythm | `src/app/pages/Explore.tsx:145`, `src/screens/send-flow/*` page shells | COMPONENTS.md measured Home at 0/0/20/10/10/0 and prescribes `--stack-tight 8 / --stack 12 / --stack-loose 24` **owned by the container**. `Explore.tsx:145` is `gap-3` (12px) uniformly — the tiers do not exist. | All 12 Home screens + the 6 full-page Send screens (**18**) |

---

## Suggested order

**Wave 0 — must land first, blocks measurement (0.5–1 day).**
P12 truncation rule and P13 rhythm tiers. Both are mechanical, both change every screen's diff, and
doing them after the per-screen work means touching every file twice. P4 (error treatment + a11y)
belongs here too: it is one CSS decision plus three attribute additions, and four screens in this
slice plus the whole onboarding flow depend on it.

**Wave 1 — the two primitives that unlock everything else (1.5–2 days, parallelisable).**
P2 `BalanceCard` and P6 `Button` on one track; P5 `Drawer` and P11 `EmptyState` on another; P1
`getTokenPrice` on a third. P1 is the only one that touches business logic, so it should be its own
commit with its 4 call sites updated together — a partial migration leaves Home and Token detail
disagreeing about what an unknown price means. P2 and P1 do not conflict (different files) but P2's
footnote slot is consumed by P1's output, so land P2 first or stub the slot.

**Wave 2 — the states that are one prop away (1 day, high parallelism).**
`Home · first run`, `Home · loading`, `Home · balance hidden` all become small once P2 ships — they
are `state=` plumbing plus P3's row variants. Do P3 immediately after P2 and these three land
together. `Send · review`, `Send · in progress`, `Send · success`, `Send · amount`, `Send ·
recipient, invalid`, `Send · token picker`, `Address book · empty`, `Address book · duplicate` are
all S and mutually independent — hand them out in parallel.

**Wave 3 — the fixes with a behavioural edge (1.5 days).**
`Home · unpriced asset` + `Token detail · price unavailable` in one commit (same root cause).
`Home · offline` + `Home · node unreachable` after P7/P8, but **the send gate on node-unreachable
needs a product answer before it is scheduled** — ship the banner restyle and hold the gate.
`Contacts · picker` + `Contacts · picker, empty` after P9. `Home · notes to claim` after P7's CTA
slot.

**Wave 4 — the genuinely new builds (2–3 days).**
`Send · recipient` is the big one and should be split: the labelled field (Wave 2, S) is separable
from Paste (S), Scan (M, mobile-only, carries two prefix bugs), and Recents (M, new data source).
Do not schedule it as one ticket. `Send · recipient, unsupported` is the best value of the four
detection states — pure frontend, no backend. `Send · recipient, new address` and `typing` follow
the recents source. `Address book` (the full Gen-1 teardown) sits here.

**Deferred — do not schedule as UI work.**
`Accounts · list`, `Account sheet`, `Send · other chain`, `Send · network`. Two need product
decisions, one needs a storage-schema change, two need bridge capability that does not exist. They
are on the same board as everything else in the mock, and that is the scheduling hazard.

---

## Class and size roll-up

**Class:** A 1 · A/B 1 · **B 14** · **C 7** · D 3 · D/E 1 · **E 3** · multi (B+C+D) 1 — total 31.
Two thirds of the slice is B or C: components that already render the state or already contain the
variant. Only 4 screens (D/E) require something the codebase cannot express today.

| Size | Screens |
|---|---|
| **S** (10) | Token detail · price unavailable · Send · recipient, invalid · Send · amount · Send · token picker · Send · review · Send · in progress · Send · success · Contacts · picker, empty · Address book · duplicate · Address book · empty |
| **M** (13) | Home / Overview · Home · first run · Home · loading · Home · balance hidden · Home · unpriced asset · Home · offline · Home · notes to claim · Token detail · Send · recipient, new address · Send · recipient, unsupported · Send · recipient, typing · Send · scan · Contacts · picker |
| **L** (8) | Home · node unreachable · Accounts · list · Account sheet · Send · recipient · Send · recipient, other network · Send · other chain · Send · network · Address book |

**Honest note on the L's.** Only two are L because of UI volume: `Send · recipient` (four separable
sub-builds) and `Address book` (a Gen-1 form teardown plus a missing `editContact` mutation). The
other six are L because of a dependency, and their *pixel* work is S–M:

- `Home · node unreachable` — the banner is a 1-hour restyle; the "sending is unavailable" **gate**
  is a behaviour change nothing in the send flow currently implements.
- `Accounts · list` — the backend (`updateCurrentAccount`, `createAccount`) is ready and unused; the
  blocker is that multi-account has never been decided as a shipping feature, and the mock does not
  draw the create-account flow it implies.
- `Account sheet` — blocked on a **storage-schema change**: card colour is one global localStorage
  key (`lib/settings/card-color.ts:16-30`), and it also has no entry point until Accounts · list ships.
- `Send · recipient, other network`, `Send · other chain`, `Send · network` — blocked on bridge
  capability, a chain registry, chain assets and ~10 i18n keys. Zero of it exists; `grep -rnwE
  'evm|EVM' src/` returns nothing and no chain name appears in `en.json`.

---

## Things that make a screen harder than it looks

1. **`Home · first run` cannot key off an empty array.** `balance.ts:31-44` `buildDefaultZeroBalance()`
   injects a synthetic 0.00 MIDEN row once the native asset id is cached, so the list is usually
   length-1 on a fresh wallet. The empty branch must test "all balances zero".
2. **`getTokenPrice` is a 4-call-site signature change, not a one-liner.** `Balance.tsx` sums it,
   `AssetRow` renders it, `TokenDetail` renders it twice (price and chart). Half-migrating it makes
   Home and Token detail disagree.
3. **`PromptCard.variant` is dead code.** Declared at `:13`, never destructured at `:19` — the two
   connectivity mocks assume a `warn` treatment that currently renders as default. Any review that
   compares them side by side will look correct and be wrong.
4. **The connectivity retry is inert on 2 of 3 targets.** `ConnectivityIssueBanner.tsx:93-99` returns
   early unless `isExtension()`. Restyling it makes a dead button prettier.
5. **The QR scanner has two prefix bugs that only fire at mainnet.** `utils/miden.ts:5` `mm1` vs
   `format.ts:58` `startsWith('m1')` — a valid mainnet QR is rejected, invisibly, until launch day.
6. **`Address book` has no edit path at any layer.** `address-book.ts:38-42` exports add/remove/get.
   The mock does not draw edit either, but "fix a typo" = delete and retype is a real product gap.
7. **Two contact lists disagree on ordering.** `SendManager.tsx:88-107` puts own accounts first;
   `use-filtered-contacts.hook.ts:34` puts external first. Same data, two screens, opposite order.
8. **`Home / Overview` has an always-on search box the mocks omit.** `Explore.tsx:204`. Its removal
   is implied by six Home mocks and stated by none — get it confirmed rather than inferred.
9. **The mock rationale for `Send · recipient` cites stale numbers.** It says "32px mono placeholder";
   shipped is `text-[40px] font-heading` (`SelectRecipient.tsx:65`). The defect (placeholder-as-label,
   louder than the page heading at `text-2xl`, `:55`) is real; the measurements are not current.
10. **The mock rationale for `Address book` says "no confirmation" on row-tap delete.** There *is* a
    `confirm()` dialog (`AddressBook.tsx:23-37`). The defect is that the whole row is the delete
    trigger with no trash/swipe/menu affordance — narrower than the note claims, still worth fixing.


<!-- ===== impl-receive-activity ===== -->

# Implementation worklist — Receive · Swap · Activity · Earn

Scope: 35 design-system screens mapped to the shipped component that must change.
Source of truth for the mocks: `design-system/index.html` (line ranges cited per row).
Every `file:line` below was opened and verified against
`/Users/bs/Develop/Miden/Projects/worktrees/earn-integration/src/` on this worktree.
Where the design-system rationale cited a line that has since drifted, the corrected
range is given and flagged.

**Class key**

| Class | Meaning |
|---|---|
| **A · Restyle** | Component already renders this state correctly; tokens/type/spacing/radius only |
| **B · Restyle + fix** | Renders this state, but the mock corrects a real defect (copy, contrast, <44pt target, colour-only status, missing label) |
| **C · New state** | Component exists; this state never renders. A branch must be added |
| **D · New screen** | No component renders this at all |
| **E · Blocked** | Needs a route, backend, i18n key, or SDK capability before any UI work |

**Counting note.** The brief lists "Pending notes" under Receive (making Receive 14 and
Activity 12). `design-system/SCREENS.md` files the bare **Pending notes** screen under
*Activity flow* (#91). Rows below follow the brief's grouping. Total is 35 either way.

---

## Receive flow (14 rows)

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by |
|---|---|---|---|---|
| **Receive** <br><sub>mock `index.html:4484–4496`</sub> | `src/app/pages/Receive.tsx:17–35` · `src/app/pages/Receive/AddressTab.tsx:84–125` | **B** | Shipped renders QR → a full-width `CopyButton` pill (`:99–106`) → a **2.5rem** text link reading "Share" (`:109–112`). Replace the 2.5rem link with a standard full-width `btn-primary` "Share address"; add the `Your Miden address` label above the address row; add the inline wrong-network notice ("Only send Miden-network assets to this address") — **new `en.json` key**; delete the two commented-out Request / Cross-chain blocks at `:113–120`. The `text-[2.5rem]` on a control is the type-scale defect the restyle corrects. | New i18n key only (not a blocker) |
| **Receive · address copied** <br><sub>`index.html:4312–4324`</sub> | `src/app/atoms/CopyButton.tsx:36–51` · `src/app/pages/Receive/AddressTab.tsx:99–106` · `src/lib/ui/useCopyToClipboard.ts:27–40` | **C** | Confirmation exists **only** as a Tippy tooltip with `trigger: 'mouseenter'` (`CopyButton.tsx:40`) — never fires on touch. Add a `done` visual state to `CopyButton` driven by the `copied` flag it already destructures at `:36` (2s auto-reset already lives in `useCopyToClipboard.ts:11–25`), plus a toast naming *what* was copied. Fix the tooltip copy: it reads `copiedHash` / `copyHashToClipboard` (`en.json:13–14`) — hash strings, on an address. | Correctness fix ships in the same PR (see #1 below) |
| **Receive · share failed** <br><sub>`index.html:4325–4337`</sub> | `src/app/pages/Receive/AddressTab.tsx:43–82` (catch at `:78–80`, silent `copy()` at `:81`) | **C** | No failure branch exists. Split the single catch into *user cancelled* (stay silent) vs *share unavailable / threw* (render the notice + "Try again"). Today all three outcomes are identical and invisible, and the fallback `copy()` writes the user's address to the clipboard with zero feedback because `copy` was destructured at `:40` **without** `copied`. | Correctness fix #2 |
| **Receive · request an amount** <br><sub>`index.html:4338–4353`</sub> — **PROPOSAL** | *No component exists.* Payload: `src/lib/qr/format.ts:17–19` (`encodeAddress`), `:30–40` (`decodeAddress`), `:49–67` (`isValidMidenAddress`) · no route in `src/app/PageRouter.tsx` · no `en.json` strings | **E** | Encoder emits `miden:<address>` and nothing else; decoder returns the remainder **verbatim** and the validator only checks prefix + 30–100 length — so `mtst1…?amount=40` is accepted today as a valid recipient address. Version the URI format and harden `decodeAddress`/`isValidMidenAddress` **before** any screen. Until then the "Set an amount" ghost must not exist (it has already been removed from the shipped Receive mock). | Versioned QR parser + route + i18n keys |
| **Receive · loading** <br><sub>`index.html:4354–4366`</sub> | `src/components/QRCode.tsx:3` (static import), `:59–74` (inject in `useEffect`), `:76–86` (`getImageBlob`) · `src/app/pages/Receive/AddressTab.tsx:43–51, 109–112` | **C** | There is no address wait to draw — `/receive` is `onlyReady`-gated (`PageRouter.tsx:150–157`, `onlyReady` at `:316–318`) and `useAccount` throws rather than blanking (`src/lib/miden/front/ready.tsx:88–103`). The real gap is the **QR well**: first paint is a 300×300 empty white square. `QRCode` must expose a ready signal; `AddressTab` skeletons the well, labels the state, keeps the address copyable, and **disables Share** until `getImageBlob()` can resolve (today it resolves `null` and silently shares text-only). | — |
| **Pending notes** <br><sub>`index.html:4802–4812`</sub> | `src/app/pages/Pending.tsx:261–280` · `src/app/pages/Receive/PendingTab.tsx:201–249` (`PendingSummary`), `:257–293` (`AssetSummaryRow`) | **B** | Restyle the summary card + asset rows. **Real defect:** the Claim All button is `className="w-30 h-10"` (`PendingTab.tsx:237–243`) → 120×40pt, under the 44pt floor. Also put the total on the action ("Claim all · 52.50") so it states its own consequence. **Mock is stale, code is right:** the mock draws flat per-note rows; shipped groups by asset with a drill-in (`PendingTab.tsx:127–143`). Ship the shipped structure. Header string is correct (`pendingNotes`, `en.json:694`, used at `Pending.tsx:264`). | — |
| **Pending notes · loading** <br><sub>`index.html:4299–4311`</sub> | `src/app/pages/Pending.tsx:38` · `src/app/pages/Receive/PendingTab.tsx:189–199` | **C** | `useClaimableNotes` returns the full SWR result (`claimable-notes.ts:340–343` spreads `swrResult`), but `Pending.tsx:38` destructures only `{ data, mutate }`. Thread `isLoading` → `PendingTab` and branch to skeleton rows above the `groupedNotes.length === 0` check. Today the whole cold-open fetch renders "You don't currently have notes to claim." | **Correctness fix #4 must land first** — otherwise you are styling a state that is lying |
| **Pending notes · empty** <br><sub>`index.html:4367–4379`</sub> | `src/app/pages/Receive/PendingTab.tsx:189–199` (single `<p>` at `:194`) | **B** | Replace the bare centred `text-sm` line with the shared empty block: title ("Nothing to claim"), body kept **verbatim** from `noNotesToClaim` (`en.json:641`), and a `btn-secondary` "Receive" — the one action a user with nothing to claim wants. Secondary, not primary: an empty queue is the resting state, not a failure. | Shared `EmptyState` primitive |
| **Pending notes · fetch failed** <br><sub>`index.html:4380–4393`</sub> | `src/app/pages/Pending.tsx:38` · `src/lib/miden/front/claimable-notes.ts:330–337` (`onError` only `console.error`s) · `src/app/pages/Receive/PendingTab.tsx:189–199` | **C** | No error state exists — a WASM panic / dropped RPC leaves `data` undefined → `safeClaimableNotes = []` → the *empty* copy renders. Thread `error` + `isValidating` from the hook through `Pending` into `PendingTab`; add an error branch that says **unknown**, not zero, names the failing call in mono, and drives Retry's busy state off `isValidating`. Three new i18n keys. | Correctness fix #4 |
| **Pending notes · claiming** <br><sub>`index.html:4394–4406`</sub> | `src/app/pages/Receive/PendingTab.tsx:235–245` (Claim All gated on `unclaimedNotesCount > 0`), `:514–524` (empty `<div data-testid="claim-spinner" className="w-18 h-7.5" />` at `:523`), `:288` (bare `{claimingCount}/{notes.length}`), `:500` (`SyncWaveBackground`) | **B** | Three sites show in-flight by *removing* things. (1) Keep the action **present and disabled** ("Claiming…") instead of unmounting it — change the `:235` gate to render-disabled. (2) Replace the empty spinner box at `:523` with a labelled in-flight row using `transactionStageClaiming` = "Claiming note" (`en.json:93`, already exists). (3) Attach a word to the `:288` fraction. In-flight amounts drop the positive green — nothing has arrived yet. | Two shipped behaviours must be flagged in the PR: extension never clears `claimingNoteIds` (`Pending.tsx:233–236`) so a stalled SW spins forever; mobile `navigate('/')` on success (`Pending.tsx:228–230`) yanks the user off-screen |
| **Pending notes · claim failed** <br><sub>`index.html:4407–4418`</sub> | `src/app/pages/Receive/PendingTab.tsx:436–437` (`hasError`), `:469` + `:482` (`setError(t('failedToClaimNote'))`), `:520` (the **only** `hasError` reader) · `:146–153` + `:157–164` (`PendingSummary` props omit `failedNoteIds`) | **C** | The failure string is set and **never rendered anywhere**. `hasError` is used at exactly one site, to flip a button title Claim→Retry. Add: a status-toned prompt card above the list, a per-row "Failed · not claimed" label (never colour-only), and pass `failedNoteIds` into `PendingSummary` so a Claim-All that fails on every note isn't zero pixels of feedback. Delete the dead key `errorClaiming` (`en.json:566`, **verified: zero callers in `src/`**) rather than reviving it. | Correctness fix #5 (`Pending.tsx:186` clears the record on the next batch) |
| **Token detail · loading** <br><sub>`index.html:4419–4444`</sub> | `src/app/pages/TokenDetail.tsx:48`, `:51–54`, `:69`, `:74–83` | **C** | `{ data: balances }` discards `isLoading`. On a cold open `token` is undefined → `symbol = t('unknown')` = "Unknown" (`:53`, `en.json:519`) becomes the **header title** (`:69`) and the `TokenLogo` key, and `balance` falls back to `0` (`:54`) rendering `0.00` / `$0.00` (`:78`, `:81`). Add a loading branch: skeletons in the exact final geometry, header falls back to the route's own `tokenId` (known with certainty), Send held. | Correctness fix #6 |
| **Token detail · zero balance** <br><sub>`index.html:4445–4466`</sub> | `src/app/pages/TokenDetail.tsx:86–101` (both actions unconditional), `:78` (`balance.toFixed(2)`), `:56` (`fiatValue`) | **C** | Add a zero branch: **remove** Send (don't grey it — a disabled `tkact` puts a white glyph below icon-contrast, and there is nothing to send), and repurpose the fiat line, which at zero is information-free by construction (`fiatValue = balance * price` is `0` for every token, priced or not). | **Correctness fix #7** — `balance.toFixed(2)` is the only formatter on the hero, so any holding below 0.005 renders as `0.00` with Send still live. The zero state cannot be trusted until that lands |
| **Token detail · unknown token** <br><sub>`index.html:4467–4483`</sub> | `src/app/PageRouter.tsx:174–181` (**corrected** — the rationale cites `:178–185`) · `src/app/pages/TokenDetail.tsx:51–53`, `:88`, `:137`, `:150–162` · `src/components/TokenLogo.tsx` · `src/lib/prices/binance.ts:21`, `:84–86`, `:128–129`, `:151–159` | **C** | `/token-detail/:tokenId` accepts any id and has no not-found branch. Add one: state the id in mono (the only true thing on the screen), drop **both** actions (Send currently deep-links the garbage id onward at `:88`), keep the contract row so the id is copyable. Also stops the fabricated price section — `getTokenPrice` falls through to `DEFAULT_PRICE = { price: 1 }` and `fetchKlineData` returns `[]`, which `:137` swaps for `FLAT_LINE_DATA` (`:30`, ten points of constant 1), so today it draws a clean flat chart under `$1.000` and a green `+0.0%`. | Correctness fix #8 |

---

## Swap flow (6 rows)

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by |
|---|---|---|---|---|
| **Swap** <br><sub>`index.html:4577–4593`</sub> | `src/screens/swap-flow/SwapAmounts.tsx:66–135` · `src/screens/send-flow/SelectAmount.tsx` (`embedded` mode) · `src/components/AmountInput.tsx:66–100` | **B** | Structure already matches the mock (two stacked amount blocks, direction pill straddling them). Restyle to tokens. **One addition:** the mock carries a persistent `Rate 1 MIDEN ≈ 10.30 USDC` row; shipped has no rate on this screen — `statusMessage` (`SwapManager.tsx:250–257`) only emits same-token / price-unavailable / fetching-price. Add the resting rate line, reusing `formatRate` already written in `ReviewSwap.tsx:22–33`. | — |
| **Swap · fetching price** <br><sub>`index.html:4565–4576`</sub> | `src/screens/swap-flow/SwapManager.tsx:250–257` · `src/screens/swap-flow/SwapAmounts.tsx:117–121` | **A** | Pure restyle — the state is correctly wired and is the only quote feedback that exists. | Separate item, not this row: `PRICE_FEED_BASE_URL` is a hardcoded devnet host (`src/lib/miden/swap/tokens.ts:82–85`, marked TODO), so on any other network every quote fails into a permanent "Price unavailable" with no explanation that swap simply does not work there |
| **Swap · insufficient balance** <br><sub>`index.html:4553–4564`</sub> | `src/screens/swap-flow/SwapAmounts.tsx:62–64` · `src/components/AmountInput.tsx:75` (red digits), `:91–94` (error row) | **B** | Restyle + **a11y fix**: `AmountInput` has **no `aria-invalid` and no `aria-describedby`** (verified — zero `aria-` attributes in the file), so the error row is a visual sibling a screen reader never connects to the field. Wire both. Second gap, product not visual: there is **no Max or Half shortcut anywhere in the repo** (grep for `Max`/`handleMax` in `src/screens` + `src/components` returns nothing), so the only way to swap everything is to type it. | — |
| **Swap · review** <br><sub>`index.html:4534–4552`</sub> | `src/screens/swap-flow/ReviewSwap.tsx:102–118` (esp. `:110`, `:111–115`) · `src/components/review/ReviewLayout.tsx:38–81` · `src/components/review/ReviewRow.tsx:41–63` | **B** | Restyle + fix: `<ReviewRow label={t('rate')} value={rate} />` at `:110` is unconditional, and `ReviewRow` renders `{children ?? value}` — so when `formatRate` returns `undefined` the user gets a **label pill with an empty value block**, and the 5% solver-fee note disappears with it (`:111` gates on `rate`). Gate the row, keep the fee disclosure. Also: the screen has **no header at all** (`ReviewLayout` documents "There is no screen header" at `:30–37`) while `reviewSwapDetails` = "Review Swap Details" sits unused at `en.json:228` (verified: zero callers). No minimum-received. | — |
| **Swap · review, submitting** <br><sub>`index.html:4515–4533`</sub> | `src/components/review/ReviewLayout.tsx:8–15` (`ReviewAction` has no `disabled`/`isLoading`), `:61–68` · `src/screens/swap-flow/SwapManager.tsx:193–194`, `:203` · `src/screens/swap-flow/ReviewSwap.tsx:107` | **C** | `SwapManager` sets `submitting` at `:203` and guards re-entry at `:194`, but **nothing is passed down**: `ReviewSwap` has no `submitting` prop and `ReviewLayout.ReviewAction` has no field for it — even though `Button` already supports `isLoading` and renders a `<Loader>` (`src/components/Button.tsx:23`, `:100`). Add `disabled`/`isLoading` to `ReviewAction`, thread `submitting` through. Today: tap Swap → biometric prompt → `initiateSwapTransaction` → **nothing on screen changes**, repeat taps silently swallowed. | — |
| **Swap · success** <br><sub>`index.html:4501–4514`</sub> | `src/screens/generating-transaction/success/SwapSuccess.tsx` · `.../TransactionSuccessLayout.tsx` · `.../receipt.ts` | **A** | Pure restyle. The copy is already the honest version ("Swap Order Created!", funds stay reserved until filled) and the component explicitly refuses to fabricate an expiry (`SwapSuccess.tsx:24–27`). Appears after `SUCCESS_RECEIPT_DELAY_MS` = 1500 (`src/screens/generating-transaction/constants.ts:2`). | — |

---

## Activity flow (12 rows)

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by |
|---|---|---|---|---|
| **Activity** <br><sub>`index.html:4598–4613`</sub> | `src/app/pages/AllHistory.tsx:44–106` · `src/app/templates/history/HistoryView.tsx:194–239` · `src/components/ui/ActivityRow.tsx:66–127` | **B** | Restyle + three defects. (1) Inactive filter chips are **outlined** — `border border-rule-strong` (`AllHistory.tsx:79`) — against the no-bordered-controls rule; draw them filled. (2) Status label is `text-[10px]` (`ActivityRow.tsx:117`), under the 11pt floor. (3) The row is a `<div role="button">` (`:82–84`), not a real button. Date headers also diverge: the mock uses `TODAY`/`YESTERDAY` caption-case, shipped `DateSeparator` (`HistoryView.tsx:40–50`) renders `July 24, 2026` + weekday at 16px extrabold — pick one and make it the primitive. The failed row's "Not sent" value copy is **new** and unreachable until fix #9. | — |
| **Activity · empty** <br><sub>`index.html:4633–4646`</sub> | `src/app/templates/history/HistoryView.tsx:156–173` (two *different* empty renderings, `:158–165` and `:166–172`) · `src/app/pages/AllHistory.tsx:66–90` | **B** | Copy stays verbatim (`noOperationsFound`, `en.json:169`) but the state gets a title and the one action that resolves it. Collapse the two empty renderings into the shared block. **Plumbing:** the filter chips and search live *outside* `History` (`AllHistory.tsx:66–90`), so four filters and a search box stay mounted over an empty list — `History` must surface an `isEmpty` signal up to `AllHistory` to hide them, and restore them the moment there is a row to filter. | Shared `EmptyState` primitive |
| **Activity · loading** <br><sub>`index.html:4647–4661`</sub> | `src/app/templates/history/HistoryView.tsx:157` (`<ActivitySpinner />`) · `src/app/templates/history/History.tsx:35–44`, `:46–55` | **B** (+ C sub-part) | Replace the single 21px spinner with skeletons in row geometry ("a list is coming, this wide"); chips and search stay live. **C sub-part:** both history SWRs set `keepPreviousData: true` (`History.tsx:42`, `:53`), so every refetch after the first — the 10s poll, an account switch, a filter change — keeps stale rows on screen with **no indication at all**. That needs a new stale/refreshing affordance, which does not exist. | — |
| **Activity · Sent, no matches** <br><sub>`index.html:4662–4677`</sub> | `src/app/templates/history/History.tsx:94–115` (client-side filter) · `src/app/templates/history/HistoryView.tsx:150` (`noEntries = entries.length === 0`) | **C** | Filtering happens after the fetch, then everything collapses to one boolean — so filtering to **Sent** with no sends prints "You don't currently have any transactions." over a wallet holding 43 of them. Search behaves identically. Add a distinct branch: name the active filter, state the real unfiltered total, put "Show all" in the block. **Plumbing:** `History` must pass the pre-filter count and the active filter down to `HistoryView`. | — |
| **Activity · failed transactions** <br><sub>`index.html:4678–4692`</sub> | `src/app/templates/history/History.tsx:140` · `src/lib/miden/transaction/get.ts:50–56` (`includeFailed = false`), `:57`, `:14–17` · `src/app/templates/history/HistoryView.tsx:58`, `:71–73`, `:119–121` · `src/lib/miden/transaction/cancel.ts:35` | **C** | The app cannot draw this screen at all — `History.tsx:140` is the **only non-test caller** of `getCompletedTransactions` and passes `includeFailed = false`, and `getUncompletedTransactions` returns only Queued + GeneratingTransaction, so a Failed row is reachable from no list in the product. Every downstream branch (`HistoryView.tsx:58`, `:71–73`, `:119–121`) is dead code. Once the flag flips: **keep the type glyph** — `:71–73` swaps it for a red cross, discarding the one fact the row still knows — and **put the reason on the row** from `dbTx.error`, which `cancelTransaction` already writes (`cancel.ts:35`) from three producers (TTL expiry `:69`, the `MAX_WAIT_BEFORE_CANCEL` sweep `:58`, the thrown error itself) and nothing reads back. | **Correctness fix #9** (one-line) **plus** an `error` field on `IHistoryEntry` (fix #12) |
| **Activity · in progress** <br><sub>`index.html:4693–4708`</sub> | `src/app/templates/history/History.tsx:56–68` (cancel closure), `:72`, `:185` (`secondaryMessage`), `:215` · `src/app/templates/history/HistoryItem.tsx:86–96` · `src/app/templates/history/HistoryView.tsx:177` · `src/app/pages/AllHistory.tsx:97` · `src/app/pages/TokenDetail.tsx:117` · `src/components/ui/ActivityRow.tsx:11–33` | **C** | Cancel is built, wired and **unreachable**: only `HistoryItem` draws it, `HistoryView.tsx:177` reaches `HistoryItem` only when `!fullHistory`, and both call sites pass `fullHistory={true}`. So a tx can be stuck for `MAX_WAIT_BEFORE_CANCEL` — 2 min mobile, **30 min desktop** (`cancel.ts:13`) — with no way to stop it. Add: an `IN PROGRESS` section lifted out of the date groups, a `cancel` slot on `ActivityRow`, and a per-row stage line — the stage data already exists as `secondaryMessage: formatTransactionStatus(tx.status)` (`History.tsx:185`) and `buildRowProps` simply never reads it. Lifting also fixes the direction bug: `History.tsx:72` concatenates pending **oldest-first** (`get.ts:21`) ahead of a list `mergeAndSort` orders **newest-first** (`:215`), so the list reverses partway down. | — |
| **Activity · end of list** <br><sub>`index.html:4709–4722`</sub> | `src/lib/miden/transaction/get.ts:68` · `src/app/templates/history/History.tsx:82–83`, `:87` · `src/app/defaults.tsx:5` · `src/app/templates/history/HistoryView.tsx:227–233` | **E** (+ C sub-part) | Pagination is broken three ways and none is visible — see correctness fix #10. **The honest end-of-list marker cannot be drawn until `hasMore` can go false**, which is a data-layer change. The C sub-part shippable today: `InfiniteScroll` is passed **no `loader` prop** (`HistoryView.tsx:227–233`), so the refetch draws nothing; a pending row plus a stated intent ("Loading older transactions…") is the minimum. | Correctness fix #10 |
| **Transaction detail** <br><sub>`index.html:4614–4632`</sub> | `src/app/templates/history/HistoryDetails.tsx:261–385` · `src/lib/ui/DetailCard.tsx:5–37` · `src/app/templates/history/DetailCard.tsx:28–43` (`StatusPill`) | **B** | Restyle the card + hero. **Fixes:** `StatusPill` hard-codes `bg-green-600/20` for **every** status (`:38`) so a failure renders red-on-green, and its label is `text-[10px]` (`:40`). The mock's bottom CTA pair ("View in explorer" primary / "Share receipt" ghost) is a **proposal** — shipped puts explorer links inline per row via `ExternalLinkValue` (`HistoryDetails.tsx:298–327`) and has no bottom actions and no share-receipt path (`receipt.ts` is the success-screen row builder, not a share). The invented "Network fee 0.0021" row has already been removed from this mock; `IHistoryEntry.fee` (`IHistoryEntry.ts:25`) is declared and never assigned or rendered anywhere. | Share receipt = new capability |
| **Transaction detail · failed** <br><sub>`index.html:4723–4742`</sub> | `src/app/templates/history/HistoryDetails.tsx:118–166` (builds entry without `error`), `:298` (hash row gated on `externalTxId`) · `src/app/templates/history/IHistoryEntry.ts:3–32` (no `error` field) · `src/lib/miden/db/types.ts` (`ITransaction.error`) · `src/app/templates/history/DetailCard.tsx:38`, `:40` | **C** | The reason is persisted and never read — `cancelTransaction` writes `dbTx.error` on every failure path, but `HistoryDetails` builds its entry without it and `IHistoryEntry` has no `error` field, so the one sentence explaining what happened to the money is dropped between the database and the screen. Add: a `Reason` row, a **present** Transaction row reading "Never submitted" (today `:298` hides it, and an absent row is indistinguishable from one that failed to load), and the reassurance notice. | Correctness fix #12 + the `StatusPill` fix (#11) |
| **Transaction detail · pending** <br><sub>`index.html:4743–4766`</sub> | `src/app/templates/history/HistoryDetails.tsx:127` · `src/app/templates/history/transactionUtils.ts:78–84` · `src/app/templates/history/HistoryView.tsx:214` · `src/app/templates/history/History.tsx:193` · `src/screens/generating-transaction/constants.ts:10–31` | **C** | Every row with a `txId` is tappable (`HistoryView.tsx:214`) and pending rows have one (`History.tsx:193`). `HistoryDetails.tsx:127` maps `timestamp: tx.completedAt`, undefined until completion, and `formatDate` returns the hard-coded, **untranslated** literal `'Invalid Date'` for a non-number — rendered straight into the Date row at `:295`. Relabel the row **Started** and read `initiatedAt`; keep the hash row correctly absent; carry progress with the four `TRANSACTION_STEPS` (`constants.ts:10–31`) the send screen already stamps; add Cancel here, since this is the only surface a pending tx can be opened from and `cancelTransactionById` is otherwise unreachable. | **Correctness fix #13 must land first** — the screen literally prints "Invalid Date" today |
| **Claim · in progress** <br><sub>`index.html:4767–4786`</sub> | `src/components/TransactionProgressModal.tsx:341–350` (`return null`) · `src/app/pages/Pending.tsx:189–226`, `:207–209`, `:211` | **D** | Nothing renders. `Pending.tsx:211` calls `openTransactionModal()` as the whole of its progress affordance on mobile/desktop, and `TransactionProgressModal` ends at `return null` (`:350`) — the flag now only kicks the processing loop. On extension there is not even that (`:207–209` fires `requestSWTransactionProcessing()` and returns). Build the screen from state the page **already holds and discards**: `claimingNoteIds`, `individualClaimingIds` and the per-note `txId` map at `:189–202`. Per-note rows, not one bar — `claimNotesBatch` queues one tx per note and awaits them in sequence (`:213–226`), so partial progress is the normal case. Dismissal is **Hide**, not Cancel; nothing is cancellable once queued. | Correctness fix #14 (the mobile `navigate('/')` at `:228–230` unmounts the owner) |
| **Claim · partial failure** <br><sub>`index.html:4787–4801`</sub> | `src/app/pages/Pending.tsx:196`, `:222`, `:228–230`, `:186` · `en.json:545` (`claimAllSummary`) · `src/app/pages/Receive/PendingTab.tsx:469` | **D** | The summary string exists, is translated, and has **zero callers in `src/`** (verified). The data to fill it is tracked and thrown away: `failedNoteIds` accumulates across the batch, then `Pending.tsx:229` runs `navigate('/', HistoryAction.Replace)` on mobile, unmounting the component that owns the set before anything can render it. Build the result screen: succeeded/failed counts, a NOT CLAIMED section using `failedToClaimNote` (`en.json:663`), and the load-bearing reassurance — a failed claim is not lost money; the note was never consumed and re-enters `getConsumableNotes()` on the next sync. | Correctness fix #14 |

---

## Earn flow (3 rows) — **FLAG IS OFF; ALL THREE ARE E**

`isEarnEnabled()` returns `false` at `src/lib/feature-flags.ts:29–31`. Consumers:
`src/app/layouts/HomeSwipeContainer.tsx:59` and `src/app/layouts/TabLayout.tsx:120`.

**Three facts that make every Earn row E rather than a styling task:**

1. **There is no data source.** Every Earn screen reads the static literal
   `EARN_DATA` in `src/screens/earn-flow/data.ts` — hard-coded fiat strings
   (including the typo `totalDeposited: '$4, 218.32'`), hard-coded chart series,
   hard-coded APYs. Nothing touches the wallet store, the SDK, or a network.
2. **`/earn` itself renders nothing.** `src/app/PageRouter.tsx:255–263` routes
   `/earn` to `<TabLayout><></></TabLayout>` — an empty fragment. `src/app/pages/Earn.tsx`
   is reachable **only** through the gated `HomeSwipeContainer`. The sub-routes
   (`:216–254`) do mount real components.
3. **None of it is internationalised.** Running the repo's own i18n config over the
   Earn tree reports **40 `i18next/no-literal-string` errors** (`My positions`,
   `Featured Vaults`, `Current APY`, `Total Earned Rewards`, `title="Deposit"`,
   `label="Risk"`, …). It passes CI today only because `yarn lint:i18n`
   (`package.json:61`) runs `eslint src` **without `--ext`**, so ESLint 8 lints just
   the three `.js` files under `src/` and never sees a `.tsx`. That is a broken gate,
   not a clean tree.

| Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by |
|---|---|---|---|---|
| **Earn · vaults** <br><sub>`index.html:4817–4835`</sub> | `src/app/pages/Earn.tsx:12–66` (`PositionCard` `:68–94`, `VaultRow` `:96–124`) · `src/screens/earn-flow/components.tsx:50–70` (`EarnSummaryPanel`) · `src/screens/earn-flow/data.ts` | **E** | UI work, once unblocked, is **B**: the mock's balance-hero ("Earning $500.00", `+$4.10 all time`, seigaiha pattern) is a different component from the shipped `EarnSummaryPanel`, and the mock's flat Vaults list with a Deposited/Not-deposited subtitle differs from shipped's "Current Positions" horizontal scroller + "Featured Vaults" list. **Also measured in the mock's own rationale:** with the flag on, the action bar goes to five segments and overflows the 360pt extension popup by **9.1pt** — that defect ships *with* Earn and needs the 7px→4px gap tightening below 380pt. | Real vault/position data source; ~20 i18n keys; the flag |
| **Vault detail** <br><sub>`index.html:4836–4853`</sub> | `src/screens/earn-flow/EarnVaultDetail.tsx:25–172` · route `src/app/PageRouter.tsx:232–239` | **E** | Once unblocked, **B**: shipped has the header, area chart, metric cards, `label="Risk"` / `label="Audited"` chips and a Deposit button, but **no Withdraw** — the mock's ghost "Withdraw" is a new affordance with no handler. The variable-APY / protocol-risk notice is a financial-credibility requirement and is absent from shipped. | Real APY + position data; withdraw capability; i18n; the flag |
| **Earn · deposit** <br><sub>`index.html:4854–4865`</sub> | `src/screens/earn-flow/EarnDepositAmount.tsx:18–63` (hard-coded `balance: 200`, `fiatPrice: 1` at `:21–30`) · `src/screens/earn-flow/EarnDepositReview.tsx` · routes `PageRouter.tsx:216–231` | **E** | Once unblocked, **B**: reuses `SelectAmount` so the muscle memory transfers from Send — that part is right. The mock's `Available 1,204.50 MIDEN` + **Max** chip does not exist: the balance is the literal `200` and **no Max control exists anywhere in the repo**. | Real balance wiring; a `Max` affordance on `SelectAmount` (also wanted by Swap); i18n; the flag |

---

## Shared primitives — what is not per-screen

Ordered by how many of my 35 screens each unlocks.

| # | Primitive | Where it lives / must live | Unlocks |
|--:|---|---|--:|
| P1 | **`EmptyState` block** — title + body + secondary action. Does not exist. Today there are **three mutually incompatible** empties: `HistoryView.tsx:158–165` (icon + grey line, centred), `HistoryView.tsx:166–172` (left-aligned `<h3>`), `PendingTab.tsx:189–199` (bare centred `<p>`). | new `src/components/ui/EmptyState.tsx`; consumed by `HistoryView`, `PendingTab`, `TokenDetail` | **5** — Activity · empty · Activity · Sent no matches · Pending notes · empty · Pending notes · fetch failed · Token detail · unknown token |
| P2 | **Skeleton row + hero geometry.** Does not exist — `ActivitySpinner` is the only loading affordance in the whole set. Must occupy the exact geometry the real value lands in (CLS). | new `src/components/ui/Skeleton.tsx`; consumed by `HistoryView`, `PendingTab`, `TokenDetail`, `AddressTab` | **5** — Activity · loading · Pending notes · loading · Receive · loading · Token detail · loading · Activity · end of list |
| P3 | **`ActivityRow`** — add a `cancel` slot, a reason/stage subtitle slot, real `<button>` semantics; raise the `text-[10px]` status label (`:117`) above the 11pt floor. | `src/components/ui/ActivityRow.tsx:11–33`, `:108–124` | **5** — Activity · Activity · failed transactions · Activity · in progress · Activity · end of list · (+ the history list embedded in Token detail via `TokenDetail.tsx:114–119`) |
| P4 | **Inline `notice` banner** — tone-able (info / warn / positive), icon + text. No shared component; every instance today is ad hoc (e.g. the fee note is a raw `<p>` at `ReviewSwap.tsx:112`). | new `src/components/ui/Notice.tsx` | **6** — Receive · Receive · loading · Receive · share failed · Transaction detail · failed · Claim · partial failure · Swap · review |
| P5 | **`DetailCard` / `DetailRow` / `StatusPill`.** One edit to `StatusPill` (`src/app/templates/history/DetailCard.tsx:38` `bg-green-600/20` → tone-derived; `:40` `text-[10px]` → ≥11pt) corrects three screens at once. `DetailRow` needs a `vsub` sub-value slot for "Queued 09:41, gave up 10:11". | `src/lib/ui/DetailCard.tsx:5–37` · `src/app/templates/history/DetailCard.tsx:28–43` | **4** — Transaction detail · Transaction detail · failed · Transaction detail · pending · (Token detail info card) |
| P6 | **Status-toned prompt card** (`mprompt` — title + body + inline CTA, `data-status`). Does not exist. | new `src/components/ui/Prompt.tsx` | **3** — Activity · in progress · Pending notes · claim failed · (Home · notes to claim, outside this set) |
| P7 | **Copy-confirmation: `CopyButton.done` + toast.** The `copied` flag and its 2s reset already exist (`useCopyToClipboard.ts:8–25`) and are simply unused on touch. A toast provider exists (`NoteToastProvider`) but is note-arrival-only. | `src/app/atoms/CopyButton.tsx:36–51` | **2** — Receive · address copied · (Token detail's contract row, `TokenDetail.tsx:241`, copies with **no** confirmation of any kind) |
| P8 | **`ReviewLayout` busy state** — add `disabled`/`isLoading` to `ReviewAction`; `Button` already supports it (`Button.tsx:23`, `:100`). | `src/components/review/ReviewLayout.tsx:8–15`, `:61–68` | **2** — Swap · review, submitting · (Send · review, outside this set) |
| P9 | **Header consolidation.** Three families are in play across these 35 screens: `ScreenHeader` (Pending, HistoryDetails), `NavigationHeader` (TokenDetail `:69`), `TabHeader` (AllHistory `:46`), plus bespoke `<header>` blocks in every Earn screen. | `src/components/ScreenHeader.tsx` as canonical | Touches **all 35** — do it as a `COMPONENTS.md` migration, not per-screen |
| P10 | **Date-group separator.** Mock says `TODAY` / `YESTERDAY` caption-case; shipped renders `July 24, 2026` + weekday at 16px extrabold (`HistoryView.tsx:40–50`). Pick one before restyling any Activity screen. | `src/app/templates/history/HistoryView.tsx:40–50` | **4** Activity screens |

---

## Correctness fixes, not restyles

Different PRs, different reviewers. Each is the **smallest safe** change; none of them
should carry a token or a class name.

| # | Defect | file:line | Smallest safe fix |
|--:|---|---|---|
| 1 | Address copy has no touch confirmation; tooltip copy is about hashes | `src/app/atoms/CopyButton.tsx:36–51` (`trigger: 'mouseenter'`, `copiedHash`/`copyHashToClipboard` at `en.json:13–14`) | Render the `copied` state in the layout rather than a hover layer; swap the two keys for address-specific strings. No behaviour change to `copy()`. |
| 2 | Share failure, no-share-target and user-cancel are indistinguishable, and the fallback writes the address to the clipboard invisibly | `src/app/pages/Receive/AddressTab.tsx:78–81` (one `catch`, silent `copy()`), `:40` (`copy` destructured without `copied`) | Narrow the catch: re-throw / no-op on `AbortError` (cancel), surface the rest. Destructure `copied` so the fallback paints. |
| 3 | Share button is live before the QR exists; `getImageBlob()` resolves `null` and silently shares text-only | `src/components/QRCode.tsx:59–74` · `src/app/pages/Receive/AddressTab.tsx:43–51` | Expose a ready flag from `QRCode`; disable Share until it is true. |
| 4 | **`isLoading` and `error` are discarded, so the empty state doubles as both loading and error** — the screen tells the user their claim queue is empty by failing to look | `src/app/pages/Pending.tsx:38` (`{ data, mutate }` only; the hook returns the whole SWR result at `claimable-notes.ts:340–343`) · `onError` only `console.error`s at `:330–337` | Destructure `isLoading`, `isValidating`, `error` and pass them to `PendingTab`. Two extra props; no logic change. |
| 5 | Failed-claim record is wiped by the next batch, and `PendingSummary` never receives it | `src/app/pages/Pending.tsx:186` (`setFailedNoteIds(new Set())`) · `src/app/pages/Receive/PendingTab.tsx:146–153`, `:157–164` | Clear per-batch rather than globally; add `failedNoteIds` to `PendingSummaryProps` and pass it through. |
| 6 | **Opening a token you hold shows "Unknown" with a `0.00` balance** for the length of the read | `src/app/pages/TokenDetail.tsx:48` (`{ data: balances }` discards `isLoading`), `:53`, `:69` | Destructure `isLoading`; while true, do not fall back `symbol` to `t('unknown')` and do not render `0.00`. Header falls back to `tokenId`. |
| 7 | **`balance.toFixed(2)` is the only formatter on the hero**, so any holding below 0.005 renders as `0.00` with Send still live beside it | `src/app/pages/TokenDetail.tsx:78` | Format at the asset's own `decimals` via `formatBigInt`, exactly as the pending screens already do (`PendingTab.tsx:262`, `:493`). |
| 8 | **An unpriced token is valued at exactly $1.00/unit and summed into totals**; an unlisted symbol also draws a clean flat chart under a green `+0.0%` | `src/lib/prices/binance.ts:21` (`DEFAULT_PRICE = { price: 1, … }`), `:84–86` (`prices[symbol] ?? DEFAULT_PRICE`) · `src/app/pages/TokenDetail.tsx:137` (`FLAT_LINE_DATA`, `:30`) | Return `undefined` from `getTokenPrice` for an unknown symbol and let callers render "No price" / em-dash. If the `1` fallback must survive, move it behind a **per-asset** stablecoin flag, not the shared getter. Stop substituting `FLAT_LINE_DATA` for an empty series — no line ≠ a flat line. |
| 9 | **Failed transactions are reachable from no list in the product** | `src/app/templates/history/History.tsx:140` passes `includeFailed = false` (default at `get.ts:54`); this is the **only** non-test caller | Pass `true`. One argument. Everything downstream (`HistoryView.tsx:58`, `:71–73`, `:119–121`) is already written and currently dead. |
| 10 | **Pagination is broken three ways, invisibly** | (a) `src/lib/miden/transaction/get.ts:68` — `transactions.slice(offset, limit)`; `Array.slice` takes `(start, end)`. With `HISTORY_PAGE_SIZE = 1000` (`defaults.tsx:5`) and `History.tsx:82–83`, page 1 asks `slice(1000, 1000)` → `[]`, so **every page after the first is empty by construction**. (b) `get.ts:62` sorts **ascending**, so page 0 is the *oldest* thousand. (c) `History.tsx:87` tests `allRestEntries.length === 0`, but `allRestEntries = mergeAndSort(restEntries, …)` is non-empty as soon as anything has loaded, so `hasMore` **never** goes false and the sentinel refetches forever. | (a) `slice(offset, offset + limit)`. (b) sort descending, or page from the tail. (c) test the **newly fetched** page (`olderTransactions.length === 0`), not the merged accumulator. All three are one-liners; all three must land together or the fix is partial. |
| 11 | `StatusPill` renders **red text on a green wash** for every failure, and its label is under the 11pt floor | `src/app/templates/history/DetailCard.tsx:38` (`bg-green-600/20` hard-coded), `:40` (`text-[10px]`) | Derive the wash from the same `isCompleted`/`isFailed` branch that already drives `dotColor`/`textColor` at `:33–34`; raise the label to ≥11pt. |
| 12 | **The failure reason is persisted and never read** | `src/lib/miden/transaction/cancel.ts:35` writes `dbTx.error` · `src/app/templates/history/IHistoryEntry.ts:3–32` has no `error` field · `src/app/templates/history/HistoryDetails.tsx:118–166` builds the entry without it | Add `error?: string` to `IHistoryEntry`; map `tx.error` in both builders (`HistoryDetails.tsx:124–141`, `History.tsx:148–164`). Additive, no behaviour change. |
| 13 | **Opening a pending transaction prints the literal, untranslated string `"Invalid Date"`** | `src/app/templates/history/HistoryDetails.tsx:127` maps `timestamp: tx.completedAt` (undefined until completion) → `transactionUtils.ts:78–84` returns `'Invalid Date'` → rendered at `:295` | Map `timestamp: tx.completedAt ?? tx.initiatedAt` and label the row from which one was used. |
| 14 | **A successful claim-all navigates away and unmounts the component that owns the result** | `src/app/pages/Pending.tsx:228–230` (`navigate('/', HistoryAction.Replace)` on mobile) — also `PendingTab.tsx:476–478` on the single-note path | Do not navigate on completion; render the result in place. This is a prerequisite for *Claim · in progress* and *Claim · partial failure* — both are unbuildable while the owner unmounts. |
| 15 | On extension, `claimingNoteIds` is **deliberately never cleared** (`Pending.tsx:232–237`), so a claim the service worker never finishes leaves the row spinning forever with no timeout | `src/app/pages/Pending.tsx:232–237` | Add a timeout that clears the id and marks the note failed, mirroring `MAX_WAIT_BEFORE_CANCEL`. Behaviour change — needs its own review. |
| 16 | `AmountInput` has **no `aria-invalid` / `aria-describedby`**, so no error in Send or Swap is programmatically associated with its field | `src/components/AmountInput.tsx:66–100` (verified: zero `aria-` attributes) | Add both; wire `error` to a stable id. |
| 17 | Swap prices come from a **hardcoded devnet host**, so on any other network every quote fails into a permanent "Price unavailable" with no explanation that swap does not work there | `src/lib/miden/swap/tokens.ts:82–85` (marked TODO) | Move to per-network config; when no feed is configured, say *swap is unavailable on this network* rather than *price unavailable*. |
| 18 | Dead i18n keys with **zero callers in `src/`** (verified by grep) | `en.json:228` `reviewSwapDetails` · `en.json:545` `claimAllSummary` · `en.json:566` `errorClaiming` | Use the first two (they are exactly the strings the Swap-review header and Claim-partial-failure summary need). Delete `errorClaiming` — a trailing-colon prefix cannot become a sentence. |
| 19 | **`yarn lint:i18n` is a no-op.** `eslint src` without `--ext` lints only the three `.js` files under `src/`; running the same config with `--ext .ts,.tsx` over `src/screens/earn-flow` + `src/app/pages/Earn.tsx` reports **40 errors** | `package.json:61` | Add `--ext .ts,.tsx`. Expect the Earn tree to go red immediately — that is the point. |

---

## Suggested order

**Stage 0 — data-layer correctness (no pixels).** These invalidate the states above
them; restyling first means building on a screen that is lying.

1. Fix **#9** (`includeFailed`) and **#10** (pagination) together — one PR against
   `get.ts` + `History.tsx`. They are the two that make Activity states *reachable at
   all*, and #10 must land as three coordinated one-liners or not at all.
2. Fix **#4** (`isLoading`/`error` on Pending), **#6** (`isLoading` on TokenDetail).
   Same shape, same reviewer, two files.
3. Fix **#13** ("Invalid Date"), **#12** (`error` on `IHistoryEntry`), **#11**
   (`StatusPill` wash + type floor). All three land in the Transaction-detail area.
4. Fix **#14** (stop navigating away from a finished claim). Prerequisite for the two
   Claim screens.
5. Fix **#7** + **#8** (formatter + fabricated price). #8 is the largest blast radius
   of any item here — it changes Home's Total Balance — so it wants its own PR and its
   own decision about the stablecoin carve-out.

**Stage 1 — primitives.** P1 (EmptyState), P2 (Skeleton), P4 (Notice), P5 (DetailCard/
StatusPill). Four small components that between them unlock 20 of the 35 rows. Build
them before touching any screen, or you will build each one four times.

**Stage 2 — the cheap restyles**, to validate the primitives on real screens:
Swap · fetching price (A) · Swap · success (A) · Pending notes · empty (B) ·
Swap · insufficient balance (B) · Swap · review (B).

**Stage 3 — the Activity spine.** P3 (ActivityRow) + P10 (date separator), then
Activity · Activity · loading · Activity · empty · Activity · Sent no matches ·
Activity · failed transactions. Do the row before the screens.

**Stage 4 — new states on now-honest data.** Pending notes · loading / fetch failed /
claiming / claim failed · Token detail · loading / zero balance / unknown token ·
Receive · loading / address copied / share failed · Transaction detail · failed /
pending · Swap · review submitting (P8).

**Stage 5 — new screens.** P6 (Prompt card), then Activity · in progress ·
Claim · in progress · Claim · partial failure.

**Stage 6 — blocked.** Receive · request an amount (after the QR parser is versioned)
and Activity · end of list's honest marker (after #10). Earn stays untouched until the
flag, the data source and the i18n pass exist — including the 9.1pt five-segment
action-bar overflow that will ship *with* the flag flip.

**Cross-cutting, any time:** P9 (header consolidation) as a `COMPONENTS.md` migration;
fix **#19** early so the Earn i18n debt becomes visible rather than theoretical.

---

## Size per screen

| Size | Screens | Note |
|---|---|---|
| **S** | Swap · fetching price · Swap · success · Pending notes · empty · Swap · insufficient balance · Swap · review · Swap · review submitting · Activity · loading | Single component, no plumbing |
| **M** | Receive · Receive · address copied · Receive · share failed · Receive · loading · Pending notes · Pending notes · loading · Pending notes · fetch failed · Pending notes · claiming · Pending notes · claim failed · Token detail · loading · Token detail · zero balance · Token detail · unknown token · Swap · Activity · Activity · empty · Activity · Sent no matches · Activity · failed transactions · Activity · in progress · Transaction detail · Transaction detail · failed · Transaction detail · pending | One new branch plus one or two props threaded |
| **L** | Claim · in progress · Claim · partial failure | New screens; all state exists but must survive a navigation change first |
| **L — because of a dependency, not UI** | Activity · end of list *(pagination rewrite)* · Receive · request an amount *(QR parser must be versioned; today `mtst1…?amount=40` validates as an address)* · Earn · vaults · Vault detail · Earn · deposit *(no data source, no i18n, flag off)* | The drawing is an afternoon in every one of these. The dependency is the work |

---

## Screens whose mock is a proposal, not a spec of shipped behaviour

- **Receive · request an amount** — explicitly proposed. No component, no route, no
  strings, and it depends on a QR-format change that is also a security fix.
- **Transaction detail** — the bottom CTA pair ("View in explorer" primary / "Share
  receipt" ghost) is proposed. Shipped puts explorer links inline per row and has no
  share-receipt path at all.
- **Activity** — the "Not sent" value-column copy on failed rows is a proposed string,
  and the row it sits on is unreachable until fix #9.
- **Swap** — the resting `Rate 1 MIDEN ≈ 10.30 USDC` row is proposed; shipped shows a
  rate only on the review screen.
- **Vault detail** — the ghost "Withdraw" is proposed; no withdraw path exists.
- **Earn · deposit** — the `Max` chip is proposed; no `Max` control exists anywhere in
  the repo.
- **Pending notes** — inverse case, worth calling out: the **mock is stale and the code
  is right**. The mock draws flat per-note rows; shipped groups by asset with a
  drill-in, which the rationale itself concedes is the better shape. Build shipped.

## Line references corrected against the design-system rationale

| Cited in `index.html` | Actual |
|---|---|
| `PageRouter.tsx:178–185` (Token detail · unknown token) | `PageRouter.tsx:174–181` |
| `claimable-notes.ts:323–330` (Pending · fetch failed) | `claimable-notes.ts:330–337` (`onError`); `:322–329` is the surrounding SWR options block |
| `PendingTab.tsx:514–524` (empty claim spinner) | the empty `<div>` is at `:523`; the conditional runs `:514–524` — correct as a range |
| `qr/format.ts:10–20` / `:26–41` / `:50–67` | `:10` + `:17–19` / `:30–40` / `:49–67` |

Everything else cited in the four flows' rationales was verified exact.


<!-- ===== impl-settings ===== -->

# Crust implementation worklist — Settings (19) + Security & recovery (22)

Repo: `/Users/bs/Develop/Miden/Projects/worktrees/earn-integration`
Mocks: `design-system/index.html` lines 4870–5620 (`#allscreens` → *Settings & browser*, *Security & recovery*).
Every file path and line range below was opened and confirmed against the working tree. Nothing in the repo was modified.

**Headline:** this area is not a reskin. Of 41 screens, only **1** is a pure restyle. **14 are blocked** on something that is not UI — a route, a backend action, an async result, an i18n key, or a live rate feed. Another **4** are new screens. The single largest lever is that **five complete or near-complete components are simply not reachable**; wiring them costs a handful of lines and unlocks 7 screens.

---

## Class legend

| Class | Meaning |
|---|---|
| **A · Restyle** | Component already renders this state correctly; tokens/type/spacing/radius only |
| **B · Restyle + fix** | Renders this state, but the mock corrects a real defect |
| **C · New state** | Component exists; this state never renders — add a branch |
| **D · New screen** | No component exists |
| **E · Blocked** | Needs a route, backend change, i18n key, or SDK capability before any UI work |

Size is the UI implementation only. Where a screen is **E**, the size excludes the unblocking work, which is called out in *Blocked by*.

---

## Settings (19)

| # | Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by | Size |
|--:|---|---|---|---|---|:-:|
| 1 | **Settings** | `src/app/pages/Settings.tsx:358–418` (list render `377–416`), `:120–219` (`TAB_GROUPS`), `src/app/templates/MenuItem.tsx:21–93` | **B** | Rows already render grouped. Restyle to `setgroup` soft blocks, 44pt row targets, per-row icon plate + chevron. **Fix:** delete `Settings.tsx:415` — `<p>Version {pkg.version}</p>` is hard-coded English bypassing `t()` in every locale; the string moves to About (screen 39). | — | M |
| 2 | **Settings · general** | `src/app/templates/GeneralSettings.tsx:72–106`, `src/app/templates/SettingToggle.tsx:14–24`, `src/app/atoms/ToggleSwitch.tsx:48–87` | **B** | Row becomes the control at 52pt with `role="switch"` + `aria-checked`. **Fix (3 defects):** `ToggleSwitch.tsx:51` and `:81` size the container *and* the invisible `<input>` at 40×22px — half the 44pt floor on the short axis. `SettingToggle.tsx:17` wraps the row in `<label htmlFor={name}>`, but `ToggleSwitch` is only ever given `name` (spread through `{...rest}` at `:84`), never `id` — **`htmlFor` matches on `id`, so the label binds to nothing**: tapping the words does not flip the switch and the checkbox has no accessible name. `GeneralSettings.tsx:79` gates Haptic Feedback on `isMobile()`, so the extension drawer shows 2 toggles, not 3 — the mock must render both counts. | — | M |
| 3 | **Settings · general, save failed** | `src/lib/settings/helpers.ts:15–19`, `src/app/templates/GeneralSettings.tsx:47–63`, `src/app/atoms/ToggleSwitch.tsx:32,39–46` | **E** | Row-scoped negative prompt that **names the surviving value** ("Not saved — still off"), with Retry. | **The app cannot report a failed write.** `helpers.ts:15–19` wraps `localStorage.setItem` in a bare `try {} catch {}` that returns nothing and throws nothing. The visible switch position lives in `ToggleSwitch`'s own `localChecked` (`:32`, set by `checkedHandler` at `:43`), not in what was persisted; `GeneralSettings.tsx:47` and `:56` call `isDelegateProofEnabled()` / `isAutoConsumeEnabled()` synchronously at render with no `useState`, so the parent never re-renders to correct it. Needs a real result from the setter + state lifted, before any UI. (Also note `delegateChangingRef` at `:48–54` and `consumeChangingRef` at `:57–63` are set and cleared inside one synchronous callback — they can never be `true` on entry and guard nothing.) | M |
| 4 | **Settings · language** | `src/app/templates/LanguageSettings.tsx:9–23,50–69`, `src/app/pages/Settings.tsx:78–94,405` | **B** | Rows 38pt (`py-3` on a 13px line) → 44pt; selected row gets tick + weight. **Fix:** two lists disagree. The drawer offers **13** locales as endonyms (`LanguageSettings.tsx:9–23`); the settings row reads `LANGUAGE_LABELS`, which holds **9** (`Settings.tsx:78–88`) and falls back to the bare code (`:93`). Pick Polski / Українська / Türk and the row reads `pl` / `uk` / `tr`. Worse: `getCurrentLanguageLabel` splits on `[-_]` first (`:92`), so `zh_TW` and `zh_CN` both render "Chinese" — the row cannot tell you which is active. Delete `LANGUAGE_LABELS`; read the endonym off the same `LANGUAGES` array. | — | S |
| 5 | **Settings · advanced, key loading** | `src/app/pages/AdvancedSettings.tsx:50,52–67` | **C** | Add a loading branch: two-line shimmer holding the same height, copy control **absent** rather than present-and-disabled. Today `:50` renders the string `' '` (the comment above it claims a non-breaking space; it is not), so the row is blank with no signal. `:62` disables the copy button at 40% opacity, which reads as broken rather than pending. `fetchPublicKey` takes the single-threaded WASM lock (`:22`) and can queue 30–60s behind a sync. | — | S |
| 6 | **Settings · advanced, key unavailable** | `src/app/pages/AdvancedSettings.tsx:20–39,50` | **C** | Add a `warn` prompt with Retry. Requires a small data change first: `fetchPublicKey` returns `null` for **two** distinct outcomes — no such account on the node (`:25–27`) and account resolved with zero key commitments (`:29–31`) — and both land in the same `publicKey` state as the pre-fetch value, so `:50` renders the same blank forever. There is **no `catch` anywhere in `fetchPublicKey`**, so a rejected WASM call escapes the `useEffect` at `:37–39` as an unhandled rejection and `setPublicKey` is never reached — identical blank. Needs a 3-way result type. | — | M |
| 7 | **Settings · faucet ID** | `src/app/templates/EditMidenFaucetId.tsx:34–36,59–100` | **B** | Add a labelled **Current** row (copyable, mono). **Fix:** the existing faucet ID is passed as the input's `placeholder` (`:69`), so it vanishes on first keystroke and is never selectable. `useLayoutEffect` at `:34–36` focuses the field before paint, raising the iOS keyboard over an unread screen — remove. Submit stays inert until the field is dirty; shipped it is always enabled and empty submits are caught only by `required` (`:63`). | — | S |
| 8 | **Settings · faucet ID, saved** | `src/app/templates/EditMidenFaucetId.tsx:95,59–100` | **C** | Add a confirmation state: tick glyph on `--pos-wash`, the written value restated, plus the setting it governs (Auto consume). Today success is one line of `text-green-600` appended **below** the submit button (`:95`) while the form, the stale placeholder and the button all stay identical — the after-screen is indistinguishable from the before-screen apart from a green sentence under the fold. `text-green-600` is also a raw Tailwind literal outside the status token set, unverified in dark. | — | S |
| 9 | **Settings · faucet ID, rejected** | `src/app/templates/EditMidenFaucetId.tsx:38–57` | **B** | Authored error caption + a second line stating **nothing changed**, with the surviving value visible above. **Fix:** `:52` pipes `err.message` straight into the field caption — the user sees the raw SDK exception (a bech32 checksum sentence). `setFaucetIdSetting` is called with the unchecked string at `:45`; the only guard is `required` (`:63`). Add client-side validation. Remove the hand-rolled 300ms delay (`:51`) and the refocus (`:53`) that reopens the keyboard over the error just written. | — | S |
| 10 | **Settings · authorized dApps** | `src/app/templates/DAppDrawerSettings.tsx:19–24,26–28,46–79` | **B** | Show the session **count** on the "See connected" row. `:26–28` computes `hasConnectedDApps` as a boolean and discards the count; `:61` then makes the row's *absence* the only signal for zero, which reads as a missing feature. Count is already in hand. **Also fix:** `:19–24` sets `suspense: true` with **no local `<Suspense>` boundary**, so a cold fetch suspends to the app shell — the whole screen blanks, not the sheet. Toggle → row control (shared fix, see Primitives). | — | S |
| 11 | **Settings · connected dApps** | `src/app/templates/DAppSettings.tsx:16–60,64–155`, `src/lib/miden-chain/constants.ts:66–69` | **B** | Card → row. Each session is currently a bordered card carrying Origin / Network / Account / Private Data Permission plus two chips (`:94–153`) — four rows to say what one says, and Account and Network are **identical on every card** because `:32` filters to the current account and the page is already scoped to one network. Hoist both to a single caption; move revoke off the card into a labelled footer (shipped affordance is an unlabelled `×` in the card header, `:98–103`). **Three defects:** `:29` does `Object.entries(data!)` — a non-null assertion on exactly the SWR value that is `undefined` before resolve; `:23–28` sets `suspense: true` with no local boundary; `:130` hard-codes `https://testnet.midenscan.com` regardless of the session's own `network` field two rows above, even though `MIDEN_EXPLORER_ENDPOINTS` (`constants.ts:66–69`) maps devnet correctly — and has **no entry for mainnet or localnet**, so the link must degrade, not guess. | — | L |
| 12 | **Settings · connected dApps, none** | `src/app/templates/DAppSettings.tsx:51–59` | **C** | Add the empty branch: icon plate, heading, explanation, "Browse dApps". Today `:53–59` maps over `dAppEntries` and renders nothing else — zero sessions paints a bare `<div class="w-full max-w-sm mx-auto my-8">` and stops. Reachable in practice: `DAppDrawerSettings.tsx:61` gates the entry link, but `/settings/dapps` is a real `HIDDEN_TABS` route (`Settings.tsx:260–265`), so back-navigating after revoking the last session lands here. | — | S |
| 13 | **Settings · networks** | `src/app/pages/Networks.tsx:1–40`, `src/app/pages/Settings.tsx:253–259`, `src/app/templates/AdvancedSettings.tsx:39–43`, `src/lib/miden-chain/constants.ts:40,91–105` | **E** | Rewrite as Current / Switch-to groups with a header, an explanation, tick-marked active row, and Mainnet drawn present-and-unavailable. | **Unreachable and untranslated.** `Networks.tsx` imports no `useTranslation` and calls `t()` nowhere — the only strings are `item.name` off `MIDEN_NETWORKS` (`constants.ts:91–105`). It lives in `HIDDEN_TABS` only (`Settings.tsx:253–259`) and its sole link is commented out at `templates/AdvancedSettings.tsx:39–43` — a file with **zero importers** (`Settings.tsx:49` imports `./AdvancedSettings` and resolves to `pages/`). **Wiring the route is one entry in `TAB_GROUPS`; the page itself is a rewrite.** Mainnet is absent from `MIDEN_NETWORKS` though `MIDEN_NETWORK_ENDPOINTS` defines it (`constants.ts:40`, marked placeholder). Needs `devnet`, `localnet`, `mainnet` i18n keys — `en.json` has only `testnet`. | L |
| 14 | **Settings · networks, confirm switch** | new sheet over `src/app/pages/Networks.tsx:12–14`; data from `constants.ts:91–105` (`rpcBaseURL`) | **D** | New confirmation sheet: From / To / Node rows + reassurance + Switch/Cancel. Nothing like it exists — `onNetworkSelect` (`:12–14`) is declared `async` and awaits nothing; one tap calls `setNetworkId`, which writes Zustand and passive storage synchronously (`ready.tsx:28–35`) and returns. One mis-tap on a 3-row list repoints the whole wallet and the balances appear to vanish. | Depends on #13 being routed | M |
| 15 | **Settings · networks, switching** | `src/lib/miden/front/ready.tsx:24–35` | **E** | Staged progress screen: *Network saved* → *Reaching the node* → *Loading balances*, with a real Cancel. | **There is no progress to report.** `useSetNetworkId` (`:24–35`) writes the id and returns — it never probes the endpoint, so the app commits to a network it has not confirmed is reachable, and everything downstream fails separately and blames itself. Requires an async, staged `setNetworkId` with an RPC round-trip against `rpcBaseURL` before any UI. | M |
| 16 | **Settings · networks, switch failed** | `src/app/pages/Networks.tsx:12–14`, `src/lib/miden-chain/constants.ts:104` | **E** | Negative prompt naming **the network that survived**, plus Still-on / Tried rows with the failed endpoint in mono, and the selection rolled back. | Same dependency as #15 plus rollback semantics. `Networks.tsx:12–14` has no `try`, no `catch`, and no returned result to inspect — an unreachable node is indistinguishable from a healthy one. Routine on Localnet: `http://localhost:57291` (`constants.ts:104`) is down whenever the dev node is not running. | M |
| 17 | **Settings · currency** | `src/lib/fiat-curency/consts.ts:6–145`, `src/lib/fiat-curency/core.tsx:18–30,79–101,103–110`, `src/lib/store/index.ts:600–602`, `src/lib/miden/front/provider.tsx:7` | **E** | New searchable picker sheet — 23 currencies, mono 3-letter code leading, Selected / All groups. | **The data layer is complete and nothing renders it.** `consts.ts:6–145` defines 23 currencies with symbols; `core.tsx:79–101` exposes `useFiatCurrency` with a `setSelectedFiatCurrency` that writes both Zustand and persistent storage; `store/index.ts:600` holds the reducer; `FiatCurrencyProvider` is mounted at `front/provider.tsx:7`. **Verified: no file outside `src/lib/` imports any of it.** But do **not** ship the picker first: `fetchFiatCurrencies` (`core.tsx:103–110`) returns `{usd:1}` from a `// TODO`, so `useAssetFiatCurrencyPrice` returns `null` for every other code (`core.tsx:25,28`), and every fiat figure in the product is a hard-coded `$` template (e.g. `Explore.tsx:188`, `SelectAmount.tsx:103`, `HistoryDetails.tsx:72` which appends the literal `"USD"`). Selecting EUR would keep showing dollars. **Blocked on real rates.** | L |
| 18 | **Address book · no results** | `src/app/templates/AddressBook.tsx:39–43,53–64,67–83` | **B** | Split the two zero-states. `:68–69` renders one string, `noContactsFound` = "No contacts found", for both `allContacts.length === 0` and `filteredContacts.length === 0` — a user with four contacts who mistypes is told they have *none*, a claim about their data rather than their query. New state echoes the query, states the true count, offers Clear search. **Second fix:** the search input (`:53–64`) has a `placeholder` and **no `<label>` and no `aria-label`** — the placeholder disappears on first keystroke, so from that point the field has no accessible name. Add a persistent visible label; it also lets the copy say the field searches name *and* address (`:42`), which "Search" never does. | — | S |
| 19 | **Address book · edit contact** | `src/lib/miden/front/address-book.ts:13–43`, `src/app/templates/AddressBook.tsx:71–83` | **E** | New edit sheet: editable Name, read-only Address with reason, live preview row, Save + named Delete. | **No edit mutation exists.** `address-book.ts` exports `addContact` (`:13`) and `removeContact` (`:25`) and nothing else — correcting one letter today means deleting the contact and retyping a 49-character bech32 address from memory. Needs an `updateContact` keyed on address. Ships alongside the fix that `AddressBook.tsx:78` binds `onClick` of the whole `CardItem` to `handleRemoveContactClick` — **the entire row *is* the delete button**, with no trash icon, no swipe, no menu, and no hint. (The shipped list also has no way to *use* a contact — tapping cannot start a send.) | M |

---

## Security & recovery (22)

| # | Screen | Owning file(s) with line ranges | Class | What actually changes | Blocked by | Size |
|--:|---|---|---|---|---|:-:|
| 20 | **Reveal recovery phrase** | `src/app/templates/RevealSeedPhrase.tsx:116–168` | **C** | The revealed grid exists; the **blurred pre-reveal state with a hold gate does not**. Shipped, `:116–168` paints the 12 words un-blurred the instant auth succeeds, with a copy chip and `hideRecoveryPhrase`. Add a blurred branch + hold-to-reveal + warning above the words. ⚠️ **The blur/hold gate is a proposal, not a spec of shipped behaviour** — its rationale cites no source file. | — | M |
| 21 | **Recovery phrase · checking device** | `src/app/templates/RevealSeedPhrase.tsx:111–113`; identical at `src/app/templates/RevealSecret.tsx:332–334` and `src/screens/encrypted-file-flow/EncryptedWalletFileWalletPassword.tsx:136–138` | **C** | Replace `return null` with header (the only exit) + a numbered skeleton grid in the geometry the words will land in. Today the frame is **entirely blank** — no header, no spinner, no background — and the user has nothing to press to leave. **One branch fixes three screens.** | — | S |
| 22 | **Recovery phrase · passcode** | `src/app/templates/RevealSeedPhrase.tsx:185,189–238` | **A** | Tokens/type/spacing on the numpad sheet only. Copy is already verbatim (`enterYourPasscode`, `revealSecretPasscodeInputDescription`). ⚠️ Note for the implementer: `:185` picks the numpad off `isMobile()` alone while `RevealSecret.tsx:66` gates the same choice on `isMobile() && hasHardwareProtector === false` — the two reveal paths disagree about when a numpad is correct. Not fixed by this screen; worth a ticket. | — | S |
| 23 | **Recovery phrase · password** | `src/app/templates/RevealSeedPhrase.tsx:189–238` (`:226`), `src/lib/miden/front/use-secret-state.hook.ts:3` | **B** | Extension branch. **Add the auto-hide statement up front** — `useSecretState` wipes the secret after `SECRET_REVEAL_TIME` (`:3`, 20s) and nothing on the shipped screen mentions it, so the phrase vanishes mid-transcription. **Draw a Cancel** — the shipped drawer has only Continue; closing it is a swipe or scrim tap that no popup-width pointer target announces. Continue stays gated on `!passwordValue` (`:226`). | — | S |
| 24 | **Private key · acknowledge** | `src/app/templates/RevealSecret.tsx:95–99,336–386` | **B** | Strings are already verbatim and the gate is real (`:340–358` renders it for `private-key` and `guardian-keys`; `:379` holds Continue disabled until ticked). **The correction is ordering:** `useLayoutEffect` at `:95–99` focuses the password field on mount, so a user can type the whole password and only then find the button dead. Disable the field until the acknowledgement lands. Warning is `warn`, not `neg` — nothing has failed. | — | S |
| 25 | **Private key · revealed** | `src/app/templates/RevealSecret.tsx:201–311`, `src/lib/miden/front/use-secret-state.hook.ts:3` | **B** | Key in Geist Mono, sole mono block. **Add the countdown** — `use-secret-state.hook.ts:3` arms a 20-second timer the moment the secret lands and the shipped screen shows no trace, so a user copying a 64-char key by hand does not know they are racing anything. Fold `privateKeyFieldDescription` into the timer line rather than giving it its own paragraph. Make **Hide primary**: the risky action here is leaving the key on screen. | — | S |
| 26 | **Reveal secret · expired** | `src/app/templates/RevealSecret.tsx:201–311`; cf. `src/app/templates/RevealSeedPhrase.tsx:72–76` | **C** | Add a post-auto-hide branch. `mainContent` (`:201–311`) falls back to the password form the instant `secret` goes null, so at 20 seconds the key silently disappears and the auth form is back with **no message at all** — read as "it failed" or "my password was wrong". **The two reveal screens also disagree:** `RevealSeedPhrase.tsx:72–76` reacts to the same expiry with `goBack()`. Pick re-prompt and unify. | — | S |
| 27 | **Guardian keys · revealed** | `src/app/templates/RevealSecret.tsx:201–245` (labels `:210 / :222 / :234`, hot-key gate `:229`) | **B** | Three labels are already verbatim. **The fix is hierarchy:** shipped, all three blocks are the same `FormField textarea readOnly` with identical label weight, so **one secret and two publishable keys are presented as peers**. Demote the public keys to `--ink-2`; each label states its own disclosure class in words. **Copy bug:** `guardianKeysRevealDescription` routes users to "Settings → Reveal Device Key" but the row is titled `revealHotKey` = "Reveal device key" and only appears for a Guardian with an activated hot key (`KeysSettings.tsx:21`) — and the pointer sits ~320 words up-screen as the cold-key field's `labelDescription`. Move it to the timer line. | — | M |
| 28 | **Settings · Keys** | `src/app/templates/KeysSettings.tsx:19–23,42–47`, `src/app/PageRouter.tsx:280` | **E** | Rows-only menu grouped by consequence (reveals vs rotations) + explanatory notice. | **"Rotate Guardian" goes nowhere.** `KeysSettings.tsx:22` navigates to `/rotate-guardian`; that path is **not in `ROUTE_MAP`**, so the `'*'` catch-all at `PageRouter.tsx:280` silently redirects to `/` — tapping a Settings row dumps the user on Home with no error. `KeysSettings.test.tsx:184` asserts only that `navigate` was called with that string, so the suite is green on a feature that does not exist. Second job: `:42–47` inlines `GuardianReplaceHotKey` — a full submit form with its own confirm state — under a list of links; it must move to its own review screen. | M |
| 29 | **Settings · change passcode** | *none* | **E** | Three-step flow (current → new → confirm) reusing the `12 · Unlock` numpad geometry verbatim, with a text step counter (not onboarding `.progdots`). | **You cannot change your passcode or password in this wallet.** Verified: there is **no `changePassword` / `changePasscode` symbol anywhere in `src/`**, no key for either in `en.json`, and no row in `Settings.tsx`'s `TAB_GROUPS` (`:120–219`). The only route from a shoulder-surfed passcode to a new one is Reset Wallet — wipe the vault and re-import from the recovery phrase, precisely the material the user is trying not to touch. **Build it end to end**: a Vault re-key operation, a backend action, a store action, a `useMidenContext` method, then the UI. | L |
| 30 | **Settings · app lock** | `src/app/templates/GeneralSettings.selectors.ts:10`, `src/lib/biometric/index.ts:183–192,284–323,376–397`, `src/screens/send-flow/ReviewTransaction.tsx:134`, `src/screens/swap-flow/SwapManager.tsx:206` | **D** | New screen, three toggles, each carrying its own word so state never rests on knob position. **Row 1 is wire-up** — `setBiometricEnabled` (`:284`) and `setupBiometric` (`:376`) exist and have **zero callers outside `lib/biometric/index.ts`**; `GeneralSettingsSelectors.BiometricToggle` (`selectors.ts:10`) is referenced by nothing but its own test. Only onboarding ever writes the preference, so a user who declined Face ID has no control anywhere. **Row 2 is the one that matters and is new:** `confirmSensitiveAction` (`:183–192`) returns `true` — *allow* — when biometrics are unavailable, when the toggle is off, **and inside a bare `catch`**, so a thrown probe also permits the send. Its only callers are `ReviewTransaction.tsx:134` and `SwapManager.tsx:206`, both passing hard-coded English ("Confirm your send" / "Confirm your swap") that never went through `t()`; on denial both do `setIsSubmitting(false); return;` — **no toast, no error**. Needs a new preference + storage key. | — | L |
| 31 | **Settings · auto-lock** | `src/lib/fixed-times.ts:7`, `src/lib/lock-up/run-checks.ts:9–10` | **E** | Radio-style list (tick + the word "Current", **no radio circles** — an unfilled `.rad` is `--surface-3` on `--surface-2`, ~1.1:1) with 10 minutes pre-selected to match the shipped constant. | **The mechanism is extension-only.** `WALLET_AUTOLOCK_TIME` is a fixed constant (`fixed-times.ts:7`, 10 min) with no setting and no `en.json` key. Worse, `lock-up/run-checks.ts:9–10` **throws** unless `window.location.href` contains `extension://`, so on iOS, Android and Tauri there is no idle auto-lock at all. Shipping a picker that silently no-ops on two of three targets is the exact defect this spec exists to stop. **Ship the accent-wash banner alone (S) until the mechanism is cross-platform; the picker is blocked.** | M |
| 32 | **Guardian · rotate review** | `public/_locales/en/en.json:412–418`, `src/app/templates/GuardianSettings.tsx:40–75,112–118`, `src/app/templates/KeysSettings.tsx:22` | **E** | Review screen: Current/New Guardian, Signed-by rows, reassurance notice, Rotate + Cancel. | **Fully translated, never built, and the copy is contested.** Six keys exist and **no source file references any of them** (verified): `reviewRotation` `:412`, `newLabel` `:413`, `walletKeyHot` `:414`, `recoveryPhraseCold` `:416`, `oldGuardianCantBlockTitle` `:417`, `oldGuardianCantBlockBody` `:418`. The entry point exists and is broken (see #28). ⚠️ **Do not ship this copy as-is** — it says rotation is approved by the user's *two on-device keys* with the old Guardian merely notified, while the code that performs a Guardian switch says the opposite: `GuardianSettings.tsx:112` submits under `switchGuardianConfirmation` = "signed with your recovery (cold) key **and co-signed by your current guardian**", and `runSwitch` (`:40–75`) drives `initiateSwitchGuardianTransaction` on that path. If the current Guardian co-signs it *can* block the rotation. **The protocol answer decides which string is wrong; this is a proposal, not a spec.** | M |
| 33 | **Guardian · remove** | `src/screens/onboarding/common/GuardianInfoDrawer.tsx:79`, `public/_locales/en/en.json:404`, `src/app/templates/GuardianSettings.tsx` | **E** | Removal sheet with an acknowledgement gate (same pattern as the private-key reveal) and a ghost that says **Keep my Guardian**, not Cancel. | **The product promises this in onboarding and never built it.** `GuardianInfoDrawer.tsx:79` renders `guardianInfoSwitchingIsEasyDescription` — "…or remove one entirely — at any time using your recovery phrase" — which the user reads on **06a** *before* choosing a Guardian. There is no removal path in `GuardianSettings.tsx`, no action in `back/actions.ts`, and no route. `en.json:404` holds `guardianAboutDescription`, a **second** copy of the same promise, rendered by no component (verified unreferenced) — the claim was written twice and implemented zero times. **Build it: protocol op → backend action → store → UI.** | L |
| 34 | **Settings · reset wallet** | `src/app/pages/Settings.tsx:120–219`, `src/app/pages/Unlock.tsx:277–284` | **C** | Add a labelled **Danger zone** group with a `--neg` Reset Wallet row, separated by a gap (not last in the Security block — a mis-tap between adjacent rows is unrecoverable). Today Reset Wallet exists only on the lock screen (`Unlock.tsx:277–284`, ghost under "Try again" on the hardware-only branch) and has no row in `TAB_GROUPS`, so the user who most needs it must **lock themselves out first** to find it. The mock also draws an Encrypted Wallet File row — that is screen #36's deliverable. | — | S |
| 35 | **Reset wallet · confirm** | `src/app/pages/Unlock.tsx:200–208`, `src/app/pages/Settings.tsx:433–492` | **D** | New typed-confirmation sheet ("Type RESET"), not a paired-button dialog. **There is no confirmation on reset today**: `Unlock.tsx:277–284` wires the button straight to `onForgotPasswordClick` (`:200–208`), one tap from a lock screen into `/forgot-password-info` → the wipe-and-reimport flow. Same sheet carries the hardening the seed-phrase overlay needs: `Settings.tsx:433–492` renders that overlay with **no `role="dialog"`, no `aria-modal`, no focus trap and no back-handler registration**, so Android hardware-back navigates the page underneath while the warning is still painted on top. | — | M |
| 36 | **Encrypted file · unlock** | `src/screens/encrypted-file-flow/EncryptedFileManager.tsx:18–34,231–240`, `src/screens/encrypted-file-flow/EncryptedWalletFileWalletPassword.tsx:136–138,144–146,168–174`, wire into `src/app/PageRouter.tsx:46–280` + `src/app/pages/Settings.tsx:120–219` | **E** | **Wire up, not build — the cheapest unlock in the area.** `src/screens/encrypted-file-flow/` is a complete three-step export: four components, `Navigator` ROUTES (`:18–34`), a mobile back handler, translated strings and a 1,393-line test suite. `EncryptedFileFlow` is exported at `EncryptedFileManager.tsx:240` and has **zero importers** — verified: nothing in `PageRouter.tsx`, nothing in `TAB_GROUPS`. Dead code with a full test suite reads as shipped in review. Adding one route + one `TAB_GROUPS` row unlocks screens 36, 37 **and** 38. Then restyle: `:136–138` has the same `return null` probe bug as #21, and the acknowledgement (`:168–174`) is a bare `<button>` wrapping a `Checkbox` with no accessible checked state. | Route + menu entry | S |
| 37 | **Encrypted file · name and password** | `src/screens/encrypted-file-flow/ExportFileSetNamePassword.tsx:95–187` (`:101,114,135,141,162`) | **B** | Labels are verbatim already. Swap `PasswordStrengthIndicator` (`:135`) for the onboarding **06b** four-tier meter — a different meter on the same job is exactly the divergence this spec closes. **Add the clarifying clause:** the user typed their wallet password one screen ago and is now asked for "a password" with nothing distinguishing them; reusing the wallet password binds the backup to the credential it is meant to survive. **Real defect to move:** `encryptedFileImportedAccountsOmitted` warns that imported accounts are excluded but renders only on step 3 (`ExportFileComplete.tsx:132–135`), *after* the file is written — one screen too late to act on. | Depends on #36 | M |
| 38 | **Encrypted file · exported** | `src/screens/encrypted-file-flow/ExportFileComplete.tsx:42–113,115–144` (`:92,111–113,128–130`) | **B** | Three copy fragments already verbatim (`:128–130`). **The file writes itself before this screen paints:** `:111–113` calls `getExportFile()` from a mount `useEffect`, so arriving here *is* the export — the heading announces something the user never confirmed, and on mobile the share sheet fires unprompted. That also makes failure silent: the mobile branch swallows errors into `console.error` (`:92`) and still renders this success screen. Add a file summary (name, accounts included, imported omitted) and **Save again** — the only retry the flow can offer without re-deriving the file. | Depends on #36 | M |
| 39 | **Settings · About** | `src/app/templates/About.tsx:1–42` (`:21,27–36`), wire into `src/app/pages/Settings.tsx:200–218`; delete `Settings.tsx:415` | **E** | **Wire up — the single cheapest item in this worklist.** `app/templates/About.tsx` has **zero non-test importers** (verified): no route, no `TAB_GROUPS` entry. So `versionLabel` (`en.json:9`) reaches no user and `Settings.tsx:415` prints a hard-coded English `Version {pkg.version}` at the foot of the list, untranslated in every locale. The shipped About also duplicates two rows the settings list already has: `TAB_GROUPS`' About group holds Privacy Policy + Terms of **Service** as `linksOutsideOfWallet` entries while `About.tsx:30–31` lists the same two URLs under `termsOfUse` — identical destination, two labels depending on surface. Routing About collapses all three problems. Then restyle: per-row outward arrow (leaving a self-custody wallet for a browser is a context change worth marking). | Menu entry | S |
| 40 | **Account · rename** | `src/lib/store/index.ts:207–228`, `src/lib/miden/front/client.ts:143–148`, `src/lib/miden/back/actions.ts:269–281`, `src/lib/miden/back/vault.ts:846`, `src/app/defaults.tsx:21`, `src/components/ui/AccountsDrawer.tsx:1–109` | **D** | **Wired end to end, with no UI on top of it.** `editAccountName` runs the whole stack — `store/index.ts:207` (optimistic with rollback) → `EditAccountRequest` → `back/actions.ts:269–281` → `vault.ts:846` — and `front/client.ts:143` exposes it on `useMidenContext`. **Verified: nothing calls it** (no `.tsx` caller outside tests). `editAccountName` = "Edit Account Name" sits at `en.json:68` rendered by no component, and `AccountsDrawer.tsx` has **no rename affordance at all**. The constraint must be on screen: `ACCOUNT_NAME_PATTERN` (`app/defaults.tsx:21`, `/^[^\s-].{0,15}$/`) is enforced in the backend action, which throws a hard-coded, **untranslated** `'Invalid name. Up to 16 characters; cannot start with whitespace or hyphen.'` (`actions.ts:273–275`). Stating the rule + counting characters is what stops that throw surfacing. | **The per-account sheet.** Rename lives on the account sheet, and there is no `AccountSheet` component — screens *Accounts · list* and *Account sheet* are tagged **proposed** in the design system (`index.html:3843,3861`) and belong to Home & overview. Cross-area dependency. | M |
| 41 | **Account · delete** | `src/lib/miden/back/actions.ts:264–267`, `src/lib/miden/front/client.ts:331` | **E** | Removal sheet with the balance row drawn deliberately (users read "remove account" as "destroy funds"; the funds are on Miden and the risk is purely key custody). | **`removeAccount` is an empty function body on both sides** — verified: `back/actions.ts:267` is `export function removeAccount(_accPublicKey: string, _password: string) {}` and `front/client.ts:331` is an empty `useCallback`. A delete UI wired to either would close the sheet, resolve successfully, and delete nothing — the most dangerous class of bug a wallet can ship. The source comment at `actions.ts:264–266` names the unfinished work: a real removal must also release the hardware-backed hot key via `secureHotKey.deleteHotKey` and clear the cold-key blob (`accColdSecretKeyStrgKey`), or the Secure Enclave entry and cold key outlive the deleted account. **Ship the copy, gate the button, leave it disabled until `removeAccount` is real.** Also blocked by the account sheet (see #40). | Backend + account sheet | M |

---

## Shared primitives — fix once, N screens land

| # | Primitive | Files | The fix | Screens it settles |
|--:|---|---|---|--:|
| **P1** | **`ToggleSwitch` target + label binding** | `src/app/atoms/ToggleSwitch.tsx:48–87` (`:51`, `:81`), `src/app/templates/SettingToggle.tsx:14–24` (`:17`) | Two bugs in one component. (a) The container *and* the invisible `<input>` are both `40px × 22px` — **half the 44pt floor on the short axis**, on every toggle in the product. (b) `SettingToggle.tsx:17` wraps the row in `<label htmlFor={name}>` to widen the target, but `ToggleSwitch` is only ever passed `name` (spread via `{...rest}`, `:84`) and never `id` — `htmlFor` matches on **id**, so **the label is bound to nothing**: tapping the words does not flip the switch, and the checkbox gets no accessible name from the label or from an `aria-label`. Fix: make the row itself the control at ≥52pt with `role="switch"` + `aria-checked`, and pass `id`. Note `COMPONENTS.md:204` also wants `components/Toggle.tsx` (`PRIMARY_HEX`) merged into this one (`ACCENT_HEX`). | **5 in this area** (#2, #3, #10, #30 ×3 toggles, plus `templates/AdvancedSettings.tsx:54–58` if that dead file is ever revived) — and every toggle elsewhere in the product |
| **P2** | **Settings row / `MenuItem`** | `src/app/templates/MenuItem.tsx:21–93`, `src/components/CardItem.tsx` | One 44pt row with icon plate, label, optional right-text, chevron; `setgroup` soft-block grouping; `--neg` variant for the Danger zone; external-link arrow variant. `COMPONENTS.md:160` already calls for `ListItem → CardItem`. | **10** (#1, #4, #10, #11, #13, #28, #30, #31, #34, #39) |
| **P3** | **Drawer / bottom sheet** | `src/lib/ui/drawer.tsx:1–145` (vaul) — the surviving overlay primitive (`COMPONENTS.md:176`) | Handle, hairline divider, `padding-bottom:max(16px,var(--safe-bottom))`, scrim, `.mlist` `min-height:0` so long lists scroll inside the sheet rather than growing it. Already the host for `Settings.tsx:420–431`, `RevealSeedPhrase.tsx:191`, `EncryptedFileManager.tsx:~199`. | **17** (#2, #3, #4, #5, #6, #10, #14, #17, #18, #19, #22, #28, #33, #35, #36, #40, #41 — every sheet-shaped screen here; #11 and #12 are full pages) |
| **P4** | **Reveal-auth pattern** | `RevealSeedPhrase.tsx:111–113,185,189–238`, `RevealSecret.tsx:66,95–99,332–334`, `EncryptedWalletFileWalletPassword.tsx:136–138`, `use-secret-state.hook.ts:3` | Four things unified once: (a) the `return null` hardware probe → header + skeleton (**3 screens open as a blank frame today**); (b) one rule for numpad-vs-password — `RevealSeedPhrase.tsx:185` uses `isMobile()`, `RevealSecret.tsx:66` uses `isMobile() && hasHardwareProtector === false`; (c) the 20s `SECRET_REVEAL_TIME` stated on screen and counted down; (d) one expiry behaviour — `RevealSeedPhrase.tsx:72–76` calls `goBack()`, `RevealSecret.tsx:201–311` silently re-prompts. | **7** (#20, #21, #22, #23, #24, #25, #26 — and #36 for the probe) |
| **P5** | **Confirm / acknowledgement gate** | `src/lib/ui/dialog.tsx:22` (constate `useConfirm`, keep as state provider per `COMPONENTS.md:179`), pattern from `RevealSecret.tsx:340–358` | One acknowledgement primitive: `.chk` checkbox with real checked state + a primary disabled until ticked, plus a typed-confirmation variant for irreversible ops. Replaces `useConfirm`'s browser-ish dialog at `AddressBook.tsx:20,26–29` and `DAppSettings.tsx:21,38–43`, and the bare `<button>`-wrapping-a-checkbox at `EncryptedWalletFileWalletPassword.tsx:168–174`. | **6** (#11, #19, #24, #33, #35, #36) |
| **P6** | **Status prompt (`mprompt`) + notice** | new; consumers listed right | One inline prompt with `data-status="warn|neg|pos"`, optional CTA, and a rule that **the words carry the outcome** (colour is never the only signal). Replaces the raw `text-green-600` at `EditMidenFaucetId.tsx:95` and `GuardianSettings.tsx:124`, and `text-red-500` at several sites. | **8** (#3, #6, #8, #9, #16, #26, #31, #33) |

---

## Suggested order

**Phase 0 — unblock by routing (hours, not days).** Five components already exist and are unreachable. Do this first because it changes the shape of everything downstream and is almost free.
1. **#39 About** — one `TAB_GROUPS` entry, delete `Settings.tsx:415`, dedupe Privacy/Terms. Removes an untranslated string from every locale.
2. **#36 Encrypted file flow** — one route + one row unlocks **three** screens (#36, #37, #38) that already have a 1,393-line test suite.
3. **#13 Networks route** — one `TAB_GROUPS` entry. (The page rewrite comes later; add the 3 missing network keys now so `lint:i18n` stays green.)
4. **#28 `/rotate-guardian`** — decide: add the route or delete the row. Today it dumps the user on Home while a test asserts it works.

**Phase 1 — primitives (P1, P2, P3).** Everything else in the area renders through these. Doing P1 now means the 40×22 target and the dead `htmlFor` never get copied into the new screens (#30 introduces three more toggles). P2 + P3 are the substrate for 10 and 17 screens respectively.

**Phase 2 — restyle + fix the screens that already render (the 14 **B**s + #22).** #1, #2, #4, #7, #9, #10, #18, #22, #23, #24, #25, #27, then #11 (largest), then #37/#38 once Phase 0 landed them. These are pure front-end, need no backend, and are where the visual consolidation actually becomes visible.

**Phase 3 — new states on existing components (the 8 **C**s).** #5, #6, #8, #12, #21, #26, #34, #20. Cheap, and #21 alone removes three blank frames from the security surface. #34 is a two-line addition that makes Reset Wallet reachable without locking yourself out.

**Phase 4 — new screens with no backend dependency (**D**).** #14 (networks confirm), #35 (reset confirm), #30 (app lock — but see the caveat below), #40 (account rename, once the account sheet lands).

**Phase 5 — file the backend tickets now, build the UI when they land (**E**).** These need someone other than the UI implementer and have long lead times, so open them at the start of Phase 1, not at the end:
- `helpers.ts` setter must return a result (#3)
- `setNetworkId` must be async with an endpoint probe + rollback (#15, #16 — and #14 improves)
- real fiat rates behind `fetchFiatCurrencies` (#17)
- `updateContact` in `address-book.ts` (#19)
- a Vault re-key op for `changePasscode` (#29)
- `removeGuardian` protocol op + backend action (#33)
- `removeAccount` implemented, including `secureHotKey.deleteHotKey` + `accColdSecretKeyStrgKey` (#41)
- cross-platform idle lock, or accept the banner-only variant (#31)
- **a protocol answer on who co-signs a Guardian rotation** (#32) — this one is a correctness question, not a build task, and it should be asked in week 1

**Two things to ship deliberately late.** #17 currency picker must not ship before real rates or it lets a user pick EUR and keeps showing dollars. #41 account delete must ship with the button disabled until `removeAccount` is real — a delete that resolves successfully and deletes nothing is worse than no delete.

**Two things to ship as banners, not controls.** #31 auto-lock (the mechanism is extension-only) and #30 row 3 (the fail-open in `confirmSensitiveAction`) both state a truth the user currently cannot discover. A control that silently no-ops is the defect the whole spec exists to stop.

---

## Size summary

| Size | Count | Screens |
|---|--:|---|
| **S** | 17 | #4, #5, #7, #8, #9, #10, #12, #18, #21, #22, #23, #24, #25, #26, #34, #36, #39 |
| **M** | 18 | #1, #2, #3, #6, #14, #15, #16, #19, #20, #27, #28, #31, #32, #35, #37, #38, #40, #41 |
| **L** | 6 | #11, #13, #17, #29, #30, #33 |

Wire-ups #36 and #39 are S for the routing itself; #37 and #38 are the M restyles that #36 unlocks. Sizes cover UI implementation only — for the 14 **E** screens the unblocking work (backend, protocol, rates) is additional and mostly not front-end.

---

## New `en.json` keys required

Flat format, `public/_locales/en/en.json`. Placeholders are `$name$`. **Missing keys block CI (`yarn lint:i18n`).** Every key below was checked against the shipped file — none of them exist today. Keys the mocks use that **already exist** (`theme`, `hapticFeedback`, `delegateProofSettings`, `autoConsumeSettings`, `autoConsumeSettingsDescription`, `dAppsInteraction`, `dAppsToggleDescription`, `seeConnected`, `accountPublicKey`, `editMidenFaucetId`, `faucetId`, `faucetIdUpdated`, `setNewFaucetId`, `coldPrivateKey`, `coldPublicKeyLabel`, `hotPublicKeyLabel`, `privateKeyRevealWarningTitle`, `privateKeyRevealWarningBody`, `privateKeyRevealAcknowledge`, `privateKeyFieldDescription`, `enterYourPasscode`, `revealSecretPasscodeInputDescription`, `encryptedWalletFile*`, `name`, `enterPasswordToEncrypt`, `verifyPassword`, `itsAMatch`, `reviewRotation`, `newLabel`, `walletKeyHot`, `recoveryPhraseCold`, `oldGuardianCantBlock*`, `resetWallet`, `versionLabel`, `editAccountName`, `selected`, `address`, `hide`, `on`, `off`, `from`, `to`, `file`, `accounts`, `account`, `network`, `retry`, `testnet`, `replaceHotKey`, `copy`, `copied`) are **not** repeated here.

### Settings

| Key | English string | Screen |
|---|---|--:|
| `settingNotSavedTitle` | `Not saved — still off` | 3 |
| `settingNotSavedBody` | `We couldn't write this setting to device storage. Delegate proving is unchanged.` | 3 |
| `publicKeyUnavailableTitle` | `Public key unavailable` | 6 |
| `publicKeyUnavailableBody` | `This account has not been fetched from the node yet, so it holds no key commitment.` | 6 |
| `current` | `Current` | 7, 13, 31 |
| `copyFaucetId` | `Copy faucet ID` | 7, 9 |
| `faucetIdScopeNotice` | `Auto-consume only claims notes from this faucet. Changing it does not move any balance.` | 7 |
| `autoConsume` | `Auto consume` | 8 |
| `faucetIdInvalid` | `Not a valid Miden faucet ID. Check for a missing character.` | 9 |
| `faucetIdUnchangedNotice` | `Nothing was changed. Your faucet ID is still the one shown above.` | 9 |
| `connectedDApps` | `Connected dApps` | 11, 12 |
| `connectedToAccountOnNetwork` | `Connected to $account$ · $network$` | 11, 12 |
| `sessionsScopedToAccountNotice` | `Only sessions for this account are listed. Other accounts keep their own.` | 11 |
| `revokeAll` | `Revoke all` | 11 |
| `noDappsConnected` | `No dApps connected` | 12 |
| `noDappsConnectedDescription` | `Apps you approve in the dApp browser appear here, and you can revoke them at any time.` | 12 |
| `browseDApps` | `Browse dApps` | 12 |
| `devnet` | `Devnet` | 13–16 |
| `localnet` | `Localnet` | 13, 16 |
| `mainnet` | `Mainnet` | 13 |
| `switchTo` | `Switch to` | 13, 16 |
| `notLiveYet` | `Not live yet` | 13 |
| `networksSeparateBalancesNotice` | `Each network holds separate balances and history. Switching does not move funds.` | 13 |
| `switchToNetworkQuestion` | `Switch to $network$?` | 14 |
| `node` | `Node` | 14 |
| `networkSwitchKeepsDataNotice` | `Your $network$ balances and history stay on $network$ and return when you switch back.` | 14 |
| `switchNetwork` | `Switch network` | 14 |
| `switchingToNetwork` | `Switching to $network$` | 15 |
| `networkSaved` | `Network saved` | 15 |
| `reachingNetworkNode` | `Reaching the $network$ node` | 15 |
| `loadingBalances` | `Loading balances` | 15 |
| `networkDataUntouched` | `Your $network$ data is untouched. You can switch back at any time.` | 15 |
| `couldntReachNetwork` | `Couldn't reach $network$` | 16 |
| `networkUnreachableBody` | `The node did not respond. You are still on $network$ and nothing was changed.` | 16 |
| `stillOn` | `Still on` | 16 |
| `tried` | `Tried` | 16 |
| `currency` | `Currency` | 17 |
| `searchNCurrencies` | `Search $count$ currencies` | 17 |
| `allCurrencies` | `All currencies` | 17 |
| `searchContactsLabel` | `Search contacts` | 18 |
| `noMatchForQuery` | `No match for "$query$"` | 18 |
| `contactSearchHint` | `You have $count$ contacts. Check the spelling, or search by address.` | 18 |
| `clearSearch` | `Clear search` | 18 |
| `editContact` | `Edit Contact` | 19 |
| `contactAddressImmutable` | `The address identifies this contact and cannot be changed. Delete and re-add to move it.` | 19 |
| `saveChanges` | `Save changes` | 19 |
| `deleteContact` | `Delete contact` | 19 |

> `searchContacts` already exists but its value is `"Search"`. The mock needs a persistent visible label; either add `searchContactsLabel` (above) or change the existing value and audit its other call sites.

### Security & recovery

| Key | English string | Screen |
|---|---|--:|
| `seedRevealShoulderSurfWarning` | `Anyone who sees these 12 words can take everything in this wallet. Make sure no one is watching.` | 20 |
| `holdToReveal` | `Hold to reveal` | 20 |
| `checkingDeviceProtection` | `Checking how this device protects your wallet. This decides whether we ask for Face ID or your passcode.` | 21 |
| `phraseAutoHidesNotice` | `The phrase hides itself after 20 seconds.` | 23 |
| `hidesInSeconds` | `Hides in $seconds$ seconds.` | 25, 27 |
| `secretHiddenTitle` | `Hidden after 20 seconds` | 26 |
| `secretHiddenBody` | `Your private key was cleared from the screen. Nothing changed — unlock again to show it.` | 26 |
| `showAgain` | `Show again` | 26 |
| `disclosureSecret` | `secret` | 27 |
| `disclosureSafeToShare` | `safe to share` | 27 |
| `revealDevicePrivateKeyPointer` | `To reveal the device private key, use Settings → Reveal device key.` | 27 |
| `guardian` | `Guardian` | 28 |
| `rotateDeviceKeyNotice` | `Rotating your device key keeps the same account and the same funds.` | 28 |
| `changePasscode` | `Change passcode` | 29 |
| `stepOf` | `Step $current$ of $total$` | 29 |
| `enterCurrentPasscode` | `Enter current passcode` | 29 |
| `enterNewPasscode` | `Enter new passcode` | 29 |
| `confirmNewPasscode` | `Confirm new passcode` | 29 |
| `passcodeChangeReassurance` | `Your wallet, funds and recovery phrase stay the same.` | 29 |
| `appLock` | `App lock` | 30 |
| `faceId` | `Face ID` | 30 |
| `requireForSendsAndSwaps` | `Require for sends and swaps` | 30 |
| `sendsUnprotectedNotice` | `With this off, sends and swaps are signed without a Face ID check. Your passcode still locks the app.` | 30 |
| `ifFaceIdUnavailable` | `If Face ID is unavailable` | 30 |
| `fallBackToPasscode` | `Fall back to passcode` | 30 |
| `biometricFailOpenWarning` | `Off means a send proceeds when Face ID cannot run. That is what the app does today, silently.` | 30 |
| `autoLock` | `Auto-lock` | 31 |
| `autoLockDescription` | `Lock the app after it has been in the background this long.` | 31 |
| `immediately` | `Immediately` | 31 |
| `afterOneMinute` | `After 1 minute` | 31 |
| `afterTenMinutes` | `After 10 minutes` | 31 |
| `afterOneHour` | `After 1 hour` | 31 |
| `autoLockUnsupportedWarning` | `On iOS and Android this setting does nothing yet. The app locks only when you close it.` | 31 |
| `currentGuardian` | `Current Guardian` | 32 |
| `newGuardian` | `New Guardian` | 32 |
| `signedBy` | `Signed by` | 32 |
| `onThisDevice` | `On this device` | 32 |
| `inYourVault` | `In your vault` | 32 |
| `removeYourGuardian` | `Remove your Guardian` | 33 |
| `removing` | `Removing` | 33 |
| `afterThis` | `After this` | 33 |
| `fullyPrivate` | `Fully private` | 33 |
| `noCosignerNoRecovery` | `No cosigner, no recovery` | 33 |
| `loseGuardianRecoveryTitle` | `You lose Guardian recovery` | 33 |
| `loseGuardianRecoveryBody` | `Nothing cosigns your transactions and nothing can help you recover this account. If you lose this device and your recovery phrase, the funds are gone.` | 33 |
| `noRecoveryAcknowledge` | `I understand this account will have no recovery.` | 33 |
| `removeGuardian` | `Remove Guardian` | 33 |
| `keepMyGuardian` | `Keep my Guardian` | 33 |
| `dangerZone` | `Danger zone` | 34 |
| `resetWalletNotice` | `Resetting erases this wallet from the device. You can restore it with your recovery phrase.` | 34 |
| `resetErasesWalletTitle` | `This erases the wallet on this device` | 35 |
| `resetErasesWalletBody` | `Your accounts, keys and Guardian setup are deleted from this phone. Your funds stay on Miden and come back only with your recovery phrase.` | 35 |
| `typeResetToConfirm` | `Type RESET to confirm` | 35 |
| `filePasswordIsDistinctNotice` | `Enter a password to encrypt your wallet file. This is a new password, not your wallet password.` | 37 |
| `nAccountsIncluded` | `$count$ included` | 38 |
| `nImportedAccountsOmitted` | `$count$ imported account omitted` | 38 |
| `saveAgain` | `Save again` | 38 |
| `externalLinksNotice` | `These four open in your browser, outside the wallet.` | 39 |
| `accountNameConstraint` | `Up to 16 characters. Cannot start with a space or a hyphen.` | 40 |
| `save` | `Save` | 40 |
| `copyAddress` | `Copy address` | 40 |
| `removeAccountNamed` | `Remove "$name$"` | 41 |
| `balance` | `Balance` | 41 |
| `staysOnMidenNotDeleted` | `Stays on Miden, not deleted` | 41 |
| `backUpAccountFirstTitle` | `Back up this account first` | 41 |
| `backUpAccountFirstBody` | `Removing it deletes its keys from this device. Without its private key you cannot bring it back, and your recovery phrase alone will not restore an imported account.` | 41 |
| `removeAccount` | `Remove account` | 41 |

**Total new keys: 47 (Settings) + 67 (Security & recovery) = 114.**

Three of those — `devnet`, `localnet`, `mainnet` — are hard blockers on #13 even before any restyle: `Networks.tsx` currently reads names straight off `MIDEN_NETWORKS` and calls `t()` nowhere, so the page cannot be translated at all today.

---

## Screens whose mock is a proposal, not a spec of shipped behaviour

Flagged so nobody implements a drawing as if it documented existing code.

| # | Screen | What is proposed |
|--:|---|---|
| 1 | Settings | The mock's row inventory (Encrypted wallet file, About, Guardian) differs from shipped `TAB_GROUPS` (`Settings.tsx:120–219`). The grouping is a restructure proposal; the rows it adds are the deliverables of #36 and #39. |
| 13 | Settings · networks | Mainnet drawn present-and-unavailable. `MIDEN_NETWORKS` (`constants.ts:91–105`) has no mainnet entry; `MIDEN_NETWORK_ENDPOINTS:40` marks the URL a placeholder. |
| 14–16 | Networks confirm / switching / failed | All three describe an async, probed, rollback-capable network switch. None of that exists — `setNetworkId` is synchronous and returns nothing. |
| 17 | Settings · currency | Entirely new UI over a complete-but-unfed data layer. |
| 20 | Reveal recovery phrase | ⚠️ Tagged "shipped" in `SCREENS.md`, but the **blur + hold-to-reveal gate is not shipped behaviour** — `RevealSeedPhrase.tsx:116–168` paints the words immediately. Its rationale cites no source file. |
| 29 | Settings · change passcode | No such capability exists anywhere in `src/`. |
| 30 | Settings · app lock | Row 2 ("Require for sends and swaps") is a **new preference** with no storage key. Rows 1 and 3 describe existing but uncontrollable behaviour. |
| 31 | Settings · auto-lock | The picker is aspirational on iOS/Android/Tauri; only the warning banner is honest today. |
| 32 | **Guardian · rotate review** | ⚠️ **Contested, not merely unbuilt.** Its reassurance copy (`en.json:417–418`) and the shipped switch path (`GuardianSettings.tsx:112`, `switchGuardianConfirmation`) make **opposite claims** about whether the current Guardian co-signs and can therefore block the rotation. One of the two is wrong; the protocol answer decides which. Do not ship either string until that is settled. |
| 33 | Guardian · remove | Promised twice in copy (`GuardianInfoDrawer.tsx:79`, `en.json:404`), implemented zero times. |
| 35 | Reset wallet · confirm | Typed-confirmation pattern is new; no `resetWalletConfirmation` key exists. |
| 40–41 | Account · rename / delete | Both live on a **per-account sheet that does not exist** — `Accounts · list` and `Account sheet` are themselves tagged *proposed* (`index.html:3843`, `:3861`) and sit in another area's scope. |


<!-- ===== impl-browser-global ===== -->

# Implementation worklist — dApp browser (11) + Global states (10)

Scope: `design-system/index.html` §`dApp browser` (lines 5618–5869) and §`Global states`
(lines 5870–6037), against the shipped tree at
`/Users/bs/Develop/Miden/Projects/worktrees/earn-integration/src/`.

Every file/line below was opened and confirmed at the time of writing. Corrections to the
design system's own citations are listed in §0. Repo was not modified.

**Class key** — A restyle · B restyle + fix · C new state (branch that never renders) ·
D new screen (no component) · E blocked (route / backend / i18n / SDK first).
**Size** — S ≤ ½ day · M 1–2 days · L 3+ days.

---

## 0 · Verification results and corrections to the design system

Everything the brief handed me is true as stated. Confirmed verbatim:

| Claim | Verdict |
|---|---|
| `dapp.ts:1529–1531` `requestConfirm` throws unless `isExtension()` | **True.** `src/lib/miden/back/dapp.ts:1529` signature, `:1530–1531` the throw. |
| `sign` / `privateNotes` / `consumableNotes` / `assets` / `importPrivateNote` have no mobile consent | **True.** `requestConfirm` is called unconditionally at `:431`, `:525`, `:642`, `:772`, `:909`. Only `:276` (connect), `:1090` (transaction), `:1239` (custom transaction), `:1378` (consume) have an `if (!isExtension())` store branch. |
| `DappConfirmationModal.tsx:46` folds `consume` into `isTransaction` | **True**, and every downstream branch keys off it (`:49`, `:183`, `:186`, `:199`, `:230`). |
| `CapsuleBar.tsx:130` hard-codes `rgba(255,255,255,0.85)`; children `text-black` → `#ffffff` dark | **True.** `main.css:442` is `--color-text-primary: #ffffff`. Five buttons at `h-8 w-8`: `:215`, `:228`, `:238`, `:255`, `:273`. |
| `DappSwitcher` `aria-modal` with no trap/restore; Escape on an unfocusable div; `Loading…` at `text-[10px]` | **True.** `role="dialog"` `:78`, `aria-modal` `:79`, `onKeyDown` on the `motion.div` `:88–90`, no `tabIndex` and zero occurrences of `focus` in the file. Hard-coded English `Loading…` at `:248–249`. Per-card × `h-7 w-7` at `:229`. Count hand-interpolated `.replace('{count}', …)` at `:70`. |
| `ConnectivityIssueBanner` mounted once at `Explore.tsx:141`; `network` retry returns early off-extension | **True.** Single mount; `onRetry` early-returns at `:93–99`; `ExtensionMessageListener` is `() => null` at `:152` and is mounted globally at `App.tsx:90` (imported `:17`). |
| No in-app toast anywhere | **True.** Zero hits for `react-hot-toast` / `sonner` / `react-toastify` / `<Toaster` in `src/` **or** `package.json`. `NoteToastProvider.tsx:60` returns `null`. |
| No `appStateChange` / resume listener | **True.** The only `App.addListener` in `src/` is `'backButton'` at `lib/mobile/back-handler.ts:30`. |
| No update gate / maintenance mode / migration UI | **True.** Only version check in the tree is `lib/browser-info.ts:47–49`, which is a *browser* version check for extension security — unrelated. |
| `Unlock.tsx:352` says "password" on the passcode screen; `<Numpad>` has no disabled state | **True.** `:352` interpolates `unlockPasswordErrorDelay`; `handleDigit`/`handleDelete` early-return on `isDisabled` (`:187`, `:195`) but `<Numpad>` at `:386` accepts only `onDigit`/`onDelete`/`className` (`Numpad.tsx:7–11`). The password path *does* disable its field (`:322`). |
| `src/lib/qr/` scanner half has zero callers | **True.** `scanQRCode` and `checkCameraPermission` appear nowhere outside `lib/qr/` and its own barrel `index.ts:2`. |

### Corrections the design system should absorb

1. **`dappConfirmationStore` *does* have a `sign` type.** The `dApp · sign message` rationale
   says it does not. `confirmation-store.ts:38` is
   `type: 'connect' | 'sign' | 'transaction' | 'consume'`. The behavioural claim survives
   (nothing routes `sign` there and the modal has no `sign` branch), but the fix is **smaller
   than the note implies** — no store type change is needed for sign.
2. **There is no fee model anywhere in the wallet.** `grep` for `networkFee|estimateFee|txFee|
   gasFee|"fee"` across `src/` and `public/_locales/en/en.json` returns **zero** hits. The
   "Network fee 0.10 MIDEN ≈ $1.04" row in `dApp · transaction request` and
   `dApp · claim note request` has no producer and no i18n key. Both rows are **proposals**.
3. **`DappPeekCard` citations are off by one.** Close button `h-6 w-6` is `:383` (note says
   `:382`); the `+N` pill spans `:396–398` (note's `:395–398` starts on the `aria-label`);
   name `text-[11px]` is `:370` (note says `:371`). All defects real, line refs one off.
4. **A third consent implementation exists and no screen documents it.** Desktop does not use
   `DappConfirmationModal`. `lib/desktop/DesktopDappConfirmationModal.tsx:34` returns `null`
   and injects a generated HTML overlay into the dApp webview via
   `generateDesktopConfirmationOverlay` (`lib/desktop/dapp-browser.ts:149`). It repeats the
   `consume`-folded-into-`isTransaction` bug at `:107`. Fixing the React modal does **not**
   fix desktop.

---

## 1 · dApp browser (11 screens)

The tab is `/browser` (`PageRouter.tsx:142`) → `pages/Browser/index.tsx` → `BrowserScreen.tsx`.
`DappPeekTray` (`DappBrowserProvider.tsx:997`), `DappSwitcher` (`:1001`) and
`DappConfirmationModal` (`:1007`) are all gated on `isMobile()`.

| # | Screen | Owning file(s) + lines | Class | What actually changes | Blocked by |
|---|---|---|---|---|---|
| 1 | **dApp browser** | `Browser/DappLauncher/index.tsx:52–64`; `HeroSearch.tsx:40–44`; `AppsGrid.tsx:45–98`; `DappLauncher/DappTile.tsx`; `components/ui/TabHeader.tsx`, `BottomNav.tsx` | **A · Restyle** | Tokens/type/radius on tiles, header and search field. One genuinely new element: the standing trust line ("Connected sites can request signatures. You approve every transaction.") — new static `<div>` + one `en.json` key, no branch. | — | 
| 2 | **dApp launcher · no recents** | `RecentsRow.tsx:32` (`if (recents.length === 0) return null`), `:22` `MAX_VISIBLE = 4`, `:34` slice; `DappLauncher/index.tsx:38–50`; `AppsGrid.tsx:55,59` | **C · New state** | Delete the null-return; always render the RECENTS heading and swap the tile row for an empty block. Separately fix `AppsGrid`'s fallback letter: `text-pure-white` on `dapp.brandColor` measures 2.77:1 (Faucet `#0EA5E9`) / 2.56:1 (Miden Name `#10B981`) — move to a neutral plate with `--ink`. Two new `en.json` keys. | — | 
| 3 | **dApp · active** | `CapsuleBar.tsx:130` (inline white), `:215,228,238,255,273` (five 32pt buttons), `:114–116` + `:194–203` (title-over-hostname), `:258` (`text-[10px]` count); `ProgressBar.tsx:32–38,44,45–48`; `main.css:442` | **B · Restyle + fix** | (a) Replace the inline `rgba(255,255,255,0.85)` with a themed surface token so dark mode stops rendering white-on-white. (b) Raise all capsule targets to 44pt, which forces the button count from five to three. (c) Reverse the hierarchy: hostname leads in mono, page-supplied title demoted. (d) Progress bar → 3px, real accessible name; either keep the fake ramp and label it indeterminate, or drop `aria-valuenow`. | — | 
| 4 | **dApp · load failed** | `DappActive.tsx:234–248` (error overlay), `:219–249` (native-webview slot); `CapsuleBar.tsx:238` (the only exit, 32pt) | **B · Restyle + fix** | Restyle the shipped overlay onto the empty-state pattern (icon plate, `.obh`/`.obp`), add the "Back to Explore" ghost — today the *only* exit from a dApp that will not load is the 32pt capsule ×. Add the reassurance notice ("Your wallet is fine. Nothing was sent…") — new `en.json` key. | — | 
| 5 | **dApp · connect request** | `DappConfirmationModal.tsx:145,161` (centred 360px card), `:199–211` (account + network blocks), `:219` (bordered Deny), `:227–228` (`disabled:bg-primary-200`), `:138` (standing `UponRequest` grant) | **B · Restyle + fix** | Re-host the modal on the vaul sheet (`lib/ui/drawer.tsx`) instead of a centred card; Deny becomes filled-secondary (removes an outlined control and orange text at 2.90:1); disabled primary loses the accent entirely. New content: the two "Connecting lets this app…" grant rows — the shipped modal never states what the grant covers. Needs ~4 new `en.json` keys. | — | 
| 6 | **dApp · transaction request** | `DappConfirmationModal.tsx:186–197,199,49`; producers `dapp.ts:1675–1689` (send), `:1702–1708` (custom), store payload `:1093–1106`; `confirmation-store.ts:38–52` | **E · Blocked** | The mock needs amount, From account, To, "You receive" and fee. The store carries only `transactionMessages?: string[]` — **pre-formatted English strings** like `"Amount, 250"` that `ConfirmPage.tsx:203` reverse-parses by splitting on `', '`, plus `sourcePublicKey`. Rendering the mock requires a typed transaction payload on `DAppConfirmationRequest` and rewriting the three `format*Preview` functions to emit structured values. **The fee row has no producer at all** (see §0.2) and is a proposal. One piece *is* unblocked and should ship immediately as a separate fix: `canApprove = isTransaction \|\| Boolean(accountId)` (`:49`) short-circuits on transactions, so Confirm stays enabled with a `null` signing account — the exact case connect refuses. | Typed payload on `confirmation-store.ts` + `dapp.ts` formatter rewrite; fee source does not exist |
| 7 | **dApp · claim note request** | `DappConfirmationModal.tsx:46` (the fold), `:183`, `:230`; type survives to `dapp.ts:1384` | **C · New state** | Split `isTransaction` into `isTransaction` / `isConsume` and add a third render branch: `+`-signed figure, "Sent by" / "Into" instead of "From" / "To", the "Claiming adds money…" sentence, and "Not now" instead of "Deny". The type is already in the payload — nothing backend is required for the *direction*. The amount is subject to the same string-parsing problem as #6 (`formatConsumeTransactionPreview` at `:1691–1700` emits `"Amount, +12.5"`), so a partial version can ship on the existing strings; the fee row is a proposal. ~5 new `en.json` keys. | Fee row only (proposal) |
| 8 | **dApp · sign message** | `dapp.ts:431` (unconditional `requestConfirm`), `:1529–1531`; `confirmation-store.ts:38` (`'sign'` already in the union); `DappConfirmationModal.tsx` (no `sign` branch); reference impl `ConfirmPage.tsx:128–152`, `:623` | **E · Blocked** *(smallest of the five)* | Two halves. **Backend:** add an `if (!isExtension())` branch in `generatePromisifySign` mirroring `:1090–1111`, passing the sign payload + `kind` (`'word'` \| `'signingInputs'`) through the store. The store type already accepts `'sign'`, but `DAppConfirmationRequest` needs a `payload`/`kind` field. **UI:** a new modal branch rendering the message verbatim in mono, never truncated, with `--accent-critical` on the primary. The extension already solves the rendering (`OpaqueSignatureWarning`, `SigningInputsPayloadContent`) — reuse, don't reinvent. **Until this lands, mobile and desktop hand the dApp a raw English wallet internal as its error string and show no wallet UI at all.** | `dapp.ts` non-extension branch + `DAppConfirmationRequest.payload` field |
| 9 | **dApp · private data request** | `dapp.ts:503–504,525` (privateNotes), `:620–621,642` (consumableNotes), `:748–749,772` (assets), `:909` (importPrivateNote), `:1529–1531`; `DappConfirmationModal.tsx:138`; reference `ConfirmPage.tsx:154–176,600,646,669,692` | **E · Blocked** *(largest single item in this area)* | Four handlers, each with the same shape: if `privateDataPermission === Auto` **and** the `AllowedPrivateData` bit is set, data is returned **silently with no prompt**; otherwise `requestConfirm` throws off-extension. Neither branch is consent. Requires: a new `'privateData'` store type carrying category + item counts; four `!isExtension()` branches in `dapp.ts`; a new modal branch with count-based disclosure rows; and — the part with no home today — an **"Allow once" vs "Always allow" split**, since `:138` grants standing `UponRequest` on every approve and nothing in `Settings.tsx` or `DAppSettings.tsx` lists or revokes it. The revocation surface is a separate screen (`Settings · connected dApps`, outside my 21). | New store type + 4 `dapp.ts` branches + a permission-revocation surface |
| 10 | **dApp · switcher** | `DappSwitcher.tsx:78–79`, `:88–90`, `:70`, `:229`, `:248–249`; correct reference impl `DappConfirmationModal.tsx:61–125` | **B · Restyle + fix** | Port the focus trap + restore + `document`-level Escape handler from `DappConfirmationModal.tsx:61–125` (ninety lines away, already correct). Per-card × 28pt → 44pt on an opaque plate (`bg-black/40` over an arbitrary page snapshot has no guaranteed contrast). `Loading…` → a real `.badge` behind `t()` — it currently ships hard-coded English at `text-[10px]`, which `yarn lint:i18n` is supposed to block. `:70` → a real i18n placeholder so locales can reorder. New: a "Close all" action — one-card-at-a-time is the only disposal route shipped. | — | 
| 11 | **dApp · peek tray** | `DappPeekCard.tsx:43–44` (104×132), `:50` (30pt offset), `:383` (× at 24pt), `:396–398` (`+N` 24pt / `text-[10px]`), `:370` (`text-[11px]`), `:365` (`text-[8px]`); `DappPeekTray.tsx:58` (`MAX_VISIBLE_CARDS = 3`), `:410` | **B · Restyle + fix** | Every control is under both floors at once: two 24pt targets against 44, three type sizes at or under 11pt, floating over live content so a mis-hit lands on the page behind. Move close off the card entirely (44pt cannot honestly fit a 104pt thumbnail — disposal moves to the switcher's new "Close all"); promote `+N` to a full-width row that names what it opens; drop `MAX_VISIBLE_CARDS` 3 → 2, since at 402pt the third card is mostly occluded and carries no controls. | — | 

**Class tally, dApp browser:** A 1 · B 5 · C 2 · D 0 · E 3.

---

## 2 · Global states (10 screens)

| # | Screen | Owning file(s) + lines | Class | What actually changes | Blocked by |
|---|---|---|---|---|---|
| 12 | **Lock · probing hardware** | `Unlock.tsx:253–259` (returns `<div className="flex items-center justify-center h-32" />`), `:81–92` (Tauri probe), `:93–104` (biometric probe), `:120` (the only `setHardwareUnlockChecked(true)`), `:262` (`isHardwareOnlyWallet` proves the paths separate) | **C · New state** | The shipped component renders loading, empty and error as the same nothing. Fill the empty box: brand mark, "Welcome back", spinner, "Checking Face ID…", plus a **"Use passcode instead" escape**. Add a timeout — `setHardwareUnlockChecked(true)` is reached only after the probe settles or throws, so a `hasHardwareKey()` that never resolves leaves a permanent blank screen with no control on it. Copy + timeout are new; the branch machinery already exists. | — | 
| 13 | **Lock · passcode incorrect** | `Unlock.tsx:351–355` (one `<p>` carrying hint / error / countdown), `:357` (`text-red-500`), `:376–377` (dots hard-coded `#C7C7CC` both states), `:160` + `:27` (`LAST_ATTEMPT = 3`), `:366` | **B · Restyle + fix** | Separate the error line from the hint line — today one `<p>` is overloaded with three unrelated meanings and recoloured by a fixed-palette class. That separation is what makes room for the **new attempt counter** ("2 tries left before a 1-minute wait"), derived entirely from `attempt`, which the component already holds. Nothing today warns that a third mistype costs sixty seconds. Dots: filled takes the accent and scales; today both states are the same hex, fill-vs-outline, ignoring the theme. One new `en.json` key. | — | 
| 14 | **Lock · rate limited** | `Unlock.tsx:352` (`unlockPasswordErrorDelay` on the passcode path), `:294` (the fork that proves passcode ≠ password), `:386` (`<Numpad>` with no disabled state), `:187,195` (handlers no-op), `:322` (password path *does* disable), `:26,51` (`LOCK_TIME`, `lockLevel`); `Numpad.tsx:7–11` | **B · Restyle + fix** | (a) New mobile-specific lockout string — the shipped one says "wrong **password** three times" on a surface where Bread never issued a password. (b) Remove the keypad during lockout rather than dimming it: twelve keys currently render at full contrast, animate their press and swallow every tap for a minute. (Alternative: add a `disabled` prop to `Numpad.tsx` — but the mock removes it, and a control that cannot be used is not information.) (c) Countdown becomes the screen, on the balance ramp with tabular figures, instead of trailing a long `text-lg` sentence. `lockLevel` already doubles the wait at six attempts and mm:ss already covers it. | — | 
| 15 | **Lock · resume re-auth** | `Unlock.tsx:65–124` (cold-start only); `lib/mobile/back-handler.ts:30` (the only Capacitor listener in `src/`); `lib/lock-up/run-checks.ts:9–10` (throws unless `extension://`), `lib/fixed-times.ts` (`WALLET_AUTOLOCK_TIME = 10 min`, extension-only) | **E · Blocked** | **The wallet never re-locks on mobile or desktop.** Auto-lock exists only for the extension and `run-checks.ts:9–10` hard-throws off-extension. The screen itself is mostly assembled from existing parts (lock plate, `.obh`/`.obp`, a masked `BalanceCard`, Face ID primary / passcode ghost matching `Unlock.tsx:65–124` priority) — but it can never render until a resume listener and a lock policy exist. See §4.2. The timeout policy (immediately vs N minutes) is a **product decision the mock deliberately does not make**. | Resume listener + mobile lock policy (neither exists) |
| 16 | **Activity · offline** | `Explore.tsx:141` (sole mount); `ConnectivityIssueBanner.tsx:41–47,49–82,93–99,136–142,152`; `App.tsx:17,90`; `AllHistory.tsx` (the Activity page, `PageRouter.tsx:129`); `TabLayout.tsx:59,208–222`; `store/types.ts:69` + `store/index.ts:104` (`lastSyncedAt`) | **C · New state** | Three things. (a) **Mount point** — hoist the banner into `TabLayout` so it covers Home, Activity and Browser instead of Home alone (§4.4). (b) **Drop the retry CTA off-extension** — `onRetry` returns early at `:93–99`, so today the button is live, tappable and inert; `useSyncTrigger` already retries every 3s. This means `VIEWS[network].ctaKey` (`:56`) and `VIEWS[node].ctaKey` (`:64`) must become platform-conditional, not deleted. (c) **The age line** ("Showing your last synced activity, from 14 minutes ago") is the sentence only Activity can say — `lastSyncedAt` already exists in the store, so it is unblocked. Also: the dismiss is an `<Icon onClick>` at `:136–142` with no `<button>`, no accessible name and ~20pt — make it a real 44pt control. Both banner strings are verbatim existing keys. | — | 
| 17 | **Toast · link copied** | **No owning file.** Consumers: `DappActionsSheet.tsx:80–88`, `:90–104`, `:106–114`; `NoteToastProvider.tsx:60` | **D · New screen** | There is no toast primitive to restyle. Build the host (§4.1) and wire the three silent `DappActionsSheet` actions to it. Note the clipboard write is `.catch(() => {})`, so a *failure* is silent too and "copied" is indistinguishable from "nothing happened" — the toast has to distinguish them. Spec is fully written in the rationale: anchored above the nav pill, `--ink` on `--paper` (10.4:1 light / 17.6:1 dark, no per-theme variant), one line, one icon, **no action control**, ~2.5s, mirrored to a live region. | — | 
| 18 | **Notifications · rationale** | `native-notifications.ts:46–60` (`checkPermissions` → `requestPermissions` back to back), `:56` (returns `false`, unconsumed); `NoteToastProvider.tsx:37–41` (fires from a mount effect) | **D · New screen** | A pre-prompt sheet does not exist. Build it on `lib/ui/drawer.tsx`, then gate `initNativeNotifications()` behind it so the OS dialog stops firing on app start with no context. iOS grants exactly one prompt per install, which makes the current uncontextualised ask the most expensive available mistake. Second half — **the denial path** — is genuinely absent: `:56`'s `false` is consumed by nobody and neither `Settings.tsx` nor `AdvancedSettings.tsx` contains the word "notification", so there is no re-request route. That half is **E**, blocked on a settings row. ~6 new `en.json` keys. | Re-request route needs a new Settings row (separate screen) |
| 19 | **Camera · permission denied** | `lib/qr/scanner.ts:85–87` (`errorKey: 'cameraPermissionDenied'`), `:99–102` (`checkCameraPermission` is a stub returning `isMobile()`); `lib/qr/index.ts:2` (the only reference); zero callers anywhere in `app/`, `screens/`, `components/` | **E · Blocked** | The whole scan path is dead code. `scanQRCode`, its four error keys and this system's own `Send · scan` mock are wired to nothing. Nothing can render a *denial* until something first attempts a *scan*. And `checkCameraPermission` cannot report denial pre-emptively — it returns `isMobile()` without checking any permission, so the app only learns it was denied after a scan has already failed. The screen as drawn is otherwise buildable and correct (denial is a fork, not an error: the paste field sits on the same screen; the CTA is named "Open iOS Settings", not "Allow", because the wallet cannot re-prompt after a hard denial). | Scanner has no callers — the Send scan entry point must exist first |
| 20 | **Update required** | **No owning file.** Nearest neighbour `PageRouter.tsx:53` (`/reset-required`) | **D · New screen** | No version gate, no maintenance flag, no migration state anywhere in `src/`. A wallet shipping to mainnet against a moving protocol needs the **non-destructive** gate, or every breaking change becomes a reset. New route + a min-version source. The screen itself is simple (mark, headline, reassurance notice, two mono version rows, Update primary, "Reveal recovery phrase first" ghost — the last safe moment to write down a phrase is *before* the build swap). Classified **D** rather than **E** because the UI can be built and routed against a stubbed version check; making the gate *authoritative* needs a backend min-version signal. | Min-version source (backend) for the gate to be real |
| 21 | **Reset required** | `screens/onboarding/ResetRequired.tsx:19–45` (`:21` hard-codes `w-[22.5rem] h-[37.5rem]`, `:37` `secondDescription`, `:41` the single Primary), `app/pages/ResetRequired.tsx:6–12`, `PageRouter.tsx:53` | **B · Restyle + fix** | (a) **Layout defect:** `:21` hard-codes a 360×600 extension-popup box with a border and centres it on *every* platform, so on a 402×874 phone the most consequential screen in the product renders as a bordered card floating in dead space. (b) **The copy offers three routes and the screen ships one button** — `:41` renders only `t('reset')`, styled as the recommended action, with no confirmation, on a wall the user cannot dismiss. Invert: the two recovery routes become the peer actions, the wipe becomes a ghost. (c) **The warning does not exist:** `resetRequiredSecondDescription` is "We're sorry for the inconvenience." occupying the slot the consequence should hold. Compare `ForgotPasswordInfo`, which does warn — the two most destructive screens in the product disagree about whether to give one. Restore/seed routes need wiring to `/reset-wallet`'s existing import paths. | — | 

**Class tally, Global states:** A 0 · B 4 · C 2 · D 3 · E 1 (+2 partial).

**Combined:** **A 1 · B 9 · C 4 · D 3 · E 4** (plus partial-E inside #6, #7, #18).

---

## 3 · Shared primitives — one fix, N screens

### 3.1 The confirmation sheet — fixes 5 screens (and unblocks 2 more)

`DappConfirmationModal.tsx` is the single component behind **#5 connect, #6 transaction,
#7 claim, #8 sign, #9 private data**, and it is the host for the switcher's focus-trap donor
code. Today it has exactly two render branches (`isTransaction` / not) for what the design
system draws as five distinct decisions.

Work in dependency order:

1. **Re-host on `lib/ui/drawer.tsx` (vaul)** — replaces the centred `max-w-[360px]` card
   (`:145,161`). Every other picker in the app is already a vaul sheet; `COMPONENTS.md:176`
   makes vaul the surviving overlay primitive. One change, five screens.
2. **Fix the two chrome defects once** — Deny loses `border-2 border-orange-500` (`:219`),
   disabled primary loses `bg-primary-200` (`:228`). Five screens.
3. **Replace the `isTransaction` boolean with a discriminated union on `request.type`.**
   Unblocks #7 immediately (the type already arrives) and is the precondition for #8 and #9.
4. **Then, and only then**, add per-type bodies.

⚠️ **Desktop is a separate implementation and none of the above reaches it.**
`generateDesktopConfirmationOverlay` (`lib/desktop/dapp-browser.ts:149`) builds its own HTML
and repeats the `consume` fold at `DesktopDappConfirmationModal.tsx:107`. Either fold desktop
onto the React modal or accept that every fix above ships twice. **Recommend folding.**

### 3.2 The capsule — fixes 2 screens

`CapsuleBar.tsx` is behind **#3 active** and **#4 load failed** (whose only exit is the
capsule ×). One 44pt pass + one surface-token fix closes both. The dark-mode inline literal
at `:130` is a *correctness* fix, not a restyle — it makes the capsule unreadable.

### 3.3 The toast — fixes 1 screen directly, ~6 more across the app

Building the host (§4.1) delivers **#17** and immediately serves at minimum:
`DappActionsSheet.tsx` ×3 silent actions, `Receive · address copied`, `Receive · share failed`,
`Settings · faucet ID, saved`, and every `.catch(() => {})` in the tree that currently
swallows a failure into indistinguishable silence.

### 3.4 The connectivity banner — fixes 1 screen here, 2 elsewhere

`ConnectivityIssueBanner.tsx` already implements four categories with priority
(`:41–47,49–82`). It is not under-built; it is **under-mounted**. The single hoist into
`TabLayout` (§4.4) delivers **#16 Activity · offline** and also `Home · offline` and
`Home · node unreachable` from the Home & overview flow. Its `.pdis` dismiss fix (`:136–142`)
lands on all three at once.

### 3.5 Reused, not new

`components/ui/PromptCard.tsx` (marked **SURVIVE** in `COMPONENTS.md:158`) is the right
carrier for the `.mprompt` treatment the offline screen draws. `Numpad.tsx` gains an optional
`disabled` prop only if #14's "remove the keypad" decision is reversed.

---

## 4 · New infrastructure required

### 4.1 Toast host — **M**

- **Where:** `src/components/ui/Toast.tsx` (primitive) + a host mounted in
  `app/layouts/TabLayout.tsx` beside the floating nav at `:229–244`, so the toast is anchored
  *above* the pill and never covers the tab about to be pressed. A store-backed queue belongs
  in `lib/store/index.ts` next to the existing `isNoteToastVisible` / `dismissNoteToast`
  slice, which is already the right shape and currently drives nothing visible.
- **Must expose:** `showToast({ message, icon?, tone? })`. Single-line, single-icon,
  **no action control** (a toast with a button is a dialog that dismisses itself, and 44pt
  cannot be met inside a 40pt bar — anything needing a response is a sheet). Auto-dismiss
  ~2.5s. Must write to an `aria-live="polite"` region: a self-dismissing element announces
  nothing on its own.
- **Do not add a dependency.** `package.json` has none of `react-hot-toast` / `sonner` /
  `react-toastify` and does not need one for a single-line, no-action, one-at-a-time toast.
- **Size:** M (primitive S, host + store + live region + first three consumers M).

### 4.2 Resume listener and mobile lock policy — **M**, security-relevant

- **Where:** `src/lib/mobile/app-state.ts`, mirroring `back-handler.ts:19–30`'s
  initialise-once shape, registered from `App.tsx` under `checkIsMobile()` beside
  `<MobileBackBridge />` at `:92`.
- **Must expose:** `App.addListener('appStateChange', …)`, a `lastBackgroundedAt` timestamp,
  and a policy check that navigates to `/` → `Unlock` when the threshold is exceeded.
  Desktop needs the same via Tauri focus events. Extension already has this
  (`lib/lock-up/run-checks.ts` + `WALLET_AUTOLOCK_TIME = 10 min`) but it **hard-throws off
  extension** at `:9–10`, so the logic cannot simply be reused — it must be generalised or
  re-implemented.
- **Product decision required first:** immediately vs N minutes. The mock explicitly declines
  to make it. Needs a `Settings · auto-lock` row (screen #125, outside my 21).
- **Size:** M. Unblocks #15.

### 4.3 Mobile/desktop consent path — **L**, security-relevant, largest item in this area

Five request types reach `dapp.ts:1529–1531` and throw off-extension. The three that already
have a store branch (`:1090`, `:1239`, `:1378`) are the template — this is **extension of an
existing mechanism, not a new path.** Concretely:

- **`confirmation-store.ts`:** extend `DAppConfirmationRequest` (`:31–52`). `'sign'` is
  **already in the type union at `:38`** — it needs a `payload` + `kind` field. `privateNotes`
  / `consumableNotes` / `assets` / `importPrivateNote` need a new `'privateData'` member
  carrying category and item counts. Transactions need a typed value object to replace
  `transactionMessages: string[]`.
- **`dapp.ts`:** five `if (!isExtension())` branches at `:431`, `:525`, `:642`, `:772`, `:909`,
  each ~20 lines copied from `:1090–1111`. **Plus** the private-data handlers need their `Auto`
  fast-path (`:503–504`, `:620–621`, `:748–749`) revisited — today `Auto` returns balances and
  notes **silently with no prompt at all**, which is the more dangerous of the two branches
  and is not fixed by adding a modal.
- **`DappConfirmationModal.tsx`:** per-type bodies (§3.1).
- **Reference implementation exists:** `ConfirmPage.tsx` already handles all eight types
  (`:452–474`, `:537–692`). Port its renderers rather than writing new ones.
- **Also required:** a revocation surface for the standing `UponRequest` grant sent at
  `DappConfirmationModal.tsx:138`. Nothing in the app lists or revokes it today.
- **Size:** L. sign alone is M; private data is L; transaction payload is M.

### 4.4 Connectivity mount point — **S**

- **Where:** hoist `<ConnectivityIssueBanner />` from `Explore.tsx:141` into
  `app/layouts/TabLayout.tsx` above the content region at `:208`, so it covers Home, Activity
  and Browser. `App.tsx:90` already mounts `ExtensionMessageListener`, which is `() => null`
  (`:152`) — **the global slot is real and empty**, but `TabLayout` is the correct host
  because the banner must sit inside the tab chrome, not above it.
- **Must expose:** nothing new. The component is complete; it is mounted once.
- **Two edits ride along:** make `ctaKey` platform-conditional (`:56`, `:64`) so the inert
  retry disappears off-extension, and turn the `<Icon onClick>` dismiss (`:136–142`) into a
  real 44pt `<button>` with an accessible name.
- **Size:** S. Delivers #16 plus two Home-flow screens.

### 4.5 Version gate — **M**

- **Where:** new `src/lib/version-gate.ts` + a route beside `/reset-required`
  (`PageRouter.tsx:53`), checked in the router's `!ready` region so it precedes everything.
- **Must expose:** `getMinimumSupportedVersion()` (backend/remote-config) and a
  `<UpdateRequired />` wall. **Non-destructive by construction** — the whole point is that
  today's only adjacent screen wipes.
- **Size:** M (UI S, authoritative min-version signal M and cross-team).

---

## 5 · Suggested order

Reasoning: security correctness first, then things that are broken in the dark, then reach,
then cosmetics. Items that unblock other items jump the queue.

### Tier 1 — security-relevant, do these first

These are ordered by *exposure × silence*. Every one of them either hands data away without
asking, approves a spend the user cannot see, or leaves an unlocked wallet in someone's hand.

1. **#9 private data — the `Auto` silent-disclosure branch** (`dapp.ts:503–504`, `:620–621`,
   `:748–749`). Balances and private notes are returned **with no prompt at all**. This is the
   only item on the list where the wallet discloses user data without any user action, and it
   needs no UI to fix — it is a policy change in three branches. **Do this before any UI work
   in this area.**
2. **#6 `canApprove` short-circuit** (`DappConfirmationModal.tsx:49`). Confirm stays enabled
   with a `null` signing account on transactions — the exact case connect refuses. One-line
   fix, ships today, independent of the payload rework.
3. **#7 claim-vs-spend collapse** (`:46`). A spend currently reads as a claim and vice versa,
   on the sheet whose entire job is telling those apart. Fixing the discriminator is the
   precondition for #8 and #9 anyway.
4. **#8 sign message.** Off-extension this throws a wallet internal into the page and shows
   **no wallet UI at all** — a signature request that reaches the user as a dApp-rendered
   error string. Smallest of the five blocked types (`'sign'` is already in the store union).
5. **#15 resume re-auth / §4.2.** Unlock once, background, hand the phone over — the next
   person is on the balance. The lock screen exists; nothing re-arms it.
6. **#21 Reset required.** A one-tap irreversible wipe, styled as the recommended action, with
   no confirmation and no warning, on a wall the user cannot dismiss — and the two recovery
   routes the copy names are unreachable from the screen demanding them.
7. **#9 private data — the consent UI**, once #1 has stopped the bleeding.

### Tier 2 — broken in the dark / unreachable

8. **#3 capsule dark-mode + 44pt** (§3.2). White-on-white in dark makes the only exit from a
   hostile page invisible. Carries #4.
9. **#12 Lock · probing hardware.** A blank screen with no control and no timeout is a wallet
   the user can neither open nor leave.
10. **#14 Lock · rate limited.** Wrong credential named; twelve keys that look live and
    swallow input for a minute.
11. **#4 dApp load failed** (rides on #3).
12. **#10 switcher focus trap.** Escape never closes a self-declared modal; donor code is
    ninety lines away.

### Tier 3 — reach and feedback

13. **§4.4 connectivity hoist (S).** Best ratio on the list: one hoist, three screens, and it
    removes a button that lies.
14. **§4.1 toast host (M).** Delivers #17 and ~6 screens outside this brief.
15. **#16 Activity · offline** (needs 13 + the age line).
16. **#13 Lock · passcode incorrect** — attempt counter; the penalty currently arrives with no
    notice.
17. **#18 Notifications rationale** — every day this ships un-gated, installs burn their one
    iOS prompt.

### Tier 4 — cosmetics and gated work

18. **#2 launcher · no recents** (+ the `AppsGrid` contrast fix, which is a real WCAG failure
    and could be pulled into Tier 2 on its own).
19. **#11 peek tray.**
20. **#1 dApp browser restyle.**
21. **#6 transaction payload rework** — parked until the typed-payload decision is made.
22. **#20 Update required** — parked on a min-version signal, but should be *specced* now:
    every week without it, a breaking protocol change has only the destructive path.
23. **#19 Camera permission denied** — parked until the scanner has a caller.

---

## 6 · Mocks that are proposals, not specs of shipped behaviour

Flagged so nobody builds against a fact that does not exist.

| Screen | What is proposed rather than specified |
|---|---|
| #6 transaction request | **The entire field set.** Amount / From / To / You receive have no typed source (`transactionMessages` is pre-formatted English). **The network fee row has no producer anywhere in the wallet** — zero hits for any fee concept in `src/` or `en.json`. |
| #7 claim note request | The fee row, same reason. The direction cues (`+`, "Sent by" / "Into") *are* specifiable — the type reaches `dapp.ts:1384` intact. |
| #2 launcher · no recents | The **saved-vs-recent split** is a product proposal ("two different promises served by one four-slot list"). The empty state itself is a spec. |
| #3 dApp · active | The rationale itself flags URL bar / back / forward / share / open-in-Safari as **unresolved by the drawing** — not specified, just named. |
| #9 private data | The **"Allow once" primary / "Always allow" ghost** inversion is a proposal — it inverts the shipped default and implies a revocation surface that does not exist. The disclosure counts are specifiable. |
| #15 resume re-auth | The **timeout policy** is explicitly deferred by the mock ("a product decision this screen does not make"). |
| #20 Update required | Entirely proposed. No version gate, flag or migration state exists to specify against. |
| #10 switcher | "Close all" is a new capability, not a fix to an existing one. |
| #11 peek tray | Reducing `MAX_VISIBLE_CARDS` 3 → 2 is a judgement call about 402pt, not a defect fix. |
| #1 dApp browser | The standing trust line is new copy, not shipped text. |

---

## 7 · Cross-cutting notes

- **`yarn lint:i18n` is not catching everything.** `DappSwitcher.tsx:249` ships hard-coded
  English `Loading…` and `:70` hand-interpolates `{count}` outside the placeholder system.
  Worth a separate look at why the rule missed both.
- **Roughly 25 new `en.json` keys** across these 21 screens. Batch them into one commit; CI
  blocks non-i18n strings.
- **Every mock is drawn as a phone.** The spec's "one system, three targets" means each of
  these must also be checked at the **extension popup 360×600**, which `SPEC.md:114` names as
  the hardest case. #21 is the cautionary tale — it was *built* for 360×600 and hard-codes it
  on every platform.
- **Run `node design-system/review.mjs` after each screen, and look at the render.** The
  Numpad-removal decision in #14 and the tray-control moves in #11 are exactly the class of
  change that passes every numeric check while being visibly wrong, per `SPEC.md:132–146`.
