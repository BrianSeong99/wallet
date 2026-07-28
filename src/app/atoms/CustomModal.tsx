import React, { FC, useCallback, useEffect } from 'react';

import { useHideDappBubblesWhileOpen } from 'lib/mobile/useHideDappBubblesWhileOpen';
import { PropsWithChildren } from 'lib/props-with-children';
import { Drawer, DrawerContent } from 'lib/ui/drawer';
import { cn } from 'lib/ui/util';

/**
 * Props kept deliberately react-modal-shaped (`isOpen` / `onRequestClose` /
 * `contentLabel`) so every existing call site — `ModalWithTitle` and, through
 * it, `AlertModal` / `ConfirmationModal` / `AddContactModal` / `Dialogs` —
 * keeps working untouched. The implementation underneath is no longer
 * react-modal: it is the app's single overlay primitive (`lib/ui/drawer`,
 * vaul), so there is exactly one sheet/modal language in the app.
 */
export type CustomModalProps = Partial<PropsWithChildren> & {
  isOpen?: boolean;
  onRequestClose?: () => void;
  className?: string;
  overlayClassName?: string;
  /** Accessible name for the surface when nothing inside labels it. */
  contentLabel?: string;
  /** Id of the visible heading that labels the surface. Preferred over `contentLabel`. */
  'aria-labelledby'?: string;
};

const CustomModal: FC<CustomModalProps> = ({
  className,
  overlayClassName,
  isOpen = false,
  onRequestClose,
  contentLabel,
  children,
  ...restProps
}) => {
  useHideDappBubblesWhileOpen(isOpen);

  // Carried over from the react-modal implementation, which did this through
  // `onAfterOpen` / `onAfterClose`: while a modal is up the page behind it
  // must not rubber-band.
  useEffect(() => {
    if (!isOpen) return;

    document.body.classList.add('overscroll-y-none');

    return () => {
      document.body.classList.remove('overscroll-y-none');
    };
  }, [isOpen]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) onRequestClose?.();
    },
    [onRequestClose]
  );

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    return null;
  }

  return (
    // `handleOnly` with no handle rendered means the surface cannot be swiped
    // away. These are blocking decisions; Esc and an overlay click still
    // resolve them, matching what react-modal did.
    <Drawer open={isOpen} onOpenChange={handleOpenChange} handleOnly>
      <DrawerContent
        id="custom-modal"
        aria-label={contentLabel}
        className={cn('bg-surface-solid z-30 shadow-2xl', className)}
        overlayClassName={cn('z-30', overlayClassName)}
        {...restProps}
      >
        {/* Keeps the content clear of the home indicator; the sheet is flush
         *  with the bottom edge, unlike the centred card this replaced. */}
        <div className="pb-[env(safe-area-inset-bottom)]">{children}</div>
      </DrawerContent>
    </Drawer>
  );
};

export default CustomModal;
