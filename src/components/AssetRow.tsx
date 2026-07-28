import React, { FC } from 'react';

import { TokenLogo } from 'components/TokenLogo';
import { AssetListItem, Sparkline } from 'components/ui';
import type { TokenBalanceData } from 'lib/miden/front';
import { getTokenPrice, useTokenSparkline } from 'lib/prices';
import type { TokenPrices } from 'lib/prices';

export interface AssetRowProps {
  asset: TokenBalanceData;
  tokenPrices: TokenPrices;
  onClick?: () => void;
  'data-testid'?: string;
}

/**
 * Wallet-aware row used in Explore + SelectToken — wraps AssetListItem with
 * the standard data plumbing: TokenLogo for the icon, 1D sparkline from
 * Binance (omitted entirely for unindexed symbols), fiat price, and
 * coloured 24h delta.
 */
export const AssetRow: FC<AssetRowProps> = ({ asset, tokenPrices, onClick, 'data-testid': dataTestId }) => {
  const { metadata, balance } = asset;
  const priceInfo = getTokenPrice(tokenPrices, metadata.symbol);
  const isPositive = priceInfo.percentageChange24h >= 0;
  const deltaValue = `${isPositive ? '+' : ''}${priceInfo.percentageChange24h.toFixed(2)}%`;
  const direction: 'positive' | 'negative' = isPositive ? 'positive' : 'negative';

  // No chart when there is no price feed. `useTokenSparkline` returns [] for
  // any symbol Binance does not list — which is every token on devnet and
  // testnet — and the row used to substitute two constant points: a 120px
  // dead-straight rule that reads as "this token held perfectly flat for 24
  // hours". It is not flat, it is unknown, and those are different claims.
  // Rabby and Uniswap both delete the chart outright rather than draw one of
  // nothing; the row omits it and the slot collapses.
  const points = useTokenSparkline(metadata.symbol, '1D');
  const hasRealPoints = points.length > 1;
  const sparkColor = isPositive ? 'var(--status-positive)' : 'var(--status-negative)';

  return (
    <AssetListItem
      icon={<TokenLogo symbol={metadata.symbol} />}
      name={metadata.name || metadata.symbol}
      amount={`${balance.toFixed(2)} ${metadata.symbol}`}
      chart={hasRealPoints ? <Sparkline points={points} color={sparkColor} width={120} height={32} /> : undefined}
      price={`$${(balance * priceInfo.price).toFixed(2)}`}
      delta={{ value: deltaValue, direction }}
      onClick={onClick}
      data-testid={dataTestId}
    />
  );
};

export default AssetRow;
