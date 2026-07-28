import React, { FC, ReactNode, useLayoutEffect, useRef, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import CopyButton from 'app/atoms/CopyButton';
import { Icon, IconName } from 'app/icons/v2';
import { hapticLight } from 'lib/mobile/haptics';
import { useCardColor } from 'lib/settings/card-color';
import { CardColor } from 'lib/settings/constants';

export type BalanceDeltaDirection = 'positive' | 'negative' | 'neutral';

/* Card background per picked color — the card-* tokens resolve light/dark
 * variants via CSS vars, so no dark: classes needed. Shared with the
 * AccountsDrawer swatches. */
export const CARD_COLOR_BG: Record<CardColor, string> = {
  slate: 'bg-card-slate',
  orange: 'bg-card-orange',
  blue: 'bg-card-blue',
  green: 'bg-card-green',
  purple: 'bg-card-purple'
};

/* Two-tone card: the top section is the primary tone — solid in light mode,
 * 50% opacity in dark mode; the bottom strip is the solid second tone. */
const CARD_COLOR_TOP: Record<CardColor, string> = {
  slate: 'bg-card-slate dark:bg-card-slate/50',
  orange: 'bg-card-orange dark:bg-card-orange/50',
  blue: 'bg-card-blue dark:bg-card-blue/50',
  green: 'bg-card-green dark:bg-card-green/50',
  purple: 'bg-card-purple dark:bg-card-purple/50'
};

const CARD_COLOR_BOTTOM: Record<CardColor, string> = {
  slate: 'bg-card-slate-deep',
  orange: 'bg-card-orange-deep',
  blue: 'bg-card-blue-deep',
  green: 'bg-card-green-deep',
  purple: 'bg-card-purple-deep'
};

export interface BalanceCardProps {
  /** Truncated display label, e.g. `mtst1aqg...940z`. */
  accountNumber: string;
  /** Full account id used when copying to clipboard. Falls back to accountNumber. */
  accountId?: string;
  amount: ReactNode;
  currency?: string;
  delta?: {
    absolute: string;
    percentage: string;
    direction?: BalanceDeltaDirection;
  };
  onMore?: () => void;
  state?: 'default' | 'loading' | 'zero' | 'hidden';
  className?: string;
}

const SKELETON_BLOCK = 'animate-pulse rounded-md bg-white/15';

const AMOUNT_MAX_REM = 3.5;
const AMOUNT_MIN_REM = 2.5;

/* Shrinks the balance font so the full amount always fits the card width.
 * Text width scales linearly with font size, so one measurement yields the
 * exact fit — no iterate-until-fit loop. Sized in rem so it tracks the root
 * font size. Falls back to maxRem when layout isn't available (jsdom). */
function useFitFontSize(maxRem: number, minRem: number, active: boolean) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const [fontSizeRem, setFontSizeRem] = useState(maxRem);

  useLayoutEffect(() => {
    const row = rowRef.current;
    const text = textRef.current;
    if (!active || !row || !text) return;

    const fit = () => {
      const textWidth = text.scrollWidth;
      const currentPx = parseFloat(getComputedStyle(text).fontSize);
      if (textWidth === 0 || !currentPx) return;
      const rootPx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const suffix = text.nextElementSibling;
      const gapPx = parseFloat(getComputedStyle(text.parentElement ?? row).columnGap) || 0;
      const suffixWidth = suffix instanceof HTMLElement ? suffix.offsetWidth + gapPx : 0;
      const available = row.clientWidth - suffixWidth;
      if (available <= 0) return;
      const widthAtMaxPx = (textWidth / currentPx) * maxRem * rootPx;
      const next = Math.min(maxRem, Math.max(minRem, (maxRem * available) / widthAtMaxPx));
      setFontSizeRem(Math.round(next * 1000) / 1000);
    };

    fit();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(fit);
    observer.observe(row);
    observer.observe(text);
    return () => observer.disconnect();
  }, [maxRem, minRem, active]);

  return { rowRef, textRef, fontSizeRem };
}

export const BalanceCard: FC<BalanceCardProps> = ({
  accountNumber,
  accountId,
  amount,
  currency = 'USD',
  delta,
  onMore,
  state = 'default',
  className
}) => {
  const isLoading = state === 'loading';
  const isHidden = state === 'hidden';
  const isZero = state === 'zero';
  const cardColor = useCardColor();
  const { t } = useTranslation();
  const { rowRef, textRef, fontSizeRem } = useFitFontSize(AMOUNT_MAX_REM, AMOUNT_MIN_REM, !isLoading);

  const handleMoreClick = () => {
    if (!onMore) return;
    hapticLight();
    onMore();
  };

  return (
    <div
      className={classNames('relative w-full overflow-hidden text-surface-balance-fg rounded-lg-token', className)}
      data-surface="graphite"
    >
      {/* `.mbc .top` — and `min-h-[7.25rem]` is the important part.
          Measured across the eight Home states, this card was drawing at FIVE
          different heights (138.6 / 141.6 / 150.0 / 155.7 / 178.7) depending on
          whether the state carried a delta, a skeleton, a footnote or a mask.
          So the balance figure — and everything below it — moved as the wallet
          loaded, lost the network, or masked itself. Flooring the top at its
          tallest natural state lets the slack fall where the delta would be, so
          the number holds one Y on every state. */}
      <div className={classNames('px-4 pt-2.5 pb-[0.6875rem] min-h-[7.25rem]', CARD_COLOR_TOP[cardColor])}>
        {/* `.balrow` — the label row is also where the card's ONE trailing
            control lives. The `···` used to be a 20pt circle down in the bottom
            strip beside the copy affordance: under half the 44pt floor, and two
            targets inside one thumb-width. */}
        <div className="flex items-center justify-between gap-2.5">
          <div className="text-caption font-semibold text-surface-balance-fg-muted leading-none">
            {t('totalBalance')}
          </div>
          {onMore && (
            <button
              type="button"
              onClick={handleMoreClick}
              aria-label={t('accountOptions')}
              className="-mr-2.5 -my-2.5 flex size-11 shrink-0 items-center justify-center rounded-full text-surface-balance-fg opacity-75"
            >
              <Icon name={IconName.More} className="w-4 h-4" fill="currentColor" />
            </button>
          )}
        </div>

        <div ref={rowRef} className="mt-[0.3125rem] flex items-end gap-1 leading-none min-w-0">
          {isLoading ? (
            <div className={classNames(SKELETON_BLOCK, 'h-12 w-48')} />
          ) : (
            <div className="flex items-baseline gap-1.5 min-w-0">
              {/* Numbers are the product: display face, tabular + lining
                  figures, so digits do not jitter as the value updates. */}
              <span
                ref={textRef}
                style={{ fontSize: `${fontSizeRem}rem` }}
                className="font-heading font-tnum font-extrabold leading-none tracking-[-0.02em] whitespace-nowrap"
              >
                {/* eslint-disable-next-line i18next/no-literal-string -- numerals and a mask glyph, not copy */}
                {isHidden ? '••••••' : isZero ? '$0.00' : amount}
              </span>
              <span className="shrink-0 text-caption font-medium text-surface-balance-fg-muted">{currency}</span>
            </div>
          )}
        </div>

        {/* The delta is a triangle plus text, not a filled pill. A pill reads as
            a badge — a thing with a state — where this is a reading of the same
            number above it. Hidden with the mask, because a visible +0.32%
            beside a masked total leaks the direction and rough size of the move,
            which defeats the point of masking. */}
        {delta && !isLoading && !isHidden && (
          <div
            className="mt-2.5 flex items-center gap-[0.3125rem] text-caption font-bold font-tnum text-surface-balance-fg-muted whitespace-nowrap"
            data-dir={delta.direction === 'negative' ? 'down' : 'up'}
          >
            <svg
              viewBox="0 0 8 7"
              aria-hidden
              className={classNames(
                'h-[0.4375rem] w-2 shrink-0',
                delta.direction === 'negative' ? 'rotate-180 fill-st-down' : 'fill-st-up'
              )}
            >
              <path d="M4 0 8 7H0z" />
            </svg>
            <span>{delta.absolute}</span>
            {/* eslint-disable-next-line i18next/no-literal-string -- parentheses around a formatted number */}
            <span className="font-inter font-semibold opacity-75">({delta.percentage})</span>
          </div>
        )}
      </div>

      {/* `.mbc .bot` — a solid hairline rather than the dashed
          `border-t-[#FFFFFF4D]`, min-height 44 so the strip itself is a proper
          row, and the copy affordance is now the only control in it. */}
      <div
        className={classNames(
          'flex items-center justify-between gap-2 min-h-11 border-t border-surface-balance-rule pl-4 pr-1.5',
          CARD_COLOR_BOTTOM[cardColor]
        )}
      >
        {/* The address is an id, so it is set in mono — the one thing the
            system reserves Geist Mono for. */}
        <CopyButton
          text={accountId ?? accountNumber}
          className={classNames(
            'font-address text-caption font-medium leading-none truncate min-w-0 flex-1 text-left',
            'text-surface-balance-fg hover:bg-transparent active:opacity-80 transition-opacity'
          )}
        >
          {t('accountNumberLabel')} {accountNumber}
        </CopyButton>
      </div>
    </div>
  );
};

export default BalanceCard;
