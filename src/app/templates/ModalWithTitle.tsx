import React, { FC, ReactNode, useId } from 'react';

import classNames from 'clsx';

import CustomModal, { CustomModalProps } from 'app/atoms/CustomModal';
import { useAppEnv } from 'app/env';

export type ModalWithTitleProps = CustomModalProps & {
  title?: ReactNode;
};

const ModalWithTitle: FC<ModalWithTitleProps> = ({ title, children, className, ...restProps }) => {
  const { compact } = useAppEnv();
  // The surface is a dialog, so it needs an accessible name. When a visible
  // title is rendered it is the name; `contentLabel` remains the fallback for
  // titleless modals.
  const titleId = useId();

  return (
    <CustomModal
      {...restProps}
      aria-labelledby={title ? titleId : undefined}
      className={classNames('w-full max-w-md mx-auto', compact ? 'px-4' : 'px-6', 'pb-4 pt-5', className)}
    >
      <>
        {title ? (
          <h1 id={titleId} className={classNames('mb-6 text-lg font-medium', 'text-black text-left')}>
            {title}
          </h1>
        ) : null}

        <div className="text-black text-sm text-left">{children}</div>
      </>
    </CustomModal>
  );
};

export default ModalWithTitle;
