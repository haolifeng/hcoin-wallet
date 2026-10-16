import { Card, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';

const { Text } = Typography;

/** 展示当前会话解锁出的 ETH 账户（地址由主进程派生后回传） */
const EthAccountCard = observer(() => {
  const account = startupStore.account;
  if (!account) return null;

  return (
    <Card
      size="small"
      title="当前 ETH 账户"
      extra={<Tag color="green">已解锁</Tag>}
      style={{ marginBottom: 16 }}
    >
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
