import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { DetailCard, DetailRow, RowLabelPill } from './DetailCard';

describe('DetailCard', () => {
  it('renders a bordered card wrapper carrying the base classes', () => {
    const { container } = render(
      <DetailCard>
        <span>body</span>
      </DetailCard>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe('DIV');
    expect(wrapper).toHaveClass('border', 'border-border-card', 'rounded-10', 'bg-white', 'overflow-hidden');
  });

  it('always renders its children', () => {
    render(
      <DetailCard>
        <span>child content</span>
      </DetailCard>
    );

    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('renders the title header when a title is supplied (truthy branch)', () => {
    render(
      <DetailCard title="Transaction Details">
        <span>body</span>
      </DetailCard>
    );

    const title = screen.getByText('Transaction Details');
    expect(title).toBeInTheDocument();
    // The title header carries its signature typographic classes.
    expect(title).toHaveClass(
      'text-xs',
      'border-b',
      'border-border-light',
      'font-semibold',
      'text-heading-gray',
      'uppercase'
    );
  });

  it('omits the title header when no title is supplied (falsy branch)', () => {
    const { container } = render(
      <DetailCard>
        <span data-testid="body">body</span>
      </DetailCard>
    );

    // With no title, the only child of the wrapper is the body content.
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.childElementCount).toBe(1);
    expect(wrapper.firstElementChild).toBe(screen.getByTestId('body'));
  });

  it('treats an empty-string title as falsy and omits the header', () => {
    const { container } = render(
      <DetailCard title="">
        <span data-testid="body">body</span>
      </DetailCard>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.childElementCount).toBe(1);
    expect(wrapper.firstElementChild).toBe(screen.getByTestId('body'));
  });
});

describe('DetailRow', () => {
  it('renders the label with its typographic classes', () => {
    render(<DetailRow label="Amount" value="10 MIDEN" />);

    const label = screen.getByText('Amount');
    expect(label.tagName).toBe('SPAN');
    expect(label).toHaveClass('text-sm', 'text-heading-gray', 'font-medium');
  });

  it('applies the bottom border when not the last row (isLast falsy branch)', () => {
    const { container } = render(<DetailRow label="Fee" value="1 MIDEN" />);

    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass('flex', 'items-center', 'justify-between', 'px-4', 'py-3');
    expect(row).toHaveClass('border-b', 'border-border-light');
  });

  it('omits the bottom border when it is the last row (isLast truthy branch)', () => {
    const { container } = render(<DetailRow label="Fee" value="1 MIDEN" isLast />);

    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass('flex', 'items-center', 'justify-between');
    expect(row).not.toHaveClass('border-b');
  });

  it('renders the value span when neither children nor badge are provided', () => {
    render(<DetailRow label="Status" value="Confirmed" />);

    const value = screen.getByText('Confirmed');
    expect(value.tagName).toBe('SPAN');
    expect(value).toHaveClass('text-sm', 'text-heading-gray', 'font-medium');
  });

  it('renders the value branch even when value is undefined (no badge, no children)', () => {
    const { container } = render(<DetailRow label="Empty" />);

    const row = container.firstChild as HTMLElement;
    // Two direct children: the label group and the (empty) value span.
    expect(row.childElementCount).toBe(2);
    const valueSpan = row.lastElementChild as HTMLElement;
    expect(valueSpan.tagName).toBe('SPAN');
    expect(valueSpan).toHaveClass('text-sm', 'text-heading-gray', 'font-medium');
    expect(valueSpan).toBeEmptyDOMElement();
  });

  it('renders a badge pill when badge is provided and children are absent', () => {
    render(<DetailRow label="Type" badge="Pending" />);

    const badge = screen.getByText('Pending');
    expect(badge.tagName).toBe('SPAN');
    // Same orange-on-wash pill; the raw #CC5200 / #FFF3EB pair is now the
    // theme-aware --accent-ink / --accent-wash token pair.
    expect(badge).toHaveClass('rounded-full', 'text-accent-ink', 'bg-accent-wash', 'px-3', 'py-1');
  });

  it('prefers the badge over the value when both are supplied', () => {
    render(<DetailRow label="Type" badge="Pending" value="ignored" />);

    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('renders children (wrapped in a flex container) taking precedence over badge and value', () => {
    render(
      <DetailRow label="Action" badge="ignored-badge" value="ignored-value">
        <button type="button">Copy</button>
      </DetailRow>
    );

    const child = screen.getByRole('button', { name: 'Copy' });
    expect(child).toBeInTheDocument();
    // Children win over both the badge and the value branches.
    expect(screen.queryByText('ignored-badge')).not.toBeInTheDocument();
    expect(screen.queryByText('ignored-value')).not.toBeInTheDocument();
    // Children are wrapped in a flex container.
    const wrapper = child.parentElement as HTMLElement;
    expect(wrapper).toHaveClass('flex', 'items-center');
  });

  it('renders an icon before the label when provided', () => {
    render(<DetailRow label="Network" value="Testnet" icon={<svg data-testid="row-icon" />} />);

    const icon = screen.getByTestId('row-icon');
    expect(icon).toBeInTheDocument();
    // The icon sits inside the left-hand label group alongside the label.
    const labelGroup = screen.getByText('Network').parentElement as HTMLElement;
    expect(labelGroup).toHaveClass('flex', 'items-center', 'gap-3');
    expect(labelGroup).toContainElement(icon);
  });

  it('does not render an icon element when none is provided', () => {
    render(<DetailRow label="Network" value="Testnet" />);

    const labelGroup = screen.getByText('Network').parentElement as HTMLElement;
    // Only the label span lives in the left-hand group when there is no icon.
    expect(labelGroup.childElementCount).toBe(1);
    expect(labelGroup.firstElementChild).toBe(screen.getByText('Network'));
  });
});

describe('RowLabelPill', () => {
  it('renders its children in a token-based pill', () => {
    const { container } = render(<RowLabelPill>Recipient</RowLabelPill>);

    const pill = container.firstChild as HTMLElement;
    expect(pill.tagName).toBe('SPAN');
    expect(pill).toHaveClass('rounded-full', 'bg-surface-interactive', 'font-heading');
    expect(pill).toHaveTextContent('Recipient');
  });

  it('merges an extra className onto the base pill classes', () => {
    const { container } = render(<RowLabelPill className="extra-pill">Amount</RowLabelPill>);

    expect(container.firstChild).toHaveClass('extra-pill', 'rounded-full');
  });
});

// The stacked layout is the review-screen shape that `components/review/ReviewRow`
// aliases; it shares this component with the bordered `inline` card row.
describe('DetailRow (stacked layout)', () => {
  it('renders the label as a pill and the value below it, with no row border', () => {
    const { container } = render(<DetailRow layout="stacked" label="To" value="0xabc…def" />);

    const row = container.firstChild as HTMLElement;
    expect(row).toHaveClass('py-6');
    expect(row).not.toHaveClass('border-b');

    // Label is the pill, not the inline label span.
    expect(screen.getByText('To')).toHaveClass('rounded-full', 'bg-surface-interactive');
    expect(screen.getByText('0xabc…def')).toHaveClass('font-heading', 'text-2xl', 'font-bold');
  });

  it('prefers children over value', () => {
    render(
      <DetailRow layout="stacked" label="To" value="ignored">
        <span data-testid="custom">CUSTOM</span>
      </DetailRow>
    );

    expect(screen.getByTestId('custom')).toHaveTextContent('CUSTOM');
    expect(screen.queryByText('ignored')).not.toBeInTheDocument();
  });

  it('renders the inline action link and fires onAction when clicked', () => {
    const onAction = jest.fn();
    render(<DetailRow layout="stacked" label="To" value="0xabc" onAction={onAction} actionLabel="Edit" />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the action link when onAction is not provided', () => {
    render(<DetailRow layout="stacked" label="To" value="0xabc" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the info note with its icon when note is provided', () => {
    const { container } = render(<DetailRow layout="stacked" label="Fee" value="0.1" note="Network fee estimate" />);

    expect(screen.getByText('Network fee estimate')).toBeInTheDocument();
    // The globally-mocked SVG import renders as a plain <svg> element.
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('omits the info note (and its icon) when note is not provided', () => {
    const { container } = render(<DetailRow layout="stacked" label="Fee" value="0.1" />);

    expect(container.querySelector('svg')).not.toBeInTheDocument();
  });
});
