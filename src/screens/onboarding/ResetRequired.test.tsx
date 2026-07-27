import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import ResetRequired from './ResetRequired';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `react-i18next` pulls in the full i18n runtime; stub `useTranslation` so
// `t(key)` echoes the key back and every rendered label is the raw key.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Icon barrel — expose the `IconName` members the screen references plus an
// `Icon` stub that echoes the name and the size it was rendered at, so the
// hero illustration stays assertable without the real SVG set.
jest.mock('app/icons/v2', () => ({
  IconName: { MidenLogo: 'MidenLogo' },
  Icon: ({ name, size }: { name: string; size?: string }) => (
    <span data-testid="hero-icon" data-icon={name} data-size={size} />
  )
}));

// `ScreenHeader` — surface just the title so the header wiring is
// assertable without dragging in `CircleButton` / the real icon set.
jest.mock('components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => <div data-testid="nav-header">{title}</div>
}));

// `Button` — render the title and forward the click so `onConfirm` wiring and
// the chosen variant can both be verified.
jest.mock('components/Button', () => ({
  Button: ({ title, onClick, variant }: { title: string; onClick?: () => void; variant?: string }) => (
    <button data-testid="reset-button" data-variant={variant} onClick={onClick}>
      {title}
    </button>
  ),
  ButtonVariant: { Primary: 'Primary' }
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderComponent = (onConfirm: () => void = jest.fn()) => render(<ResetRequired onConfirm={onConfirm} />);

describe('ResetRequired', () => {
  it('renders the navigation header with the reset-required title', () => {
    renderComponent();
    expect(screen.getByTestId('nav-header')).toHaveTextContent('resetRequired');
  });

  it('renders the reset-required copy, icon and hero sizing', () => {
    renderComponent();

    // Same three strings the `Message` block used to be handed, now asserted on
    // the heading / subcopy primitives that replaced it.
    expect(screen.getByRole('heading')).toHaveTextContent('resetRequired');
    expect(screen.getByText('resetRequiredDescription')).toBeInTheDocument();
    expect(screen.getByText('resetRequiredSecondDescription')).toBeInTheDocument();

    const icon = screen.getByTestId('hero-icon');
    expect(icon).toHaveAttribute('data-icon', 'MidenLogo');
    // Sizing moved off the icon (it was pinned at 218px) and onto the shared
    // hero wrapper, which is the design system's `--hero-w`.
    expect(icon.parentElement).toHaveClass('w-hero');
  });

  it('renders the primary reset button', () => {
    renderComponent();

    const button = screen.getByTestId('reset-button');
    expect(button).toHaveTextContent('reset');
    expect(button).toHaveAttribute('data-variant', 'Primary');
  });

  it('invokes onConfirm when the reset button is clicked', () => {
    const onConfirm = jest.fn();
    renderComponent(onConfirm);

    fireEvent.click(screen.getByTestId('reset-button'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not invoke onConfirm before any interaction', () => {
    const onConfirm = jest.fn();
    renderComponent(onConfirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
