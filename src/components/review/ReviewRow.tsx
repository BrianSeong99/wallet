import React from 'react';

import { DetailRow, RowLabelPill } from 'lib/ui/DetailCard';

/**
 * Grey pill used to label a review section (row label or the hero caption).
 * Alias of the shared `RowLabelPill` — kept under this name because the review
 * screens and the success receipt already speak in `ReviewLabel`.
 */
export const ReviewLabel = RowLabelPill;

export interface ReviewRowProps {
  label: string;
  /** Default value text (large, bold). Ignored when `children` is provided. */
  value?: string;
  /** Inline "Edit" link rendered after the value, separated by a divider. */
  onEdit?: () => void;
  editLabel?: string;
  /** Custom value content (badges, dots, bold text…); overrides `value`. */
  children?: React.ReactNode;
  /** Optional helper line under the value, prefixed with an info icon. */
  note?: React.ReactNode;
}

/**
 * One label/value block in a review screen. This is the canonical key/value row
 * (`lib/ui/DetailCard`'s `DetailRow`) in its `stacked` layout — grey pill label
 * on top, then the value (large, bold, `font-heading`) below, optionally
 * followed by an inline "Edit" link and an info note. Dividers between rows are
 * owned by the parent (ReviewLayout's `dividers` prop), so this stays
 * border-free.
 */
export const ReviewRow: React.FC<ReviewRowProps> = ({ label, value, onEdit, editLabel, children, note }) => (
  <DetailRow layout="stacked" label={label} value={value} onAction={onEdit} actionLabel={editLabel} note={note}>
    {children}
  </DetailRow>
);
