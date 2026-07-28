import React, { ComponentProps, FC, HTMLAttributes } from 'react';

import classNames from 'clsx';

import CopyButton, { CopyButtonProps } from 'app/atoms/CopyButton';
import HashShortView from 'app/atoms/HashShortView';
import { Icon, IconName } from 'app/icons/v2';

type HashChipProps = HTMLAttributes<HTMLButtonElement> &
  ComponentProps<typeof HashShortView> &
  Pick<ComponentProps<typeof Icon>, 'size' | 'fill' | 'className'> &
  Pick<CopyButtonProps, 'small' | 'type' | 'bgShade' | 'rounded' | 'textShade'> & { copyIcon?: boolean };

const HashChip: FC<HashChipProps> = ({
  hash,
  trimHash,
  trimAfter,
  firstCharsCount,
  lastCharsCount,
  displayName,
  type = 'button',
  size = 'xs',
  fill = 'black',
  copyIcon = true,
  ...rest
}) => (
  <CopyButton text={hash} type={type} {...rest}>
    {/* Hashes and ids are the other half of the mono role; a `displayName`
        substitutes a human label, which stays in the UI face. */}
    <span className={classNames('flex flex-row items-center', !displayName && 'font-address')}>
      <HashShortView
        hash={hash}
        trimHash={trimHash}
        trimAfter={trimAfter}
        firstCharsCount={firstCharsCount}
        lastCharsCount={lastCharsCount}
        displayName={displayName}
      />
      {copyIcon && <Icon name={IconName.Copy} size={size} fill={fill} />}
    </span>
  </CopyButton>
);

export default HashChip;
