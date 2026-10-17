import { Button, Card, Statistic, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react-lite';
import { menuStore } from '../stores/MenuStore';
import { startupStore } from '../stores/StartupStore';
import { sendStore } from '../stores/SendStore';
import { priceStore } from '../stores/PriceStore';
import { networkStore } from '../stores/NetworkStore';
import { getChains, buildAssetValue } from '../constants/chains';
import { formatAmount, formatUsd } from '../utils/format';

const { Title, Text } = Typography;

/** 总览行：某条链上的某个币种 */
interface OverviewRow {
  key: string;
  chainKey: string;
  chainName: string;
  asset: string;
  balance: number | undefined;
  price: number;
  value: number;
}

/** 总览：按链列出各币种余额、价格与美元估值，并汇总为总额（价格由 App 统一轮询） */
const OverviewPanel = observer(() => {
  const rows: OverviewRow[] = [];
  let total = 0;
  for (const chain of getChains(networkStore.network)) {
    const balances = startupStore.chainBalances[chain.key];
    for (const symbol of [chain.nativeSymbol, ...chain.tokens]) {
      const balance =
        symbol === chain.nativeSymbol ? balances?.native : balances?.tokens?.[symbol];
      const price = priceStore.getPrice(symbol);
      const value = (balance ?? 0) * price;
      total += value;
      rows.push({
        key: `${chain.key}:${symbol}`,
        chainKey: chain.key,
        chainName: chain.name,
        asset: symbol,
        balance,
        price,
        value,
      });
    }
  }

  const columns: ColumnsType<OverviewRow> = [
    {
      title: '链',
      dataIndex: 'chainName',
      key: 'chainName',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    { title: '币种', dataIndex: 'asset', key: 'asset' },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number | undefined) => formatAmount(balance),
    },
    {
      title: '价格（USD）',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatUsd(price),
    },
    {
      title: '估值（USD）',
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => <Text strong>{formatUsd(value)}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: OverviewRow) => (
        <Button
          size="small"
          type="primary"
          disabled={!startupStore.account}
          onClick={() =>
            sendStore.open(buildAssetValue(record.chainKey, record.asset), { lockAsset: true })
          }
        >
          发送
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>{menuStore.currentLabel}</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Statistic title="资产总额（USD）" value={total} precision={2} prefix="$" />
        <Text type="secondary" style={{ fontSize: 12 }}>
          价格来源：CoinGecko ·{' '}
          {priceStore.updatedAt
            ? `更新于 ${new Date(priceStore.updatedAt).toLocaleTimeString()}`
            : '暂用兜底价格'}
        </Text>
      </Card>

      <Table
        rowKey="key"
        size="small"
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: '暂无资产' }}
      />
    </div>
  );
});

export default OverviewPanel;
