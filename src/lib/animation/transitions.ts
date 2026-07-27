import type { Transition, Variants } from 'framer-motion';

/**
 * Page transitions — Apple's iOS parallax push.
 *
 * The design system picked this over the four competing "push from right"
 * specs the audit found, and expresses it through framer-motion because the app
 * already ships framer-motion; adding a second animation system to get one
 * curve would be the worse trade. The curve is also what vaul already uses for
 * sheets, so screens and sheets agree instead of drifting apart.
 *
 * A push is TWO layers, and that is the whole point. The incoming screen
 * travels the full width while the outgoing one moves only a third of it and
 * dims slightly — that difference in travel is the parallax, and it is what
 * makes the new screen read as arriving *over* the old one rather than the pair
 * sliding together like a carousel.
 *
 * 99.5% rather than 100% deliberately: at exactly 100% a subpixel rounding gap
 * can show the background through the seam between the two layers mid-flight.
 *
 * Going back is not the forward animation reversed. The incoming (previous)
 * screen comes from the left, and the outgoing screen travels the FULL width
 * out to the right at full opacity — it is being uncovered, not dimmed away.
 */
export const iosPush = { duration: 0.54, ease: [0.32, 0.72, 0, 1] } as const satisfies Transition;

export type NavigationDirection = 'forward' | 'backward';

interface PushVariantOptions {
  direction: NavigationDirection;
  /** Skip all travel and cross-fade instead. */
  reduceMotion?: boolean | null;
  /** Right-to-left locales mirror the whole gesture. */
  isRTL?: boolean;
}

/**
 * Build the three variants for one push. Returned as a `Variants` map to be
 * passed to `variants` — NOT to `transition`, which is where they were before
 * and is why nothing animated: framer-motion resolves `initial="initialState"`
 * against `variants`, so with the map in the wrong prop the names matched
 * nothing and every screen rendered at rest.
 */
export const pushVariants = ({ direction, reduceMotion, isRTL = false }: PushVariantOptions): Variants => {
  // Reduced motion keeps the state change legible without moving anything:
  // a cross-fade still tells you the screen changed.
  if (reduceMotion) {
    return {
      initialState: { opacity: 0 },
      animateState: { opacity: 1 },
      exitState: { opacity: 0 }
    };
  }

  const dir = isRTL ? -1 : 1;
  const back = direction === 'backward';

  return {
    initialState: { x: `${dir * (back ? -99.5 : 99.5)}%`, opacity: 1 },
    animateState: { x: '0%', opacity: 1 },
    // The outgoing layer. Forward: a third of the width, dimmed to .8 — the
    // parallax. Back: the full width at full opacity, because it is being
    // revealed rather than covered.
    exitState: { x: `${dir * (back ? 99.5 : -33)}%`, opacity: back ? 1 : 0.8 }
  };
};
