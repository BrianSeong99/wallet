import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge has to be TOLD about the Crust type ramp.
 *
 * Its built-in font-size group only knows Tailwind's own `text-xs … text-9xl`.
 * Every ramp step we added — `text-title`, `text-body`, `text-caption` … — is
 * unknown to it, so it fell through to the CATCH-ALL text-colour group and
 * collided with the colour token sitting beside it. Last one won:
 *
 *   twMerge('font-black text-title text-center text-ink')
 *     -> 'font-black text-center text-ink'      // text-title silently dropped
 *
 * which is why `OnboardingHeading` and `OnboardingSubcopy` rendered at the
 * inherited 16px on every screen that used them, headline and body copy alike.
 * Nothing errored and nothing was missing from the compiled CSS — the class was
 * removed at runtime, after Tailwind had done its job.
 *
 * Declaring the ramp here puts these back in the font-size group, where they
 * conflict only with each other and a call-site override actually wins.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'caption',
            'label',
            'body',
            'subhead',
            'cta',
            'heading',
            'title',
            'title-lg',
            'numeric-hero',
            'display-xl'
          ]
        }
      ]
    }
  }
});
export const clearClipboard = () => {
  window.navigator.clipboard.writeText('');
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
