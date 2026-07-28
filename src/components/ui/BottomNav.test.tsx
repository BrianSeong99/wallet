import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import BottomNavDefault, { BottomNav, BottomNavItem } from './BottomNav';

const items: BottomNavItem[] = [
  { id: 'home', label: 'Home', icon: <svg data-testid="icon-home" /> },
  {
    id: 'activity',
    label: 'Activity',
    icon: <svg data-testid="icon-activity" />,
    iconActive: <svg data-testid="icon-activity-active" />
  },
  { id: 'settings', label: 'Settings', icon: <svg data-testid="icon-settings" /> }
];

const renderNav = (props: Partial<React.ComponentProps<typeof BottomNav>> = {}) =>
  render(<BottomNav items={items} activeId="home" onChange={jest.fn()} {...props} />);

const getTab = (label: string) => screen.getByRole('button', { name: label });
const getIndicator = () => screen.getByTestId('bottom-nav-indicator');

describe('BottomNav — exports & structure', () => {
  it('exposes the same component as the default and named export', () => {
    expect(BottomNavDefault).toBe(BottomNav);
  });

  it('renders a nav with one button per item, each carrying its icon and label', () => {
    const { container } = renderNav();

    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    // Base layout classes always present on the container. The capsule is the
    // Liquid Glass material: --nav-bg fill, full radius.
    expect(nav!.className).toContain('flex');
    expect(nav!.className).toContain('bg-nav-bg');
    expect(nav!.className).toContain('rounded-full');

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);

    // Every item's inactive icon renders by default (home is active but has no iconActive).
    expect(screen.getByTestId('icon-home')).toBeTruthy();
    expect(screen.getByTestId('icon-settings')).toBeTruthy();

    // Labels mirror each item. Labels are a settled decision — the nav is
    // never icon-only.
    expect(getTab('Home')).toBeTruthy();
    expect(getTab('Activity')).toBeTruthy();
    expect(getTab('Settings')).toBeTruthy();

    // Each button is a real submit-safe type="button".
    buttons.forEach(button => expect(button.getAttribute('type')).toBe('button'));
  });

  it('appends a caller-supplied className to the nav container', () => {
    const { container } = renderNav({ className: 'my-extra-class' });

    const nav = container.querySelector('nav')!;
    expect(nav.className).toContain('my-extra-class');
    // Base classes still present alongside the override.
    expect(nav.className).toContain('items-stretch');
  });

  it('renders an empty nav when there are no items', () => {
    const { container } = render(<BottomNav items={[]} activeId="none" onChange={jest.fn()} />);

    expect(container.querySelector('nav')).not.toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});

describe('BottomNav — active vs inactive rendering', () => {
  it('marks the active tab with aria-current="page" and leaves the others unset', () => {
    renderNav({ activeId: 'activity' });

    expect(getTab('Activity').getAttribute('aria-current')).toBe('page');
    // Inactive tabs omit the attribute entirely (undefined => not present).
    expect(getTab('Home').hasAttribute('aria-current')).toBe(false);
    expect(getTab('Settings').hasAttribute('aria-current')).toBe(false);
  });

  it('applies the neutral ink + extrabold label to the active tab and the nav-scoped dim pair to the rest', () => {
    renderNav({ activeId: 'home' });

    // The active glyph is NEUTRAL — no brand colour anywhere in the nav.
    const active = getTab('Home');
    expect(active.className).toContain('text-ink');
    expect(active.className).not.toContain('text-nav-ink-off');
    expect(active.className).not.toContain('text-accent');
    // Active label is the heavier weight (800).
    expect(active.className).toContain('font-extrabold');
    expect(active.className).not.toContain('font-semibold');

    // Inactive ink is nav-scoped rather than --ink-2, so the active/inactive
    // step reads as a real selection.
    const inactive = getTab('Settings');
    expect(inactive.className).toContain('text-nav-ink-off');
    expect(inactive.className).not.toContain('text-ink ');
    // Inactive label is semibold (600).
    expect(inactive.className).toContain('font-semibold');
    expect(inactive.className).not.toContain('font-extrabold');
  });
});

describe('BottomNav — icon vs iconActive selection', () => {
  it('renders iconActive on the active tab when the item provides one', () => {
    renderNav({ activeId: 'activity' });

    expect(screen.getByTestId('icon-activity-active')).toBeTruthy();
    // The inactive-state icon is not rendered while active.
    expect(screen.queryByTestId('icon-activity')).toBeNull();
  });

  it('falls back to the base icon on the active tab when no iconActive is provided', () => {
    // Home is active but has no iconActive => uses item.icon.
    renderNav({ activeId: 'home' });

    expect(screen.getByTestId('icon-home')).toBeTruthy();
  });

  it('renders the base icon on an inactive tab even when an iconActive exists', () => {
    // Activity has an iconActive but is inactive here => uses item.icon.
    renderNav({ activeId: 'home' });

    expect(screen.getByTestId('icon-activity')).toBeTruthy();
    expect(screen.queryByTestId('icon-activity-active')).toBeNull();
  });
});

describe('BottomNav — notification dot', () => {
  it('renders the dot only for items with showDot set', () => {
    const dotItems: BottomNavItem[] = [
      { id: 'home', label: 'Home', icon: <svg />, showDot: true },
      { id: 'settings', label: 'Settings', icon: <svg />, showDot: false },
      { id: 'activity', label: 'Activity', icon: <svg /> }
    ];
    render(<BottomNav items={dotItems} activeId="home" onChange={jest.fn()} />);

    // Exactly one dot in the whole nav — the one on Home. The hue is the
    // theme-flipping --neg token rather than a fixed palette red.
    const dots = document.querySelectorAll('.bg-neg');
    expect(dots).toHaveLength(1);

    // It lives inside the Home button and is hidden from the a11y tree.
    const homeDot = getTab('Home').querySelector('.bg-neg');
    expect(homeDot).not.toBeNull();
    expect(homeDot!.getAttribute('aria-hidden')).toBe('true');

    // No dot on the items that did not opt in.
    expect(getTab('Settings').querySelector('.bg-neg')).toBeNull();
    expect(getTab('Activity').querySelector('.bg-neg')).toBeNull();
  });
});

describe('BottomNav — selection behaviour', () => {
  it('calls onChange with the id when an inactive tab is clicked', () => {
    const onChange = jest.fn();
    renderNav({ activeId: 'home', onChange });

    fireEvent.click(getTab('Settings'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('settings');
  });

  it('forwards re-taps on the already-active tab too (owner decides no-op semantics)', () => {
    const onChange = jest.fn();
    renderNav({ activeId: 'home', onChange });

    fireEvent.click(getTab('Home'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('home');
  });

  it('reports the correct id for each distinct tab clicked', () => {
    const onChange = jest.fn();
    renderNav({ activeId: 'home', onChange });

    fireEvent.click(getTab('Activity'));
    expect(onChange).toHaveBeenLastCalledWith('activity');

    fireEvent.click(getTab('Settings'));
    expect(onChange).toHaveBeenLastCalledWith('settings');

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe('BottomNav — Liquid Glass indicator', () => {
  it('drives the indicator from --i alone, with no measurement', () => {
    const { container, rerender } = renderNav({ activeId: 'home' });
    const nav = container.querySelector('nav')!;

    expect(nav.style.getPropertyValue('--i')).toBe('0');

    rerender(<BottomNav items={items} activeId="settings" onChange={jest.fn()} />);
    expect(nav.style.getPropertyValue('--i')).toBe('2');

    // The offset itself is derived from --i — one item plus one rail per step,
    // where `%` resolves against the bubble's own width.
    expect(getIndicator().className).toContain('translate-x-[calc(var(--i)*(100%+0.375rem))]');
  });

  it('sizes the bubble to exactly one item, whatever the item count', () => {
    // 3 tabs: the design system states this case literally as
    // calc(33.3333% - .5rem).
    const { unmount } = renderNav();
    expect(getIndicator().style.width).toBe('calc(33.3333% - 0.5rem)');
    unmount();

    // 2 tabs — the extension popup drops the Explore tab.
    render(<BottomNav items={items.slice(0, 2)} activeId="home" onChange={jest.fn()} />);
    expect(getIndicator().style.width).toBe('calc(50% - 0.5625rem)');
  });

  it('renders no indicator when no item matches activeId', () => {
    render(<BottomNav items={items} activeId="nothing" onChange={jest.fn()} />);

    expect(screen.queryByTestId('bottom-nav-indicator')).toBeNull();
  });

  it('is hidden from the a11y tree and cannot swallow a tap', () => {
    renderNav();

    expect(getIndicator().getAttribute('aria-hidden')).toBe('true');
    expect(getIndicator().className).toContain('pointer-events-none');
  });
});

describe('BottomNav — deformation on travel', () => {
  it('arms the liquid keyframe when the active tab changes, and drops it when it ends', () => {
    const { rerender } = renderNav({ activeId: 'home' });

    // At rest the bubble only carries its transition, not the one-shot.
    expect(getIndicator().className).not.toContain('animate-[navliquid');

    rerender(<BottomNav items={items} activeId="activity" onChange={jest.fn()} />);
    expect(getIndicator().className).toContain('animate-[navliquid_var(--dur-normal)_var(--ease-out-cubic)]');

    fireEvent.animationEnd(getIndicator());
    expect(getIndicator().className).not.toContain('animate-[navliquid');
  });

  it('re-arms the keyframe when a second travel starts before the first ended', () => {
    const { rerender } = renderNav({ activeId: 'home' });

    rerender(<BottomNav items={items} activeId="activity" onChange={jest.fn()} />);
    expect(getIndicator().className).toContain('animate-[navliquid');

    // No animationEnd in between — the component forces a reflow so the
    // keyframe restarts rather than being ignored as already-running.
    rerender(<BottomNav items={items} activeId="settings" onChange={jest.fn()} />);
    expect(getIndicator().className).toContain('animate-[navliquid');
    expect(getIndicator().style.animation).toBe('');
  });

  it('does not squish on a re-tap of the already-active tab', () => {
    const onChange = jest.fn();
    renderNav({ activeId: 'home', onChange });

    fireEvent.click(getTab('Home'));

    expect(onChange).toHaveBeenCalledWith('home');
    expect(getIndicator().className).not.toContain('animate-[navliquid');
  });

  it('respects prefers-reduced-motion for both the travel and the squish', () => {
    renderNav();

    expect(getIndicator().className).toContain('motion-reduce:transition-none');
    expect(getIndicator().className).toContain('motion-reduce:animate-none');
  });
});
