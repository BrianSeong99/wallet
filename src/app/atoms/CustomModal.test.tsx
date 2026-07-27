import React from 'react';

import { render, screen, act, fireEvent } from '@testing-library/react';

import CustomModal from './CustomModal';

// `lib/platform` gates the body-drawer flag CustomModal sets: `isMobile()`
// (via `useHideDappBubblesWhileOpen`) toggles it. `isExtension()` is mocked
// too so each platform branch can be steered independently.
jest.mock('lib/platform', () => ({
  isExtension: jest.fn(() => false),
  isMobile: jest.fn(() => false)
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const platform = require('lib/platform') as {
  isExtension: jest.Mock;
  isMobile: jest.Mock;
};

/** Adds the `#root` element CustomModal looks up, mirroring the real app shell. */
function mountRoot(): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('id', 'root');
  document.body.appendChild(root);
  return root;
}

/**
 * The overlay primitive animates in and out, so open/close side effects can
 * land a frame or a timer late. Advancing the fake clock (wrapped in `act`)
 * flushes anything pending so the modal's lifecycle effects have run.
 */
function flushModalTimers(ms = 300): void {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  platform.isExtension.mockReturnValue(false);
  platform.isMobile.mockReturnValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  // Clean up any manually-added #root and the body flags the callbacks set so
  // tests stay isolated from each other.
  document.getElementById('root')?.remove();
  document.body.classList.remove('overscroll-y-none');
  document.body.removeAttribute('data-drawer-open');
});

describe('CustomModal', () => {
  it('renders null when there is no #root element', () => {
    // No #root mounted -> the early-return branch fires.
    const { container } = render(
      <CustomModal isOpen>
        <div data-testid="content">hi</div>
      </CustomModal>
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    expect(document.getElementById('custom-modal')).toBeNull();
  });

  it('renders the modal content when #root exists and isOpen is true', () => {
    mountRoot();

    render(
      <CustomModal isOpen>
        <div data-testid="content">hello</div>
      </CustomModal>
    );

    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(document.getElementById('custom-modal')).toBeInTheDocument();
  });

  it('does not render content when isOpen is false', () => {
    mountRoot();

    render(
      <CustomModal isOpen={false}>
        <div data-testid="content">hidden</div>
      </CustomModal>
    );

    expect(screen.queryByTestId('content')).not.toBeInTheDocument();
  });

  it('adds the base classes and merges a custom className onto the content', () => {
    mountRoot();

    render(
      <CustomModal isOpen className="my-custom-class">
        <div>body</div>
      </CustomModal>
    );

    const content = document.getElementById('custom-modal') as HTMLElement;
    expect(content).toHaveClass('bg-surface-solid', 'rounded-t-[20px]', 'z-30', 'shadow-2xl', 'my-custom-class');
  });

  it('merges a custom overlayClassName onto the overlay', () => {
    mountRoot();

    render(
      <CustomModal isOpen overlayClassName="my-overlay-class">
        <div>body</div>
      </CustomModal>
    );

    const overlay = document.querySelector('.my-overlay-class') as HTMLElement;
    expect(overlay).not.toBeNull();
    // Scrim spec: 40% black light / 55% dark, with a small (4px) never-animated blur.
    expect(overlay).toHaveClass('fixed', 'inset-0', 'z-30', 'bg-black/40', 'backdrop-blur-[4px]', 'dark:bg-black/55');
  });

  it('flags the body when the modal opens', () => {
    mountRoot();

    render(
      <CustomModal isOpen>
        <div>body</div>
      </CustomModal>
    );

    // onAfterOpen runs on the next animation frame.
    flushModalTimers();

    expect(document.body).toHaveClass('overscroll-y-none');
  });

  it('clears the body flag when the modal closes (extension build)', () => {
    platform.isExtension.mockReturnValue(true);
    mountRoot();

    const { rerender } = render(
      <CustomModal isOpen>
        <div>body</div>
      </CustomModal>
    );

    flushModalTimers();
    expect(document.body).toHaveClass('overscroll-y-none');

    act(() => {
      rerender(
        <CustomModal isOpen={false}>
          <div>body</div>
        </CustomModal>
      );
    });

    expect(document.body).not.toHaveClass('overscroll-y-none');
  });

  it('clears the body flag when the modal closes (non-extension build)', () => {
    platform.isExtension.mockReturnValue(false);
    mountRoot();

    const { rerender } = render(
      <CustomModal isOpen>
        <div>body</div>
      </CustomModal>
    );

    flushModalTimers();
    expect(document.body).toHaveClass('overscroll-y-none');

    act(() => {
      rerender(
        <CustomModal isOpen={false}>
          <div>body</div>
        </CustomModal>
      );
    });

    // Let the exit animation settle before asserting the flag is gone.
    flushModalTimers();

    expect(document.body).not.toHaveClass('overscroll-y-none');
  });

  it('sets the drawer-open body flag on mobile via useHideDappBubblesWhileOpen', () => {
    platform.isMobile.mockReturnValue(true);
    mountRoot();

    render(
      <CustomModal isOpen>
        <div>body</div>
      </CustomModal>
    );

    expect(document.body.hasAttribute('data-drawer-open')).toBe(true);
  });

  it('exposes contentLabel as the surface accessible name', () => {
    mountRoot();

    render(
      <CustomModal isOpen contentLabel="my-dialog">
        <div>body</div>
      </CustomModal>
    );

    const content = document.getElementById('custom-modal') as HTMLElement;
    expect(content.getAttribute('aria-label')).toBe('my-dialog');
  });

  it('requests close on Escape', () => {
    mountRoot();
    const onRequestClose = jest.fn();

    render(
      <CustomModal isOpen onRequestClose={onRequestClose}>
        <div>body</div>
      </CustomModal>
    );

    flushModalTimers();

    act(() => {
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    });

    expect(onRequestClose).toHaveBeenCalled();
  });
});
