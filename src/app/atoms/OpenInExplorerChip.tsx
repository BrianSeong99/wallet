import React, { FC, useMemo } from 'react';

import classNames from 'clsx';

import { ReactComponent as ArrowRightTopIcon } from 'app/icons/arrow-right-top.svg';
import { AnalyticsEventCategory, useAnalytics } from 'lib/analytics';
import useTippy from 'lib/ui/useTippy';

import { OpenInExplorerChipSelectors } from './OpenInExplorerChip.selectors';

// Fill and ink travel together as one semantic variant. The old API exposed
// them as two independent numeric-shade axes (`bgShade={200} textShade={500}`),
// which named Tailwind palette steps rather than roles and let a call site
// build the illegal pairing — muted ink on the muted fill.
type OpenInExplorerChipVariant = 'default' | 'muted';

// `sm` and `md` are the two Crust radii a chip may take (8 / 12). The previous
// `'sm' | 'base'` mapped to Tailwind's stock 2px and 4px, neither of which is
// on the four-step radius scale.
type OpenInExplorerChipRadius = 'sm' | 'md';

type OpenInExplorerChipProps = {
  baseUrl: string;
  hash: string;
  className?: string;
  variant?: OpenInExplorerChipVariant;
  radius?: OpenInExplorerChipRadius;
};

const VARIANT_CLASSNAMES: Record<OpenInExplorerChipVariant, string> = {
  default: 'bg-surface-2 text-ink hover:bg-surface-3',
  muted: 'bg-surface-3 text-ink-3 hover:bg-surface-2'
};

const RADIUS_CLASSNAMES: Record<OpenInExplorerChipRadius, string> = {
  sm: 'rounded-sm-token',
  md: 'rounded-md-token'
};

const OpenInExplorerChip: FC<OpenInExplorerChipProps> = ({
  baseUrl,
  hash,
  className,
  variant = 'default',
  radius = 'sm'
}) => {
  const { trackEvent } = useAnalytics();
  const tippyProps = useMemo(
    () => ({
      trigger: 'mouseenter',
      hideOnClick: false,
      content: 'View on block explorer',
      animation: 'shift-away-subtle'
    }),
    []
  );

  const ref = useTippy<HTMLAnchorElement>(tippyProps);

  const handleClick = () => {
    trackEvent(OpenInExplorerChipSelectors.ViewOnBlockExplorerLink, AnalyticsEventCategory.ButtonPress);
  };

  return (
    <a
      ref={ref}
      href={`${baseUrl}/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(
        VARIANT_CLASSNAMES[variant],
        RADIUS_CLASSNAMES[radius],
        'leading-none select-none',
        'transition-colors ease-hover duration-150',
        // It is a link, so it is a tap target: SC 2.5.5 floor.
        'flex items-center justify-center min-h-11 min-w-11',
        className
      )}
      onClick={handleClick}
    >
      <ArrowRightTopIcon className="h-5 w-auto fill-current" />
    </a>
  );
};

export default OpenInExplorerChip;
