import React, { FC, ReactNode } from 'react';

import classNames from 'clsx';

import { PropsWithChildren } from 'lib/props-with-children';

export interface ActionZoneProps extends PropsWithChildren {
  /** Optional secondary/ghost action, rendered BENEATH the primary. */
  secondary?: ReactNode;
  className?: string;
}

/**
 * The bottom action zone.
 *
 * The design system's rule is that the primary action sits at the SAME Y on
 * every screen, so it never jumps as the user moves between steps. Onboarding
 * did not have that: bottom padding was `pb-4`, `pb-6` and `pb-8` across
 * different screens (16 / 24 / 32px), so the CTA moved by up to 16px per step.
 * Centralising the zone is what makes the rule enforceable rather than a
 * convention everyone re-implements.
 *
 * Geometry, from the spec:
 *   - `mt-auto` pins it to the bottom of a flex column, whatever the content height
 *   - 16px above, 16px below
 *   - primary is full-width, min-height 52px (Button's h-14 is 56, so it clears)
 *   - the secondary sits BENEATH the primary, never above
 *
 * On the bottom inset: `mobile.html` already applies
 * `padding-bottom: max(16px, env(safe-area-inset-bottom))` to <body>, so the
 * inset is handled once, globally. Re-applying `env()` here would reserve it
 * TWICE and push the CTA up by the height of the home indicator. On the
 * extension and desktop there is no inset, so `env()` resolves to 0 and the
 * `max()` floor is what applies — which is why the floor has to exist at all:
 * a bare `env()` collapses to 0 on SE and in the popup, and that is the
 * flush-to-edge bug.
 *
 * Why the secondary is beneath, not above: it matches the shipped Welcome
 * screen, and on an irreversible action it is a safety property — an accidental
 * tap at the very bottom edge hits Cancel, never "send funds permanently". The
 * layout-stability argument for putting it above does not apply, because the
 * zone's height is fixed by its own padding rather than by its contents.
 */
export const ActionZone: FC<ActionZoneProps> = ({ children, secondary, className }) => (
  <div className={classNames('mt-auto w-full shrink-0', 'flex flex-col items-center gap-3', 'pt-4 pb-4', className)}>
    {children}
    {secondary}
  </div>
);

export interface GhostActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  /** Optional trailing affordance, e.g. a chevron. */
  iconRight?: ReactNode;
}

/**
 * The ghost action that pairs with the zone: 44pt tall (SC 2.5.5), label at
 * --t-label / 700 in --ink-2. Borderless by definition — a border on a tap
 * target is reserved for structural separation.
 *
 * `min-h-11` is 44px and is deliberately a px floor rather than a rem one:
 * SC 2.5.5 is an absolute minimum, and in rem the target drops below 44 as soon
 * as a user *shrinks* their text size.
 */
export const GhostAction: FC<GhostActionProps> = ({ title, iconRight, className, ...props }) => (
  <button
    type="button"
    {...props}
    className={classNames(
      'flex min-h-11 w-full items-center justify-center gap-1',
      'text-label font-bold text-ink-2',
      'cursor-pointer bg-transparent',
      'outline-none focus-visible:ring-3 focus-visible:ring-accent/50 rounded-full',
      className
    )}
  >
    {title}
    {iconRight}
  </button>
);
