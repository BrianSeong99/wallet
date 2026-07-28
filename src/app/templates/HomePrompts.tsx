import React, { FC, useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useUnclaimedNotesCount } from 'app/hooks/useHasUnclaimedNotes';
import { ActivateHotKeyBanner } from 'app/templates/ActivateHotKeyBanner';
import { GuardianNeedsUrlBanner } from 'app/templates/GuardianNeedsUrlBanner';
import { useConnectivityIssue } from 'components/ConnectivityIssueBanner';
import { PromptCard, PromptCarousel, PromptCardVariant } from 'components/ui';
import { WalletAccount } from 'lib/shared/types';
import { useWalletPromptStorage, WalletPromptType } from 'lib/wallet-prompts';
import { navigate } from 'lib/woozie';

type WalletPromptDefinition = {
  titleKey: string;
  bodyKey: string;
  route: string;
  variant?: PromptCardVariant;
  dismissible: boolean;
};

const WALLET_PROMPT_DEFINITIONS: Record<WalletPromptType, WalletPromptDefinition> = {
  [WalletPromptType.VerifySeedPhrase]: {
    titleKey: 'verifySeedPhrasePromptTitle',
    bodyKey: 'verifySeedPhrasePromptBody',
    route: '/settings/verify-seed-phrase',
    variant: 'warning',
    dismissible: true
  }
};

interface HomePromptsProps {
  account: WalletAccount;
}

export const HomePrompts: FC<HomePromptsProps> = ({ account }) => {
  const { t } = useTranslation();
  const { dismissPrompt, isPromptPending } = useWalletPromptStorage();
  const { view: connectivityView, onRetry, onDismiss } = useConnectivityIssue();
  const unclaimedNotesCount = useUnclaimedNotesCount();

  const pendingWalletPrompts = useMemo(
    () =>
      Object.entries(WALLET_PROMPT_DEFINITIONS).filter(([type]) => isPromptPending(type as WalletPromptType)) as Array<
        [WalletPromptType, WalletPromptDefinition]
      >,
    [isPromptPending]
  );

  return (
    <PromptCarousel>
      {/* Connectivity leads the carousel. It is the only prompt that describes
          the state of the number directly above it, so it outranks prompts
          about things the user could do at any later time.
          `pickActiveCategory` already guarantees at most one is active. */}
      {connectivityView && (
        <PromptCard
          key={`connectivity-${connectivityView.category}`}
          title={t(connectivityView.titleKey)}
          body={t(connectivityView.bodyKey)}
          variant="warning"
          ctaLabel={connectivityView.ctaKey ? t(connectivityView.ctaKey) : undefined}
          onCta={connectivityView.ctaKey ? onRetry : undefined}
          onDismiss={onDismiss}
        />
      )}
      {/* Unclaimed notes. The money is real, it is addressed to this account,
          and it is NOT in the balance above — so the prompt states both halves.
          "Claim" routes to Activity, which is where the claim actually lives;
          "you have notes" without "here is how to get them" is a dead end. */}
      {unclaimedNotesCount > 0 && (
        <PromptCard
          key="unclaimed-notes"
          title={t('unclaimedNotesTitle', { notes: String(unclaimedNotesCount) })}
          body={t('unclaimedNotesBody')}
          ctaLabel={t('claim')}
          onCta={() => navigate('/history')}
          onClick={() => navigate('/history')}
        />
      )}
      {pendingWalletPrompts.map(([type, definition]) => (
        <PromptCard
          key={type}
          title={t(definition.titleKey)}
          body={t(definition.bodyKey)}
          variant={definition.variant}
          onClick={() => navigate(definition.route)}
          onDismiss={definition.dismissible ? () => dismissPrompt(type) : undefined}
        />
      ))}
      {account.requiresHotKeyRotation && <ActivateHotKeyBanner />}
      {account.guardianSyncStatus === 'needs-user-input' && <GuardianNeedsUrlBanner />}
    </PromptCarousel>
  );
};

export default HomePrompts;
