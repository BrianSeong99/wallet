import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { hapticLight } from 'lib/mobile/haptics';

import { Chip } from './Chip';

// Mock haptics
jest.mock('lib/mobile/haptics', () => ({
  hapticLight: jest.fn()
}));

describe('Chip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a string label', () => {
    render(<Chip label="Hello" />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders a ReactNode label', () => {
    render(<Chip label={<span data-testid="node-label">Node</span>} />);

    expect(screen.getByTestId('node-label')).toBeInTheDocument();
    expect(screen.getByTestId('node-label')).toHaveTextContent('Node');
  });

  it('renders as a label element with base classes', () => {
    const { container } = render(<Chip label="Base" />);
    const label = container.querySelector('label');

    expect(label).toBeInTheDocument();
    // rounded-sm-token (8px) replaces the arbitrary rounded-[10px]; 10 is not a
    // step on the radius scale (8/12/16/full).
    expect(label).toHaveClass('flex', 'items-center', 'justify-center', 'rounded-sm-token', 'font-base', 'text-sm');
  });

  // The chip is a tap target, so it carries no border — borders in this system
  // are structural separation only. Selection is neutral ink rather than a
  // status hue, and both states use theme-flipping tokens: the previous
  // bg-pure-black/text-pure-white pair was fixed-palette and rendered a black
  // chip on a near-black page in dark mode.
  it('applies default (unselected) styles when selected is not set', () => {
    const { container } = render(<Chip label="Default" />);
    const label = container.querySelector('label')!;

    expect(label).toHaveClass('bg-surface-2', 'text-ink');
    expect(label).not.toHaveClass('bg-ink');
  });

  it('applies default (unselected) styles when selected is false', () => {
    const { container } = render(<Chip label="Default" selected={false} />);
    const label = container.querySelector('label')!;

    expect(label).toHaveClass('bg-surface-2', 'text-ink');
    expect(label).not.toHaveClass('bg-ink');
  });

  it('applies selected styles when selected is true', () => {
    const { container } = render(<Chip label="Selected" selected />);
    const label = container.querySelector('label')!;

    expect(label).toHaveClass('bg-ink', 'text-paper');
    expect(label).not.toHaveClass('bg-surface-2');
  });

  it('never renders a border on either state — a tap target is not outlined', () => {
    const { container: unselected } = render(<Chip label="A" />);
    const { container: selected } = render(<Chip label="B" selected />);

    for (const c of [unselected, selected]) {
      const label = c.querySelector('label')!;
      expect(label.className).not.toMatch(/\bborder(-|\b)/);
    }
  });

  it('applies a custom className', () => {
    const { container } = render(<Chip label="Custom" className="my-custom-class" />);
    const label = container.querySelector('label')!;

    expect(label).toHaveClass('my-custom-class');
  });

  it('calls onClick and triggers haptic feedback when clicked', () => {
    const onClick = jest.fn();
    render(<Chip label="Clickable" onClick={onClick} />);

    fireEvent.click(screen.getByText('Clickable'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(hapticLight).toHaveBeenCalledTimes(1);
  });

  it('does not trigger haptic feedback when clicked without an onClick handler', () => {
    render(<Chip label="NoHandler" />);

    expect(() => fireEvent.click(screen.getByText('NoHandler'))).not.toThrow();
    expect(hapticLight).not.toHaveBeenCalled();
  });

  it('forwards additional props to the underlying label element', () => {
    const { container } = render(<Chip label="Props" id="chip-id" htmlFor="target" data-testid="chip-el" />);
    const label = container.querySelector('label')!;

    expect(label).toHaveAttribute('id', 'chip-id');
    expect(label).toHaveAttribute('for', 'target');
    expect(screen.getByTestId('chip-el')).toBe(label);
  });
});
