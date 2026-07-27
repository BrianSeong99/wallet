import React from 'react';

import classNames from 'clsx';

import { Icon, IconName } from 'app/icons/v2';
import { CircleButton } from 'components/CircleButton';

/**
 * Lifts a sub-44pt affordance to a 44pt hit area (SC 2.5.5) without growing
 * the header row: the pseudo-element paints nothing but is part of the
 * button's hit box.
 */
const TAP_TARGET_44 =
  'relative after:absolute after:left-1/2 after:top-1/2 after:h-11 after:w-11 after:-translate-x-1/2 after:-translate-y-1/2';

export interface ScreenHeaderProps {
  title: React.ReactNode;
  /** Leading back affordance (circular arrow). Omit for a back-less header. */
  onBack?: () => void;
  backLabel?: string;
  /** Trailing close (X) affordance. Omit for a close-less header. */
  onClose?: () => void;
  closeLabel?: string;
  /**
   * `start` (default) is the standard screen header. `center` is the centred
   * nav-bar presentation used by settings, token detail and the seed-phrase /
   * encrypted-file step flows.
   */
  align?: 'start' | 'center';
  /** Hairline rule under the header. */
  showBorder?: boolean;
  className?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  onBack,
  backLabel,
  onClose,
  closeLabel,
  align = 'start',
  showBorder = true,
  className
}) => (
  <div className={classNames('flex items-center gap-4 py-4', showBorder && 'border-b border-border-faint', className)}>
    {onBack && (
      <CircleButton
        icon={IconName.BackArrow}
        color="currentColor"
        size="sm"
        onClick={onBack}
        aria-label={backLabel}
        className={classNames('shrink-0 bg-gray-25 text-primary-500', TAP_TARGET_44)}
      />
    )}
    <h1
      className={classNames(
        'flex-1 font-heading text-heading font-extrabold leading-none text-heading-gray',
        align === 'center' && 'text-center',
        // Optical centring: a leading-only affordance makes the row
        // asymmetric, so nudge the title back to the middle.
        align === 'center' && onBack && !onClose && 'pr-10'
      )}
    >
      {title}
    </h1>
    {onClose && (
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className={classNames(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100',
          TAP_TARGET_44
        )}
      >
        <Icon name={IconName.Close} size="sm" fill="currentColor" className="text-heading-gray" />
      </button>
    )}
  </div>
);
