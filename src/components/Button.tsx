import React from 'react';

import { motion } from 'framer-motion';

import { IconName } from 'app/icons/v2';
import { hapticLight } from 'lib/mobile/haptics';
import { cn } from 'lib/ui/util';
import { IconOrComponent } from 'utils/icon-or-component';

import { Loader } from './Loader';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Ghost = 'ghost'
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  title?: string;
  iconLeft?: React.ReactNode | IconName;
  iconRight?: React.ReactNode | IconName;
  isLoading?: boolean;
  /** Optional E2E hook, forwarded to the root <button>. Set by specific callers. */
  'data-testid'?: string;
}

const propsPerButtonVariant = {
  [ButtonVariant.Primary]: {
    color: 'text-pure-white',
    fontWeight: 'font-bold',
    // White on the brand orange is exactly 3.00:1, which conforms under
    // SC 1.4.3 ONLY as large text (>=18.66px bold). At the shared text-base
    // (16px) this button was non-conformant everywhere it appeared, so the
    // label size is an accessibility constraint here, not styling: --t-cta is
    // 19px and it must never be set smaller while the label stays white.
    // Margin at 3.00:1 is zero.
    fontSize: 'text-cta',
    disabledColor: 'text-heading-gray',
    disabledFontWeight: 'font-semibold',
    backgroundColor: 'bg-primary-500 focus:bg-primary-500',
    hoverBackgroundColor: 'hover:bg-primary-600',
    disabledBackgroundColor: 'bg-surface-inactive',
    iconColor: 'white',
    border: ''
  },
  [ButtonVariant.Secondary]: {
    color: 'text-heading-gray',
    fontWeight: 'font-bold',
    fontSize: 'text-base',
    disabledColor: 'text-heading-gray',
    disabledFontWeight: 'font-semibold',
    backgroundColor: 'bg-button-secondary',
    hoverBackgroundColor: 'hover:bg-button-secondary-hover',
    disabledBackgroundColor: 'bg-surface-inactive',
    iconColor: 'black',
    border: ''
  },
  [ButtonVariant.Ghost]: {
    color: 'text-heading-gray',
    fontWeight: 'font-bold',
    fontSize: 'text-base',
    disabledColor: 'text-grey-400',
    disabledFontWeight: 'font-semibold',
    backgroundColor: 'bg-transparent',
    hoverBackgroundColor: 'hover:bg-gray-100',
    disabledBackgroundColor: 'bg-gray-50',
    iconColor: 'black',
    // No border. Actions are filled-primary, filled-secondary or
    // borderless-ghost; a border on a tap target is reserved for structural
    // separation (cards, rows, dividers), never for the target itself.
    border: ''
  }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = ButtonVariant.Primary,
    title = 'Button Title',
    iconRight,
    iconLeft,
    disabled,
    className,
    isLoading,
    children,
    ...props
  },
  ref
) {
  const variantProps = propsPerButtonVariant[variant];
  let color = variantProps.color;
  let fontWeight = variantProps.fontWeight;
  const fontSize = variantProps.fontSize;
  let backgroundColor = variantProps.backgroundColor;
  let hoverBackgroundColor = variantProps.hoverBackgroundColor;
  const iconColor = variantProps.iconColor;
  const border = variantProps.border;
  if (disabled) {
    backgroundColor = variantProps.disabledBackgroundColor;
    color = variantProps.disabledColor;
    fontWeight = variantProps.disabledFontWeight;
    hoverBackgroundColor = '';
  }

  const renderContent = () => {
    if (children) {
      return children;
    }

    return (
      <>
        {iconLeft && <span className="w-6">{<IconOrComponent icon={iconLeft} color={iconColor} />}</span>}
        {isLoading ? <Loader color={iconColor} /> : <span className={cn(color, fontWeight)}>{title}</span>}
        {iconRight && <span className="w-6">{<IconOrComponent icon={iconRight} color={iconColor} />}</span>}
      </>
    );
  };

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Deliberately does NOT blur(). It used to, which threw focus back to
    // <body> on every click -- so a keyboard user advancing through onboarding
    // lost their place on every step (SC 2.4.3). The blur was there to stop a
    // focus ring sticking after a touch tap; :focus-visible is the mechanism
    // for that, and it is applied on the element below, so the ring now shows
    // for keyboard users and not for touch.
    hapticLight();
    props.onClick?.(e);
  };
  const motionButtonProps = props as Omit<
    React.ComponentPropsWithoutRef<typeof motion.button>,
    'children' | 'className' | 'onClick'
  >;

  return (
    <motion.button
      ref={ref}
      className={cn(
        'flex justify-center items-center gap-x-2 font-heading',
        // Fixed design-system dimensions: 370px × 56px (override with w-full etc via className).
        'max-w-92.5 h-14 px-4 rounded-full w-full',
        'transition-colors duration-150 ease-hover',
        // Replaces the blur-on-click hack: a visible ring for keyboard focus,
        // nothing on touch or mouse.
        'outline-none focus-visible:ring-3 focus-visible:ring-accent/50',
        color,
        fontWeight,
        fontSize,
        backgroundColor,
        hoverBackgroundColor,
        border,
        isLoading && 'pointer-events-none',
        disabled ? 'cursor-default' : 'cursor-pointer',
        className
      )}
      disabled={disabled}
      type="button"
      whileTap={!disabled && !isLoading ? { scale: 0.95, transition: { duration: 0.03 } } : undefined}
      transition={{ type: 'spring', stiffness: 800, damping: 35 }}
      {...motionButtonProps}
      onClick={onClick}
    >
      {renderContent()}
    </motion.button>
  );
});
