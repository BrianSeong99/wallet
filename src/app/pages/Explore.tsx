import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { useTranslation } from 'react-i18next';

import useMidenFaucetId from 'app/hooks/useMidenFaucetId';
import Balance from 'app/templates/Balance';
import HomePrompts from 'app/templates/HomePrompts';
import { AssetRow } from 'components/AssetRow';
import { useConnectivityIssue } from 'components/ConnectivityIssueBanner';
import { AccountsDrawer, BalanceCard } from 'components/ui';
import { toLocalFormat } from 'lib/i18n/numbers';
import {
  initiateConsumeTransaction,
  requestSWTransactionProcessing,
  startBackgroundTransactionProcessing
} from 'lib/miden/activity';
import {
  setFaucetIdSetting,
  useAccount,
  useAllBalances,
  useAllTokensBaseMetadata,
  useMidenContext
} from 'lib/miden/front';
import type { TokenBalanceData } from 'lib/miden/front';
import { useClaimableNotes } from 'lib/miden/front/claimable-notes';
import { zustandProvider } from 'lib/miden/front/guardian-sync';
import { MIDEN_NETWORK_NAME, MIDEN_FAUCET_ENDPOINTS } from 'lib/miden-chain/constants';
import { isExtension } from 'lib/platform';
import type { TokenPrices } from 'lib/prices';
import { isAutoConsumeEnabled, isDelegateProofEnabled } from 'lib/settings/helpers';
import { WalletAccount } from 'lib/shared/types';
import { useWalletStore } from 'lib/store';
import { navigate } from 'lib/woozie';
import { isHexAddress } from 'utils/miden';
import { truncateAddress } from 'utils/string';

const Explore: FC = () => {
  const account = useAccount();
  const midenFaucetId = useMidenFaucetId();
  const { signTransaction } = useMidenContext();
  const allTokensBaseMetadata = useAllTokensBaseMetadata();
  const { data: allTokenBalances = [] } = useAllBalances(account.publicKey, allTokensBaseMetadata);
  const tokenPrices = useWalletStore(s => s.tokenPrices);

  const { data: claimableNotes, mutate: mutateClaimableNotes } = useClaimableNotes(account.publicKey);
  const isDelegatedProvingEnabled = isDelegateProofEnabled();
  const shouldAutoConsume = isAutoConsumeEnabled();

  const address = account.publicKey;

  const midenNotes = useMemo(() => {
    if (!shouldAutoConsume || !claimableNotes) {
      return [];
    }

    return claimableNotes.filter(note => note!.faucetId === midenFaucetId);
  }, [claimableNotes, midenFaucetId, shouldAutoConsume]);

  const hasAutoConsumableNotes = useMemo(() => {
    return midenNotes.length > 0;
  }, [midenNotes]);

  const autoConsumeMidenNotes = useCallback(async () => {
    if (!shouldAutoConsume || !hasAutoConsumableNotes) {
      return;
    }

    const notesToClaim = midenNotes!.filter(note => !note.isBeingClaimed);
    if (notesToClaim.length === 0) {
      return;
    }

    const promises = notesToClaim.map(async note => {
      await initiateConsumeTransaction(account.publicKey, note, isDelegatedProvingEnabled);
    });
    await Promise.all(promises);
    mutateClaimableNotes();

    if (isExtension()) {
      requestSWTransactionProcessing();
    } else {
      startBackgroundTransactionProcessing(signTransaction, false, zustandProvider);
    }
  }, [
    midenNotes,
    isDelegatedProvingEnabled,
    mutateClaimableNotes,
    account.publicKey,
    shouldAutoConsume,
    hasAutoConsumableNotes,
    signTransaction
  ]);

  useEffect(() => {
    if (hasAutoConsumableNotes) {
      autoConsumeMidenNotes();
    }
  }, [autoConsumeMidenNotes, hasAutoConsumableNotes]);

  useEffect(() => {
    if (isHexAddress(address)) {
      navigate('/reset-required');
    }
  }, [address]);

  const fetchFaucetState = useCallback(async () => {
    fetch(`${MIDEN_FAUCET_ENDPOINTS.get(MIDEN_NETWORK_NAME.DEVNET)}/get_metadata`)
      .then(response => response.json())
      .then(data => {
        if (data.id !== midenFaucetId) {
          setFaucetIdSetting(data.id);
        }
      })
      .catch(error => {
        console.error('Error fetching faucet metadata:', error);
      });
  }, [midenFaucetId]);

  useEffect(() => {
    //fetchFaucetState();
  }, [fetchFaucetState]);

  // Home lists every asset. The design system's Home has no search affordance,
  // so there is nothing to filter by here; the sort (native token first) stays.
  const sortedTokens = useMemo(
    () => [...allTokenBalances].sort(a => (a.tokenId === midenFaucetId ? -1 : 1)),
    [allTokenBalances, midenFaucetId]
  );

  if (isHexAddress(address)) {
    return null;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-app-bg font-inter" data-testid="explore-page">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-3 px-4 pt-3 pb-32">
          <HomeOverview address={address} tokenPrices={tokenPrices} tokens={sortedTokens} account={account} />
        </div>
      </div>
    </div>
  );
};

export default Explore;

interface HomeOverviewProps {
  address: string;
  tokenPrices: TokenPrices;
  tokens: TokenBalanceData[];
  account: WalletAccount;
}

const HomeOverview: FC<HomeOverviewProps> = ({ address, tokenPrices, tokens, account }) => {
  const [accountsOpen, setAccountsOpen] = useState(false);
  const { t } = useTranslation();
  // While the network or the node is down, the 24h delta describes a price
  // move fetched over the very connection that just went away. Showing a
  // stale reading beside a balance we have already told the user we cannot
  // verify is worse than showing no reading at all — so the delta comes off
  // and the connectivity prompt below the card carries the explanation.
  const { isBalanceStale } = useConnectivityIssue();
  return (
    <>
      <Balance>
        {balance => (
          <BalanceCard
            accountNumber={truncateAddress(address, false, 8)}
            accountId={address}
            amount={`$${toLocalFormat(balance, { decimalPlaces: 2 })}`}
            currency="USD"
            delta={isBalanceStale ? undefined : { absolute: '+0.00', percentage: '0.00%', direction: 'positive' }}
            onMore={() => setAccountsOpen(true)}
          />
        )}
      </Balance>

      <AccountsDrawer open={accountsOpen} onOpenChange={setAccountsOpen} />

      <HomePrompts account={account} />

      {/* `.masset-h` — display face at --t-heading, not text-2xl. */}
      <div className="flex items-center justify-between pt-2">
        <span className="font-heading text-heading font-extrabold text-ink">{t('assets')}</span>
      </div>

      {/* `.mrow + .mrow` — consecutive rows sit --stack-tight apart, NOT flush.
          The design system reaches that number by letting the rows inherit
          `.mpad`'s --stack gap and subtracting back down to tight; this list is
          its own flex column, so it states the tight tier directly. It was 0
          here, which put two 15px/11px text blocks 24px apart with nothing but
          their own padding between them and made the whole list read cramped. */}
      <div className="flex flex-col gap-stack-tight">
        {tokens.map(asset => (
          <AssetRow
            key={asset.tokenId}
            asset={asset}
            tokenPrices={tokenPrices}
            onClick={() => navigate(`/token-detail/${asset.tokenId}`)}
          />
        ))}
      </div>
    </>
  );
};
