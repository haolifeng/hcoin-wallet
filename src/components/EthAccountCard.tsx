import { useEffect } from 'react';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { sendStore } from '../stores/SendStore';
import { formatAccountAddress } from '../utils/format';
import { CHAINS } from '../constants/chains';

const { Text } = Typography;

/** 余额轮询间隔（毫秒） */
const BALANCE_POLL_INTERVAL = 5000;

/** 余额为 undefined / null（尚未取到）时展示占位符，否则保留 4 位小数 */
function formatBalance(balance: number | null | undefined): string {
  return balance === null || balance === undefined ? '—' : balance.toFixed(4);
}

/** 展示当前会话解锁出的账户，并轮询数据库中的各链余额（ETH / AVAX / BTC / USDT / USDC） */
const EthAccountCard = observer(() => {
  const account = startupStore.account;

  // 账户解锁后开始轮询余额；账户变化或组件卸载时自动重新开始 / 清理
  useEffect(() => {
    if (!account) return;
    void startupStore.refreshBalances();
    const timer = window.setInterval(() => {
      void startupStore.refreshBalances();
    }, BALANCE_POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, [account]);

  if (!account) return null;

  return (
    <Card
      size="small"
      title="当前账户"
      extra={
        <Space>
          <Tag color="green">已解锁</Tag>
          <Button size="small" type="primary" onClick={() => sendStore.open()}>
            发送
          </Button>
        </Space>
      }
      style={{ marginBottom: 16 }}
    >
      {CHAINS.map((chain) => {
        const balances = startupStore.chainBalances[chain.key];
        return (
          <div key={chain.key} style={{ marginBottom: 12 }}>
            <Text type="secondary">
              {chain.nativeSymbol} 链（{chain.name}）
            </Text>
            <Row gutter={16} style={{ marginTop: 4 }}>
              <Col span={8}>
                <Text type="secondary">{chain.nativeSymbol} 余额</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {formatBalance(balances?.native)}
                  </Text>{' '}
                  <Text type="secondary">{chain.nativeSymbol}</Text>
                </div>
              </Col>
              {chain.tokens.map((symbol) => (
                <Col span={8} key={symbol}>
                  <Text type="secondary">{symbol} 余额</Text>
                  <div>
                    <Text strong style={{ fontSize: 18 }}>
                      {formatBalance(balances?.tokens?.[symbol])}
                    </Text>{' '}
                    <Text type="secondary">{symbol}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        );
      })}

      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">链上地址（ETH / AVAX 共用）</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {account.ethAddress}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">BTC 地址（Native SegWit / 主网）</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {account.btcAddress}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">Solana 地址（主网）</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {account.solAddress}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">钱包账户</Text>
        <div>
          <Text code copyable={{ text: account.address }} title={account.address}>
            {formatAccountAddress(account.address)}
          </Text>
        </div>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        EVM 派生路径 m/44'/60'/0'/0/0（BIP44）· BTC 派生路径 m/84'/0'/0'/0/0（BIP84）· SOL 派生路径
        m/44'/501'/0'/0'（SLIP-0010）
      </Text>
    </Card>
  );
});

export default EthAccountCard;
