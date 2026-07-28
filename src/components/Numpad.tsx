import React from 'react';

import { useTranslation } from 'react-i18next';

import { Icon, IconName } from 'app/icons/v2';
import { hapticLight } from 'lib/mobile/haptics';
import { cn } from 'lib/ui/util';

export interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  /**
   * Renders the decimal separator in the slot the passcode pad leaves blank.
   * The amount pad needs it; the passcode pad must not have it. Same grid,
   * same key geometry — one key differs, so this is a prop rather than a
   * second component whose spacing would drift from this one.
   */
  decimalKey?: string;
  className?: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// `.pad button` — 4.75rem circles at 1.625rem/500 on --surface-2, pressing to
// --surface-3 at scale(.94). Previously `size-23` (5.75rem) at
// `text-numeric-hero` (2rem): 92pt keys where the system draws 76, which put
// the pad 28pt wider than spec and crowded the 3-across grid on a 360pt frame.
// 1.625rem has no ramp step of its own — the ramp tops out at --t-title, and
// this glyph is a control label, not type — so the system states it literally
// and so does this.
const keyClass =
  'size-19 rounded-full bg-surface-2 text-ink text-[1.625rem] font-medium flex items-center justify-center select-none ' +
  'transition-[transform,background-color] duration-[var(--dur-fast)] active:scale-[0.94] active:bg-surface-3 ' +
  'motion-reduce:transition-none';

export const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, decimalKey, className }) => {
  const { t } = useTranslation();
  const handleDigit = (digit: string) => {
    hapticLight();
    onDigit(digit);
  };

  const handleDelete = () => {
    hapticLight();
    onDelete();
  };

  // `.pad` — the columns are the key width, so the gap is the ONLY thing
  // between them: 0.875rem down, 1.625rem across. A single `gap-4` made the pad
  // squarer than the system draws it.
  return (
    <div className={cn('grid grid-cols-[repeat(3,4.75rem)] justify-center gap-y-3.5 gap-x-6.5 mx-auto', className)}>
      {DIGITS.map(digit => (
        <button
          key={digit}
          type="button"
          className={keyClass}
          onClick={() => handleDigit(digit)}
          data-testid={`numpad-${digit}`}
        >
          {digit}
        </button>
      ))}
      {decimalKey ? (
        <button type="button" className={keyClass} onClick={() => handleDigit(decimalKey)} data-testid="numpad-decimal">
          {decimalKey}
        </button>
      ) : (
        <div aria-hidden="true" />
      )}
      <button type="button" className={keyClass} onClick={() => handleDigit('0')} data-testid="numpad-0">
        0
      </button>
      <button
        type="button"
        aria-label={t('delete')}
        // Same 44pt+ target and circular shape as the digits, but no fill —
        // delete is not a digit, and the mock leaves it unfilled.
        className="size-19 rounded-full text-ink flex items-center justify-center select-none active:scale-[0.94]"
        onClick={handleDelete}
        data-testid="numpad-delete"
      >
        <Icon name={IconName.Backspace} size="lg" />
      </button>
    </div>
  );
};

export default Numpad;
