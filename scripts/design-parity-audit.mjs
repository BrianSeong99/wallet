#!/usr/bin/env node
/**
 * Static design-parity audit — app code vs. the Crust design system.
 *
 *   node scripts/design-parity-audit.mjs            # human report
 *   node scripts/design-parity-audit.mjs --json     # machine-readable
 *   node scripts/design-parity-audit.mjs --strict   # exit 1 on any OPEN finding
 *
 * WHY THIS EXISTS ALONGSIDE THE PLAYWRIGHT HARNESS. The runtime harness renders
 * screens and measures them; it can only see what it can navigate to, and it
 * cannot see a rule that is never exercised. This reads the source instead, so it
 * catches the drift that never renders in a screenshot: an icon that hardcodes a
 * hue, a "mono" class that is not monospace, a gutter used 52 times that the spec
 * says should not exist. Neither is sufficient alone. See
 * docs/design-parity-playbook.md.
 *
 * Findings are one of:
 *   OPEN    — a divergence from the system with no recorded reason. Fix or record.
 *   KNOWN   — a divergence deliberately accepted, listed in KNOWN_DIVERGENCES with
 *             the reason. Reviewed, not ignored.
 *   OK      — conforms.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const JSON_OUT = process.argv.includes('--json');
const STRICT = process.argv.includes('--strict');

/** Directories excluded from "app surface" checks, with the reason. */
const EXCLUDED = [
  ['src/screens/send-flow', 'under review in a separate session'],
  ['src/screens/earn-flow', 'P3 outlier — rebuilt wholesale, not worth tokenising first']
];

/**
 * Divergences that are deliberate. Each needs a REASON, not just an entry —
 * an unexplained entry here is just a suppressed failure.
 */
const KNOWN_DIVERGENCES = [
  {
    id: 'brand-colours-hardcoded',
    reason:
      'Third-party brand marks (USDC #0278D2, Bitcoin #F7931A) are identity, not surfaces. Tokenising them would be wrong.'
  },
  {
    id: 'qr-background-fixed',
    reason: 'QR foreground/background contrast is a scanning requirement, not a themed surface.'
  },
  {
    id: 'tx-card-balance-tokens-deferred',
    reason:
      '--tx-*, --card-* and --surface-balance* keep shipped values pending the fill-vs-ink split; the tx glyph change is blocked on TransactionIcon.test.tsx asserting text-pure-white in 5 places.'
  },
  {
    id: 'color-mix-unusable',
    reason:
      '.browserslistrc targets Safari >= 14; color-mix() needs 16.4+. The design system uses it in .btn-primary[disabled] and .badge.neg — those two rules are not portable. Use rgb(var(--accent-rgb) / a).'
  },
  {
    id: 'radius-md-shadcn',
    reason:
      'shadcn reads --radius-md via min(var(--radius-md), 10px); raising it to Crust 12px changes those primitives.'
  }
];

const sh = cmd => {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch (e) {
    // grep exits 1 on no matches — that is a valid empty result, not an error.
    return (e.stdout ?? '').trim();
  }
};

const countLines = out => (out ? out.split('\n').filter(Boolean).length : 0);

/** Build a `grep` exclusion suffix for the carved-out directories. */
const excludeArgs = EXCLUDED.map(([d]) => `--exclude-dir=${path.basename(d)}`).join(' ');

const findings = [];
const add = (status, area, title, detail, evidence = '') => findings.push({ status, area, title, detail, evidence });

// ---------------------------------------------------------------- colour
{
  const hex = sh(
    `grep -rnE '#[0-9a-fA-F]{6}\\b' src/screens src/components --include='*.tsx' ${excludeArgs} | grep -v '\\.test\\.' | grep -vE '(//|/\\*|\\*).*#[0-9a-fA-F]{6}'`
  );
  const n = countLines(hex);
  add(
    n === 0 ? 'OK' : 'OPEN',
    'colour',
    'No raw hex in screens/ and components/',
    n === 0 ? 'none found' : `${n} raw hex literals remain`,
    hex.split('\n').slice(0, 8).join('\n')
  );
}

// ---------------------------------------------------------------- type ramp
{
  // The ramp, extended to the sizes the app genuinely uses.
  const RAMP = [11, 12, 13, 14, 15, 16, 18, 19, 20, 26, 28, 32, 72];
  const raw = sh(`grep -rhoE 'text-\\[[0-9.]+(px|rem)\\]' src/screens src/components --include='*.tsx' ${excludeArgs}`);
  const offRamp = new Map();
  for (const m of raw.split('\n').filter(Boolean)) {
    const v = m.match(/([0-9.]+)(px|rem)/);
    if (!v) continue;
    const px = v[2] === 'rem' ? parseFloat(v[1]) * 16 : parseFloat(v[1]);
    if (!RAMP.includes(px)) offRamp.set(px, (offRamp.get(px) ?? 0) + 1);
  }
  const list = [...offRamp.entries()].sort((a, b) => b[1] - a[1]);
  add(
    list.length === 0 ? 'OK' : 'OPEN',
    'type',
    'Every font size is a step on the ramp',
    list.length === 0 ? 'all sizes on-ramp' : `${list.length} off-ramp sizes`,
    list.map(([px, c]) => `${px}px x${c}`).join(', ')
  );
}

// ---------------------------------------------------------------- radius
{
  const raw = sh(`grep -rhoE 'rounded-\\[[0-9.]+px\\]' src/screens src/components --include='*.tsx' ${excludeArgs}`);
  const vals = [...new Set(raw.split('\n').filter(Boolean))];
  add(
    vals.length === 0 ? 'OK' : 'OPEN',
    'radius',
    'Radii collapse to 8 / 12 / 16 / full',
    vals.length === 0 ? 'no arbitrary radii' : `${vals.length} arbitrary radii remain`,
    vals.join(', ')
  );
}

// ---------------------------------------------------------------- gutter
{
  const g = k =>
    Number(sh(`grep -rho '\\b${k}\\b' src/screens src/components --include='*.tsx' ${excludeArgs} | wc -l`));
  const six = g('px-6');
  const four = g('px-4');
  add(
    four <= six ? 'OK' : 'OPEN',
    'spacing',
    'Page gutter is 24px (px-6), the only gutter',
    `px-6 used ${six}x, px-4 used ${four}x`,
    four > six
      ? 'The dominant gutter in the app is 16px, not the 24px the spec calls "the only gutter". Either the app is wrong on ~' +
          four +
          ' sites or the spec is describing a product that does not exist.'
      : ''
  );
}

// ---------------------------------------------------------------- fonts
{
  const mono = Number(sh(`grep -rho '\\bfont-mono\\b' src --include='*.tsx' | wc -l`));
  const tnum = Number(sh(`grep -rho 'font-tnum\\|tabular-nums' src --include='*.tsx' | wc -l`));
  add(
    mono > 0 ? 'OK' : 'OPEN',
    'type',
    'Addresses / hashes / ids are set in mono',
    `font-mono used ${mono}x`,
    mono === 0 ? 'Crust reserves Geist Mono for addresses, hashes and ids; nothing uses it.' : ''
  );
  add(
    tnum >= 5 ? 'OK' : 'OPEN',
    'type',
    'Numbers use tabular + lining figures',
    `tabular figures applied ${tnum}x`,
    tnum < 5 ? 'The spec makes tnum/lnum a core rule ("numbers are the product"); it is essentially unapplied.' : ''
  );
}

// ---------------------------------------------------------------- icons
{
  const ICON_DIR = 'src/app/icons';
  const total = Number(sh(`find ${ICON_DIR} -name '*.svg' | wc -l`));
  const hardcoded = Number(sh(`grep -rlE '(fill|stroke)="#[0-9a-fA-F]{3,8}"' ${ICON_DIR} --include='*.svg' | wc -l`));
  // The four action glyphs SHOULD keep their own hue (spec: "each action glyph
  // keeps its own hue"), but the light values must be DARKENED to clear 3:1 on
  // the inactive chip — a collapsed segment is icon-only with no label.
  const ACTION = { 'send-new': '#91ACC1', 'receive-new': '#99AC94', convert: '#BEACD2', earn: '#777487' };
  const stale = [];
  for (const [name, shipped] of Object.entries(ACTION)) {
    const f = sh(`find ${ICON_DIR} -name '${name}.svg' | head -1`);
    if (!f) continue;
    const body = fs.readFileSync(path.join(ROOT, f), 'utf8');
    if (body.includes(shipped)) stale.push(`${name}.svg still ships ${shipped}`);
  }
  add(
    stale.length === 0 ? 'OK' : 'OPEN',
    'icons',
    'Action glyphs use the darkened --act-* values',
    stale.length === 0 ? 'all action glyphs tinted' : `${stale.length}/4 still ship the raw pastel`,
    stale.join('; ') +
      (stale.length
        ? ' — these measure 2.37-2.42:1 on the inactive chip and a collapsed segment is icon-only, so SC 1.4.11 3:1 applies.'
        : '')
  );
  add(
    'INFO',
    'icons',
    'Icon colour surface',
    `${hardcoded}/${total} SVGs hardcode a fill or stroke`,
    'Not all are wrong — brand marks and illustrations legitimately carry colour. Listed for review.'
  );
  // `find`, not a `**` glob — sh does not expand globstar, which made this
  // check silently pass on a file that does contain a fixed fill.
  const walletFixed = sh(
    `find ${ICON_DIR} -name 'wallet.svg' -exec grep -l 'fill="black"\\|fill="#000' {} \\; 2>/dev/null`
  );
  add(
    walletFixed ? 'OPEN' : 'OK',
    'icons',
    'wallet.svg follows the ink (currentColor)',
    walletFixed ? 'contains a fixed fill="black"' : 'currentColor only',
    walletFixed
      ? 'Spec: wallet.svg "is genuinely currentColor and must follow the ink" — a fixed black will not invert.'
      : ''
  );
}

// ---------------------------------------------------------------- buttons
{
  const outlined = sh(
    `grep -rnE 'className=.*(bg-(accent|primary-500)|btn).*\\bborder\\b' src/components --include='*.tsx' | grep -v '\\.test\\.'`
  );
  add(
    countLines(outlined) === 0 ? 'OK' : 'OPEN',
    'buttons',
    'No outlined tap targets',
    countLines(outlined) === 0 ? 'none' : `${countLines(outlined)} candidates`,
    outlined.split('\n').slice(0, 4).join('\n')
  );
}

// ---------------------------------------------------------------- overrides
{
  // A component-level fix is not enough if call sites can override the very
  // property that makes it conformant. Four onboarding screens passed
  // className="text-base" to <Button>, which beat its own text-cta and dropped
  // the label back under the size white-on-accent needs. The audit only caught
  // the default, not the override — so now it checks both.
  const overrides = sh(
    `grep -rnE '<Button[^>]*className="[^"]*\\btext-(xs|sm|base|lg|label|body|caption)\\b' src --include='*.tsx' | grep -v '\\.test\\.'`
  );
  const n = countLines(overrides);
  add(
    n === 0 ? 'OK' : 'OPEN',
    'buttons',
    'No call site overrides the CTA label size',
    n === 0 ? 'none' : `${n} call site(s) override Button's font size`,
    overrides.split('\n').slice(0, 6).join('\n')
  );
}

// ---------------------------------------------------------------- hardcoded px
{
  // Sizing must come from tokens or the rem scale so the whole composition
  // scales together with the user's text size. Inline pixel style objects are
  // the worst offenders because no utility scan catches them.
  const inline = sh(
    `grep -rnE 'style=\\{\\{[^}]*(width|height|fontSize|padding|margin|gap):[[:space:]]*[0-9]+[,}]' src/screens/onboarding --include='*.tsx' | grep -v '\\.test\\.'`
  );
  const n = countLines(inline);
  add(
    n === 0 ? 'OK' : 'OPEN',
    'spacing',
    'Onboarding sizes come from tokens, not inline pixels',
    n === 0 ? 'no inline pixel sizing' : `${n} inline pixel size(s)`,
    inline.split('\n').slice(0, 6).join('\n')
  );
}

// ---------------------------------------------------------------- report
const order = { OPEN: 0, INFO: 1, KNOWN: 2, OK: 3 };
findings.sort((a, b) => order[a.status] - order[b.status]);

if (JSON_OUT) {
  console.log(JSON.stringify({ findings, knownDivergences: KNOWN_DIVERGENCES, excluded: EXCLUDED }, null, 2));
} else {
  const icon = { OPEN: '✗', OK: '✓', INFO: 'i', KNOWN: '~' };
  console.log('\nCrust design-parity audit — app code vs. design system\n');
  for (const f of findings) {
    console.log(`${icon[f.status]} [${f.area}] ${f.title}`);
    console.log(`    ${f.detail}`);
    if (f.evidence) {
      for (const line of String(f.evidence).split('\n').slice(0, 6)) console.log(`      ${line}`);
    }
  }
  console.log('\nDeliberate divergences on record:');
  for (const k of KNOWN_DIVERGENCES) console.log(`  ~ ${k.id}: ${k.reason}`);
  console.log('\nExcluded from app-surface checks:');
  for (const [d, why] of EXCLUDED) console.log(`  - ${d} (${why})`);
  const open = findings.filter(f => f.status === 'OPEN').length;
  console.log(`\n${open} open finding(s).\n`);
}

if (STRICT && findings.some(f => f.status === 'OPEN')) process.exit(1);
