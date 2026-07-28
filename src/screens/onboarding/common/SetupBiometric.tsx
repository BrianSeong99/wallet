import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ReactComponent as FaceIcon } from 'app/icons/onboarding/face.svg';
import { ReactComponent as FingerprintIcon } from 'app/icons/onboarding/fingerprint.svg';
import { Icon, IconName } from 'app/icons/v2';
import { Button, ButtonVariant } from 'components/Button';
import { ActionZone } from 'components/ui/ActionZone';
import { authenticate, checkBiometricAvailability } from 'lib/biometric';
import { hapticLight } from 'lib/mobile/haptics';
import { isIOS, isMobile } from 'lib/platform';
import { cn } from 'lib/ui/util';

import { OnboardingBody, OnboardingHeading, OnboardingScreen, OnboardingSubcopy } from './layout';

type Phase = 'prompt' | 'success';

export interface SetupBiometricScreenProps {
  onSwitchToPasscode?: () => void;
  onContinue?: () => void;
}

type FrameColor = 'primary' | 'positive';

/**
 * Corner placement + rotation for the four brackets, in visual order
 * (top-left, top-right, bottom-right, bottom-left). This was four inline style
 * objects computing `top`/`left`/`transform` from a numeric `rotate` prop and
 * sizing the frame at a hardcoded 224×56px; as utilities the whole frame scales
 * with the user's text size like every other illustration on the flow.
 */
const BRACKET_CORNERS = [
  'top-0 left-0',
  'top-0 right-0 rotate-90',
  'bottom-0 right-0 rotate-180',
  'bottom-0 left-0 -rotate-90'
] as const;

/**
 * The scan frame is this step's illustration, so it sits at `--hero-w` — the
 * same optical scale as the `OnboardingHero` artwork on every neighbouring
 * step, instead of the 224px that made it the largest element in onboarding.
 *
 * Colour is never the sole carrier of the state change (SC 1.4.1): the brackets
 * go accent → positive at the same moment the glyph swaps to a tick and the
 * headline changes word.
 */
const ScanFrame: React.FC<{ color: FrameColor; children: React.ReactNode }> = ({ color, children }) => {
  const stroke = color === 'primary' ? 'text-accent' : 'text-pos';

  return (
    <div className="relative flex size-35 shrink-0 items-center justify-center">
      {BRACKET_CORNERS.map(corner => (
        // Quarter-circle "L" bracket, rotated to land at each corner.
        <svg key={corner} className={cn('absolute size-8', stroke, corner)} viewBox="0 0 56 56" fill="none">
          <path d="M4 54V20C4 11.1634 11.1634 4 20 4H54" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
        </svg>
      ))}
      {children}
    </div>
  );
};

export const SetupBiometricScreen: React.FC<SetupBiometricScreenProps> = ({ onSwitchToPasscode, onContinue }) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>('prompt');
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const isFaceId = isIOS();
  const InnerIcon = isFaceId ? FaceIcon : FingerprintIcon;
  const promptTitle = isFaceId ? t('faceIdSetUp') : t('biometricSetUp');

  const tryAuthenticate = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setError(null);
    try {
      // Non-mobile (extension/desktop) can't trigger the Capacitor biometric
      // plugin — surface a switch-to-passcode prompt instead.
      if (!isMobile()) {
        setError(t('biometricUnavailable'));
        return;
      }
      const availability = await checkBiometricAvailability();
      if (!availability.isAvailable) {
        setError(t('biometricUnavailable'));
        return;
      }
      const ok = await authenticate(t('biometricSetupReason'));
      if (ok) {
        setPhase('success');
      } else {
        setError(t('biometricFailed'));
      }
    } finally {
      inFlightRef.current = false;
    }
  }, [t]);

  // Trigger the OS prompt as soon as the user lands on this screen.
  // Phase change to 'success' re-runs the effect but the guard inside the
  // callback (inFlightRef) plus the conditional below keeps it idempotent.
  useEffect(() => {
    if (phase === 'prompt') {
      void tryAuthenticate();
    }
  }, [phase, tryAuthenticate]);

  const handleRetry = () => {
    hapticLight();
    void tryAuthenticate();
  };

  return (
    <OnboardingScreen testId="onboarding-setup-biometric">
      <OnboardingBody className="gap-stack-loose">
        {phase === 'prompt' ? (
          <>
            <button
              type="button"
              aria-label={promptTitle}
              onClick={handleRetry}
              // `outline-none` alone left keyboard users with no focus
              // indicator on the one control that re-triggers the OS prompt.
              className="outline-none focus-visible:ring-3 focus-visible:ring-accent/50 rounded-lg-token"
            >
              <ScanFrame color="primary">
                <InnerIcon className="size-14 text-ink" />
              </ScanFrame>
            </button>
            <OnboardingHeading>{promptTitle}</OnboardingHeading>
            {/* `.ferr` — the field-level error treatment: 11px/700 in `--neg`,
                never a banner. */}
            {error && <p className="text-caption font-bold leading-[1.45] text-neg text-center">{error}</p>}
          </>
        ) : (
          <>
            <ScanFrame color="positive">
              {/* `--paper` rather than `pure-white`: on dark the positive token
                  is a light green, and white-on-it is unreadable. */}
              <div className="size-14 rounded-full bg-pos flex items-center justify-center">
                <Icon name={IconName.Checkmark} size="lg" fill="currentColor" className="text-paper" />
              </div>
            </ScanFrame>
            <OnboardingHeading>{t('biometricConfirmed')}</OnboardingHeading>
            <OnboardingSubcopy>{t('onlyOneMoreStep')}</OnboardingSubcopy>
          </>
        )}
      </OnboardingBody>

      <ActionZone>
        {phase === 'prompt' ? (
          <Button title={t('usePasscodeInstead')} variant={ButtonVariant.Secondary} onClick={onSwitchToPasscode} />
        ) : (
          <Button title={t('continue')} onClick={onContinue} />
        )}
      </ActionZone>
    </OnboardingScreen>
  );
};

export default SetupBiometricScreen;
