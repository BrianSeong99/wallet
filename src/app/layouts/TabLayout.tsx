import React, { FC, useEffect, useRef } from 'react';

import classNames from 'clsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useAppEnv } from 'app/env';
import { useHasUnclaimedNotes } from 'app/hooks/useHasUnclaimedNotes';
import { Icon, IconName } from 'app/icons/v2';
import HomeSwipeContainer from 'app/layouts/HomeSwipeContainer';
import { BottomNav, SegmentedActionBar } from 'components/ui';
import { iosPush, pushVariants } from 'lib/animation';
import { isEarnEnabled, isSwapEnabled } from 'lib/feature-flags';
import { hapticSelection } from 'lib/mobile/haptics';
import { isReturningFromWebview } from 'lib/mobile/webview-state';
import { isDesktop, isExtension, isMobile } from 'lib/platform';
import { PropsWithChildren } from 'lib/props-with-children';
import { navigate, useLocation } from 'lib/woozie';

/**
 * Layout for tab-based pages (Home, History, Settings, Browser).
 * Provides a persistent footer and animated content area.
 *
 * The top action bar is mounted when the route is in the "home"
 * tab group (/, /send, /receive, /earn, /swap) so it stays visible across
 * Overview ↔ Send ↔ Receive ↔ Earn ↔ Swap transitions. Other tabs (Explore,
 * Activity) hide it.
 */
const TAB_ROUTES: Record<string, string> = {
  home: '/',
  explore: '/browser',
  activity: '/history'
};

const ACTION_ROUTES: Record<string, string> = {
  overview: '/',
  send: '/send',
  receive: '/receive',
  earn: '/earn',
  swap: '/swap'
};

const HOME_GROUP_ROUTES = new Set(['/', '/send', '/receive', '/earn', '/swap']);

function activeTabFromPath(pathname: string): string {
  const segment = pathname.split('/')[1] ?? '';
  if (segment === 'browser') return 'explore';
  if (segment === 'history' || segment === 'activity-details') return 'activity';
  return 'home';
}

function activeActionFromPath(pathname: string): string {
  if (pathname === '/send') return 'send';
  if (pathname === '/receive') return 'receive';
  if (pathname === '/earn') return 'earn';
  if (pathname === '/swap') return 'swap';
  return 'overview';
}

const TabLayout: FC<PropsWithChildren> = ({ children }) => {
  const { fullPage, sidePanel } = useAppEnv();
  const reduceMotion = useReducedMotion();
  const { pathname } = useLocation();
  const hasUnclaimedNotes = useHasUnclaimedNotes();
  const prevPathnameRef = useRef<string | null>(null);

  // During render `prevPathnameRef.current` still holds the previous path
  // (the effect below updates it AFTER commit). That's exactly what we need
  // to decide whether the incoming page should slide in.
  const prevPathname = prevPathnameRef.current;
  const skipSlideIn =
    isExtension() ||
    (isMobile() && isReturningFromWebview()) ||
    (prevPathname !== null && HOME_GROUP_ROUTES.has(prevPathname) && HOME_GROUP_ROUTES.has(pathname));

  useEffect(() => {
    prevPathnameRef.current = pathname;
  }, [pathname]);

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: <Icon name={IconName.Home} className="w-6 h-6" fill="currentColor" />
    },
    // Explore tab is a dApp browser surface — extension popup has no use
    // for it (browser-the-product is already the host), so drop it there.
    ...(isExtension()
      ? []
      : [
          {
            id: 'explore',
            label: 'Explore',
            icon: <Icon name={IconName.Explore} className="w-6 h-6" />
          }
        ]),
    {
      id: 'activity',
      label: 'Activity',
      icon: <Icon name={IconName.Activity} className="w-6 h-6" />,
      showDot: hasUnclaimedNotes
    }
  ];

  // Action identity: each glyph keeps its OWN hue, but the hue now comes from a
  // theme-flipping --act-* token instead of a hex baked into the SVG. The SVGs are
  // currentColor, so the tint is applied here, per action — the app equivalent of
  // the design system's `data-act` attribute. Light values are darkened from the
  // shipped pastels: a collapsed segment is icon-only with no label, so SC 1.4.11's
  // 3:1 applies and the pastels measured 2.37-2.42:1 on the chip. Dark keeps the
  // pastels. Overview deliberately has no tint — wallet.svg follows the ink.
  const actionItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Icon name={IconName.Wallet} className="w-5 h-5 text-heading-gray" />
    },
    {
      id: 'send',
      label: 'Send',
      icon: <Icon name={IconName.Send} className="w-5 h-5 text-act-send" />
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: <Icon name={IconName.Receive} className="w-5 h-5 text-act-receive" />
    },
    // Earn and Swap segments are feature-gated (isEarnEnabled / isSwapEnabled).
    ...(isEarnEnabled()
      ? [
          {
            id: 'earn',
            label: 'Earn',
            icon: <Icon name={IconName.Earn} className="w-5 h-5 text-act-earn" />
          }
        ]
      : []),
    ...(isSwapEnabled()
      ? [
          {
            id: 'swap',
            label: 'Swap',
            icon: <Icon name={IconName.Convert} className="w-5 h-5 text-act-swap" />
          }
        ]
      : [])
  ];

  const activeTab = activeTabFromPath(pathname);
  const activeAction = activeActionFromPath(pathname);
  const showActionBar = HOME_GROUP_ROUTES.has(pathname);

  // Fires for re-taps on the active tab too (BottomNav forwards them), so a
  // Home tap from /send, /receive, etc. returns to Overview; a tap on the
  // route we're already on stays a silent no-op.
  const handleTabChange = (id: string) => {
    const to = TAB_ROUTES[id];
    if (to && to !== pathname) {
      hapticSelection();
      navigate(to);
    }
  };

  // SegmentedActionBar already no-ops re-taps on the active segment and
  // fires the selection haptic itself.
  const handleActionChange = (id: string) => {
    const to = ACTION_ROUTES[id];
    if (to && to !== pathname) navigate(to);
  };

  // Platform-specific sizing:
  // - Mobile: 100% to inherit from parent chain (body has safe area padding)
  // - Desktop: Responsive with max-width for comfortable reading
  // - Extension: Fixed sizes for popup/fullpage modes
  const containerStyles = isMobile()
    ? { height: '100%', width: '100%' }
    : isDesktop()
      ? { height: '100%', width: '100%', maxWidth: '600px' }
      : sidePanel
        ? { height: '100%', width: '100%' }
        : fullPage
          ? { height: '640px', width: '600px' }
          : { height: '600px', width: '360px' };

  return (
    <div
      // Mobile clips horizontally only (`clip` keeps overflow-y visible) so
      // the BottomNav shadow can fade into the body's safe-area padding
      // strip below the container; fixed-size extension/desktop frames keep
      // full overflow-hidden.
      className={classNames(
        'relative m-auto bg-app-bg flex flex-col',
        isMobile() ? 'overflow-x-clip' : 'overflow-hidden'
      )}
      style={containerStyles}
    >
      {/* Top action bar — sits outside the animated content tree so it stays
          fixed across intra-home-group navigations.

          Its PRESENCE is animated, and that is the fix for the glitch on
          Home -> Explore/Activity. The bar exists only on home-group routes, so
          leaving it a bare `&&` meant it popped out of flow the instant the
          route changed: measured, the content layer jumped 60px up and grew
          60px in a single frame, while the page underneath was still sliding.
          Two unrelated motions at once, one of them instantaneous, is what read
          as "glitchy".

          Collapsing the height on the SAME curve as the page makes it one
          coordinated movement instead. `overflow-hidden` stops the bar spilling
          while its box is shorter than its content, and reduced motion skips
          straight to the end state rather than animating a height.

          `px-4` is the gutter the bar was missing entirely: it ran edge to edge,
          touching both bezels, where the design system insets it 16px from the
          frame (`.mpad` is `8px 16px 0`). The gutter lives on this container, so
          the bar keeps no opinion about its own outer spacing. */}
      <AnimatePresence initial={false}>
        {showActionBar && (
          <motion.div
            key="action-bar"
            className="shrink-0 relative z-10 overflow-hidden"
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={iosPush}
          >
            <div className="px-4 pt-2">
              <SegmentedActionBar items={actionItems} activeId={activeAction} onChange={handleActionChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated content. For home-group routes we mount the
          HomeSwipeContainer once (a five-page horizontal carousel) and let it
          drive intra-group transitions via drag — pathname is just the
          source of truth for which page is centered. For other routes
          (Browser, Activity, etc.) we still slide each new page in via
          framer. The motion.div is keyed by group so the carousel doesn't
          remount when only the centered page changes. */}
      <div className="flex-1 min-h-0 relative">
        {/* Apple's iOS parallax push, the design system's single page
            transition — the same one onboarding uses, so a nav-bar change and
            an onboarding step now move identically.

            What was here was a bare spring on `x: 8%` with NO exit animation:
            the outgoing page unmounted instantly while the incoming one sprang
            in from 8%. With only one layer ever on stage there is no parallax,
            and because `springs.standard` overshoots, the incoming page settled
            with a small wobble against a background that had already changed —
            which is the subtle movement that reads as a glitch rather than as
            a transition.

            `AnimatePresence` in its default (sync) mode is what puts both pages
            on stage at once; `mode="wait"` would serialise them and `popLayout`
            would strip `flex-1` off the exiting one. Both layers are already
            `absolute inset-0`, so they overlap at full size. */}
        <AnimatePresence initial={false}>
          <motion.div
            key={showActionBar ? 'home-group' : pathname}
            // flex column so non-home children (AllHistory, Browser) that use
            // `flex-1 min-h-0 overflow-y-auto` for their scroll region can
            // actually claim the remaining height. Without this their list
            // collapses to 0 and transactions appear missing.
            className="absolute inset-0 overflow-hidden flex flex-col"
            // Stable hook: the action bar above is also a motion.div now, so
            // "the page layer" needs to be addressable by something other than
            // its position in the DOM.
            data-testid="page-layer"
            initial={skipSlideIn ? false : 'initialState'}
            animate="animateState"
            exit="exitState"
            variants={pushVariants({ direction: 'forward', reduceMotion })}
            transition={iosPush}
          >
            {showActionBar ? <HomeSwipeContainer /> : children}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating bottom nav — overlays content. The data attribute lets
          the dApp bubble host measure footer height for corner snap math.
          Forced `display:flex !important` + `z-[60]` guard against legacy
          CSS or stale compiled bundles that try to hide `[data-tabbar-footer]`
          or stack a higher z-index over it. */}
      <div
        className="absolute bottom-0 left-0 right-0 z-60 pointer-events-none"
        data-tabbar-footer="true"
        style={{ display: 'flex' }}
      >
        {/* Mobile: the body's safe-area padding (max(16px, env(...)) in
            mobile.html) already keeps the pill off the screen edge. */}
        {/* `min-w-0` lets this flex child shrink to the footer width instead of
            ballooning to the pill's min-content (the nav's wide `px-13.5` padding
            makes its min-content ~367px, which otherwise pushed the flex item to
            399px and overflowed the right edge by ~8px on a 375px-wide viewport).
            `justify-center` then centers the pill within the row. */}
        <div
          className={classNames('pointer-events-auto flex-1 min-w-0 px-4 flex justify-center', !isMobile() && 'pb-2')}
        >
          <BottomNav items={tabs} activeId={activeTab} onChange={handleTabChange} />
        </div>
      </div>
    </div>
  );
};

export default TabLayout;
