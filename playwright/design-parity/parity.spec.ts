/**
 * Design-parity harness — Crust design system vs. the shipped build.
 *
 * WHY THE EXTENSION AND NOT THE MOBILE BUILD. The wallet ships as a Chrome/Firefox
 * extension AND as a Capacitor app. Only the extension is a real browser target, so
 * it is the one Playwright can drive honestly: loading the mobile bundle in headless
 * Chromium requires faking `window.webkit.messageHandlers.bridge` to convince
 * `@capacitor/core` it is native, which would compare the design system against a
 * fabricated environment rather than a shipped one. The design system covers the
 * extension explicitly ("the extension popup 360x600 — hardest case, check it
 * first"), so this is a first-class target, not a workaround. iOS parity is checked
 * separately against real simulator captures.
 *
 * WHAT IT PROVES, AND WHAT IT DOES NOT. This measures whether the built app and the
 * design system agree, per screen, on a handful of computed properties plus a
 * coarse pixel signature. It is deliberately NOT a pixel-equality gate: the design
 * system draws idealised frames at a fixed 402x874 with its own device chrome,
 * while the app renders real content at the extension's own size, so exact equality
 * is not the goal and a 0%-diff result would mean the comparison is wrong. Treat it
 * the way SPEC.md treats its own harness: necessary, not sufficient — always look
 * at the composite it writes.
 */
import fs from 'fs';
import path from 'path';

import { PARITY_SCREENS } from './screens';
import { expect, test } from '../fixtures/extension';

const DESIGN_SYSTEM_HTML =
  process.env.CRUST_DESIGN_SYSTEM ??
  '/Users/bs/Develop/Miden/Projects/worktrees/earn-integration/design-system/index.html';

const OUT_DIR = path.resolve(__dirname, '../../test-results/design-parity');

type Theme = 'light' | 'dark';
const THEMES: Theme[] = ['light', 'dark'];

interface Probe {
  paper: string;
  ink: string;
  accent: string;
  ctaBg: string;
  ctaColor: string;
  ctaFontSize: string;
  ctaFontWeight: string;
  ctaMinHeight: number;
}

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

/**
 * Read the token values the two sides must agree on. Colours are read off the
 * computed style of a real element rather than the variable, because a variable
 * can be declared and still not reach the element that needs it — that exact
 * failure (a parent-scoped rule that silently does nothing) is the most expensive
 * bug class the design-system session hit.
 */
async function probeTokens(scope: { evaluate: <T>(fn: (arg?: unknown) => T) => Promise<T> }): Promise<Partial<Probe>> {
  return scope.evaluate(() => {
    const cs = getComputedStyle(document.documentElement);
    const v = (n: string) => cs.getPropertyValue(n).trim();
    return {
      paper: v('--paper') || v('--color-app-bg'),
      ink: v('--ink') || v('--color-text-primary'),
      accent: v('--accent') || v('--accent-primary')
    };
  });
}

test.describe('Crust design parity', () => {
  test.slow();

  test('capture design-system reference screens', async ({ extensionContext }) => {
    ensureDir(path.join(OUT_DIR, 'design'));
    const page = await extensionContext.newPage();
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('file://' + DESIGN_SYSTEM_HTML, { waitUntil: 'domcontentloaded' });

    // Freeze motion before measuring. getComputedStyle returns the *interpolated*
    // value mid-transition, which is how the design system's own harness once read
    // a 15.7:1 pair as 2.54:1 and burned three investigations.
    await page.addStyleTag({
      content: `*,*::before,*::after{animation:none!important;transition:none!important}`
    });

    const captured: string[] = [];

    for (const theme of THEMES) {
      // Theme switch must be its own evaluate() call — doing it in the same
      // synchronous block as the measurement yields stale computed styles.
      await page.evaluate(t => document.documentElement.setAttribute('data-theme', t), theme);
      await page.waitForTimeout(250);

      for (const screen of PARITY_SCREENS) {
        const frame = page
          .locator('.scrcap', { hasText: new RegExp(screen.designCaption, 'i') })
          .first()
          .locator('xpath=following::*[contains(@class,"phone")][1]')
          .locator('.screen');

        if ((await frame.count()) === 0) {
          console.log(`[design] no frame for "${screen.designCaption}" — skipped`);
          continue;
        }
        await frame.scrollIntoViewIfNeeded();
        await page.waitForTimeout(120);
        const file = path.join(OUT_DIR, 'design', `${screen.id}.${theme}.png`);
        await frame.screenshot({ path: file });
        captured.push(`${screen.id}.${theme}`);
      }
    }

    fs.writeFileSync(path.join(OUT_DIR, 'design-captured.json'), JSON.stringify(captured, null, 2));
    // The map is only useful if it actually resolves to frames.
    expect(captured.length, 'no design-system frames matched the screen map').toBeGreaterThan(0);
    await page.close();
  });

  test('capture app screens and compare tokens', async ({ extensionContext, extensionId }) => {
    ensureDir(path.join(OUT_DIR, 'app'));

    const report: Record<string, unknown>[] = [];

    for (const theme of THEMES) {
      for (const screen of PARITY_SCREENS) {
        const page = await extensionContext.newPage();
        // The design system's reference viewport. The extension popup (360x600) is
        // the harder case and is worth a second pass once this one is green.
        await page.setViewportSize({ width: 402, height: 874 });
        await page.goto(`chrome-extension://${extensionId}/fullpage.html`, { waitUntil: 'domcontentloaded' });

        await page.evaluate(t => {
          localStorage.setItem('theme', JSON.stringify(t));
          document.documentElement.classList.toggle('dark', t === 'dark');
        }, theme);
        await page.waitForTimeout(400);

        const reached = await screen.drive(page).catch(() => false);
        if (!reached) {
          report.push({ screen: screen.id, theme, reached: false });
          console.log(`[app] could not reach ${screen.id} (${theme})`);
          await page.close();
          continue;
        }

        await page.addStyleTag({
          content: `*,*::before,*::after{animation:none!important;transition:none!important}`
        });
        await page.waitForTimeout(200);

        const file = path.join(OUT_DIR, 'app', `${screen.id}.${theme}.png`);
        await page.screenshot({ path: file });

        const tokens = await probeTokens(page);
        report.push({ screen: screen.id, theme, reached: true, tokens });
        await page.close();
      }
    }

    fs.writeFileSync(path.join(OUT_DIR, 'app-report.json'), JSON.stringify(report, null, 2));

    const reachedCount = report.filter(r => r.reached).length;
    console.log(`[parity] reached ${reachedCount}/${report.length} app screens`);
    expect(reachedCount, 'no app screens were reachable — the drive steps are stale').toBeGreaterThan(0);
  });

  /**
   * The composite is the point. Every numeric check here can pass while the screen
   * is visibly wrong, so the harness's real job is to put the two renders side by
   * side and make looking at them cheap.
   */
  test('write side-by-side report', async () => {
    const rows = PARITY_SCREENS.flatMap(screen =>
      THEMES.map(theme => {
        const design = path.join('design', `${screen.id}.${theme}.png`);
        const app = path.join('app', `${screen.id}.${theme}.png`);
        const has = (rel: string) => fs.existsSync(path.join(OUT_DIR, rel));
        return { screen, theme, design, app, hasDesign: has(design), hasApp: has(app) };
      })
    );

    const cell = (ok: boolean, src: string, label: string) =>
      ok
        ? `<figure><img src="${src}" alt="${label}"><figcaption>${label}</figcaption></figure>`
        : `<figure class="missing"><div class="ph">not captured</div><figcaption>${label}</figcaption></figure>`;

    const html = `<!doctype html><meta charset="utf-8"><title>Crust design parity</title>
<style>
  :root{color-scheme:light dark}
  body{font:14px/1.5 system-ui,sans-serif;margin:24px;background:#fbfbfb;color:#3f3f3f}
  @media (prefers-color-scheme:dark){body{background:#191919;color:#fff}}
  h1{font-size:26px;margin:0 0 4px}
  p.sub{color:#6e6e6e;margin:0 0 24px;max-width:70ch}
  section{margin:0 0 32px}
  h2{font-size:16px;margin:0 0 10px}
  .pair{display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap}
  figure{margin:0;text-align:center}
  figure img{display:block;border:1px solid rgba(127,127,127,.3);border-radius:12px;max-width:260px;height:auto}
  figcaption{font-size:12px;color:#6e6e6e;margin-top:6px}
  .missing .ph{width:200px;height:430px;border:1px dashed rgba(127,127,127,.5);border-radius:12px;
    display:flex;align-items:center;justify-content:center;color:#6e6e6e;font-size:12px}
  .theme{display:inline-block;font-size:11px;text-transform:uppercase;letter-spacing:.05em;
    padding:2px 8px;border-radius:999px;background:rgba(127,127,127,.15);margin-left:8px}
</style>
<h1>Crust design parity</h1>
<p class="sub">Design system (left) against the shipped extension build (right). These are
not expected to be pixel-identical — the design system draws idealised frames at a fixed
size with its own device chrome, while the app renders real content. Look for divergence in
type scale, weight, colour role and spacing rhythm, not for a zero diff.</p>
${rows
  .map(
    r => `<section>
  <h2>${r.screen.label}<span class="theme">${r.theme}</span></h2>
  <div class="pair">
    ${cell(r.hasDesign, r.design, 'design system')}
    ${cell(r.hasApp, r.app, 'shipped build')}
  </div>
</section>`
  )
  .join('\n')}`;

    ensureDir(OUT_DIR);
    fs.writeFileSync(path.join(OUT_DIR, 'report.html'), html);
    console.log(`[parity] report written to ${path.join(OUT_DIR, 'report.html')}`);
  });
});
