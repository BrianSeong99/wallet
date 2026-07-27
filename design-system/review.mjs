// Automated design review for the Crust design system.
//
// Catches the classes of defect that eyeballing screenshots misses — the keypad
// overlapping the home indicator is exactly why this exists. Run it after any
// visual change:
//
//   node design-system/review.mjs                 # both themes, all screens
//   node design-system/review.mjs --shot 04       # also write PNGs matching a caption
//
// Checks, per screen, in BOTH themes:
//   1. GEOMETRY  — nothing inside the home-indicator / safe-area band, nothing
//                  clipped by the frame, no overflow
//   2. CONTRAST  — text vs composited background (4.5:1, or 3:1 for large text),
//                  currentColor icons (3:1), .nti non-text indicators (3:1), and the
//                  .sel selection ring vs the colour showing through its offset gap (3:1)
//   3. TARGETS   — every interactive element >= 44pt
//   4. TYPE      — nothing below the 11pt Apple floor
//
// The theme switch MUST happen in a separate evaluate() call from the measurement —
// doing both in one synchronous block yields stale computed styles and silently
// fabricates failures.
//
// Same trap, second form — and the cause of a false failure that survived three
// investigations. getComputedStyle returns the INTERPOLATED value while a transition is
// running. `.mseg .seg` is the only component that transitions `background` and `color`,
// so flipping data-theme started a 280ms colour transition on it; measuring 120ms later
// read white-on-#232323 (15.7:1) as rgb(187,187,187) on rgb(113,113,113) — 2.54:1.
// Every other component passed simply because it doesn't transition colour.
// prep() therefore disables ALL animation and transition for the duration of the audit,
// which makes both the theme flip and the section reveal resolve instantly.

import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Icon PRESENCE lint. The .svgic mask paints the icon's own alpha, so an SVG with
// `fill="none"` and no stroke paints NOTHING -- an invisible icon. The icon-contrast check
// cannot catch it: it measures the element's currentColor against its parent, which is a
// perfectly good ratio whether or not the mask has any coverage. key.svg and search.svg
// were both shipped invisible this way. The app gets away with these files because its
// <Icon> component injects fill/stroke as a prop; a CSS mask uses the raw file.
const lintIcons = dir => {
  const bad = [];
  for (const f of readdirSync(dir).filter(n => n.endsWith('.svg'))) {
    const src = readFileSync(join(dir, f), 'utf8');
    const paints = [...src.matchAll(/(?:fill|stroke)="([^"]+)"/g)].map(m => m[1]);
    if (!paints.some(v => v && v !== 'none')) bad.push(f);
  }
  return bad;
};

const URL = process.env.DS_URL ?? 'http://localhost:4599';
const SHOT = process.argv.includes('--shot') ? process.argv[process.argv.indexOf('--shot') + 1] : null;
const SAFE_BOTTOM = 34; // iPhone 17 home-indicator reserve, in points
const SAFE_TOP = 62;

// Reveal every section and freeze all motion, so every measurement sees the settled
// value instead of a frame partway through a transition or keyframe.
const prep = () => {
  if (!document.getElementById('audit-style')) {
    const st = document.createElement('style');
    st.id = 'audit-style';
    st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}' +
                     '.section{opacity:1!important}';
    document.head.appendChild(st);
  }
  document.querySelectorAll('.section').forEach(s => s.classList.add('active'));
  // Audit with the Earn flag ON. The site mirrors isEarnEnabled()=false, which display:none's
  // the three earn screens -- and a hidden .phone measures 0x0, so every check inside it
  // silently passes while the summary still counts it as a screen. Auditing the flag-on state
  // is also the superset: it includes the five-segment action bar that ONLY exists there.
  document.documentElement.dataset.earn = 'on';
};

const cleanup = () => {
  document.getElementById('audit-style')?.remove();
  document.documentElement.dataset.earn = 'off';   // back to the shipped state
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'allscreens'));
};

const probe = () => {
  const parse = c => {
    const m = (c || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const over = (f, g) => ({ r: f.a * f.r + (1 - f.a) * g.r, g: f.a * f.g + (1 - f.a) * g.g, b: f.a * f.b + (1 - f.a) * g.b, a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const cr = (a, b) => { const L = lum(a), M = lum(b), hi = Math.max(L, M), lo = Math.min(L, M); return (hi + 0.05) / (lo + 0.05); };
  const canvas = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const bgOf = el => {
    let n = el, st = [];
    while (n && n.nodeType === 1) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { st.push(c); if (c.a >= 0.99) break; }
      n = n.parentElement;
    }
    let base = { ...canvas, a: 1 };
    for (let i = st.length - 1; i >= 0; i--) base = over(st[i], base);
    return base;
  };

  const out = [];
  const hidden = [];
  document.querySelectorAll('.phone').forEach(ph => {
    const scr = ph.querySelector('.screen');
    if (!scr) return;
    // A zero-sized frame means it is hidden; every check below would vacuously pass.
    // Surface it instead of counting it as a clean screen.
    if (ph.getBoundingClientRect().width < 2) { hidden.push(
      ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().slice(0, 40) || '?'); return; }
    const zoom = parseFloat(getComputedStyle(ph).zoom) || 1;
    const sr = scr.getBoundingClientRect();
    const pt = v => v / zoom;
    const cap = ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || '?';
    const isSplash = !!scr.querySelector('.splash');
    // Required bottom clearance is per-frame, not global: max(16px gutter, this frame's
    // safe-area inset). An iPhone reserves 34pt for the home indicator; the extension
    // popup reserves nothing, so demanding 34 there would be a false positive.
    const mockEl = scr.querySelector('.mock');
    const safeBottom = mockEl
      ? parseFloat(getComputedStyle(mockEl).getPropertyValue('--safe-bottom')) || 0
      : 0;
    const minBottom = Math.max(16, safeBottom);
    const f = { screen: cap, inSafeArea: [], clipped: [], overflow: false, contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [] };

    const body = scr.querySelector('.mock,.mwel');
    if (body && body.scrollHeight > scr.clientHeight + 2) f.overflow = true;

    scr.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const label = (el.textContent || '').trim().slice(0, 16) || el.className?.toString().slice(0, 16) || el.tagName;
      const bottomPt = pt(sr.bottom - r.bottom);
      const topPt = pt(r.top - sr.top);
      // full-bleed art and scrims are meant to reach the frame edge
      const fullBleed = el.matches('.shot,.splash,.splash *') ||
        (cs.position === 'absolute' && parseFloat(cs.inset || '1') === 0);
      const interactive = el.matches('button,a,input,.gh,.azghost,.obback,.seg,.gcard,.ropt');
      const leaf = el.children.length === 0;

      // 1. geometry — interactive or leaf content must not sit in the safe-area bands
      if (!isSplash && !fullBleed && (interactive || leaf)) {
        if (bottomPt < minBottom - 0.5) f.inSafeArea.push({ el: label, bottomGapPt: Math.round(bottomPt), needPt: minBottom });
        if (topPt < 0 || bottomPt < 0) f.clipped.push({ el: label, topPt: Math.round(topPt), bottomPt: Math.round(bottomPt) });
      }

      // 3. targets
      if (interactive && Math.round(pt(r.height)) < 44) f.targets.push({ el: label, hPt: Math.round(pt(r.height)) });

      // 2 + 4. text
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (own && !isSplash) {
        const fg = parse(cs.color);
        if (fg) {
          const bg = bgOf(el), ratio = cr(over(fg, bg), bg), px = parseFloat(cs.fontSize);
          const large = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
          const need = large ? 3 : 4.5;
          if (ratio < need - 0.05) f.contrast.push({ t: own.slice(0, 16), px, ratio: +ratio.toFixed(2), need,
            fg: cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
            theme: document.documentElement.dataset.theme || '(unset)',
            path: (()=>{const q=[];let n=el;while(n&&n!==document.body&&q.length<6){
              q.unshift(n.tagName.toLowerCase()+(n.className&&typeof n.className==='string'?'.'+n.className.trim().split(/\s+/).join('.'):''));
              n=n.parentElement;}return q.join(' > ');})() });
          if (px < 11) f.tiny.push({ t: own.slice(0, 14), px });
        }
      }
      // 2b. currentColor icons
      if (el.classList?.contains('svgic')) {
        const fg = parse(cs.backgroundColor);
        if (fg) {
          const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
          if (ratio < 2.95) f.icons.push({ ratio: +ratio.toFixed(2) });
        }
      }
      // 2c. meaningful non-text indicators — status dots, bars, any graphic that CARRIES
      // information rather than decorating. 3:1 against its surround (SC 1.4.11).
      // Opt-in by class, deliberately: deciding whether a graphic is load-bearing is the
      // SC 1.4.11 judgement itself, and auto-detecting every filled box would flag every
      // card and surface (which are exempt) and drown the real hits. Until this check
      // existed the harness verified text and icons only, so a status token used as a
      // FILL was never measured at all — the exact hole that let --status-positive ship
      // at 2.19:1 as text while passing as a dot.
      if (el.classList?.contains('nti')) {
        // State can be carried by the border rather than the fill (the Face ID success
        // corners are border-colour only), so fall back to it when the box is transparent.
        let fg = parse(cs.backgroundColor);
        if (!fg || fg.a === 0) fg = parse(cs.borderTopColor);
        if (fg && fg.a > 0) {
          const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
          if (ratio < 2.95) f.fills.push({ el: label, ratio: +ratio.toFixed(2) });
        }
      }
      // 2d. selection ring — the .sel outline is the thing that says "this account", "this
      // guardian", "this recovery option", so it is a meaning-bearing graphical object and
      // SC 1.4.11 wants 3:1 against what it sits against.
      // outline-offset leaves a TRANSPARENT gap, so the ring is judged against whatever is
      // painted BEHIND the element, not against the card it wraps — hence bgOf(el.parentElement),
      // the same composited resolution the text check uses. A hardcoded page colour would be
      // wrong: these cards sit on --paper on a screen, on --surface inside a sheet, and on
      // --surface-2 in a well, and the ring only has to clear 3:1 against the one it is actually on.
      // Threshold is a strict 3.0 here, not the 2.95 the interpolation-prone checks above use:
      // both sides are flat tokens with prep() holding transitions frozen, so there is nothing
      // to round off and a 2.97 ring is a real failure.
      // outline-width is a PRESENCE gate only, never a reported figure: .phone applies
      // zoom:0.5, and Chromium scales and snaps the computed width through it, so the same
      // 3px rule reads "2px" inside a frame and "3px" outside. Colour is not zoom-affected.
      if (el.matches('.mbc.sel,.gcard.sel,.ropt.sel')) {
        if (cs.outlineStyle !== 'none' && (parseFloat(cs.outlineWidth) || 0) > 0) {
          const fg = parse(cs.outlineColor);
          if (fg && fg.a > 0) {
            const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
            if (ratio < 3) f.rings.push({ el: label, ratio: +ratio.toFixed(2),
              ring: cs.outlineColor, gap: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})` });
          }
        }
      }
    });
    out.push(f);
  });

  // Specimens pass. probe() otherwise only walks INSIDE .phone frames, so every declared
  // indicator in the Foundations/Components sections was invisible to the checks above and
  // reported a meaningless 0. Geometry does not apply out here (there is no device frame),
  // so this measures only the declared graphics: .nti fills/borders and .svgic icons.
  const spec = { screen: '· component specimens (outside phone frames)',
                 inSafeArea: [], clipped: [], overflow: false,
                 contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [] };
  document.querySelectorAll('.nti,.svgic').forEach(el => {
    if (el.closest('.phone')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const label = el.className?.toString().slice(0, 24) || el.tagName;
    let fg = parse(cs.backgroundColor);
    if (!fg || fg.a === 0) fg = parse(cs.borderTopColor);
    if (!fg || fg.a === 0) return;
    const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
    if (ratio < 2.95) (el.classList.contains('svgic') ? spec.icons : spec.fills)
      .push({ el: label, ratio: +ratio.toFixed(2) });
  });
  out.push(spec);
  if (hidden.length) out.push({ screen: `!! ${hidden.length} HIDDEN frame(s) not audited: ${hidden.join(', ')}`,
    inSafeArea: [], clipped: [], overflow: true, contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [] });
  return out;
};

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, bypassCSP: true });
  const page = await ctx.newPage();
  // ALWAYS bypass cache. A stale index.html silently reports OLD token values as
  // failures (or hides real ones) — this cost real debugging time.
  await ctx.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${URL}?cb=${Date.now()}`, { waitUntil: 'networkidle' });

  const results = {};
  await page.evaluate(prep);
  for (const theme of ['light', 'dark']) {
    // separate call — see header note about stale computed styles
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(120);
    results[theme] = await page.evaluate(probe);
  }
  await page.evaluate(cleanup);

  const unpaintable = lintIcons('design-system/assets/icons');
  if (unpaintable.length) {
    console.log(`\n  \u2717 UNPAINTABLE ICONS (fill="none", no stroke -> invisible under a mask):`);
    unpaintable.forEach(f => console.log(`      ${f}`));
  }

  let total = 0;
  const tally = { inSafeArea: 0, clipped: 0, overflow: 0, contrast: 0, icons: 0, fills: 0, rings: 0, targets: 0, tiny: 0 };
  for (const [theme, screens] of Object.entries(results)) {
    for (const s of screens) {
      const hits = Object.entries(tally).filter(([k]) => k === 'overflow' ? s.overflow : s[k]?.length);
      if (!hits.length) continue;
      total++;
      console.log(`\n  ✗ [${theme}] ${s.screen}`);
      for (const [k] of hits) {
        if (k === 'overflow') { console.log(`      overflow: content taller than the frame`); tally.overflow++; continue; }
        tally[k] += s[k].length;
        console.log(`      ${k}: ${JSON.stringify(s[k].slice(0, 4))}${s[k].length > 4 ? ` +${s[k].length - 4} more` : ''}`);
      }
    }
  }

  const screens = results.light.length;
  console.log(`\n${'─'.repeat(64)}`);
  console.log(`  screens checked : ${screens} × 2 themes`);
  console.log(`  failing screens : ${total}`);
  console.log(`  in safe area    : ${tally.inSafeArea}   (content under the home indicator)`);
  console.log(`  clipped         : ${tally.clipped}`);
  console.log(`  overflow        : ${tally.overflow}`);
  console.log(`  contrast        : ${tally.contrast}`);
  console.log(`  icon contrast   : ${tally.icons}`);
  console.log(`  fill contrast   : ${tally.fills}   (.nti indicators vs surround, 3:1)`);
  console.log(`  ring contrast   : ${tally.rings}   (.sel outline vs its gap, 3:1)`);
  console.log(`  targets < 44pt  : ${tally.targets}`);
  console.log(`  text < 11pt     : ${tally.tiny}`);
  console.log(`  unpaintable svg : ${unpaintable.length}   (invisible under a CSS mask)`);
  if (errors.length) console.log(`  console errors  : ${errors.length} → ${errors[0]}`);
  console.log(`${'─'.repeat(64)}`);

  if (SHOT) {
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, 'light');
    await page.evaluate(prep);
    const n = await page.evaluate(q => {
      const m = [...document.querySelectorAll('.phone')].filter(p =>
        (p.parentElement?.querySelector('.scrcap,.caphead')?.textContent || '').includes(q));
      m.forEach((p, i) => p.setAttribute('data-shot', i));
      return m.length;
    }, SHOT);
    for (let i = 0; i < n; i++) {
      await page.locator(`[data-shot="${i}"]`).screenshot({ path: `/tmp/ds-${SHOT}-${i}.png` });
    }
    console.log(`  wrote ${n} screenshot(s) to /tmp/ds-${SHOT}-*.png`);
  }

  await browser.close();
  process.exit(total || unpaintable.length ? 1 : 0);
};

run().catch(e => { console.error(e); process.exit(2); });
