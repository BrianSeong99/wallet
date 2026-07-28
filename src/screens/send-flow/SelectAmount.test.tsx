import React from 'react';

import { render, screen, fireEvent, within } from '@testing-library/react';

import { hapticLight } from 'lib/mobile/haptics';
import { isMobile } from 'lib/platform';

import { SelectAmount, SelectAmountProps } from './SelectAmount';
import { UIToken } from './types';

// --- i18n: interpolate the `{ value }` option so approxFiatValue is assertable.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) =>
      opts && typeof opts === 'object' && 'value' in opts ? `${key}:${opts.value}` : key
  })
}));

// --- Platform / haptics.
jest.mock('lib/platform', () => ({
  isMobile: jest.fn(() => false)
}));

jest.mock('lib/mobile/haptics', () => ({
  hapticLight: jest.fn()
}));

// --- Child components: stub out presentational internals, but keep the passed
//     nodes (tokenSelector / label / helper) so SelectAmount's own JSX renders.
jest.mock('components/TokenLogo', () => ({
  TokenLogo: ({ symbol, size }: { symbol: string; size?: string }) => (
    <span data-testid="token-logo" data-symbol={symbol} data-size={size} />
  )
}));

jest.mock('components/Button', () => ({
  Button: ({ title, onClick, disabled }: { title?: string; onClick?: () => void; disabled?: boolean }) => (
    <button data-testid="confirm-btn" onClick={onClick} disabled={disabled}>
      {title}
    </button>
  ),
  ButtonVariant: { Primary: 'Primary', Secondary: 'Secondary', Ghost: 'Ghost' }
}));

jest.mock('app/icons/v2', () => ({
  Icon: ({ name }: { name: string }) => <span data-testid="icon" data-name={name} />,
  IconName: { ChevronDown: 'chevron-down' }
}));

// The AmountInput mock forwards every prop we care about and exposes buttons
// that invoke `onValueChange` with the different value/values shapes the source
// coalesces over (`values?.formatted || value || ''`).
type OnValueChange = (value: string | undefined, name?: string, values?: { formatted?: string }) => void;

jest.mock('components/AmountInput', () => ({
  AmountInput: ({
    label,
    value,
    error,
    helper,
    tokenSelector,
    onValueChange,
    autoFocus,
    'data-testid': dataTestId
  }: {
    label?: React.ReactNode;
    value?: string;
    error?: string;
    helper?: React.ReactNode;
    tokenSelector?: React.ReactNode;
    onValueChange?: OnValueChange;
    autoFocus?: boolean;
    'data-testid'?: string;
  }) => (
    <div data-testid="amount-input" data-forwarded-testid={dataTestId} data-auto-focus={String(!!autoFocus)}>
      <div data-testid="ai-label">{label}</div>
      {error !== undefined && <div data-testid="ai-error">{error}</div>}
      {helper !== undefined && <div data-testid="ai-helper">{helper}</div>}
      <div data-testid="ai-token-selector">{tokenSelector}</div>
      <div data-testid="ai-value">{value}</div>
      <button data-testid="ai-change-formatted" onClick={() => onValueChange?.('rawF', 'n', { formatted: '987.65' })} />
      <button data-testid="ai-change-value" onClick={() => onValueChange?.('rawVal', 'n', { formatted: '' })} />
      <button data-testid="ai-change-value-novalues" onClick={() => onValueChange?.('rawVal2', 'n', undefined)} />
      <button data-testid="ai-change-empty" onClick={() => onValueChange?.(undefined, 'n', undefined)} />
    </div>
  )
}));

const baseToken = (overrides: Partial<UIToken> = {}): UIToken => ({
  id: 't1',
  name: 'USDC',
  decimals: 6,
  balance: 200,
  fiatPrice: 0.2,
  ...overrides
});

const renderComponent = (props: Partial<SelectAmountProps> = {}) => {
  const defaults: SelectAmountProps = {
    token: baseToken(),
    amount: '10',
    isValidAmount: true,
    onAmountChange: jest.fn(),
    onSelectToken: jest.fn(),
    onConfirm: jest.fn()
  };
  return render(<SelectAmount {...defaults} {...props} />);
};

describe('SelectAmount', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (isMobile as jest.Mock).mockReturnValue(false);
  });

  describe('page variant', () => {
    it('renders the amount field, token logo, balance helper and confirm CTA', () => {
      renderComponent();

      // Network pill (default showNetworkPill = true).

      // Token logo defaults its symbol to token.name.
      const logo = screen.getByTestId('token-logo');
      expect(logo).toHaveAttribute('data-symbol', 'USDC');
      expect(logo).toHaveAttribute('data-size', 'md');

      // Token name chip + chevron icon.
      expect(screen.getByText('USDC')).toBeInTheDocument();
      // The .sh2 back control is an Icon too now, so scope this to the chip.
      expect(within(screen.getByTestId('send-token-selector')).getByTestId('icon')).toHaveAttribute(
        'data-name',
        'chevron-down'
      );

      // Default label + forwarded testid.
      // The page variant is `bare`: its .sh2 header names the screen, so the
      // field draws no label of its own. Swap (embedded) still gets one.
      expect(screen.getByTestId('ai-label')).toBeEmptyDOMElement();
      expect(screen.getByTestId('amount-input')).toHaveAttribute('data-forwarded-testid', 'send-amount-input');

      // Balance helper: trimmed balance + fiat value (200 * 0.2 = $40.00).
      const helper = screen.getByTestId('ai-helper');
      expect(helper).toHaveTextContent('available 200 USDC');
      expect(helper).toHaveTextContent('approxFiatValue:$40.00');

      // Confirm CTA enabled with default title.
      const confirm = screen.getByTestId('confirm-btn');
      expect(confirm).toHaveTextContent('confirm');
      expect(confirm).not.toBeDisabled();
    });

    it('trims trailing zeros but preserves real decimals in the balance helper', () => {
      renderComponent({ token: baseToken({ balance: 200.5, fiatPrice: 1 }) });
      const helper = screen.getByTestId('ai-helper');
      expect(helper).toHaveTextContent('available 200.5 USDC');
      expect(helper).toHaveTextContent('approxFiatValue:$200.50');
    });

    it('calls onConfirm when the enabled confirm button is clicked', () => {
      const onConfirm = jest.fn();
      renderComponent({ onConfirm });
      fireEvent.click(screen.getByTestId('confirm-btn'));
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('disables the confirm button when the amount is invalid', () => {
      renderComponent({ isValidAmount: false });
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    });

    it('disables the confirm button when there is no token', () => {
      renderComponent({ token: undefined });
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    });

    it('disables the confirm button when onConfirm is omitted even if the amount is valid', () => {
      renderComponent({ onConfirm: undefined });
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    });

    it('uses the confirmTitle override for the CTA', () => {
      renderComponent({ confirmTitle: 'Swap Now' });
      expect(screen.getByTestId('confirm-btn')).toHaveTextContent('Swap Now');
    });

    it('draws no network pill — the recipient row carries the network', () => {
      renderComponent({});
      expect(screen.queryByText('miden')).not.toBeInTheDocument();
    });

    it('hides the balance helper when showBalanceHelper is false', () => {
      renderComponent({ showBalanceHelper: false });
      expect(screen.getByTestId('ai-helper')).not.toHaveTextContent('available');
    });

    it('renders children below the amount field', () => {
      renderComponent({ children: <div data-testid="extra-child">extra</div> });
      expect(screen.getByTestId('extra-child')).toBeInTheDocument();
    });

    it('uses the system gutter, not a platform split', () => {
      // Was px-8 on mobile / px-6 elsewhere. The gutter is the frame's, and it
      // narrows on a 320-360pt screen rather than widening on a phone.
      const { container } = renderComponent();
      expect(container.firstChild).toHaveClass('px-4');
      expect(container.firstChild).toHaveClass('min-[360px]:px-6');
    });

    it('restates the recipient and offers a route back to it', () => {
      const onBack = jest.fn();
      renderComponent({ recipientAddress: 'mtst1aplqzwh6s4gvcyzsvx726y6xvsgt5qv5qruqqypuyph', onBack });

      // The step used to commit an amount without naming who receives it, and
      // had no back control at all outside the mobile hardware handler.
      fireEvent.click(screen.getByTestId('send-amount-recipient'));
      expect(onBack).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByTestId('send-amount-back'));
      expect(onBack).toHaveBeenCalledTimes(2);
    });

    it('states why Confirm is dead instead of only greying it out', () => {
      renderComponent({ amount: '', isValidAmount: false });
      expect(screen.getByTestId('send-amount-subline')).toHaveTextContent('enterAnAmountToContinue');
      expect(screen.getByTestId('confirm-btn')).toBeDisabled();
    });

    it('fills the EXACT balance on Max, not the rounded display value', () => {
      // formatBalance rounds to 4dp for display while the field takes 6 and the
      // send converts with the token's own decimals. Filling the displayed
      // string is the "I sent everything and still have 0.00003 left" bug.
      const onAmountChange = jest.fn();
      renderComponent({ token: baseToken({ balance: 1204.5678912 }), onAmountChange });

      fireEvent.click(screen.getByTestId('send-amount-max'));
      expect(onAmountChange).toHaveBeenCalledWith('1204.5678912');
    });

    it('does NOT focus the field unless the step is the visible page', () => {
      // HomeSwipeContainer mounts all five home-group pages at once. Focusing a
      // descendant makes the browser scroll the nearest scrollable ancestor to
      // reveal it — and it does that even when the ancestor is
      // `overflow: hidden`. An unconditional autoFocus here scrolled the
      // carousel off its rail and stranded the home group between pages.
      renderComponent({});
      expect(screen.getByTestId('amount-input')).not.toHaveAttribute('data-auto-focus', 'true');

      renderComponent({ autoFocus: true });
      expect(screen.getAllByTestId('amount-input').at(-1)).toHaveAttribute('data-auto-focus', 'true');
    });

    it('says Max is engaged in words, not only in colour', () => {
      renderComponent({ token: baseToken({ balance: 200 }) });
      const max = screen.getByTestId('send-amount-max');
      expect(max).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(max);
      expect(screen.getByTestId('send-amount-max')).toHaveAttribute('aria-pressed', 'true');
      expect(screen.getByText('wholeBalanceSelected')).toBeInTheDocument();
    });
  });

  describe('token selector', () => {
    it('fires haptic feedback and onSelectToken when tapped', () => {
      const onSelectToken = jest.fn();
      renderComponent({ onSelectToken });
      fireEvent.click(screen.getByTestId('send-token-selector'));
      expect(hapticLight).toHaveBeenCalledTimes(1);
      expect(onSelectToken).toHaveBeenCalledTimes(1);
    });

    it('honors the logoSymbol override for the token logo', () => {
      renderComponent({ logoSymbol: 'PSWAP' });
      expect(screen.getByTestId('token-logo')).toHaveAttribute('data-symbol', 'PSWAP');
    });

    it('renders "select a token" text and no logo when no token is selected (page variant)', () => {
      renderComponent({ token: undefined });
      expect(screen.getByText('selectAToken')).toBeInTheDocument();
      expect(screen.queryByTestId('token-logo')).not.toBeInTheDocument();
      // Page variant (not embedded) with no token renders neither logo nor "$".
      expect(screen.getByTestId('ai-token-selector')).not.toHaveTextContent('$');
    });
  });

  describe('amount change coalescing', () => {
    it('prefers the formatted value from the currency-input values object', () => {
      const onAmountChange = jest.fn();
      renderComponent({ onAmountChange });
      fireEvent.click(screen.getByTestId('ai-change-formatted'));
      expect(onAmountChange).toHaveBeenCalledWith('987.65');
    });

    it('falls back to the raw value when formatted is empty', () => {
      const onAmountChange = jest.fn();
      renderComponent({ onAmountChange });
      fireEvent.click(screen.getByTestId('ai-change-value'));
      expect(onAmountChange).toHaveBeenCalledWith('rawVal');
    });

    it('falls back to the raw value when the values object is undefined', () => {
      const onAmountChange = jest.fn();
      renderComponent({ onAmountChange });
      fireEvent.click(screen.getByTestId('ai-change-value-novalues'));
      expect(onAmountChange).toHaveBeenCalledWith('rawVal2');
    });

    it('emits an empty string when neither formatted nor raw value is present', () => {
      const onAmountChange = jest.fn();
      renderComponent({ onAmountChange });
      fireEvent.click(screen.getByTestId('ai-change-empty'));
      expect(onAmountChange).toHaveBeenCalledWith('');
    });
  });

  describe('label and error', () => {
    it('renders the label override in place of the default (embedded only)', () => {
      // Only the embedded variant carries a label at all — swap stacks two of
      // these fields and each one needs naming. The page variant is `bare`.
      renderComponent({ label: 'You Pay', embedded: true });
      expect(screen.getByTestId('ai-label')).toHaveTextContent('You Pay');
      expect(screen.getByTestId('ai-label')).not.toHaveTextContent('selectAmount');
    });

    it('translates and renders the error when present', () => {
      renderComponent({ error: 'amountTooHigh' });
      expect(screen.getByTestId('ai-error')).toHaveTextContent('amountTooHigh');
    });

    it('renders no error row when error is undefined', () => {
      renderComponent({ error: undefined });
      expect(screen.queryByTestId('ai-error')).not.toBeInTheDocument();
    });
  });

  describe('embedded variant', () => {
    it('renders only the amount field (no chrome) with a token', () => {
      renderComponent({ embedded: true });
      expect(screen.getByTestId('amount-input')).toBeInTheDocument();
      expect(screen.getByTestId('token-logo')).toBeInTheDocument();
      // No network pill, no confirm button, no helper (helper prop is undefined).
      expect(screen.queryByText('miden')).not.toBeInTheDocument();
      expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument();
      expect(screen.queryByTestId('ai-helper')).not.toBeInTheDocument();
    });

    it('renders the "$" placeholder chip when embedded with no token', () => {
      renderComponent({ embedded: true, token: undefined });
      expect(screen.getByTestId('ai-token-selector')).toHaveTextContent('$');
      expect(screen.getByText('selectAToken')).toBeInTheDocument();
      expect(screen.queryByTestId('token-logo')).not.toBeInTheDocument();
      expect(screen.queryByTestId('confirm-btn')).not.toBeInTheDocument();
    });

    it('ignores children in the embedded variant', () => {
      renderComponent({ embedded: true, children: <div data-testid="extra-child">extra</div> });
      expect(screen.queryByTestId('extra-child')).not.toBeInTheDocument();
    });
  });
});
