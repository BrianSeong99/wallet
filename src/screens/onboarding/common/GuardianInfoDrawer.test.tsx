import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import GuardianInfoDrawer, {
  GuardianInfoDrawer as NamedGuardianInfoDrawer,
  GuardianInfoDrawerProps
} from './GuardianInfoDrawer';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

// `react-i18next` — identity translator (labels echo the raw key) plus a
// `Trans` stub that surfaces its `i18nKey` so the description branch renders
// something assertable without dragging in the i18n runtime.
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => <span data-testid="trans">{i18nKey}</span>
}));

// Icon barrel — a trivial stub keeps the whole `app/icons/v2` tree (and its
// chain-constants import) out of the module graph. Echo the icon `name` so the
// two `Icon`-based badges can be told apart.
jest.mock('app/icons/v2', () => ({
  Icon: ({ name, className }: { name: string; className?: string }) => (
    <span data-testid="icon" data-name={name} className={className} />
  ),
  IconName: { Checkmark: 'checkmark', Close: 'close' }
}));

// `Button` — render the title and forward the click so the "gotIt" wiring can
// be verified. `ButtonVariant` has to come along: the dismiss is a SECONDARY
// action, so the component reads the enum at render and a bare `Button` mock
// would throw.
jest.mock('components/Button', () => ({
  ButtonVariant: { Primary: 'primary', Secondary: 'secondary', Ghost: 'ghost' },
  Button: ({ title, onClick, variant }: { title: string; onClick?: () => void; variant?: string }) => (
    <button data-testid={`btn-${title}`} data-variant={variant} onClick={onClick}>
      {title}
    </button>
  )
}));

// Drawer — the real component renders through `vaul` portals; a passthrough
// stub keeps the children directly in the DOM, exposes the `open` prop, and
// gives a handle to fire `onOpenChange`.
jest.mock('lib/ui/drawer', () => ({
  Drawer: ({
    open,
    onOpenChange,
    children
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
  }) => (
    <div data-testid="drawer" data-open={String(open)}>
      <button data-testid="drawer-onOpenChange-false" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  ),
  DrawerContent: ({ children }: { children: React.ReactNode }) => <div data-testid="drawer-content">{children}</div>,
  DrawerTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="drawer-title">{children}</div>
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeProps = (overrides: Partial<GuardianInfoDrawerProps> = {}): GuardianInfoDrawerProps => ({
  open: true,
  onOpenChange: jest.fn(),
  ...overrides
});

const renderDrawer = (props: GuardianInfoDrawerProps = makeProps()) => render(<GuardianInfoDrawer {...props} />);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GuardianInfoDrawer', () => {
  it('forwards the open prop to the drawer scaffold when open', () => {
    renderDrawer(makeProps({ open: true }));
    expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'true');
    expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
  });

  it('forwards the open prop to the drawer scaffold when closed', () => {
    renderDrawer(makeProps({ open: false }));
    expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'false');
  });

  it('renders the translated title in the drawer title slot', () => {
    renderDrawer();
    expect(screen.getByTestId('drawer-title')).toHaveTextContent('whatIsAGuardian');
  });

  it('renders the hero illustration svg', () => {
    const { container } = renderDrawer();
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders the intro description via the Trans component with its i18n key', () => {
    renderDrawer();
    expect(screen.getByTestId('trans')).toHaveTextContent('guardianInfoDescription');
  });

  it('renders all three info rows with their translated titles and descriptions', () => {
    renderDrawer();
    [
      'guardianInfoWhatItDoesTitle',
      'guardianInfoWhatItDoesDescription',
      'guardianInfoSwitchingIsEasyTitle',
      'guardianInfoSwitchingIsEasyDescription',
      'guardianInfoWhatItCannotDoTitle',
      'guardianInfoWhatItCannotDoDescription'
    ].forEach(key => {
      expect(screen.getByText(key)).toBeInTheDocument();
    });
  });

  it('renders the checkmark and close icon badges plus the exclamation badge', () => {
    renderDrawer();
    const icons = screen.getAllByTestId('icon');
    const names = icons.map(icon => icon.getAttribute('data-name'));
    expect(names).toEqual(expect.arrayContaining(['checkmark', 'close']));
    // The "switching is easy" badge is a plain "!" glyph, not an Icon.
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('draws a divider between rows only — the first row has none (hasDivider branch)', () => {
    const { container } = renderDrawer();
    // The rule sits BETWEEN rows (`.isrow + .isrow`), so it is a top border on
    // rows 2 and 3; the first row passes `hasDivider={false}`. Same invariant as
    // before — exactly two rules for three rows — just anchored to the top edge.
    expect(container.querySelectorAll('.border-t')).toHaveLength(2);
  });

  it('closes the drawer when the "gotIt" button is clicked', () => {
    const onOpenChange = jest.fn();
    renderDrawer(makeProps({ onOpenChange }));

    fireEvent.click(screen.getByTestId('btn-gotIt'));

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("propagates the drawer's own onOpenChange requests", () => {
    const onOpenChange = jest.fn();
    renderDrawer(makeProps({ onOpenChange }));

    fireEvent.click(screen.getByTestId('drawer-onOpenChange-false'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not fire onOpenChange before any interaction', () => {
    const onOpenChange = jest.fn();
    renderDrawer(makeProps({ onOpenChange }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('exposes the same component as its default and named export', () => {
    expect(NamedGuardianInfoDrawer).toBe(GuardianInfoDrawer);
  });
});
