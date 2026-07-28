import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { AnalyticsEventCategory, useAnalytics } from 'lib/analytics';
import useTippy from 'lib/ui/useTippy';

import OpenInExplorerChip from './OpenInExplorerChip';
import { OpenInExplorerChipSelectors } from './OpenInExplorerChip.selectors';

jest.mock('lib/analytics', () => ({
  AnalyticsEventCategory: { ButtonPress: 'ButtonPress' },
  useAnalytics: jest.fn()
}));

jest.mock('lib/ui/useTippy', () => ({
  __esModule: true,
  default: jest.fn(() => jest.fn())
}));

const mockUseAnalytics = useAnalytics as jest.Mock;
const mockUseTippy = useTippy as jest.Mock;

describe('OpenInExplorerChip', () => {
  const trackEvent = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAnalytics.mockReturnValue({ trackEvent });
  });

  it('renders the explorer link with default props and tracks clicks', () => {
    render(<OpenInExplorerChip baseUrl="https://explorer.test" hash="0xabc" />);

    const link = screen.getByRole('link');

    // href is composed from baseUrl + hash, opens safely in a new tab.
    expect(link).toHaveAttribute('href', 'https://explorer.test/0xabc');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');

    // Default branches: variant='default', radius='sm'.
    expect(link).toHaveClass('bg-surface-2', 'hover:bg-surface-3');
    expect(link).toHaveClass('text-ink');
    expect(link).toHaveClass('rounded-sm-token');
    expect(link).not.toHaveClass('rounded-md-token');

    // A link is a tap target — SC 2.5.5's 44pt floor.
    expect(link).toHaveClass('min-h-11', 'min-w-11');

    // The tippy ref callback is used on the anchor.
    expect(mockUseTippy).toHaveBeenCalledTimes(1);
    const tippyProps = mockUseTippy.mock.calls[0][0];
    expect(tippyProps).toEqual({
      trigger: 'mouseenter',
      hideOnClick: false,
      content: 'View on block explorer',
      animation: 'shift-away-subtle'
    });

    // Icon is rendered inside the anchor.
    expect(link.querySelector('svg')).toBeInTheDocument();

    expect(trackEvent).not.toHaveBeenCalled();
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      OpenInExplorerChipSelectors.ViewOnBlockExplorerLink,
      AnalyticsEventCategory.ButtonPress
    );
  });

  it('applies the muted variant, the md radius and a custom className', () => {
    render(
      <OpenInExplorerChip
        baseUrl="https://explorer.test"
        hash="deadbeef"
        variant="muted"
        radius="md"
        className="custom-class"
      />
    );

    const link = screen.getByRole('link');

    expect(link).toHaveClass('bg-surface-3', 'hover:bg-surface-2');
    expect(link).toHaveClass('text-ink-3');
    expect(link).toHaveClass('rounded-md-token');
    expect(link).not.toHaveClass('rounded-sm-token');
    expect(link).toHaveClass('custom-class');
  });

  it('keeps fill and ink paired so a variant cannot be half-applied', () => {
    // The old API had independent `bgShade` / `textShade` axes; the ink now
    // travels with the fill, so asking for the default variant can never yield
    // the muted ink.
    render(<OpenInExplorerChip baseUrl="https://explorer.test" hash="feedface" variant="default" />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-ink');
    expect(link).not.toHaveClass('text-ink-3');
  });
});
