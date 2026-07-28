import React, { useState } from 'react';

import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { AmountInput } from 'components/AmountInput';
import { Button, ButtonVariant } from 'components/Button';
import { Numpad } from 'components/Numpad';
import { TokenLogo } from 'components/TokenLogo';
import { hapticLight } from 'lib/mobile/haptics';
import { truncateAddress } from 'utils/string';

import { UIToken } from './types';

export interface SelectAmountProps {
  token?: UIToken;
  amount: string;
  isValidAmount: boolean;
  error?: string;
  /** Overrides the amount label (e.g. "Select Amount", "You Pay"). */
  label?: React.ReactNode;
  /** Overrides the Confirm button label in the page variant. */
  confirmTitle?: string;
  showBalanceHelper?: boolean;
  children?: React.ReactNode;
  onAmountChange: (amount: string) => void;
  onSelectToken: () => void;
  /** Required in the default (page) variant, which renders its own Confirm CTA. */
  onConfirm?: () => void;
  /**
   * `embedded` strips the full-screen chrome (network pill, balance helper,
   * scroll container, Confirm button) so the field can be stacked — the swap
   * screen renders two of these (You Pay / You Receive) under one shared
   * Confirm. Defaults to the standalone page layout used by the send flow.
   */
  embedded?: boolean;
  /** Token-logo symbol override (e.g. the DEX `logoSymbol`); defaults to `token.name`. */
  logoSymbol?: string;
  /** Recipient, restated on this step. Page variant only. */
  recipientAddress?: string;
  /** Back out to the recipient step. Page variant only. */
  onBack?: () => void;
  /**
   * Focus the field on mount so the platform decimal pad comes up.
   *
   * MUST be false unless this step is the visible page. HomeSwipeContainer
   * mounts all five home-group pages at once, and focusing a descendant makes
   * the browser scroll the nearest scrollable ancestor to reveal it — which it
   * does even when that ancestor is `overflow: hidden`. Focusing the amount
   * field while the send page sat off-screen therefore scrolled the carousel
   * container off its rail and stranded the whole home group between pages.
   */
  autoFocus?: boolean;
}

/**
 * Display-only rounding for the Available row.
 *
 * NOT what Max fills. `toFixed(4)` is a four-decimal rounding while the field
 * accepts six and the send converts with the token's own decimals, so filling
 * the *displayed* string would leave dust behind on any token with more than
 * four decimals — the classic "I sent everything and still have 0.00003 left".
 * Max uses `exactBalance` below.
 */
function formatBalance(value: number): string {
  return Number(value.toFixed(4)).toString();
}

/** What Max fills: the balance itself, with no display rounding applied. */
function exactBalance(value: number): string {
  return String(value);
}

export const SelectAmount: React.FC<SelectAmountProps> = ({
  token,
  amount,
  isValidAmount,
  error,
  label,
  confirmTitle,
  showBalanceHelper = true,
  children,
  onAmountChange,
  onSelectToken,
  onConfirm,
  embedded = false,
  logoSymbol,
  recipientAddress,
  onBack,
  autoFocus = false
}) => {
  const { t } = useTranslation();
  const [isMaxed, setIsMaxed] = useState(false);

  const availableFiat = token ? token.balance * token.fiatPrice : 0;
  const canProceed = !!token && isValidAmount;

  const tokenSelector = (
    <button
      type="button"
      data-testid="send-token-selector"
      onClick={() => {
        hapticLight();
        onSelectToken();
      }}
      className="flex items-center gap-1.25 cursor-pointer"
    >
      {token ? (
        <TokenLogo symbol={logoSymbol ?? token.name} size="md" />
      ) : embedded ? (
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2F6BED] text-lg font-bold text-pure-white">
          $
        </span>
      ) : null}
      <span className="font-heading text-2xl font-bold text-heading-gray">
        {token ? token.name : t('selectAToken')}
      </span>
      <Icon name={IconName.ChevronDown} size="sm" className="text-primary-500" fill="currentColor" />
    </button>
  );

  const helper =
    token && showBalanceHelper ? (
      <>
        <span className="font-heading text-gray text-base font-bold">
          {t('available')} {formatBalance(token.balance)} {token.name}
        </span>
        <span className="font-heading text-gray text-base font-bold">
          {t('approxFiatValue', { value: `$${availableFiat.toFixed(2)}` })}
        </span>
      </>
    ) : null;

  const amountField = (
    <AmountInput
      label={label ?? t('selectAmount')}
      value={amount}
      error={error ? t(error) : undefined}
      helper={embedded ? undefined : helper}
      // Embedded (swap) keeps the chip inside the field, where AmountInput
      // stacks it BELOW the value. The page variant puts it beside the figure
      // instead — same row, figure left, chip right — so it renders the chip
      // itself and must not also hand it to the field, or there are two.
      tokenSelector={embedded ? tokenSelector : undefined}
      // The step opens on an empty amount, so the field IS the screen: without
      // focus the platform decimal pad never comes up and the user lands on a
      // dead figure. AmountInput already emits inputMode="decimal"; it was
      // simply never told to take focus. Gated on the step being VISIBLE — see
      // the prop doc; taking focus off-screen moves the carousel.
      autoFocus={autoFocus}
      data-testid="send-amount-input"
      onValueChange={(value, _name, values) => onAmountChange(values?.formatted || value || '')}
    />
  );

  if (embedded) {
    return amountField;
  }

  // --- page variant: screens 61-64 -----------------------------------------

  const handleKey = (key: string) => {
    setIsMaxed(false);
    if (key === '.') {
      if (amount.includes('.')) return;
      onAmountChange((amount || '0') + '.');
      return;
    }
    // A single leading zero is the start state, so the first digit replaces it
    // rather than appending — otherwise typing 5 gives "05".
    const next = amount === '0' || amount === '' ? key : amount + key;
    onAmountChange(next);
  };

  const handleDelete = () => {
    setIsMaxed(false);
    onAmountChange(amount.length <= 1 ? '' : amount.slice(0, -1));
  };

  const handleMax = () => {
    if (!token) return;
    hapticLight();
    setIsMaxed(true);
    onAmountChange(exactBalance(token.balance));
  };

  // The fiat slot is the one line with nothing to convert when the figure is
  // empty or rejected, so it carries the reason instead. The CTA is never
  // disabled without a sentence beside it.
  const subline = error
    ? { text: t(error), tone: 'error' as const }
    : !amount || Number(amount) === 0
      ? { text: t('enterAnAmountToContinue'), tone: 'muted' as const }
      : {
          text: t('approxFiatValue', { value: `$${(Number(amount) * (token?.fiatPrice ?? 0)).toFixed(2)}` }),
          tone: 'muted' as const
        };

  return (
    <div className="flex flex-col h-full min-h-0 bg-app-bg px-4 min-[360px]:px-6">
      {/* `.sh2` — this is step 2 of a linear flow, not a tab. There was no
          header and no back control at all: the only route back to the address
          was the hardware handler, which exists on iOS and Android and nowhere
          else. */}
      <div className="flex shrink-0 items-center gap-1 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label={t('back')}
            data-testid="send-amount-back"
            className="-ml-2 flex size-11 shrink-0 items-center justify-center rounded-full text-ink"
          >
            <Icon name={IconName.ChevronLeft} size="sm" fill="currentColor" />
          </button>
        )}
        <span className="font-heading text-heading font-extrabold text-ink">{t('send')}</span>
      </div>

      {/* The recipient never scrolls out of sight: an address error is the
          highest-consequence failure in this flow, and the step used to commit
          an amount without ever restating who receives it. */}
      {recipientAddress && (
        <button
          type="button"
          onClick={onBack}
          aria-label={t('editRecipient')}
          data-testid="send-amount-recipient"
          className="mt-3 flex shrink-0 items-center gap-2.5 rounded-md-token bg-surface-2 px-3 py-2.5 text-left"
        >
          <span className="size-9 shrink-0 rounded-full bg-surface-3" aria-hidden />
          <span className="flex min-w-0 flex-col">
            <span className="text-caption font-semibold uppercase tracking-[0.04em] text-ink-2">{t('to')}</span>
            <span className="font-address text-caption font-medium text-ink truncate">
              {truncateAddress(recipientAddress, true, 8)}
            </span>
          </span>
        </button>
      )}

      {/* Figure left, token chip right. */}
      <div className="mt-5 flex shrink-0 items-center gap-3">
        <div className="min-w-0 flex-1">{amountField}</div>
        <div className="shrink-0">{tokenSelector}</div>
      </div>

      <p
        data-testid="send-amount-subline"
        role={error ? 'alert' : undefined}
        className={clsx('mt-1.5 shrink-0 text-caption', error ? 'text-neg font-semibold' : 'text-ink-2')}
      >
        {subline.text}
      </p>

      {/* Available / Max. Max is the only one-tap route out of the zero state,
          so it is present at zero on purpose. */}
      {token && showBalanceHelper && (
        <div className="mt-4 flex shrink-0 items-center justify-between gap-2 rounded-md-token bg-surface-2 py-2 pl-3 pr-2">
          <span className="min-w-0 truncate text-caption font-semibold text-ink-2">
            {isMaxed ? t('wholeBalanceSelected') : `${t('available')} ${formatBalance(token.balance)} ${token.name}`}
          </span>
          <button
            type="button"
            onClick={handleMax}
            aria-pressed={isMaxed}
            data-testid="send-amount-max"
            className={clsx(
              'shrink-0 rounded-full px-3.5 min-h-11 text-caption font-extrabold whitespace-nowrap',
              // Not colour-only: the row's own text switches to a sentence, and
              // the control carries aria-pressed.
              isMaxed ? 'bg-accent text-on-accent-sm' : 'bg-surface text-ink'
            )}
          >
            {t('max')}
          </button>
        </div>
      )}

      {children}

      {/* The pad IS the field, so the commit belongs on the far side of it —
          a button between the figure and the pad reads as being about the
          field it interrupts. */}
      <Numpad decimalKey="." onDigit={handleKey} onDelete={handleDelete} className="mt-auto pt-4" />

      <div className="shrink-0 pt-4 pb-[max(1rem,var(--safe-bottom,0px))]">
        <Button
          title={confirmTitle ?? t('confirm')}
          variant={ButtonVariant.Primary}
          onClick={onConfirm}
          disabled={!canProceed || !onConfirm}
          data-testid="send-amount-confirm"
          className="w-full max-w-none"
        />
      </div>
    </div>
  );
};
