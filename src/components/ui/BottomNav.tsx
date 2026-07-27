import React, { FC, ReactNode } from 'react';

import classNames from 'clsx';

export interface BottomNavItem {
  id: string;
  label: string;
  icon: ReactNode;
  iconActive?: ReactNode;
  /** Renders a small red notification dot on the icon (e.g. unclaimed notes). */
  showDot?: boolean;
}

export interface BottomNavProps {
  items: BottomNavItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const BottomNav: FC<BottomNavProps> = ({ items, activeId, onChange, className }) => {
  // Re-taps on the active tab are forwarded too: the owner decides whether
  // they navigate (e.g. Home tap on /send returns to Overview) and owns the
  // haptic so no-op taps don't buzz.
  const handleSelect = (id: string) => {
    onChange(id);
  };

  return (
    <nav
      className={classNames(
        'flex items-center gap-8 justify-center',
        'bg-white rounded-3xl px-13.5 py-2',
        // Elevation · raised (e1). The design system names this component in the
        // e1 bullet ("prompts, the floating bottom-nav pill — a whisper of
        // lift"), so this matches the SPEC, not the old look: the hand-rolled
        // pair was a 12px + 40px double drop closer to an overlay than a
        // whisper, and being a literal rgba it also could not step down in dark
        // mode, where the system communicates lift by surface step instead.
        'shadow-e1',
        className
      )}
    >
      {items.map(item => {
        const isActive = item.id === activeId;
        const iconNode = isActive && item.iconActive ? item.iconActive : item.icon;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => handleSelect(item.id)}
            className={classNames(
              'flex flex-col items-center justify-center gap-0.5 py-1.5 px-3',
              'transition-colors',
              isActive ? 'text-accent-primary' : 'text-text-primary-token'
            )}
          >
            <span className="relative flex items-center justify-center w-6 h-6">
              {iconNode}
              {item.showDot && (
                <span aria-hidden className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className={classNames('text-xs leading-none', isActive ? 'font-bold' : 'font-semibold')}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
