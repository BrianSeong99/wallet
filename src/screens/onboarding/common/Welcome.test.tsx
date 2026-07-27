import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import { WelcomeScreen } from './Welcome';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `react-i18next` pulls in the full i18n runtime; stub `useTranslation` so
// `t(key)` echoes the key back and every rendered label is the raw key.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// `isMobile` gates the top-padding class on the button column. A mutable holder
// lets individual tests flip the platform to exercise both the mobile (`pt-8`)
// and non-mobile (`pt-6`) branches.
const mockPlatform = { isMobile: false };
jest.mock('lib/platform', () => ({
  isMobile: () => mockPlatform.isMobile
}));

// `hapticLight` is a native Capacitor wrapper; replace it with a spy so the
// recover-link tap wiring can be asserted without touching the plugin.
const hapticLight = jest.fn();
jest.mock('lib/mobile/haptics', () => ({
  hapticLight: () => hapticLight()
}));

// `app/icons/v2` — replace the SVG barrel with a lightweight marker exposing the
// only `IconName` member the component references.
jest.mock('app/icons/v2', () => ({
  Icon: (props: { name?: string }) => <span data-testid="icon" data-name={props.name} />,
  IconName: { ChevronRight: 'ChevronRight' }
}));

// `Button` — render the title and forward the click / tabIndex so the primary
// "get started" wiring can be verified. A `btn-<title>` test id makes the CTA
// addressable.
jest.mock('components/Button', () => ({
  Button: ({ title, onClick, tabIndex }: { title: string; onClick?: () => void; tabIndex?: number }) => (
    <button data-testid={`btn-${title}`} data-tabindex={String(tabIndex)} onClick={onClick}>
      {title}
    </button>
  )
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderComponent = (props: Partial<React.ComponentProps<typeof WelcomeScreen>> = {}) =>
  render(<WelcomeScreen {...props} />);

beforeEach(() => {
  mockPlatform.isMobile = false;
  hapticLight.mockClear();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WelcomeScreen', () => {
  it('renders the onboarding welcome container with its test id', () => {
    renderComponent();
    expect(screen.getByTestId('onboarding-welcome')).toBeInTheDocument();
  });

  it('renders the bread logo svg with the fixed width sizing', () => {
    const { container } = renderComponent();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveStyle({ width: '130px' });
  });

  it('renders the translated heading copy across its spans', () => {
    renderComponent();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('welcome');
    expect(heading).toHaveTextContent('toLowercase');
    expect(heading).toHaveTextContent('midenWallet');
  });

  it('renders the translated description copy', () => {
    renderComponent();
    expect(screen.getByText('breadWalletDescription')).toBeInTheDocument();
  });

  it('renders the primary get-started button as focusable (tabIndex 0)', () => {
    renderComponent();
    const button = screen.getByTestId('btn-getStarted');
    expect(button).toHaveTextContent('getStarted');
    expect(button).toHaveAttribute('data-tabindex', '0');
  });

  it('renders the recover-account link with the chevron icon', () => {
    renderComponent();
    const link = document.getElementById('import-link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveTextContent('recoverYourAccount');
    expect(screen.getByTestId('icon')).toHaveAttribute('data-name', 'ChevronRight');
  });

  it('invokes onSubmit with "select-wallet-type" when get-started is clicked', () => {
    const onSubmit = jest.fn();
    renderComponent({ onSubmit });

    fireEvent.click(screen.getByTestId('btn-getStarted'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('select-wallet-type');
  });

  it('fires the haptic and onSubmit with "select-import-type" when recover is clicked', () => {
    const onSubmit = jest.fn();
    renderComponent({ onSubmit });

    fireEvent.click(document.getElementById('import-link')!);
    expect(hapticLight).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith('select-import-type');
  });

  it('still fires the haptic on recover even without an onSubmit handler', () => {
    renderComponent();

    expect(() => fireEvent.click(document.getElementById('import-link')!)).not.toThrow();
    expect(hapticLight).toHaveBeenCalledTimes(1);
  });

  it('does not throw when get-started is clicked without an onSubmit handler', () => {
    renderComponent();
    expect(() => fireEvent.click(screen.getByTestId('btn-getStarted'))).not.toThrow();
  });

  it('does not fire any callback before interaction', () => {
    const onSubmit = jest.fn();
    renderComponent({ onSubmit });

    expect(onSubmit).not.toHaveBeenCalled();
    expect(hapticLight).not.toHaveBeenCalled();
  });

  // The action zone used to pad itself differently per platform (pt-8 on mobile,
  // pt-6 elsewhere). The design system gives the zone ONE geometry so the primary
  // action sits at the same Y on every screen and every target — a platform
  // conditional here is the drift, not a feature. These two tests now assert that
  // invariant instead of the old split.
  it('gives the action zone the same padding on mobile and desktop', () => {
    mockPlatform.isMobile = true;
    const { unmount } = renderComponent();
    const mobileColumn = screen.getByTestId('btn-getStarted').parentElement;
    const mobileClasses = mobileColumn?.className;
    unmount();

    mockPlatform.isMobile = false;
    renderComponent();
    const desktopColumn = screen.getByTestId('btn-getStarted').parentElement;

    expect(desktopColumn?.className).toBe(mobileClasses);
    expect(desktopColumn).toHaveClass('pt-4', 'pb-4');
    expect(desktopColumn).not.toHaveClass('pt-8');
    expect(desktopColumn).not.toHaveClass('pt-6');
  });

  it('pins the action zone to the bottom of the column', () => {
    renderComponent();

    // mt-auto is what holds the CTA at a fixed distance from the bottom
    // regardless of how tall the content above it is.
    expect(screen.getByTestId('btn-getStarted').parentElement).toHaveClass('mt-auto');
  });
});
