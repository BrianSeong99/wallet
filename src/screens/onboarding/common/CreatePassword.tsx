import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import classNames from 'clsx';
import { useTranslation } from 'react-i18next';

import { MIN_PASSWORD_LENGTH, PRIVACY_POLICY_URL, STRONG_PASSWORD_LENGTH, TERMS_OF_USE_URL } from 'app/constants';
import { Icon, IconName } from 'app/icons/v2';
import { Button } from 'components/Button';
import { Input } from 'components/Input';
import { ActionZone } from 'components/ui/ActionZone';

export interface PasswordValidation {
  minChar: boolean;
  cases: boolean;
  number: boolean;
  specialChar: boolean;
  strongPasswordLength?: boolean;
}

const uppercaseLowercaseMixtureRegx = /(?=.*[a-z])(?=.*[A-Z])/;
const lettersNumbersMixtureRegx = /(?=.*\d)(?=.*[A-Za-z])/;
const specialCharacterRegx = /[!@#$%^&*()_+\-=\]{};':"\\|,.<>?]/;

export interface CreatePasswordScreenProps extends Omit<React.ButtonHTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (password: string) => void;
}

export const PasswordStrengthIndicator = ({
  password,
  validation
}: {
  password: string;
  validation: PasswordValidation;
}) => {
  const { t } = useTranslation();
  const validationChecks = useMemo(() => Object.values(validation).filter(Boolean).length, [validation]);
  const validationMessage = useMemo(() => {
    if (validationChecks === 5) {
      return t('veryStrong');
    }
    if (validationChecks >= 3) {
      return t('medium');
    }

    if (validationChecks === 2) {
      return t('low');
    }

    return t('8chars1number');
  }, [validationChecks, t]);
  // Four tiers, four DISTINCT tokens. `pos`/`warn`/`neg` are the status set;
  // amber is `--warn`, deliberately not `--pend`, because on dark `--accent`,
  // `--pend` and `--neg` all sit at the same hue and lightness, so "low" and
  // "medium" rendered identically and both read as brand colour. The unfilled
  // segment is `--surface-3` rather than a fixed grey so it flips with theme.
  const validationColor = useMemo(() => {
    if (validationChecks === 5) {
      return 'bg-pos';
    }
    if (validationChecks >= 3) {
      return 'bg-warn';
    }

    if (validationChecks === 2) {
      return 'bg-neg';
    }

    return 'bg-surface-3';
  }, [validationChecks]);

  // TODO: show strength indicator if password is more than 0 characters
  return (
    <div className="h-4">
      {password.length > 0 ? (
        <div className="flex flex-row justify-between items-center gap-stack">
          {/* `.opwbar` — the meter spans the field it measures, so the segments
              share the width instead of being three fixed 40px stubs floated
              left of a lot of dead space. */}
          <div className="flex flex-1 flex-row gap-1">
            {[2, 3, 5].map(check => (
              <div
                key={`check-${check}`}
                className={`h-1 flex-1 rounded-full ${validationChecks >= check ? validationColor : 'bg-surface-3'}`}
              />
            ))}
          </div>
          {/* The tier is spelled out in words as well as colour, so the meter
              still reads without hue (SC 1.4.1). */}
          <p className="text-caption font-bold text-ink-2 shrink-0">{validationMessage}</p>
        </div>
      ) : (
        <p className="text-caption text-ink-2">{t('minimumCharsWithAtLeast')}</p>
      )}
    </div>
  );
};

export const CreatePasswordScreen: React.FC<CreatePasswordScreenProps> = ({ className, onSubmit, ...props }) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isVerifyPasswordVisible, setIsVerifyPasswordVisible] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minChar: false,
    cases: false,
    number: false,
    specialChar: false,
    strongPasswordLength: false
  });
  const verifyPasswordRef = useRef<HTMLInputElement>(null);

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  useEffect(() => {
    setPasswordValidation({
      minChar: password.length >= MIN_PASSWORD_LENGTH,
      cases: uppercaseLowercaseMixtureRegx.test(password),
      number: lettersNumbersMixtureRegx.test(password),
      specialChar: specialCharacterRegx.test(password),
      strongPasswordLength: password.length >= STRONG_PASSWORD_LENGTH
    });
  }, [password]);

  const isValidPassword = useMemo(
    () => Object.values(passwordValidation).filter(Boolean).length > 1 && password === verifyPassword,
    [passwordValidation, password, verifyPassword]
  );

  const handleTabKey = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      verifyPasswordRef.current?.focus();
    }
  }, []);

  const onPasswordSubmit = useCallback(() => {
    if (isValidPassword && onSubmit) {
      onSubmit(password);
    }
  }, [isValidPassword, onSubmit, password]);

  const onPasswordVisibilityToggle = useCallback(() => {
    setIsPasswordVisible(prev => !prev);
  }, []);

  const onVerifyPasswordVisibilityToggle = useCallback(() => {
    setIsVerifyPasswordVisible(prev => !prev);
  }, []);

  const handleEnterKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (isValidPassword && onSubmit) {
          onPasswordSubmit();
        }
      }
    },
    [isValidPassword, onPasswordSubmit, onSubmit]
  );

  return (
    <div
      // 24px gutter, not 16 — this is a page, and the design system has exactly
      // one page gutter.
      className={classNames('flex flex-col flex-1', 'bg-app-bg gap-stack-loose px-6 pt-8 text-ink', className)}
      {...props}
    >
      {/* `.obh` / `.obp`, left-aligned as on `06b`. Hand-rolled rather than
          `OnboardingHeading`, which bakes in `text-center` and composes with
          clsx, so a `text-left` override would not reliably win. */}
      <div className="flex flex-col gap-stack-tight">
        <h1 className="font-heading font-black text-title leading-[1.12] text-ink">{t('createPassword')}</h1>
        <p className="text-label leading-[1.45] text-ink-2">{t('createPasswordDescription')}</p>
      </div>

      <article className="w-full justify-center items-center flex flex-col gap-stack-loose">
        <div className="flex flex-col gap-stack-tight w-full">
          <Input
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('password')}
            value={password}
            placeholder={t('enterPassword')}
            icon={
              <button className="flex-1" onClick={onPasswordVisibilityToggle}>
                <Icon name={isPasswordVisible ? IconName.EyeOff : IconName.Eye} fill="currentColor" />
              </button>
            }
            onChange={onPasswordChange}
            onKeyDown={handleTabKey}
          />
          <PasswordStrengthIndicator password={password} validation={passwordValidation} />
        </div>

        <div className="flex flex-col gap-stack-tight w-full">
          <Input
            ref={verifyPasswordRef}
            type={isVerifyPasswordVisible ? 'text' : 'password'}
            label={t('verifyPassword')}
            value={verifyPassword}
            placeholder={t('enterPasswordAgain')}
            icon={
              <button className="flex-1" onClick={onVerifyPasswordVisibilityToggle}>
                <Icon name={isVerifyPasswordVisible ? IconName.EyeOff : IconName.Eye} fill="currentColor" />
              </button>
            }
            onChange={e => setVerifyPassword(e.target.value)}
            onKeyDown={handleEnterKey}
          />
          {/* `.fok` / `.ferr`: settled validation only. There is deliberately no
              error ring on the field while it is being typed — incomplete is
              not invalid. */}
          <p
            className={classNames(
              'h-4 text-caption font-bold leading-[1.45] text-pos',
              isValidPassword && password === verifyPassword ? 'block' : 'hidden'
            )}
          >
            {t('itsAMatch')}
          </p>
          <p
            className={classNames(
              'h-4 text-caption font-bold leading-[1.45] text-neg',
              verifyPassword.length >= password.length && password !== verifyPassword ? 'block' : 'hidden'
            )}
          >
            {t('passwordsDoNotMatch')}
          </p>
        </div>
      </article>
      <ActionZone>
        <p className="w-full text-caption leading-[1.45] text-ink-2 text-center">
          {t('byProceeding')}{' '}
          <a target="_blank" href={TERMS_OF_USE_URL} className="underline" rel="noreferrer">
            {t('termsOfUsage')}
          </a>{' '}
          {t('andWord')}{' '}
          <a target="_blank" href={PRIVACY_POLICY_URL} className="underline" rel="noreferrer">
            {t('privacyPolicy')}
          </a>
          .
        </p>
        <Button title={t('continue')} disabled={!isValidPassword} onClick={onPasswordSubmit} />
      </ActionZone>
    </div>
  );
};
