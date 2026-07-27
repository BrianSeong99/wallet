import React from 'react';

import { render, screen, fireEvent } from '@testing-library/react';

import ForgotPasswordInfo from './ForgotPasswordInfo';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `react-i18next` pulls in the full i18n runtime; stub `useTranslation` so
// `t(key)` echoes the key back and every rendered label is the raw key.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// Icon barrel — expose the `IconName` members the screen references plus an
// `Icon` stub that echoes the name, so the badged glyph stays assertable
// without the real SVG set.
jest.mock('app/icons/v2', () => ({
  IconName: { Lock: 'Lock' },
  Icon: ({ name }: { name: string }) => <span data-testid="status-icon" data-icon={name} />
}));

// `ScreenHeader` — surface the title, the affordance the header was given
// (`close` vs `back`) and the close handler so the header wiring is assertable
// without dragging in `CircleButton` / the real icon set.
jest.mock('components/ScreenHeader', () => ({
  ScreenHeader: ({ title, onBack, onClose }: { title: string; onBack?: () => void; onClose?: () => void }) => (
    <div data-testid="nav-header" data-mode={onClose ? 'close' : onBack ? 'back' : undefined}>
      <span data-testid="nav-header-title">{title}</span>
      <button data-testid="nav-header-close" onClick={onClose}>
        close
      </button>
    </div>
  )
}));

// `Button` — render the title and forward the click so `onSignOut` wiring and
// the chosen variant can both be verified.
jest.mock('components/Button', () => ({
  Button: ({ title, onClick, variant }: { title: string; onClick?: () => void; variant?: string }) => (
    <button data-testid="sign-out-button" data-variant={variant} onClick={onClick}>
      {title}
    </button>
  ),
  ButtonVariant: { Primary: 'Primary' }
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderComponent = (onClose: () => void = jest.fn(), onSignOut: () => void = jest.fn()) =>
  render(<ForgotPasswordInfo onClose={onClose} onSignOut={onSignOut} />);

describe('ForgotPasswordInfo', () => {
  it('renders the navigation header in close mode with the forgot-password title', () => {
    renderComponent();

    const header = screen.getByTestId('nav-header');
    expect(screen.getByTestId('nav-header-title')).toHaveTextContent('forgotPassword');
    expect(header).toHaveAttribute('data-mode', 'close');
  });

  it('renders the forgot-password copy, badged lock icon and the promoted warning', () => {
    renderComponent();

    // Same three strings the `Message` block used to be handed, now asserted on
    // the heading / subcopy primitives that replaced it.
    expect(screen.getByRole('heading')).toHaveTextContent('forgotPassword');
    expect(screen.getByText('forgotPasswordDescription')).toBeInTheDocument();

    const icon = screen.getByTestId('status-icon');
    expect(icon).toHaveAttribute('data-icon', 'Lock');
    // The glyph now sits in the design system's warn-wash status badge.
    expect(icon.parentElement).toHaveClass('bg-warn-wash', 'text-warn');

    // The "do not sign out unless…" sentence carried `text-sm` before; it is the
    // sentence that decides whether the user should be here at all, so it is
    // promoted to full-ink bold rather than sized down.
    const warning = screen.getByText('forgotPasswordSecondDescription');
    expect(warning).toHaveClass('text-label', 'font-bold', 'text-ink');
  });

  it('renders the primary sign-out button', () => {
    renderComponent();

    const button = screen.getByTestId('sign-out-button');
    expect(button).toHaveTextContent('signOut');
    expect(button).toHaveAttribute('data-variant', 'Primary');
  });

  it('invokes onClose when the header close control is clicked', () => {
    const onClose = jest.fn();
    renderComponent(onClose);

    fireEvent.click(screen.getByTestId('nav-header-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onSignOut when the sign-out button is clicked', () => {
    const onSignOut = jest.fn();
    renderComponent(jest.fn(), onSignOut);

    fireEvent.click(screen.getByTestId('sign-out-button'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('keeps the two handlers independent — closing does not sign out and vice versa', () => {
    const onClose = jest.fn();
    const onSignOut = jest.fn();
    renderComponent(onClose, onSignOut);

    fireEvent.click(screen.getByTestId('nav-header-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSignOut).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('sign-out-button'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not invoke either handler before any interaction', () => {
    const onClose = jest.fn();
    const onSignOut = jest.fn();
    renderComponent(onClose, onSignOut);

    expect(onClose).not.toHaveBeenCalled();
    expect(onSignOut).not.toHaveBeenCalled();
  });
});
