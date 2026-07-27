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
 *   - `sticky bottom-0` keeps it pinned once the content OUTGROWS the viewport
 *   - 16px above, 16px below
 *   - primary is full-width, min-height 52px (Button's h-14 is 56, so it clears)
 *   - the secondary sits BENEATH the primary, never above
 *
 * Why both `mt-auto` and `sticky`: they cover the two halves of the same rule
 * and neither covers the other. `mt-auto` handles the short-content case — the
 * zone falls to the bottom of the column instead of hugging the content. But
 * `mt-auto` pins the zone to the bottom of the *column*, not of the *viewport*,
 * so the moment the content is taller than the screen (the 360x600 extension
 * popup and the 375x667 SE are the cases the system names) the zone is pushed
 * below the fold and the primary action scrolls away. `sticky bottom-0` is what
 * makes "the primary sits at the same Y on every screen" survive a short
 * viewport: the content scrolls BENEATH the zone, which is exactly how the
 * design system words it. That requires the zone to be opaque, hence
 * `bg-app-bg` — the same ground `OnboardingScreen` paints, as a theme-flipping
 * token so it follows dark mode — and `z-10` so it paints over the content it
 * is covering rather than under it.
 *
 * Sticky needs the right ancestor chain: the scroll container is
 * `OnboardingScreen`'s OUTER div (`overflow-y-auto`) and the zone's containing
 * block is the inner `min-h-full flex flex-col` column, with nothing in between
 * that clips overflow. If a future screen wraps the zone in its own
 * `overflow-hidden` box, the sticky silently degrades to static — which is the
 * failure mode to look for if a CTA starts scrolling away again.
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
 * The design system's Viewports section says the inset is *additive* ("24px +
 * env(safe-area-inset-bottom)"); SPEC.md, COMPONENTS.md and the mock's own
 * `.zone` rule (`padding-bottom: max(1rem, var(--safe-bottom, 0))`) all say
 * max(), and SPEC.md names the cost of the additive form outright — it wastes
 * ~48dp under Android's 3-button nav. max() is what is implemented; the
 * additive wording is the outlier.
 *
 * Why the secondary is beneath, not above: it matches the shipped Welcome
 * screen, and on an irreversible action it is a safety property — an accidental
 * tap at the very bottom edge hits Cancel, never "send funds permanently". The
 * layout-stability argument for putting it above does not apply, because the
 * zone's height is fixed by its own padding rather than by its contents.
 */
export const ActionZone: FC<ActionZoneProps> = ({ children, secondary, className }) => (
  <div
    className={classNames(
      'mt-auto w-full shrink-0',
      'sticky bottom-0 z-10 bg-app-bg',
      'flex flex-col items-center gap-3',
      'pt-4 pb-4',
      className
    )}
  >
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
