import React, { FC, ReactNode } from 'react';

import { PropsWithChildren } from 'lib/props-with-children';
import { cn } from 'lib/ui/util';

/**
 * Shared onboarding composition primitives.
 *
 * Onboarding is the design system's north star — the surface everything else is
 * derived from — so its type, rhythm and hero scale need to be stated once
 * rather than re-invented per screen. Before this, 19 screens each chose their
 * own heading size, body treatment and spacing, which is exactly the drift the
 * system exists to remove.
 *
 * EVERYTHING HERE IS REM (via tokens or Tailwind's rem scale). No hardcoded px:
 * the whole composition has to scale together when the user changes their text
 * size, otherwise the illustration stays put while the words around it grow.
 * The one deliberate exception is the 44pt touch floor in ActionZone, which is
 * an absolute accessibility minimum — in rem it drops below 44 when a user
 * *shrinks* text.
 */

/** Page shell: the cream ground, the 24px gutter, and a full-height column. */
export const OnboardingScreen: FC<PropsWithChildren & { className?: string; testId?: string }> = ({
  children,
  className,
  testId
}) => (
  <div className={cn('bg-app-bg h-full overflow-y-auto', className)} data-testid={testId}>
    <div className="min-h-full flex flex-col px-6">{children}</div>
  </div>
);

/**
 * The centred content block between the header and the action zone.
 * `flex-1` lets it take the slack so the action zone stays pinned.
 */
export const OnboardingBody: FC<PropsWithChildren & { className?: string }> = ({ children, className }) => (
  <div className={cn('flex-1 flex flex-col items-center justify-center w-full', 'gap-stack', className)}>
    {children}
  </div>
);

/**
 * Step illustration at the system's `--hero-w`. Screens were rendering these at
 * 240–278px against a 140px spec, which is what made the flow read as
 * illustration-heavy rather than calm.
 */
export const OnboardingHero: FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('w-hero shrink-0 [&>svg]:w-full [&>svg]:h-auto', className)}>{children}</div>
);

/**
 * Step headline — `--t-title` (26px), display face, centred by default.
 * Alignment is overridable: several step mocks set the head left-aligned, so a
 * call site passing `text-left` must win. That works only because these use
 * `cn` (twMerge) rather than plain clsx — with clsx both classes survive and
 * CSS source order decides, which silently ignores the call site.
 * The design system's `.obh` is weight 900; Nunito carries it well and it is
 * what separates the headline from the body at this size.
 */
export const OnboardingHeading: FC<PropsWithChildren & { className?: string }> = ({ children, className }) => (
  <h1
    className={cn('font-heading font-black text-title leading-[1.12] text-center text-ink', className)}
    data-onboarding-heading="true"
  >
    {children}
  </h1>
);

/** Supporting copy — `--t-label` (13px) in `--ink-2`, centred. */
export const OnboardingSubcopy: FC<PropsWithChildren & { className?: string }> = ({ children, className }) => (
  <p className={cn('text-label leading-[1.45] text-center text-ink-2', className)}>{children}</p>
);
