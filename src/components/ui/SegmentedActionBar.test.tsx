import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { hapticSelection } from 'lib/mobile/haptics';

import SegmentedActionBarDefault, { SegmentedActionBar, SegmentedActionBarItem } from './SegmentedActionBar';

// framer-motion: the two `motion.span`s are (1) the sliding active pill —
// surface its `layoutId` — and (2) the fading label. Both just render plain
// spans; the framer-only props (layoutId/initial/animate/transition) are
// stripped so React does not warn about unknown DOM attributes.
jest.mock('framer-motion', () => ({
  __esModule: true,
  motion: {
    span: ({ children, layoutId, initial, animate, transition, ...props }: any) => (
      <span data-layout-id={layoutId} {...props}>
        {children}
      </span>
    )
  }
}));

// i18n: echo the key so the nav's accessible name is assertable without
// loading the real locale bundle.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

// Native selection buzz — spy so we can assert it fires only on a real change.
jest.mock('lib/mobile/haptics', () => ({
  hapticSelection: jest.fn()
}));

const mockHapticSelection = hapticSelection as jest.MockedFunction<typeof hapticSelection>;

const items: SegmentedActionBarItem[] = [
  { id: 'send', label: 'Send', icon: <svg data-testid="icon-send" /> },
  { id: 'receive', label: 'Receive', icon: <svg data-testid="icon-receive" /> },
  { id: 'swap', label: 'Swap', icon: <svg data-testid="icon-swap" /> }
];

const renderBar = (props: Partial<React.ComponentProps<typeof SegmentedActionBar>> = {}) =>
  render(<SegmentedActionBar items={items} activeId="send" onChange={jest.fn()} {...props} />);

// Segments are plain buttons inside a nav landmark — not tabs. See the
// component for why (route navigation, no tabpanel, no arrow-key model).
const getSegment = (label: string) => screen.getByRole('button', { name: label });

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SegmentedActionBar — exports & structure', () => {
  it('exposes the same component as the default and named export', () => {
    expect(SegmentedActionBarDefault).toBe(SegmentedActionBar);
  });

  it('renders a labelled nav with one button per item, each carrying its icon and aria-label', () => {
    renderBar();

    const nav = screen.getByRole('navigation', { name: 'walletActions' });
    expect(nav).toBeTruthy();
    // Base layout classes always present on the container.
    expect(nav.className).toContain('rounded-full');
    expect(nav.className).toContain('bg-surface-2');
    expect(nav.className).toContain('p-1');

    const segments = screen.getAllByRole('button');
    expect(segments).toHaveLength(3);

    // Every item's icon renders regardless of active state.
    expect(screen.getByTestId('icon-send')).toBeTruthy();
    expect(screen.getByTestId('icon-receive')).toBeTruthy();
    expect(screen.getByTestId('icon-swap')).toBeTruthy();

    // aria-label mirrors the item label on each button.
    expect(getSegment('Send')).toBeTruthy();
    expect(getSegment('Receive')).toBeTruthy();
    expect(getSegment('Swap')).toBeTruthy();

    // Each button is a real submit-safe type="button".
    segments.forEach(segment => expect(segment.getAttribute('type')).toBe('button'));
  });

  it('exposes no tab-widget semantics — these are route links, not tabs', () => {
    renderBar();

    // `role="tab"` would promise a tabpanel and arrow-key traversal that this
    // component neither owns nor implements.
    expect(screen.queryByRole('tablist')).toBeNull();
    expect(screen.queryAllByRole('tab')).toHaveLength(0);
    screen.getAllByRole('button').forEach(segment => {
      expect(segment.getAttribute('role')).toBeNull();
      expect(segment.getAttribute('aria-selected')).toBeNull();
    });
  });

  it('appends a caller-supplied className to the container', () => {
    renderBar({ className: 'my-extra-class' });

    const nav = screen.getByRole('navigation');
    expect(nav.className).toContain('my-extra-class');
    // Base classes still present alongside the override.
    expect(nav.className).toContain('flex');
  });

  it('renders nothing but an empty nav when there are no items', () => {
    render(<SegmentedActionBar items={[]} activeId="none" onChange={jest.fn()} />);

    expect(screen.getByRole('navigation')).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('SegmentedActionBar — active vs inactive rendering', () => {
  it('marks the active segment as the current page and leaves the others unmarked', () => {
    renderBar({ activeId: 'receive' });

    expect(getSegment('Receive').getAttribute('aria-current')).toBe('page');
    // Omitted rather than "false" — absent is the correct inactive state.
    expect(getSegment('Send').getAttribute('aria-current')).toBeNull();
    expect(getSegment('Swap').getAttribute('aria-current')).toBeNull();
  });

  it('applies the active layout classes to the selected segment and the fill classes to the rest', () => {
    renderBar({ activeId: 'send' });

    // Active: shrinks to content, shows the gap + label padding.
    expect(getSegment('Send').className).toContain('grow-[1.7]');
    expect(getSegment('Send').className).toContain('shadow-e1');
    expect(getSegment('Send').className).toContain('font-extrabold');

    // Inactive: an equal flex share, no raised surface, no bold.
    expect(getSegment('Receive').className).toContain('flex-1');
    expect(getSegment('Receive').className).not.toContain('shadow-e1');
    expect(getSegment('Receive').className).not.toContain('font-extrabold');
    expect(getSegment('Receive').className).not.toContain('grow-[1.7]');
  });

  it('renders the pill and the label only inside the active segment', () => {
    renderBar({ activeId: 'send' });

    // The label text appears exactly once — on the active segment.
    expect(screen.getByText('Send')).toBeTruthy();
    // Inactive segments render their icon but not their label text.
    // Inactive labels stay MOUNTED and collapse to zero width — revealing by
    // width rather than mounting keeps them available to assistive tech.
    expect(screen.getByText('Receive').className).toContain('max-w-0');
    expect(screen.getByText('Swap').className).toContain('max-w-0');

    // There is no separate pill element any more — the active SEGMENT carries
    // the raised surface itself, which is what removes the shared layoutId.
    const activePill = getSegment('Send');
    expect(activePill).not.toBeNull();
    expect(getSegment('Receive').className).not.toContain('bg-surface ');
  });

  it('moves the pill and label when a different segment is active', () => {
    renderBar({ activeId: 'swap' });

    expect(screen.getByText('Swap')).toBeTruthy();
    expect(screen.getByText('Send').className).toContain('max-w-0');
    expect(getSegment('Swap').className).toContain('bg-surface');
    expect(getSegment('Send').className).not.toContain('grow-[1.7]');
  });
});

describe('SegmentedActionBar — label unfurl', () => {
  // Replaces the old layoutId tests. There is no shared layout id to plumb any
  // more: the motion is a CSS flex-grow/max-width transition, so the thing
  // worth guarding is that every label STAYS in the DOM and is revealed by
  // width rather than mounted on activation — conditional rendering would hide
  // the inactive labels from assistive tech entirely.
  it('keeps every label mounted, collapsed on the inactive segments', () => {
    renderBar({ activeId: 'send' });

    for (const label of ['Send', 'Receive', 'Swap']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('reveals the active label by width and collapses the rest', () => {
    renderBar({ activeId: 'send' });

    expect(screen.getByText('Send').className).toContain('max-w-25');
    expect(screen.getByText('Send').className).toContain('opacity-100');
    expect(screen.getByText('Receive').className).toContain('max-w-0');
    expect(screen.getByText('Receive').className).toContain('opacity-0');
  });
});

describe('SegmentedActionBar — selection behaviour', () => {
  it('buzzes and calls onChange with the id when an inactive segment is clicked', () => {
    const onChange = jest.fn();
    renderBar({ activeId: 'send', onChange });

    fireEvent.click(getSegment('Receive'));

    expect(mockHapticSelection).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('receive');
  });

  it('is a no-op when the already-active segment is clicked (early return, no buzz)', () => {
    const onChange = jest.fn();
    renderBar({ activeId: 'send', onChange });

    fireEvent.click(getSegment('Send'));

    expect(mockHapticSelection).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('reports the correct id for each distinct inactive segment', () => {
    const onChange = jest.fn();
    renderBar({ activeId: 'send', onChange });

    fireEvent.click(getSegment('Swap'));

    expect(onChange).toHaveBeenCalledWith('swap');
    expect(mockHapticSelection).toHaveBeenCalledTimes(1);
  });
});
