import React from 'react';

import { render } from '@testing-library/react';

import { WalletAccount } from 'lib/shared/types';

import { PriceChangeBadge } from './PriceChangeBadge';

// ---------------------------------------------------------------------------
// Mocks.
//
// `PriceChangeBadge` folds three impure inputs into a single fiat delta:
//   - `useAllTokensBaseMetadata()` — the metadata map, forwarded to the balance
//     hook (its contents are otherwise opaque to the component),
//   - `useAllBalances(publicKey, metadata)` — `{ data }` list of token balances,
//   - `useWalletStore(s => s.tokenPrices)` — per-symbol `{ price, change24h }`.
//
// We stub all three so the reduce is driven by hand, and swap the `Badge` UI
// primitive for a pass-through `<span>` that echoes `variant` and `className`
// as attributes, so we can assert on exactly what the component chose without
// pulling class-variance-authority into the test. Direction now selects a
// status *variant* on the canonical badge rather than a hardcoded `bg-*`
// utility, so the colour assertions key on `data-variant`.
// ---------------------------------------------------------------------------
const mockUseAllTokensBaseMetadata = jest.fn<Record<string, unknown>, []>();
const mockUseAllBalances = jest.fn<{ data?: unknown[] }, [string, Record<string, unknown>]>();

jest.mock('lib/miden/front', () => ({
  useAllTokensBaseMetadata: () => mockUseAllTokensBaseMetadata(),
  useAllBalances: (publicKey: string, metadata: Record<string, unknown>) => mockUseAllBalances(publicKey, metadata)
}));

// The only store slice read is `tokenPrices`; run the real selector against a
// controllable state object so per-test prices flow straight through.
let mockTokenPrices: Record<string, { price?: number; change24h?: number }> = {};
jest.mock('lib/store', () => ({
  useWalletStore: (selector: (state: { tokenPrices: typeof mockTokenPrices }) => unknown) =>
    selector({ tokenPrices: mockTokenPrices })
}));

jest.mock('lib/ui/badge', () => ({
  Badge: ({ variant, className, children }: { variant?: string; className?: string; children: React.ReactNode }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  )
}));

// ---------------------------------------------------------------------------
// Helpers.
// ---------------------------------------------------------------------------
const account = { publicKey: 'pk-1' } as WalletAccount;

const renderBadge = () => {
  const { container } = render(<PriceChangeBadge account={account} />);
  const badge = container.querySelector('[data-testid="badge"]') as HTMLElement;
  const percent = container.querySelector('p') as HTMLElement;
  return { container, badge, percent };
};

beforeEach(() => {
  jest.clearAllMocks();
  mockTokenPrices = {};
  mockUseAllTokensBaseMetadata.mockReturnValue({ ETH: {} });
  mockUseAllBalances.mockReturnValue({ data: [] });
});

describe('PriceChangeBadge', () => {
  it('forwards the account public key and metadata map to useAllBalances', () => {
    const metadata = { ETH: { decimals: 8 } };
    mockUseAllTokensBaseMetadata.mockReturnValue(metadata);

    renderBadge();

    expect(mockUseAllBalances).toHaveBeenCalledWith('pk-1', metadata);
  });

  it('renders the neutral state (grey) when there are no balances, using the default empty list', () => {
    // `useAllBalances` returns an object with no `data` key, exercising the
    // `{ data: allTokenBalances = [] }` default-parameter branch.
    mockUseAllBalances.mockReturnValue({});

    const { badge, percent } = renderBadge();

    // Neutral: empty sign prefix + "$0.00", non-status badge, muted percentage.
    expect(badge.textContent).toBe('$0.00');
    expect(badge).toHaveAttribute('data-variant', 'default');
    expect(badge.className).toContain('font-medium');
    expect(percent.textContent).toBe('0.00%');
    expect(percent.className).toContain('text-ink-3');
  });

  it('renders a positive (green) delta with a "+" prefix and computed percentage', () => {
    mockUseAllBalances.mockReturnValue({ data: [{ balance: 10, metadata: { symbol: 'ETH' } }] });
    mockTokenPrices = { ETH: { price: 2, change24h: 0.5 } };

    const { badge, percent } = renderBadge();

    // portfolioChange = 10 * 0.5 = 5 (> 0), totalValue = 10 * 2 = 20,
    // percentage = 5 / 20 * 100 = 25.
    expect(badge.textContent).toBe('+$5.00');
    expect(badge).toHaveAttribute('data-variant', 'pos');
    expect(percent.textContent).toBe('25.00%');
    expect(percent.className).toContain('text-pos');
  });

  it('renders a negative (red) delta with a "-" prefix and the absolute amount', () => {
    mockUseAllBalances.mockReturnValue({ data: [{ balance: 10, metadata: { symbol: 'BTC' } }] });
    mockTokenPrices = { BTC: { price: 3, change24h: -0.4 } };

    const { badge, percent } = renderBadge();

    // portfolioChange = 10 * -0.4 = -4 (< 0), totalValue = 10 * 3 = 30,
    // percentage = -4 / 30 * 100 = -13.333... -> "-13.33". Amount uses abs().
    expect(badge.textContent).toBe('-$4.00');
    expect(badge).toHaveAttribute('data-variant', 'neg');
    expect(percent.textContent).toBe('-13.33%');
    expect(percent.className).toContain('text-neg');
  });

  it('falls back to change24h=0 / price=1 for symbols with missing or partial price data', () => {
    mockUseAllBalances.mockReturnValue({
      data: [
        // No entry at all in tokenPrices -> optional chain short-circuits.
        { balance: 5, metadata: { symbol: 'FOO' } },
        // Entry present but empty -> `.change24h` / `.price` are undefined.
        { balance: 2, metadata: { symbol: 'BAR' } }
      ]
    });
    mockTokenPrices = { BAR: {} };

    const { badge, percent } = renderBadge();

    // change contributions: 5*0 + 2*0 = 0 (neutral); totalValue: 5*1 + 2*1 = 7
    // (> 0), so percentage = 0 / 7 * 100 = 0. Neutral styling applies.
    expect(badge.textContent).toBe('$0.00');
    expect(badge).toHaveAttribute('data-variant', 'default');
    expect(percent.textContent).toBe('0.00%');
    expect(percent.className).toContain('text-ink-3');
  });

  it('keeps percentage at 0 when the total portfolio value is zero (price=0)', () => {
    mockUseAllBalances.mockReturnValue({ data: [{ balance: 10, metadata: { symbol: 'ZERO' } }] });
    mockTokenPrices = { ZERO: { price: 0, change24h: -0.5 } };

    const { badge, percent } = renderBadge();

    // portfolioChange = 10 * -0.5 = -5 (< 0, negative badge), but
    // totalValue = 10 * 0 = 0, so the `totalValue > 0` guard yields 0%.
    expect(badge.textContent).toBe('-$5.00');
    expect(badge).toHaveAttribute('data-variant', 'neg');
    expect(percent.textContent).toBe('0.00%');
    expect(percent.className).toContain('text-neg');
  });
});
