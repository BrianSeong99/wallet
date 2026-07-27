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
 * Zone 2 of the design system's three-zone screen model (chrome / content /
 * action zone). It absorbs ALL the slack — that is the actual rule, and the one
 * most often broken: "slack belongs to the content zone, never below it.
 * Top-anchoring the content and letting the remainder pool above the buttons is
 * the single most common way a step screen reads as unfinished."
 *
 * `pb-[7%]` is optical centring, not padding. `justify-center` centres
 * geometrically, and the eye reads geometric centre as slightly low, so the
 * block is lifted ~7% — the same reason a book's text block sits above centre.
 * Without it the screen carries one obviously empty band under the content,
 * which is exactly the symptom the system uses to detect this bug, and exactly
 * what the Protection-method screen was caught on.
 *
 * The falsifiable form of the rule: in a step screen no single vertical gap may
 * exceed ~22% of screen height (~190pt at 874). A gap larger than that means
 * either the content is top-anchored when it should be centred, or the hero is
 * undersized (spec: 30–38% of screen width, ~120–150px at 402pt).
 */
export const OnboardingBody: FC<PropsWithChildren & { className?: string }> = ({ children, className }) => (
  <div className={cn('flex-1 flex flex-col items-center justify-center w-full', 'gap-stack pb-[7%]', className)}>
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
