import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './util';

// The one STATIC badge. Interactive filter chips are `components/Chip` — this
// primitive is deliberately not a tap target and carries no border, because
// borders are for structural separation (cards, rows, dividers) and never for
// a control.
//
// Every variant is a fill/ink PAIR, so an illegal combination cannot be built
// at a call site. Two rules make the pairs what they are:
//
//   * A solid status pill is `background: var(--status); color: var(--paper)`.
//     The on-fill label is `--paper` and NOT white: the page colour inverts per
//     theme, so the single declaration is correct in light and dark alike.
//     A wash is `background: var(--status-wash); color: var(--status)`.
//     `--pend` deliberately has no wash — the app has never needed one and
//     inventing it would be inventing a requirement.
//
//   * `accent` (the "Default" band) labels with `--on-accent-sm`, the near-black
//     at 5.78:1 — never white. White on the brand orange is 2.90:1 and conforms
//     only as large text, which a badge never is.
//
// The previous variant set (`bg-primary`, `text-primary-foreground`,
// `bg-secondary`, `bg-destructive`, `border-border`, `text-foreground`,
// `ring`, `destructive`) was stock shadcn naming. None of those tokens exist in
// this app's Tailwind palette or in main.css, so every one of them emitted no
// CSS at all — the badge rendered as bare unfilled text and each call site had
// to re-specify a background by hand.
const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-sm-token px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-colors duration-150 ease-hover [&>svg]:pointer-events-none [&>svg]:size-3',
  {
    variants: {
      variant: {
        default: 'bg-surface-2 text-ink-2',
        accent: 'bg-accent text-on-accent-sm',
        pos: 'bg-pos text-paper',
        warn: 'bg-warn text-paper',
        neg: 'bg-neg text-paper',
        pend: 'bg-pend text-paper',
        'pos-wash': 'bg-pos-wash text-pos',
        'warn-wash': 'bg-warn-wash text-warn',
        'neg-wash': 'bg-neg-wash text-neg'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

function Badge({
  className,
  variant = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span';

  return (
    <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
