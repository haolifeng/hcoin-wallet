import { useEffect } from 'react';
import { Card, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { networkStore } from '../stores/NetworkStore';
import { resolveChainAddress, type ChainDisplay } from '../constants/chains';
import type { NetworkType } from '../constants/network';
import { useT } from '../i18n/I18nProvider';

const { Text } = Typography;

/** 余额轮询间隔（毫秒） */
const BALANCE_POLL_INTERVAL = 5000;

/** 各链派生路径说明 */
const DERIVATION_PATH: Record<string, string> = {
  evm: "m/44'/60'/0'/0/0（BIP44）",
  bitcoin: "m/84'/0'/0'/0/0（BIP84 / Native SegWit）",
  solana: "m/44'/501'/0'/0'（SLIP-0010）",
};

/** BTC 的 BIP84 coinType 随网络环境变化（主网 0 / 测试网 1） */
const BTC_DERIVATION_PATH: Record<NetworkType, string> = {
  mainnet: "m/84'/0'/0'/0/0（BIP84 / Native SegWit）",
  testnet: "m/84'/1'/0'/0/0（BIP84 / Native SegWit）",
};

/**
 * 展示当前选中链的账户信息（地址、网络、派生路径）。
 * 余额轮询在此启动，账户或链变化时重新开始 / 清理。
 */
const ChainAccountCard = observer(({ chain }: { chain: ChainDisplay }) => {
  const account = startupStore.account;
  const t = useT();

  useEffect(() => {
    if (!account) return;
    void startupStore.refreshBalances();
    const timer = window.setInterval(() => {
      void startupStore.refreshBalances();
    }, BALANCE_POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [account]);

  if (!account) {
    return (
      <Card
        size="small"
        title={t('content.accountTitle', { symbol: chain.nativeSymbol })}
        style={{ marginBottom: 16 }}
      >
        <Text type="secondary">{t('content.lockedHint', { symbol: chain.nativeSymbol })}</Text>
      </Card>
    );
  }

  const address = resolveChainAddress(chain, account);
  const network = networkStore.network;
  const derivationPath =
    chain.kind === 'bitcoin' ? BTC_DERIVATION_PATH[network] : DERIVATION_PATH[chain.kind];

  return (
    <Card
      size="small"
      title={t('content.accountTitle', { symbol: chain.nativeSymbol })}
      extra={<Tag color="blue">{chain.name}</Tag>}
      style={{ marginBottom: 16 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">{t('content.addressLabel', { symbol: chain.nativeSymbol })}</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {address}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">{t('content.network')}</Text>
        <div>
          <Text>
            {chain.name}（{networkStore.label}）
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">{t('content.derivationPath')}</Text>
        <div>
          <Text code>{derivationPath}</Text>
        </div>
      </div>
      <div>
        <Text type="secondary">{t('content.walletAccount')}</Text>
        <div>
          <Text code copyable={{ text: account.address }} title={account.address}>
            {account.address}
          </Text>
        </div>
      </div>
    </Card>
  );
});

export default ChainAccountCard;
