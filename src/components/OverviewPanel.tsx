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
import { useT } from '../i18n/I18nProvider';

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
  const t = useT();
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
      title: t('overview.chain'),
      dataIndex: 'chainName',
      key: 'chainName',
      render: (name: string) => <Tag color="blue">{name}</Tag>,
    },
    { title: t('common.asset'), dataIndex: 'asset', key: 'asset' },
    {
      title: t('common.balance'),
      dataIndex: 'balance',
      key: 'balance',
      render: (balance: number | undefined) => formatAmount(balance),
    },
    {
      title: t('common.priceUsd'),
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => formatUsd(price),
    },
    {
      title: t('common.valueUsd'),
      dataIndex: 'value',
      key: 'value',
      render: (value: number) => <Text strong>{formatUsd(value)}</Text>,
    },
    {
      title: t('common.action'),
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
          {t('common.send')}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>{menuStore.currentLabel}</Title>

      <Card size="small" style={{ marginBottom: 16 }}>
        <Statistic title={t('overview.totalTitle')} value={total} precision={2} prefix="$" />
        <Text type="secondary" style={{ fontSize: 12 }}>
          {priceStore.updatedAt
            ? t('overview.priceSource', {
                time: new Date(priceStore.updatedAt).toLocaleTimeString(),
              })
            : t('overview.priceFallback')}
        </Text>
      </Card>

      <Table
        rowKey="key"
        size="small"
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: t('common.noData') }}
      />
    </div>
  );
});

export default OverviewPanel;
