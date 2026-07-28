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

jest.mock('lib/mobile/haptics', () => ({
  hapticLight: jest.fn()
}));

// `Button` — render the title, forward the click, and surface `disabled`, which
// is the whole point of the gate: Sign Out must stay inert until all four
// affirmations are true.
jest.mock('components/Button', () => ({
  Button: ({
    title,
    onClick,
    variant,
    disabled
  }: {
    title: string;
    onClick?: () => void;
    variant?: string;
    disabled?: boolean;
  }) => (
    <button data-testid={`button-${title}`} data-variant={variant} disabled={disabled} onClick={onClick}>
      {title}
    </button>
  ),
  ButtonVariant: { Primary: 'Primary', Secondary: 'Secondary' }
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACK_IDS = ['ack-erased', 'ack-data', 'ack-guardian', 'ack-phrase'];

const renderComponent = (onClose: () => void = jest.fn(), onSignOut: () => void = jest.fn()) =>
  render(<ForgotPasswordInfo onClose={onClose} onSignOut={onSignOut} />);

const tickAll = () => ACK_IDS.forEach(id => fireEvent.click(screen.getByTestId(id)));

describe('ForgotPasswordInfo', () => {
  it('renders the heading, subcopy and the promoted warning notice', () => {
    renderComponent();

    expect(screen.getByText('forgotPassword')).toBeInTheDocument();
    expect(screen.getByText('forgotPasswordDescription')).toBeInTheDocument();
    expect(screen.getByText('forgotPasswordSecondDescription')).toBeInTheDocument();
  });

  it('renders all four affirmations with their descriptions, under the confirm-all label', () => {
    renderComponent();

    expect(screen.getByText('forgotAckConfirmAll')).toBeInTheDocument();
    ACK_IDS.forEach(id => expect(screen.getByTestId(id)).toBeInTheDocument());

    ['forgotAckErased', 'forgotAckData', 'forgotAckGuardian', 'forgotAckPhrase'].forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
      expect(screen.getByText(`${key}Desc`)).toBeInTheDocument();
    });
  });

  it('states the reassurance in the action zone, not as a fifth affirmation', () => {
    renderComponent();

    // It is true and worth saying, but it is not something to AFFIRM — inside
    // the ladder it would let the user tick past the destruction notice while
    // agreeing to good news.
    expect(screen.getByText('forgotFundsSafe')).toBeInTheDocument();
    expect(screen.queryByTestId('ack-funds')).not.toBeInTheDocument();
  });

  it('keeps Sign Out disabled until every affirmation is true', () => {
    renderComponent();

    const signOut = screen.getByTestId('button-signOut');
    expect(signOut).toBeDisabled();

    // Three of four is still not the gate.
    ACK_IDS.slice(0, 3).forEach(id => fireEvent.click(screen.getByTestId(id)));
    expect(signOut).toBeDisabled();

    fireEvent.click(screen.getByTestId(ACK_IDS[3]!));
    expect(signOut).toBeEnabled();
  });

  it('re-disables Sign Out when an affirmation is withdrawn', () => {
    renderComponent();
    tickAll();

    const signOut = screen.getByTestId('button-signOut');
    expect(signOut).toBeEnabled();

    fireEvent.click(screen.getByTestId('ack-guardian'));
    expect(signOut).toBeDisabled();
  });

  it('invokes onSignOut only once the gate is open', () => {
    const onSignOut = jest.fn();
    renderComponent(jest.fn(), onSignOut);

    fireEvent.click(screen.getByTestId('button-signOut'));
    expect(onSignOut).not.toHaveBeenCalled();

    tickAll();
    fireEvent.click(screen.getByTestId('button-signOut'));
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });

  it('exits via Cancel in the action zone — there is no second dismissal', () => {
    const onClose = jest.fn();
    const onSignOut = jest.fn();
    renderComponent(onClose, onSignOut);

    // The header × is gone: two escapes on one screen is one more than a
    // destructive decision should offer. Hardware back still works.
    expect(screen.queryByTestId('nav-header-close')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('button-cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it('Cancel stays available regardless of how many affirmations are ticked', () => {
    const onClose = jest.fn();
    renderComponent(onClose);

    expect(screen.getByTestId('button-cancel')).toBeEnabled();
    tickAll();
    expect(screen.getByTestId('button-cancel')).toBeEnabled();
  });
});
