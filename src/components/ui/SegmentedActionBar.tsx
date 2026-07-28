import React, { FC, ReactNode } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { hapticSelection } from 'lib/mobile/haptics';

export interface SegmentedActionBarItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface SegmentedActionBarProps {
  items: SegmentedActionBarItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

/**
 * The home action bar — the design system's `.mseg` segmented control.
 *
 * THE ANIMATION IS NOT A SLIDING PILL, which is why there is no framer-motion
 * `layoutId` here any more. The active segment GROWS (`flex-grow: 1 -> 1.7`)
 * while its label unfurls from `max-width: 0`, and the inactive segments
 * collapse back to icon-only. Every moving part is a CSS transition on
 * `flex-grow` / `max-width` / `background` / `box-shadow` / `color`, so the
 * layout does the work: nothing is measured, nothing shares a layout id, and
 * two bars can mount at once without colliding (which is what the `layoutId`
 * prop existed to work around — it is gone with it).
 *
 * That also fixes a real defect of the old implementation: the active segment
 * was `shrink-0` with the inactive ones `flex-1`, so the pill's width came from
 * its label's text length. A longer translation made the whole bar re-flow,
 * and `layoutId` animated between two boxes whose sizes were content-derived
 * rather than specified.
 *
 * Sizing: `h-11` is 2.75rem = 44pt, the touch floor (SC 2.5.5), and it is what
 * stops the collapsed segments compressing on a narrow viewport.
 *
 * Icon colour: each action glyph keeps its OWN hue — that is what makes an
 * Activity row and its action-bar glyph read as the same thing. The glyphs are
 * `currentColor` SVGR inlines, and `TabLayout` passes `text-act-*` per action,
 * so the hue arrives by inheritance. Do not add a colour here; it would flatten
 * all four to one ink.
 */
export const SegmentedActionBar: FC<SegmentedActionBarProps> = ({ items, activeId, onChange, className }) => {
  const { t } = useTranslation();

  const handleSelect = (id: string) => {
    if (id === activeId) return;
    hapticSelection();
    onChange(id);
  };

  return (
    // Navigation landmark, not a tablist: every segment changes the route
    // (TabLayout maps ids through ACTION_ROUTES) rather than swapping a
    // tabpanel. `role="tab"` would also advertise arrow-key traversal we
    // don't implement. Same semantics as BottomNav.
    <nav
      aria-label={t('walletActions')}
      className={classNames('flex items-center gap-1 rounded-full bg-surface-2 p-1', className)}
    >
      {items.map(item => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            aria-label={item.label}
            onClick={() => handleSelect(item.id)}
            className={classNames(
              'flex h-11 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-full',
              'text-ink outline-none focus-visible:ring-3 focus-visible:ring-accent/50',
              // The four properties the design system transitions. `flex-grow`
              // is the one that carries the motion.
              'transition-[flex-grow,background-color,box-shadow,color] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
              'motion-reduce:transition-none',
              isActive && 'grow-[1.7] bg-surface text-caption font-extrabold tracking-[0.01em] shadow-e1'
            )}
          >
            <span className="flex size-[1.125rem] shrink-0 items-center justify-center [&>svg]:h-full [&>svg]:w-full">
              {item.icon}
            </span>
            {/* The label unfurls rather than mounting: animating `max-width`
                from 0 keeps it in the DOM for assistive tech at every width,
                where conditionally rendering it would not.

                Hidden below 380pt. Five segments overflow the 360pt extension
                popup by 9.1pt, and the collapsed chips are already on their
                44pt floor so they cannot absorb it — dropping the active
                label is the only slack left. Today's bar is four segments
                (Earn is flag-gated off), so this only bites when Earn ships. */}
            <span
              className={classNames(
                'overflow-hidden whitespace-nowrap text-ellipsis leading-none',
                'transition-[max-width,opacity,margin-left] duration-[280ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
                'motion-reduce:transition-none',
                isActive ? 'ml-1 max-w-25 opacity-100 max-[379px]:hidden' : 'max-w-0 opacity-0'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default SegmentedActionBar;
