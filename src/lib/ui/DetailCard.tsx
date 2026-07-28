import React, { FC } from 'react';

import classNames from 'clsx';

import { ReactComponent as InfoIcon } from 'app/icons/information.svg';

export const DetailCard: FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="border border-border-card rounded-10 bg-white overflow-hidden">
    {title && (
      <div className="text-xs border-b border-border-light font-semibold text-heading-gray uppercase tracking-[0.6px] leading-4 w-full py-3 pl-4">
        {title}
      </div>
    )}
    {children}
  </div>
);

/**
 * Grey pill used to label a key/value row in the `stacked` layout, and reused
 * standalone by the success-receipt rows. Background/text are token-based so
 * they auto-flip with the theme.
 *
 * Re-exported as `ReviewLabel` from `components/review` for the review screens.
 */
export const RowLabelPill: FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span
    className={classNames(
      'inline-flex items-center rounded-full bg-surface-interactive px-2 py-1 text-sm font-bold text-gray dark:text-pure-white font-heading',
      className
    )}
  >
    {children}
  </span>
);

/**
 * `inline` — the bordered-card row: label (with optional leading icon) on the
 * left, value/badge/custom content on the right, hairline underneath unless
 * it is the last row. This is the shape used inside `DetailCard`.
 *
 * `stacked` — the review-screen row: grey pill label on top, large bold value
 * below, optionally followed by an inline action link and an info note.
 * Dividers are owned by the parent (`ReviewLayout`'s `dividers` prop), so the
 * stacked layout stays border-free and ignores `isLast`.
 */
export type DetailRowLayout = 'inline' | 'stacked';

export interface DetailRowProps {
  label: string;
  /** Default value text. Ignored when `children` is provided. */
  value?: string;
  /** Pill-rendered value. `inline` only; ignored when `children` is provided. */
  badge?: string;
  /** Leading glyph next to the label. `inline` only. */
  icon?: React.ReactNode;
  /** Suppresses the bottom hairline. `inline` only. */
  isLast?: boolean;
  /** Custom value content (badges, dots, bold text…); overrides `value`. */
  children?: React.ReactNode;
  /** Defaults to `inline`. */
  layout?: DetailRowLayout;
  /** `stacked` only: inline action link rendered after the value. */
  onAction?: () => void;
  /** `stacked` only: label for the inline action link. */
  actionLabel?: string;
  /** `stacked` only: helper line under the value, prefixed with an info icon. */
  note?: React.ReactNode;
}

/**
 * The single key/value row. `DetailRow` (bordered card rows) and `ReviewRow`
 * (review screens) were near-duplicates of the same label→value contract with
 * different chrome; they are now one component behind the `layout` prop, with
 * `components/review/ReviewRow` kept as a thin alias so the review call sites
 * keep their own vocabulary.
 */
export const DetailRow: FC<DetailRowProps> = ({
  label,
  value,
  badge,
  icon,
  isLast,
  children,
  layout = 'inline',
  onAction,
  actionLabel,
  note
}) => {
  if (layout === 'stacked') {
    return (
      <div className="py-6">
        <RowLabelPill>{label}</RowLabelPill>

        <div className="mt-2 font-heading text-2xl font-bold text-heading-gray wrap-break-word">
          {children ?? value}
          {onAction && (
            <>
              <span className="mx-2 text-heading-gray">|</span>
              <button type="button" onClick={onAction} className="align-baseline text-primary-500 cursor-pointer">
                {actionLabel}
              </button>
            </>
          )}
        </div>

        {/* --ink-2, not a raw hex: #6B6862 was the same value in both themes, so
            the note stayed dark-on-dark when the theme flipped. */}
        {note && (
          <div className="mt-2 flex items-start gap-1.5 text-xs text-ink-2">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 fill-current" />
            <span>{note}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={classNames('flex items-center justify-between px-4 py-3', !isLast && 'border-b border-border-light')}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm text-heading-gray font-medium">{label}</span>
      </div>
      {children ? (
        <div className="flex items-center">{children}</div>
      ) : badge ? (
        /* --accent-ink on --accent-wash: the shipped #CC5200 on #FFF3EB was a
           light-mode-only pair, so the pill kept its pale wash in dark mode. */
        <span className="text-sm font-medium text-accent-ink bg-accent-wash px-3 py-1 rounded-full">{badge}</span>
      ) : (
        <span className="text-sm text-heading-gray font-medium">{value}</span>
      )}
    </div>
  );
};
