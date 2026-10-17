import { useEffect } from 'react';
import { Card, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { resolveChainAddress, type ChainDisplay } from '../constants/chains';

const { Text } = Typography;

/** 余额轮询间隔（毫秒） */
const BALANCE_POLL_INTERVAL = 5000;

/** 各链派生路径说明 */
const DERIVATION_PATH: Record<string, string> = {
  evm: "m/44'/60'/0'/0/0（BIP44）",
  bitcoin: "m/84'/0'/0'/0/0（BIP84 / Native SegWit）",
  solana: "m/44'/501'/0'/0'（SLIP-0010）",
};

/**
 * 展示当前选中链的账户信息（地址、网络、派生路径）。
 * 余额轮询在此启动，账户或链变化时重新开始 / 清理。
 */
const ChainAccountCard = observer(({ chain }: { chain: ChainDisplay }) => {
  const account = startupStore.account;

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
      <Card size="small" title={`${chain.nativeSymbol} 账户`} style={{ marginBottom: 16 }}>
        <Text type="secondary">钱包未解锁，请先解锁后查看 {chain.nativeSymbol} 账户信息。</Text>
      </Card>
    );
  }

  const address = resolveChainAddress(chain, account);

  return (
    <Card
      size="small"
      title={`${chain.nativeSymbol} 账户`}
      extra={<Tag color="blue">{chain.name}</Tag>}
      style={{ marginBottom: 16 }}
    >
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">{chain.nativeSymbol} 地址</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {address}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">网络</Text>
        <div>
          <Text>{chain.name}</Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">派生路径</Text>
        <div>
          <Text code>{DERIVATION_PATH[chain.kind]}</Text>
        </div>
      </div>
      <div>
        <Text type="secondary">钱包账户</Text>
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
