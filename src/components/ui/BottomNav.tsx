import React, { CSSProperties, FC, ReactNode, useLayoutEffect, useRef, useState } from 'react';

import classNames from 'clsx';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  iconActive?: ReactNode;
  /** Renders a small notification dot on the tab (e.g. unclaimed notes). */
  showDot?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * The rail: the capsule's own padding AND the gap between items, which are the
 * same 0.375rem (`p-1.5` / `gap-1.5`). The indicator's geometry is derived from
 * it rather than restated, so the three can never drift apart.
 */
const RAIL_REM = 0.375;

/**
 * Width of the indicator as a share of the capsule, for `n` items.
 *
 *   capsule content = W - 2·rail          (own padding)
 *   item            = (content - (n-1)·rail) / n
 *                   = W/n - (rail/n + rail)
 *
 * so the bubble is exactly one item wide with no measurement. For the n=3 case
 * the design system states this literally as `calc(33.3333% - .5rem)`; the
 * formula reproduces that and also covers the 2-tab extension popup, which
 * drops the Explore tab.
 */
const indicatorWidth = (count: number) =>
  `calc(${Number((100 / count).toFixed(4))}% - ${RAIL_REM / count + RAIL_REM}rem)`;

export const BottomNav: FC<BottomNavProps> = ({ items, activeId, onChange, className }) => {
  const activeIndex = items.findIndex(item => item.id === activeId);

  // The liquid squish is a one-shot keyframe, so it has to be re-armed on every
  // travel — including a travel that starts while the previous one is still in
  // flight. `sliding` drives the class; the layout effect forces the reflow
  // that restarts the keyframe, which is the same remove/reflow/re-add the
  // design system's own demo does.
  const [sliding, setSliding] = useState(false);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const prevIndexRef = useRef(activeIndex);

  useLayoutEffect(() => {
    if (prevIndexRef.current === activeIndex) return;
    prevIndexRef.current = activeIndex;
    // Nothing travels from or to "no active tab", so don't squish for it.
    if (activeIndex < 0) return;

    const el = indicatorRef.current;
    if (el) {
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = '';
    }
    setSliding(true);
  }, [activeIndex]);

  // Re-taps on the active tab are forwarded too: the owner decides whether
  // they navigate (e.g. Home tap on /send returns to Overview) and owns the
  // haptic so no-op taps don't buzz. They deliberately do not re-arm the
  // squish — the bubble has nowhere to travel.
  const handleSelect = (id: string) => {
    onChange(id);
  };

  return (
    <nav
      className={classNames(
        // Apple Liquid Glass, per the design system's "Bottom nav" section: a
        // floating capsule that the content beneath peeks through. `isolate`
        // keeps the indicator's z-order local so the capsule can be dropped
        // into any stacking context.
        'relative isolate flex w-full items-stretch gap-1.5 rounded-full p-1.5',
        'min-h-[3.8125rem]',
        // Three of the material's four layers. The specular sheen is a fixed
        // white ramp in BOTH themes (it is a highlight, not a colour), over the
        // theme-flipping --nav-bg; the rim hairlines fake the read of a curved
        // edge. The fourth layer — lensing/refraction — is not expressible in
        // CSS at all, so on device the native navbar overlay is used instead
        // and this renderer is the extension/desktop one plus the fallback.
        'bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0))] bg-nav-bg',
        'backdrop-blur-[1.5rem] backdrop-saturate-[1.8]',
        'shadow-[inset_0_1px_0_var(--nav-rim),inset_0_-1px_0_var(--nav-rim-lo),var(--shadow-1)]',
        // Dark communicates lift by surface step, not by shadow.
        'dark:shadow-none',
        className
      )}
      // --i is the ONLY state the indicator needs: its offset is derived from
      // the index, so there is nothing to measure and no shared layout id. It
      // ports to the native overlay as a single number.
      style={{ '--i': Math.max(activeIndex, 0) } as CSSProperties}
    >
      {activeIndex >= 0 && (
        <span
          ref={indicatorRef}
          aria-hidden
          data-testid="bottom-nav-indicator"
          onAnimationEnd={() => setSliding(false)}
          style={{ width: indicatorWidth(items.length) }}
          className={classNames(
            'pointer-events-none absolute inset-y-1.5 left-1.5 z-0 rounded-full',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0))] bg-nav-pill',
            'shadow-[inset_0_1px_0_var(--nav-rim),0_1px_3px_rgba(0,0,0,0.06)]',
            // `%` here resolves against the bubble's OWN width — i.e. one item —
            // so one item + one rail is exactly one step of travel.
            'translate-x-[calc(var(--i)*(100%+0.375rem))]',
            'transition-transform duration-[var(--dur-normal)] ease-[var(--ease-out-cubic)]',
            'motion-reduce:transition-none',
            // The bubble DEFORMS as it travels rather than rigidly sliding —
            // that deformation is what separates Liquid Glass from a segmented
            // control. `scale` is an independent transform property, so the
            // keyframe composes with the translate instead of overwriting it.
            sliding && 'animate-[navliquid_var(--dur-normal)_var(--ease-out-cubic)]',
            'motion-reduce:animate-none'
          )}
        />
      )}

      {items.map(item => {
        const isActive = item.id === activeId;
        const iconNode = isActive && item.iconActive ? item.iconActive : item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleSelect(item.id)}
            className={classNames(
              'relative z-[1] flex flex-1 flex-col items-center justify-center gap-1 rounded-full',
              'min-h-[3.0625rem] min-w-[4.8125rem] px-2.5 py-[0.3125rem]',
              'text-caption leading-[0.8125rem] transition-colors',
              'focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]',
              // The active glyph is NEUTRAL — no brand colour in the nav. --ink
              // on the bubble measures 9.01:1 light / 12.63:1 dark, where the
              // accent's pass is far narrower; a deliberate departure from HIG's
              // "coloured glyph plus highlighted shape" in favour of the
              // reference apps and the contrast headroom.
              //
              // Inactive ink is nav-scoped rather than --ink-2: at --ink-2 the
              // active/inactive step is only 1.65:1 and reads as a weak
              // selection, and scoping it means nothing else in the system dims.
              isActive ? 'font-extrabold text-ink' : 'font-semibold text-nav-ink-off'
            )}
          >
            <span className="flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full">{iconNode}</span>
            {/* Labels stay. Slack tried label-less tabs and reported it cost
                accessibility and comprehension — a first-party outcome, which
                outranks the icon-only counter-observation.

                The weight switch (600 → 800) reverses the system's earlier
                "never change weight on activation" rule, deliberately: these
                items are fixed thirds (`flex-1`), so the label re-renders inside
                its own centred box and nothing reflows. */}
            <span>{item.label}</span>
            {item.showDot && (
              <span
                aria-hidden
                className={classNames(
                  'absolute right-3 top-0.5 h-2 w-2 rounded-full bg-neg',
                  // Ring width is one of the settled px exceptions.
                  'shadow-[0_0_0_1.5px_var(--surface)] dark:shadow-[0_0_0_1.5px_var(--surface-2)]'
                )}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
