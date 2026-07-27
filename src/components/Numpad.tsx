import React from 'react';

import { Icon, IconName } from 'app/icons/v2';
import { hapticLight } from 'lib/mobile/haptics';
import { cn } from 'lib/ui/util';

export interface NumpadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  className?: string;
}

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Circular keys, per the passcode mocks (04 / 05 / 05e / 12) — the app drew
// rounded squares. `text-numeric-hero` (32) replaces an off-ramp text-[34px];
// `bg-surface-2` replaces `bg-gray-25`, which is the same warm step but a name
// the token layer owns.
const keyClass =
  'size-23 rounded-full bg-surface-2 text-ink text-numeric-hero font-medium flex items-center justify-center select-none';

export const Numpad: React.FC<NumpadProps> = ({ onDigit, onDelete, className }) => {
  const handleDigit = (digit: string) => {
    hapticLight();
    onDigit(digit);
  };

  const handleDelete = () => {
    hapticLight();
    onDelete();
  };

  return (
    <div className={cn('grid grid-cols-3 gap-4 w-fit mx-auto', className)}>
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
      <div aria-hidden="true" />
      <button type="button" className={keyClass} onClick={() => handleDigit('0')} data-testid="numpad-0">
        0
      </button>
      <button
        type="button"
        aria-label="Delete"
        // Same 44pt+ target and circular shape as the digits, but no fill —
        // delete is not a digit, and the mock leaves it unfilled.
        className="size-23 rounded-full text-ink flex items-center justify-center select-none"
        onClick={handleDelete}
        data-testid="numpad-delete"
      >
        <Icon name={IconName.Backspace} size="lg" />
      </button>
    </div>
  );
};

export default Numpad;
