import React, { useMemo } from 'react';

import clsx from 'clsx';

import { useAllBalances, useAllTokensBaseMetadata } from 'lib/miden/front';
import { WalletAccount } from 'lib/shared/types';
import { useWalletStore } from 'lib/store';
import { Badge } from 'lib/ui/badge';

export const PriceChangeBadge = ({ account }: { account: WalletAccount }) => {
  const allTokensBaseMetadata = useAllTokensBaseMetadata();
  const { data: allTokenBalances = [] } = useAllBalances(account.publicKey, allTokensBaseMetadata);
  const tokenPrices = useWalletStore(s => s.tokenPrices);
  const { portfolioChange, percentageChange } = useMemo(() => {
    const portfolioChange = allTokenBalances.reduce((sum, t) => {
      const p = tokenPrices[t.metadata.symbol]?.change24h ?? 0;
      return sum + t.balance * p;
    }, 0);
    const totalValue = allTokenBalances.reduce((sum, t) => {
      const price = tokenPrices[t.metadata.symbol]?.price ?? 1;
      return sum + t.balance * price;
    }, 0);
    const percentageChange = totalValue > 0 ? (portfolioChange / totalValue) * 100 : 0;
    return { portfolioChange, percentageChange };
  }, [allTokenBalances, tokenPrices]);
  const isPositive = portfolioChange > 0;
  const isNeutral = portfolioChange === 0;

  // Direction picks a status role, and the role owns both the fill and the ink.
  // Previously the fill was hardcoded (`bg-receive-green` / `bg-red-500` /
  // `bg-grey-400`) and the label had to be forced back on top of it with
  // `!text-white` — white that does not invert with the theme. `pos`/`neg` put
  // `--paper` on the fill instead, which is correct in both themes with one
  // declaration; the neutral case is not a status at all, so it takes the
  // default surface badge.
  const variant = isNeutral ? 'default' : isPositive ? 'pos' : 'neg';

  return (
    <div className="flex items-center gap-1">
      <Badge variant={variant} className="font-medium">
        {isNeutral ? '' : isPositive ? '+' : '-'}${Math.abs(portfolioChange).toFixed(2)}
      </Badge>
      <p className={clsx('text-xs', isNeutral ? 'text-ink-3' : isPositive ? 'text-pos' : 'text-neg')}>
        {percentageChange.toFixed(2)}%
      </p>
    </div>
  );
};
