import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { openInFullPage, useAppEnv } from 'app/env';
import { ReactComponent as BreadLogo } from 'app/icons/brand/new-bread.svg';
import { Icon, IconName } from 'app/icons/v2';
import SimplePageLayout from 'app/layouts/SimplePageLayout';
import { Button, ButtonVariant } from 'components/Button';
import { Input } from 'components/Input';
import { Numpad } from 'components/Numpad';
import { ActionZone, GhostAction } from 'components/ui/ActionZone';
import { useFormAnalytics } from 'lib/analytics';
import { useLocalStorage, useMidenContext } from 'lib/miden/front';
import { MidenSharedStorageKey } from 'lib/miden/types';
import { isDesktop, isExtension, isMobile } from 'lib/platform';
import { navigate } from 'lib/woozie';

import { OnboardingHeading } from '../../screens/onboarding/common/layout';

const BrandIcon = () => (
  <div className="flex flex-col items-center gap-2">
    <BreadLogo style={{ width: 80, height: 'auto' }} />
    {/* eslint-disable-next-line i18next/no-literal-string -- brand wordmark, never translated */}
    <span className="text-3xl font-semibold font-heading text-heading-gray">Bread</span>
  </div>
);

const PASSCODE_LENGTH = 6;
const LOCK_TIME = 60_000;
const LAST_ATTEMPT = 3;

const checkTime = (i: number) => (i < 10 ? '0' + i : i);

const getTimeLeft = (start: number, end: number) => {
  const isPositiveTime = start + end - Date.now() < 0 ? 0 : start + end - Date.now();
  const diff = isPositiveTime / 1000;
  const seconds = Math.floor(diff % 60);
  const minutes = Math.floor(diff / 60);
  return `${checkTime(minutes)}:${checkTime(seconds)}`;
};

interface UnlockProps {
  openForgotPasswordInFullPage?: boolean;
}

const Unlock: FC<UnlockProps> = ({ openForgotPasswordInFullPage = false }) => {
  const { t } = useTranslation();
  const { unlock } = useMidenContext();
  const formAnalytics = useFormAnalytics('UnlockWallet');
  const { compact } = useAppEnv();

  const [attempt, setAttempt] = useLocalStorage<number>(MidenSharedStorageKey.PasswordAttempts, 1);
  const [timelock, setTimeLock] = useLocalStorage<number>(MidenSharedStorageKey.TimeLock, 0);
  const lockLevel = LOCK_TIME * Math.floor(attempt / 3);

  // HARDWARE UNLOCK STATE
  // Mobile & Desktop: tries hardware unlock (biometric/passcode) automatically
  // Fallback UI: passcode numpad on mobile, password form on extension/desktop
  const [hardwareUnlockAttempted, setHardwareUnlockAttempted] = useState(false);
  const [hardwareUnlockChecked, setHardwareUnlockChecked] = useState(false);
  // For hardware-only wallets (no password protector), show biometric-only UI
  const [isHardwareOnlyWallet, setIsHardwareOnlyWallet] = useState(false);
  // Screen 12 puts "Use Face ID" in the action zone. The automatic attempt on
  // mount is one shot — if the user cancels the system sheet there is no way
  // back to it, which made the numpad the only route on a device that has
  // biometrics set up. The label follows the hardware: only Face ID is called
  // Face ID.
  const [biometryType, setBiometryType] = useState<'face' | 'other' | null>(null);

  // Use ref to prevent double unlock attempts (React 18 Strict Mode runs effects twice)
  const unlockInProgressRef = useRef(false);

  // On mobile/desktop, try hardware unlock automatically on mount
  // Purely a question about the DEVICE — does it have biometrics we can offer
  // on the lock screen — so it stays out of the unlock path above. Folding it
  // in there ran it on the extension (no biometrics at all) and called
  // hasHardwareKey a second time on a path that had already answered it.
  useEffect(() => {
    if (!isMobile()) return;
    let cancelled = false;
    void (async () => {
      try {
        const { checkBiometricAvailability } = await import('lib/biometric');
        const availability = await checkBiometricAvailability();
        if (!cancelled && availability.isAvailable) {
          setBiometryType(availability.biometryType === 'face' ? 'face' : 'other');
        }
      } catch {
        // No biometrics here; the zone just holds the ghost link.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const tryHardwareUnlock = async () => {
      if (isExtension() || hardwareUnlockAttempted) {
        setHardwareUnlockChecked(true);
        return;
      }

      if (unlockInProgressRef.current) {
        console.log('[Unlock] Hardware unlock already in progress, skipping');
        return;
      }
      unlockInProgressRef.current = true;

      setHardwareUnlockAttempted(true);

      try {
        if (isDesktop()) {
          const { hasHardwareKey } = await import('lib/desktop/secure-storage');
          const hasKey = await hasHardwareKey();
          console.log('[Unlock] Desktop hardware key available:', hasKey);

          if (hasKey) {
            console.log('[Unlock] Attempting desktop hardware unlock (Touch ID)...');
            await unlock();
            setAttempt(1);
            navigate('/');
            return;
          }
        } else if (isMobile()) {
          const { hasHardwareKey } = await import('lib/biometric');
          const hasKey = await hasHardwareKey();
          console.log('[Unlock] Mobile hardware key available:', hasKey);

          if (hasKey) {
            console.log('[Unlock] Attempting mobile hardware unlock (biometric)...');
            await unlock();
            setAttempt(1);
            navigate('/');
            return;
          }
        }
      } catch (err) {
        console.log('[Unlock] Hardware unlock failed or cancelled:', err);
        try {
          const { Vault } = await import('lib/miden/back/vault');
          const hasPassword = await Vault.hasPasswordProtector();
          if (!hasPassword) {
            console.log('[Unlock] Hardware-only wallet detected, showing biometric UI');
            setIsHardwareOnlyWallet(true);
          }
        } catch (checkErr) {
          console.log('[Unlock] Failed to check password protector:', checkErr);
        }
      }

      setHardwareUnlockChecked(true);
    };

    tryHardwareUnlock();
  }, [hardwareUnlockAttempted, unlock, setAttempt]);

  const [timeleft, setTimeleft] = useState(getTimeLeft(timelock, lockLevel));

  const [code, setCode] = useState('');
  // Extension-only: the vault is protected by a full password, not a passcode.
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDisabled = useMemo(() => Date.now() - timelock <= lockLevel, [timelock, lockLevel]);

  const submitPasscode = useCallback(
    async (passcode: string) => {
      if (isSubmitting) return;
      setIsSubmitting(true);
      setIsError(false);
      formAnalytics.trackSubmit();

      try {
        if (attempt > LAST_ATTEMPT) await new Promise(res => setTimeout(res, Math.random() * 2000 + 1000));
        await unlock(passcode);

        formAnalytics.trackSubmitSuccess();
        setAttempt(1);

        // On mobile/desktop, don't reload - the backend state is already updated in-process.
        // On extension, reload to sync with background worker.
        if (!isExtension()) {
          navigate('/');
        } else {
          window.location.reload();
        }
      } catch (err) {
        formAnalytics.trackSubmitFail();
        if (attempt >= LAST_ATTEMPT) setTimeLock(Date.now());
        setAttempt(attempt + 1);
        setTimeleft(getTimeLeft(Date.now(), LOCK_TIME * Math.floor((attempt + 1) / 3)));

        console.error(err);

        await new Promise(res => setTimeout(res, 300));
        setIsError(true);
        setCode('');
        setIsSubmitting(false);
      }
    },
    [isSubmitting, unlock, formAnalytics, attempt, setAttempt, setTimeLock]
  );

  useEffect(() => {
    if (code.length === PASSCODE_LENGTH && !isSubmitting) {
      const timer = setTimeout(() => {
        submitPasscode(code);
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [code, isSubmitting, submitPasscode]);

  const handleDigit = useCallback(
    (digit: string) => {
      if (isDisabled || isSubmitting) return;
      if (isError) setIsError(false);
      setCode(prev => (prev.length >= PASSCODE_LENGTH ? prev : prev + digit));
    },
    [isDisabled, isSubmitting, isError]
  );

  const handleDelete = useCallback(() => {
    if (isDisabled || isSubmitting) return;
    if (isError) setIsError(false);
    setCode(prev => prev.slice(0, -1));
  }, [isDisabled, isSubmitting, isError]);

  const onForgotPasswordClick = useCallback(() => {
    if (openForgotPasswordInFullPage) {
      navigate('/forgot-password-info');
      openInFullPage();
      if (compact) {
        window.close();
      }
    } else {
      navigate('/forgot-password-info');
    }
  }, [openForgotPasswordInFullPage, compact]);

  const onPasswordSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!password || isDisabled || isSubmitting) return;
      submitPasscode(password);
    },
    [password, isDisabled, isSubmitting, submitPasscode]
  );

  const onPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isError) setIsError(false);
      setPassword(e.target.value);
    },
    [isError]
  );

  // Also backs "Use Face ID" on screen 12: the automatic attempt on mount is
  // one shot, so cancelling the system sheet used to leave the numpad as the
  // only route on a device that has biometrics set up. Same hardware path,
  // reached deliberately.
  const onRetryHardwareUnlock = useCallback(async () => {
    try {
      await unlock();
      setAttempt(1);
      navigate('/');
    } catch (err) {
      console.log('[Unlock] Hardware unlock retry failed:', err);
    }
  }, [unlock, setAttempt]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - timelock > lockLevel) {
        setTimeLock(0);
      }
      setTimeleft(getTimeLeft(timelock, lockLevel));
    }, 1_000);

    return () => {
      clearInterval(interval);
    };
  }, [timelock, lockLevel, setTimeLock]);

  // Wait for hardware unlock check to complete before showing passcode UI
  if (!hardwareUnlockChecked && !isExtension()) {
    return (
      <SimplePageLayout icon={<BrandIcon />}>
        <div className="flex items-center justify-center h-32" />
      </SimplePageLayout>
    );
  }

  // Hardware-only wallet (no password protector) — biometric retry UI
  if (isHardwareOnlyWallet) {
    return (
      <SimplePageLayout icon={<BrandIcon />}>
        <div className="w-full max-w-sm mx-auto my-8" style={{ padding: '0px 32px' }}>
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">{t('biometricUnlockRequired')}</h2>
            <p className="text-text-muted text-sm">{t('biometricUnlockRequiredDescription')}</p>
          </div>
          <Button
            id="retry-biometric"
            title={t('tryAgain')}
            variant={ButtonVariant.Primary}
            onClick={onRetryHardwareUnlock}
            className="w-full justify-center mb-3"
            style={{ fontSize: '16px', lineHeight: '24px', padding: '12px 0px' }}
          />
          <Button
            id="reset-wallet"
            title={t('resetWallet')}
            variant={ButtonVariant.Ghost}
            onClick={onForgotPasswordClick}
            className="w-full justify-center"
            style={{ fontSize: '16px', lineHeight: '24px', padding: '12px 0px' }}
          />
        </div>
      </SimplePageLayout>
    );
  }

  // Extension/desktop wallets are protected by a full password (set during
  // onboarding — passcodes are mobile-only), so unlock is a password form:
  // the 6-digit numpad can't type one.
  if (!isMobile()) {
    const passwordSubtitle = isDisabled
      ? `${t('unlockPasswordErrorDelay')} ${timeleft}`
      : isError
        ? t('incorrectPassword')
        : null;

    return (
      <div className="bg-app-bg h-full overflow-y-auto" data-testid="unlock-password">
        <div className="min-h-full flex flex-col items-center px-6 pb-8">
          <div className="flex flex-col items-center w-full mt-10 shrink-0">
            <BrandIcon />
            <h1 className="text-3xl font-semibold font-heading text-heading-gray text-center leading-[100%] tracking-tight mt-8">
              {t('enterYourPassword')}
            </h1>
            <p className={`h-6 text-base text-center mt-3 ${passwordSubtitle ? 'text-red-500' : ''}`}>
              {passwordSubtitle}
            </p>
          </div>

          <form className="w-full flex flex-col gap-6 mt-4" onSubmit={onPasswordSubmit}>
            <Input
              id="unlock-password"
              type={isPasswordVisible ? 'text' : 'password'}
              label={t('password')}
              value={password}
              placeholder={t('enterPassword')}
              autoFocus
              disabled={isDisabled}
              icon={
                <button type="button" className="flex-1" onClick={() => setIsPasswordVisible(prev => !prev)}>
                  <Icon name={isPasswordVisible ? IconName.EyeOff : IconName.Eye} fill="currentColor" />
                </button>
              }
              onChange={onPasswordChange}
            />
            <Button
              type="submit"
              title={t('unlock')}
              isLoading={isSubmitting}
              disabled={!password || isDisabled || isSubmitting}
            />
          </form>

          <button
            id="forgot-password"
            type="button"
            onClick={onForgotPasswordClick}
            className="mt-6 text-heading-gray text-base font-medium"
          >
            {t('forgotPassword')}
          </button>
        </div>
      </div>
    );
  }

  // Screen 12 draws NO idle subcopy — the six dots say how many digits are
  // wanted, so "Enter your 6-digit code" was the caption restating the control
  // beneath it. What survives is the error line, which the mock has no state
  // for but the screen genuinely needs.
  const errorMessage = isDisabled
    ? `${t('unlockPasswordErrorDelay')} ${timeleft}`
    : isError
      ? t('incorrectPasscode')
      : null;

  return (
    <div
      // `pt-4` is the gap under the status bar, and it is measured rather than
      // picked: the mock puts the logo 73.7pt from the frame top — a 65.2pt
      // `.stat` row (which carries 8px of its own bottom padding) plus
      // `.mpad`'s 8px. On device `env(safe-area-inset-top)` covers 59pt of that
      // via <body>, so the remaining ~15pt has to come from here. Without it
      // the logo sat flush against the Dynamic Island.
      className="bg-app-bg h-full flex flex-col px-4 min-[360px]:px-6 pt-4 mx-auto w-full max-w-125"
      data-testid="unlock-passcode"
    >
      {/* `justify-end` — the pad is the anchor. The system pins it to the
          bottom of the content zone and lets the logo, heading and dots ride
          above it, so the keys land under the thumb on every height instead of
          the whole stack floating from the top. */}
      <div className="flex-1 min-h-0 flex flex-col justify-end items-center w-full">
        <BreadLogo className="w-13 h-auto shrink-0" />

        {/* `.obh` at its own 0.75rem, not the 1rem it carries in onboarding —
            this screen has no step chrome above it. */}
        <OnboardingHeading className="mt-3">{t('enterYourPasscode')}</OnboardingHeading>

        {errorMessage && (
          <p className="mt-2 text-label font-bold text-neg text-center" role="alert">
            {errorMessage}
          </p>
        )}

        {/* `.dots` — 0.75rem circles on --surface-3; a filled one takes --accent
            AND scales 1.12, so the fill is confirmed by a size change and not by
            colour alone (SC 1.4.1). They were #C7C7CC hardcoded, identical in
            both themes and in both states bar the fill. */}
        <div className="flex items-center justify-center gap-2.75 mt-5 mb-5.5">
          {Array.from({ length: PASSCODE_LENGTH }).map((_, index) => (
            <div
              key={index}
              className={classNames(
                'size-3 rounded-full transition-[background-color,transform] duration-[var(--dur-base)]',
                'motion-reduce:transition-none',
                index < code.length ? 'bg-accent scale-[1.12]' : 'bg-surface-3'
              )}
            />
          ))}
        </div>

        {/* `.pad.pinned` — margin-top:auto plus the home-indicator inset. */}
        <Numpad
          onDigit={handleDigit}
          onDelete={handleDelete}
          className="mt-auto pb-[max(1rem,var(--safe-bottom,0px))]"
        />
      </div>

      <ActionZone>
        {biometryType && (
          <Button
            title={biometryType === 'face' ? t('useFaceId') : t('useFaceIdOrBiometric')}
            variant={ButtonVariant.Secondary}
            onClick={onRetryHardwareUnlock}
          />
        )}
        <GhostAction id="forgot-password" title={t('forgotPasscode')} onClick={onForgotPasswordClick} />
      </ActionZone>
    </div>
  );
};

export default Unlock;
