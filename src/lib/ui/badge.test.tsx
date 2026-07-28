import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { Badge, badgeVariants } from './badge';

// Base classes shared by every variant (from the cva base string).
const BASE_CLASSES = ['inline-flex', 'w-fit', 'shrink-0', 'items-center', 'rounded-sm-token', 'text-xs', 'font-medium'];

describe('Badge', () => {
  it('renders a <span> by default carrying the badge data-slot and default variant', () => {
    const { container } = render(<Badge data-testid="badge">hello</Badge>);

    const el = screen.getByTestId('badge');
    expect(el).toBeInTheDocument();
    expect(el.tagName).toBe('SPAN');
    expect(el).toBe(container.firstChild);
    expect(el).toHaveAttribute('data-slot', 'badge');
    // variant defaults to 'default' when the prop is omitted.
    expect(el).toHaveAttribute('data-variant', 'default');
    expect(el).toHaveTextContent('hello');
    expect(el).toHaveClass(...BASE_CLASSES);
    // Default variant styling.
    expect(el).toHaveClass('bg-surface-2', 'text-ink-2');
  });

  it.each([
    ['default', ['bg-surface-2', 'text-ink-2']],
    // The accent band labels with --on-accent-sm, never white: white on the
    // brand orange is 2.90:1 and conforms only as large text.
    ['accent', ['bg-accent', 'text-on-accent-sm']],
    // Solid status pills take --paper as the on-fill ink so one declaration is
    // correct in both themes.
    ['pos', ['bg-pos', 'text-paper']],
    ['warn', ['bg-warn', 'text-paper']],
    ['neg', ['bg-neg', 'text-paper']],
    ['pend', ['bg-pend', 'text-paper']],
    // Washes invert: the status becomes the ink on its own wash.
    ['pos-wash', ['bg-pos-wash', 'text-pos']],
    ['warn-wash', ['bg-warn-wash', 'text-warn']],
    ['neg-wash', ['bg-neg-wash', 'text-neg']]
  ] as const)('applies the %s variant classes and reflects it on data-variant', (variant, expectedClasses) => {
    render(
      <Badge data-testid="badge" variant={variant}>
        badge
      </Badge>
    );

    const el = screen.getByTestId('badge');
    expect(el).toHaveAttribute('data-variant', variant);
    // The base classes are always present regardless of variant.
    expect(el).toHaveClass(...BASE_CLASSES);
    // Each variant-specific class must be present.
    for (const expectedClass of expectedClasses) {
      expect(el).toHaveClass(expectedClass);
    }
  });

  it('merges a caller-supplied className with the variant classes', () => {
    render(
      <Badge data-testid="badge" className="mt-2 px-4">
        badge
      </Badge>
    );

    const el = screen.getByTestId('badge');
    expect(el).toHaveClass('mt-2');
    // px-4 wins the tailwind-merge conflict against the base px-2.
    expect(el).toHaveClass('px-4');
    expect(el).not.toHaveClass('px-2');
    // Non-conflicting base classes survive.
    expect(el).toHaveClass('inline-flex', 'rounded-sm-token');
  });

  it('lets a caller-supplied className win a tailwind-merge conflict against a variant class', () => {
    // `cn` runs through tailwind-merge, so a conflicting bg utility from the
    // caller should replace the default variant's bg-surface-2.
    render(
      <Badge data-testid="badge" variant="default" className="bg-red-500">
        badge
      </Badge>
    );

    const el = screen.getByTestId('badge');
    expect(el).toHaveClass('bg-red-500');
    expect(el).not.toHaveClass('bg-surface-2');
  });

  it('spreads arbitrary span props onto the rendered element', () => {
    render(
      <Badge data-testid="badge" id="status-badge" role="status" aria-label="online" title="user is online">
        <span>child content</span>
      </Badge>
    );

    const el = screen.getByTestId('badge');
    expect(el).toHaveAttribute('id', 'status-badge');
    expect(el).toHaveAttribute('role', 'status');
    expect(el).toHaveAttribute('aria-label', 'online');
    expect(el).toHaveAttribute('title', 'user is online');
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('forwards event handlers passed through props', () => {
    const onClick = jest.fn();
    render(
      <Badge data-testid="badge" onClick={onClick}>
        clickable
      </Badge>
    );

    fireEvent.click(screen.getByTestId('badge'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders as its child element (via Slot) when asChild is true', () => {
    const { container } = render(
      <Badge asChild variant="accent" data-testid="badge">
        <a href="https://miden.xyz">link badge</a>
      </Badge>
    );

    // Slot merges the badge props onto the child <a> rather than wrapping it
    // in a <span>.
    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor).toHaveAttribute('href', 'https://miden.xyz');
    expect(anchor).toHaveAttribute('data-slot', 'badge');
    expect(anchor).toHaveAttribute('data-variant', 'accent');
    expect(anchor).toHaveClass(...BASE_CLASSES);
    expect(anchor).toHaveTextContent('link badge');
    // No wrapper <span> is produced when asChild is used.
    expect(container.querySelector('span')).toBeNull();
  });

  it('explicitly renders a <span> when asChild is false', () => {
    render(
      <Badge asChild={false} data-testid="badge">
        badge
      </Badge>
    );

    const el = screen.getByTestId('badge');
    expect(el.tagName).toBe('SPAN');
    expect(el).toHaveAttribute('data-slot', 'badge');
  });

  it('reflects an explicitly-passed default variant on data-variant', () => {
    render(
      <Badge data-testid="badge" variant="default">
        badge
      </Badge>
    );

    expect(screen.getByTestId('badge')).toHaveAttribute('data-variant', 'default');
  });
});

describe('badgeVariants', () => {
  it('returns the base classes with the default variant when called with no args', () => {
    const classes = badgeVariants();
    for (const base of BASE_CLASSES) {
      expect(classes).toContain(base);
    }
    // Falls back to the default variant styling.
    expect(classes).toContain('bg-surface-2');
    expect(classes).toContain('text-ink-2');
  });

  it('returns the base classes plus the default variant when variant is omitted from the options object', () => {
    const classes = badgeVariants({});
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('bg-surface-2');
  });

  it.each([
    ['default', 'bg-surface-2'],
    ['accent', 'bg-accent'],
    ['pos', 'bg-pos'],
    ['warn', 'bg-warn'],
    ['neg', 'bg-neg'],
    ['pend', 'bg-pend'],
    ['pos-wash', 'bg-pos-wash'],
    ['warn-wash', 'bg-warn-wash'],
    ['neg-wash', 'bg-neg-wash']
  ] as const)('includes the %s variant class when requested', (variant, expectedClass) => {
    const classes = badgeVariants({ variant });
    expect(classes).toContain('inline-flex');
    expect(classes).toContain(expectedClass);
  });

  it('never emits a border utility — a badge is not a bordered control', () => {
    expect(badgeVariants({ variant: 'accent' })).not.toMatch(/(^|\s)border/);
  });

  it('offers no pending wash: --pend deliberately has none', () => {
    // The status matrix is intentionally asymmetric. Inventing a pending wash
    // to square it off would be inventing a requirement.
    expect(badgeVariants({ variant: 'pend' })).toContain('bg-pend');
    expect(badgeVariants({ variant: 'pend' })).not.toContain('pend-wash');
  });

  it('produces a string usable as a className', () => {
    expect(typeof badgeVariants({ variant: 'accent' })).toBe('string');
  });
});
