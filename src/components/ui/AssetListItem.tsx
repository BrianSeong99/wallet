import React, { FC, ReactNode } from 'react';

import classNames from 'clsx';

import { hapticLight } from 'lib/mobile/haptics';

export type AssetDeltaDirection = 'positive' | 'negative' | 'neutral';

export interface AssetListItemProps {
  icon: ReactNode;
  name: string;
  amount: string;
  chart?: ReactNode;
  price?: string;
  delta?: {
    value: string;
    direction?: AssetDeltaDirection;
  };
  onClick?: () => void;
  className?: string;
  'data-testid'?: string;
}

export const AssetListItem: FC<AssetListItemProps> = ({
  icon,
  name,
  amount,
  chart,
  price,
  delta,
  onClick,
  className,
  'data-testid': dataTestId
}) => {
  const handleClick = () => {
    if (!onClick) return;
    hapticLight();
    onClick();
  };

  // `.mrow .rt .b` is --ink-2 by default; the mock colours it only when there
  // is a real move to report, so a flat or unpriced row reads as neutral
  // information rather than as a status.
  const deltaColor =
    delta?.direction === 'negative' ? 'text-neg' : delta?.direction === 'neutral' ? 'text-ink-2' : 'text-pos';

  return (
    <div
      data-testid={dataTestId}
      role={onClick ? 'button' : undefined}
      onClick={onClick ? handleClick : undefined}
      className={classNames(
        // `.mrow` — padding rather than a fixed h-18, so the row height comes
        // from its content and the list keeps one rhythm.
        'w-full flex items-center justify-between gap-3 py-3',
        onClick && 'cursor-pointer active:opacity-90 transition-opacity',
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* `.mrow .ic` — 2.375rem, and the icon is the row's only fixed size. */}
        <div className="shrink-0 size-[2.375rem] rounded-full flex items-center justify-center overflow-hidden">
          {icon}
        </div>

        <div className="flex flex-col min-w-0">
          {/* `.nm` — --t-body at 700. The token NAME is copy, so it stays
              proportional; everything numeric below and to the right does not. */}
          <div className="text-body font-bold leading-tight text-ink truncate">{name}</div>
          {/* amount / price / delta are live values — tabular + lining figures so
              the digits don't jitter on refresh and the column of prices in the
              asset list lines up. The token NAME above is copy, so it stays
              proportional. */}
          {/* `.ad` — --t-caption in --ink-2, on the display face with tabular
              figures. `opacity-50` on --ink was doing the job of a token and
              could not theme; --ink-2 is the muted ink the system defines. */}
          <div className="font-heading font-tnum text-caption leading-tight text-ink-2">{amount}</div>
        </div>
      </div>

      <div className="flex items-center justify-center">{chart}</div>

      {/* `.rt` — right column, both values on the display face with tabular
          figures so the price column lines up down the list. */}
      <div className="ml-auto flex flex-col items-end text-right">
        {price && <div className="font-heading font-tnum text-body font-bold leading-tight text-ink">{price}</div>}
        {delta && (
          <div className={classNames('font-heading font-tnum text-caption leading-tight', deltaColor)}>
            {delta.value}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetListItem;
