import React from 'react';

import classNames from 'clsx';

import { hapticLight } from 'lib/mobile/haptics';

export interface ChipProps extends React.ComponentProps<'label'> {
  label: string | React.ReactNode;
  selected?: boolean;
  className?: string;
}

// Chip is the one INTERACTIVE chip (filters, selectable words); static labels
// are `lib/ui/badge`.
//
// No border: a chip is a tap target, and borders in this system are for
// structural separation (cards, rows, dividers) only.
//
// Selection is neutral ink, not a status hue — being selected is not a status.
// `bg-ink`/`text-paper` also fixes the previous `bg-pure-black`/`text-pure-white`
// pair, which is fixed-palette and did not invert: a black chip with white text
// sat on a near-black page in dark mode.
const defaultClassName = 'bg-surface-2 text-ink hover:bg-surface-3';
const selectedClassName = 'bg-ink text-paper hover:bg-ink-2';

export const Chip: React.FC<ChipProps> = ({ label, selected, className, onClick, ...props }) => {
  const stateClassName = selected ? selectedClassName : defaultClassName;

  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    if (onClick) {
      hapticLight();
      onClick(e);
    }
  };

  return (
    <label
      {...props}
      className={classNames(
        'flex items-center justify-center',
        'px-3 py-2 min-h-8 rounded-sm-token',
        'transition-colors duration-150 ease-hover',
        'font-base text-sm',
        stateClassName,
        className
      )}
      onClick={handleClick}
    >
      {label}
    </label>
  );
};
