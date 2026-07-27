import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { WalletType } from '../types';
import { RecoveryOption, SelectRecoveryMethodScreen } from './SelectRecoveryMethod';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `react-i18next` pulls in the full i18n runtime; stub `useTranslation` so
// `t(key)` echoes the key back and every rendered label is the raw key.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key })
}));

// `Button` — render the title and forward the click so `onSubmit` wiring can be
// verified without dragging in framer-motion / haptics.
jest.mock('components/Button', () => ({
  Button: ({ title, onClick, className }: { title: string; onClick?: () => void; className?: string }) => (
    <button data-testid="continue-button" data-classname={className} onClick={onClick}>
      {title}
    </button>
  )
}));

// `Badge` — echo the variant and className as data attributes so the "default"
// badge branch is assertable without pulling in class-variance-authority.
jest.mock('lib/ui/badge', () => ({
  Badge: ({ variant, className, children }: { variant?: string; className?: string; children?: React.ReactNode }) => (
    <span data-testid="default-badge" data-variant={variant} data-classname={className}>
      {children}
    </span>
  )
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const renderScreen = (props: Partial<React.ComponentProps<typeof SelectRecoveryMethodScreen>> = {}) =>
  render(<SelectRecoveryMethodScreen {...props} />);

// Row wrapper for an option (the clickable card is the parent of the <h2> title).
const optionCardByTitle = (title: string): HTMLElement => {
  const heading = screen.getByRole('heading', { level: 2, name: title });
  // h2 -> "flex items-center gap-2" -> "flex flex-row justify-between" -> card
  return heading.parentElement!.parentElement!.parentElement as HTMLElement;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SelectRecoveryMethodScreen', () => {
  describe('default options', () => {
    it('renders the heading and description copy', () => {
      renderScreen();

      expect(screen.getByRole('heading', { level: 1, name: 'chooseRecoveryMethod' })).toBeInTheDocument();
      expect(screen.getByText('chooseRecoveryMethodDescription')).toBeInTheDocument();
    });

    it('renders both default recovery options with their titles and descriptions', () => {
      renderScreen();

      expect(screen.getByRole('heading', { level: 2, name: 'guardianRecovery' })).toBeInTheDocument();
      expect(screen.getByText('guardianRecoveryDescription')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'fullyPrivateRecovery' })).toBeInTheDocument();
      expect(screen.getByText('fullyPrivateRecoveryDescription')).toBeInTheDocument();
    });

    it('renders the "default" badge only on the default (Guardian) option', () => {
      renderScreen();

      const badges = screen.getAllByTestId('default-badge');
      expect(badges).toHaveLength(1);
      expect(badges[0]).toHaveTextContent('default');
      // The fill/ink pair now comes from the Badge's own `accent` variant
      // (--accent + --on-accent-sm) instead of an ad-hoc
      // `bg-primary-500 text-white` override at the call site.
      expect(badges[0]).toHaveAttribute('data-variant', 'accent');
      expect(badges[0]).not.toHaveAttribute('data-classname');
      // The badge lives inside the Guardian card, not the OffChain card.
      expect(optionCardByTitle('guardianRecovery')).toContainElement(badges[0]!);
    });

    // Same spacing rule as before, expressed in the rhythm tokens: the tight
    // step between options, the loose one below the last before the CTA.
    it('applies the tight stack to non-last options and the loose one to the last option', () => {
      renderScreen();

      expect(optionCardByTitle('guardianRecovery')).toHaveClass('mb-stack-tight');
      expect(optionCardByTitle('guardianRecovery')).not.toHaveClass('mb-stack-loose');
      expect(optionCardByTitle('fullyPrivateRecovery')).toHaveClass('mb-stack-loose');
      expect(optionCardByTitle('fullyPrivateRecovery')).not.toHaveClass('mb-stack-tight');
    });

    // Selection is now carried by the accent ring on the SELECTED card rather
    // than by dimming the other one; the assertions keep their meaning
    // (exactly one card is marked, the other is not).
    it('pre-selects the default option and rings it', () => {
      renderScreen();

      // Guardian is the default => selected => carries the accent ring.
      expect(optionCardByTitle('guardianRecovery')).toHaveClass('outline-accent');
      // OffChain is not selected => transparent ring.
      expect(optionCardByTitle('fullyPrivateRecovery')).toHaveClass('outline-transparent');
      expect(optionCardByTitle('fullyPrivateRecovery')).not.toHaveClass('outline-accent');
    });

    it('updates the selection (and the ring) when another option is clicked', () => {
      renderScreen();

      fireEvent.click(optionCardByTitle('fullyPrivateRecovery'));

      expect(optionCardByTitle('fullyPrivateRecovery')).toHaveClass('outline-accent');
      expect(optionCardByTitle('guardianRecovery')).toHaveClass('outline-transparent');
      expect(optionCardByTitle('guardianRecovery')).not.toHaveClass('outline-accent');
    });

    it('submits the pre-selected (Guardian) wallet type when Continue is clicked', () => {
      const onSubmit = jest.fn();
      renderScreen({ onSubmit });

      const button = screen.getByTestId('continue-button');
      expect(button).toHaveTextContent('continue');
      // The screen no longer passes className="text-base". That override beat
      // Button's own text-cta and put the label back under the size that
      // white-on-accent requires to stay legible.
      expect(button).not.toHaveAttribute('data-classname', 'text-base');

      fireEvent.click(button);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(WalletType.Guardian);
    });

    it('submits the newly-selected wallet type after clicking another option', () => {
      const onSubmit = jest.fn();
      renderScreen({ onSubmit });

      fireEvent.click(optionCardByTitle('fullyPrivateRecovery'));
      fireEvent.click(screen.getByTestId('continue-button'));

      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith(WalletType.OffChain);
    });

    it('does not throw when Continue is clicked without an onSubmit handler', () => {
      renderScreen();

      expect(() => fireEvent.click(screen.getByTestId('continue-button'))).not.toThrow();
    });

    it('does not invoke onSubmit before any interaction', () => {
      const onSubmit = jest.fn();
      renderScreen({ onSubmit });
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('custom options', () => {
    const customOptions: RecoveryOption[] = [
      { id: WalletType.OnChain, title: 'On Chain', description: 'On chain description' },
      { id: WalletType.OffChain, title: 'Off Chain', description: 'Off chain description', isLast: true }
    ];

    it('renders provided options instead of the defaults', () => {
      renderScreen({ options: customOptions });

      expect(screen.getByRole('heading', { level: 2, name: 'On Chain' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 2, name: 'Off Chain' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { level: 2, name: 'guardianRecovery' })).not.toBeInTheDocument();
    });

    it('falls back to the first option when none is marked default', () => {
      const onSubmit = jest.fn();
      renderScreen({ options: customOptions, onSubmit });

      // No isDefault => first option (OnChain) is pre-selected and ringed.
      expect(optionCardByTitle('On Chain')).toHaveClass('outline-accent');
      expect(optionCardByTitle('Off Chain')).toHaveClass('outline-transparent');

      fireEvent.click(screen.getByTestId('continue-button'));
      expect(onSubmit).toHaveBeenCalledWith(WalletType.OnChain);
    });

    it('renders no "default" badge when no option is marked default', () => {
      renderScreen({ options: customOptions });
      expect(screen.queryByTestId('default-badge')).not.toBeInTheDocument();
    });
  });

  describe('passthrough props', () => {
    it('spreads extra props onto the root container', () => {
      const { container } = renderScreen({ id: 'recovery-root', 'aria-label': 'recovery' } as never);

      const root = container.querySelector('#recovery-root');
      expect(root).not.toBeNull();
      expect(root).toHaveAttribute('aria-label', 'recovery');
    });
  });
});
