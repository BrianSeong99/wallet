# Crust — screen-drafting brief (shared by every fragment agent)

You are drafting missing screens for **Crust**, the design system for **Bread Wallet**
(Miden L2 wallet: iOS/Android via Capacitor, Chrome/Firefox extension, Tauri desktop).

## The single hard rule

**You write to exactly one file: your assigned `design-system/_frag/<name>.html`.**
You may READ anything. You may not create, edit or delete any other file — above all not
`design-system/index.html`. Three separate sessions have lost work to concurrent edits on
that file. An integrator splices your fragment in afterwards.

## What a fragment file contains

A flat sequence of screen blocks. No `<html>`, no `<style>`, no wrapper div, no comments
outside the blocks. Each block is exactly this shape:

```html
<div><div class="scrcap"><i></i>CAPTION</div>
        <div class="phone"><div class="screen"><div class="notch"></div><div class="mock">
          <div class="stat"><span>9:41</span><span class="r">&#10022; &#9642; &#9642;</span></div>
          <div class="mpad" style="flex:1;display:flex;flex-direction:column">
            ...screen content...
          </div>
        </div></div></div>
        <div class="scrnote">RATIONALE</div></div>
```

- `CAPTION` — `Area &middot; state`, e.g. `Activity &middot; empty`. Append a tag span when it
  applies: `<span class="tag merge">gap</span>` (state the app cannot render today),
  `<span class="tag retire">bug</span>` (shipped behaviour is wrong), `<span class="tag survive">…</span>`.
- `RATIONALE` — this is the deliverable, not decoration. Say what the shipped code does, cite
  `file.tsx:line`, and say why the design resolves it. Terse, declarative, no hedging, no
  bullet lists. HTML entities for all punctuation (`&mdash;`, `&rsquo;`, `&percnt;`, `&middot;`).
- If the screen has a bottom tab bar, put `<div class="mnav">…</div>` as a sibling AFTER
  `</div>` closing `.mpad`, still inside `.mock`. Copy it verbatim from an existing screen.

## Read these first (in this order)

1. `design-system/index.html` — the CSS is one `<style>` block near the top; the screens are
   under `id="allscreens"`. **Grep it. Copy real markup.** Do not invent class names: if a
   class is not in that file it does not exist and the screen will render as unstyled text.
2. `design-system/SPEC.md`, `COMPONENTS.md`, `TOKENS.md` — the rules and the token contract.
3. The shipped source under `src/` for your area. Every claim in a `scrnote` must be checked
   against the code, with a line number. Copy strings **verbatim from
   `public/_locales/en/en.json`** — never paraphrase shipped copy.

## Class vocabulary (grep index.html for each before using it)

| Purpose | Class |
|---|---|
| Page header w/ back | `.sh2` > `.bk2` (back) + `.t2` (title) |
| Section heading | `.masset-h`, `.shlab`, `.mstk-lbl2` |
| List row | `.mrow` > `.ic` (+`.sq`/`.anon`) , `.nm`, `.ad`(`.addr`), `.rt`>`.f`/`.b`, `.go` |
| Balance/account card | `.mbc`(`.hero`) > `.top`+`.bot`, `.balrow`,`.tl`,`.amt`,`.delta`,`.perf`,`.acc`,`.acopy2` |
| Prompt / banner | `.mprompt`(`[data-status="warn"|"neg"]`) > `.ptx`>`.pt`+`.pb`, `.pcta`, `.pdis` |
| Bottom sheet | `.shscrim` + `.msheet` > `.mshandle`,`.mshead`,`.mlist` |
| Detail card | `.dcard`(`.compact`) > `.dhero`>`.tokwell`,`.hamt`,`.hfiat`; `.dmeta`>`.drow`>`.k`+`.v`; `.dtot` |
| Action zone | `.zone` > `.btn.btn-primary` / `.btn.btn-secondary` / `.gh` (ghost link); `.zpair` for two peers |
| Field | `.fld`>`label`+`.searchf`/`.fieldrow`; `.drow.filled`>`.k`+`.v` |
| Empty state | `.emptyb` > `.et` + `.eb` + `.btn` |
| Skeleton | `.skel` (title-height), `.skel2` (body-height) |
| Inline notice | `.notice` (defaults to negative; override inline for neutral) |
| Filter chips | `.filters` > `.fc`(`.on`) |
| Status colour | `data-status="pos|warn|neg|pend"` scopes `--st` / `--st-wash` |
| Toggle/segmented | `.mseg`>`.seg`(`.on`); `.tabpick` if present |
| Receipt | `.rcpt` > `.ok2` |

## Non-negotiable design rules

1. **Never colour-only.** Every status carries a word. A failed row says "Failed" *and*
   "Not sent"; a red glyph alone is SC 1.4.1.
2. **44pt minimum on every target**, and a negative margin may cancel a parent's padding but
   never outrun it (that ships an invisible overflow).
3. **No bordered/outlined buttons or chips.** Filled or ghost only.
4. **No left-accent-bar callouts.**
5. **Text ≥ 11pt.** Use the ramp tokens (`--t-caption` 11.5px is the floor), never raw px.
6. **rem everywhere**, except: 44pt touch floors, hairlines/outlines/shadows, device chrome.
7. **Accent orange `#E77537` never carries white text** except at `--t-cta` 19px bold.
   Orange *text* is `--accent-ink`. Labels on accent are near-black `#1C1A18`.
8. **Loading ≠ empty ≠ error.** If the shipped code collapses them, that is the finding.
9. Addresses/hashes in `.addr`/`.mono` (Geist Mono). Numbers use Nunito tabular.
10. Earn is flagged off — wrap any Earn surface in `data-earn-surface`. Swap is on.

## The harness will judge you

`node design-system/review.mjs` runs 13 checks over every screen in both themes: contrast,
icon contrast, indicator fill, selection-ring contrast, safe area, clipping, overflow,
targets < 44pt, text < 11pt, targets at 200% zoom, disproportionate growth at 200%, reflow at
320/360/375/402/430, and unpaintable SVG. You cannot run it (it reads index.html, which you do
not touch). Write markup that will pass it: reuse proven geometry rather than inventing spacing.

## Style of the rationale

Look at existing `.scrnote` text in index.html and match it. It is written for an engineer who
will implement the screen and a reviewer who will argue with it. Lead with the finding, name
the file and line, state the consequence in terms of what a user loses. No praise, no summary
sentences, no "this ensures".
