import { useEffect } from 'react';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { sendStore } from '../stores/SendStore';

const { Text } = Typography;

/** 余额轮询间隔（毫秒） */
const BALANCE_POLL_INTERVAL = 5000;

/** 需要展示的 ERC-20 代币（与后端支持的测试网代币保持一致） */
const DISPLAY_TOKENS = ['USDT', 'USDC'] as const;

/** 余额为 undefined / null（尚未取到）时展示占位符，否则保留 4 位小数 */
function formatBalance(balance: number | null | undefined): string {
  return balance === null || balance === undefined ? '—' : balance.toFixed(4);
}

/** 展示当前会话解锁出的 ETH 账户，并轮询数据库中的 ETH / USDT / USDC 余额 */
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
      title="当前 ETH 账户"
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
      <Row gutter={16} style={{ marginBottom: 12 }}>
        <Col span={8}>
          <Text type="secondary">ETH 余额</Text>
          <div>
            <Text strong style={{ fontSize: 18 }}>
              {formatBalance(startupStore.ethBalance)}
            </Text>{' '}
            <Text type="secondary">ETH</Text>
          </div>
        </Col>
        {DISPLAY_TOKENS.map((symbol) => (
          <Col span={8} key={symbol}>
            <Text type="secondary">{symbol} 余额</Text>
            <div>
              <Text strong style={{ fontSize: 18 }}>
                {formatBalance(startupStore.tokenBalances[symbol])}
              </Text>{' '}
              <Text type="secondary">{symbol}</Text>
            </div>
          </Col>
        ))}
      </Row>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">ETH 地址</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {account.ethAddress}
          </Text>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <Text type="secondary">钱包账户</Text>
        <div>
          <Text code copyable style={{ wordBreak: 'break-all' }}>
            {account.address}
          </Text>
        </div>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        派生路径 m/44'/60'/0'/0/0（BIP44 标准）
      </Text>
    </Card>
  );
});

export default EthAccountCard;
