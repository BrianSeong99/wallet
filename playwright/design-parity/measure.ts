/**
 * Geometry + alignment measurement for the design-parity harness.
 *
 * Screenshots do not catch alignment drift — you have to measure it. These checks
 * mirror the rules the Crust spec states numerically, so they can be run against
 * the live app and against the design-system frame and compared:
 *
 *   - Action zone: the primary CTA sits at the SAME distance from the bottom on
 *     every screen. The spec calls this out explicitly because "today's builds
 *     drift". Also: gutter 24, CTA min-height 52.
 *   - Secondary/ghost sits BENEATH the primary, never above — on an irreversible
 *     action an accidental tap at the very bottom edge must hit Cancel, never
 *     "send funds permanently".
 *   - Touch targets >= 44pt (SC 2.5.5). This is an absolute px floor, not rem:
 *     in rem it drops below 44 when a user *shrinks* text.
 *   - Type floor 11pt.
 *   - Nothing interactive within max(16px, safe-bottom) of the bottom edge.
 *   - Nothing clipped horizontally, nothing overflowing vertically.
 *
 * Everything returns data rather than asserting, so the caller decides what is a
 * failure and what is an expected difference between an idealised frame and a
 * real screen.
 */

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ActionZone {
  /** Text of the primary CTA, for identification in the report. */
  label: string;
  rect: Rect;
  /** Distance from the CTA's bottom edge to the bottom of the viewport. */
  bottomOffset: number;
  /** Left inset — the page gutter. */
  gutterLeft: number;
  /** Right inset. Should equal gutterLeft; asymmetry is the bug this catches. */
  gutterRight: number;
  height: number;
}

export interface SmallTarget {
  tag: string;
  label: string;
  w: number;
  h: number;
}

export interface TinyText {
  text: string;
  fontSize: number;
}

export interface Measurements {
  viewport: { w: number; h: number };
  primary: ActionZone | null;
  /** Every button/link, top-to-bottom, so ordering (primary above secondary) is checkable. */
  actionOrder: { label: string; y: number; isPrimary: boolean }[];
  smallTargets: SmallTarget[];
  tinyText: TinyText[];
  /** Interactive elements whose bottom edge sits inside the safe-area floor. */
  inSafeArea: { label: string; bottomOffset: number }[];
  horizontalOverflow: boolean;
  verticalOverflow: boolean;
}

/**
 * Runs in the page. Kept as a single self-contained function because Playwright
 * serialises it across the boundary — it cannot close over anything here.
 */
export const measureInPage = (safeBottomFloor: number): Measurements => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const isVisible = (el: Element) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
  };

  const labelOf = (el: Element) =>
    (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);

  const interactiveSel = 'button,a,input,select,textarea,[role="button"],[role="link"],[tabindex]:not([tabindex="-1"])';
  const interactive = Array.from(document.querySelectorAll(interactiveSel)).filter(isVisible);

  // The primary CTA: the accent-filled, full-width-ish button lowest on the
  // screen. Identified by fill rather than by class so it survives a restyle.
  let primary: ActionZone | null = null;
  let bestY = -1;
  for (const el of interactive) {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundColor;
    const r = el.getBoundingClientRect();
    // Accent fill = a saturated non-transparent background on a wide element.
    const m = bg.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/);
    if (!m) continue;
    const [rr, gg, bb] = [Number(m[1]), Number(m[2]), Number(m[3])];
    const max = Math.max(rr, gg, bb);
    const min = Math.min(rr, gg, bb);
    const saturated = max - min > 40;
    if (!saturated) continue;
    if (r.width < vw * 0.5) continue;
    if (r.y > bestY) {
      bestY = r.y;
      primary = {
        label: labelOf(el),
        rect: { x: r.x, y: r.y, w: r.width, h: r.height },
        bottomOffset: vh - (r.y + r.height),
        gutterLeft: r.x,
        gutterRight: vw - (r.x + r.width),
        height: r.height
      };
    }
  }

  const actionOrder = interactive
    .map(el => {
      const r = el.getBoundingClientRect();
      return {
        label: labelOf(el),
        y: Math.round(r.y),
        isPrimary: primary != null && Math.abs(r.y - primary.rect.y) < 1 && Math.abs(r.width - primary.rect.w) < 1
      };
    })
    .sort((a, b) => a.y - b.y);

  const smallTargets = interactive
    .map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), label: labelOf(el), w: Math.round(r.width), h: Math.round(r.height) };
    })
    // 44pt floor, with 0.5px slack for subpixel layout.
    .filter(t => t.w < 43.5 || t.h < 43.5);

  const tinyText: TinyText[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    const text = (node.textContent ?? '').trim();
    if (!text) continue;
    const parent = node.parentElement;
    if (!parent || !isVisible(parent)) continue;
    const fs = parseFloat(getComputedStyle(parent).fontSize);
    if (fs < 11) tinyText.push({ text: text.slice(0, 30), fontSize: fs });
  }

  const inSafeArea = interactive
    .map(el => {
      const r = el.getBoundingClientRect();
      return { label: labelOf(el), bottomOffset: vh - (r.y + r.height) };
    })
    .filter(t => t.bottomOffset < safeBottomFloor && t.bottomOffset > -200);

  const de = document.documentElement;
  return {
    viewport: { w: vw, h: vh },
    primary,
    actionOrder,
    smallTargets,
    tinyText,
    inSafeArea,
    horizontalOverflow: de.scrollWidth > vw + 1,
    verticalOverflow: de.scrollHeight > vh + 1
  };
};

/** Spec constants, so the report can state the rule it is checking. */
export const RULES = {
  gutter: 24,
  ctaMinHeight: 52,
  touchFloor: 44,
  typeFloor: 11,
  safeBottomFloor: 16
} as const;
