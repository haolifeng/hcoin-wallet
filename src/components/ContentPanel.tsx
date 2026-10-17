import { Button, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { observer } from 'mobx-react-lite';
import { menuStore } from '../stores/MenuStore';
import { startupStore } from '../stores/StartupStore';
import { sendStore } from '../stores/SendStore';
import { priceStore } from '../stores/PriceStore';
import { buildAssetValue } from '../constants/chains';
import { formatAmount, formatUsd } from '../utils/format';
import ChainAccountCard from './ChainAccountCard';
import OverviewPanel from './OverviewPanel';

const { Title, Text } = Typography;

/** 余额行 */
interface AssetRow {
  key: string;
  asset: string;
  balance: number | undefined;
  price: number;
  value: number;
}

const ContentPanel = observer(() => {
  // 「总览」聚合各链资产；其余菜单项为单链详情
  if (menuStore.selectedKey === 'overview') return <OverviewPanel />;

  const chain = menuStore.currentChain;
  if (!chain) return null;

  const balances = startupStore.chainBalances[chain.key];
  const assets = [chain.nativeSymbol, ...chain.tokens];
  const rows: AssetRow[] = assets.map((symbol) => {
    const balance =
      symbol === chain.nativeSymbol ? balances?.native : balances?.tokens?.[symbol];
    const price = priceStore.getPrice(symbol);
    return {
      key: symbol,
      asset: symbol,
      balance,
      price,
      value: (balance ?? 0) * price,
    };
  });
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  const columns: ColumnsType<AssetRow> = [
    { title: '资产', dataIndex: 'asset', key: 'asset' },
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
      render: (value: number) => formatUsd(value),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: unknown, record: AssetRow) => (
        <Button
          size="small"
          type="primary"
          disabled={!startupStore.account}
          onClick={() =>
            sendStore.open(buildAssetValue(chain.key, record.asset), { lockAsset: true })
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

      {/* 选中链的账户信息（地址 / 网络 / 派生路径），并启动余额轮询 */}
      <ChainAccountCard chain={chain} />

      <Table
        rowKey="key"
        size="small"
        columns={columns}
        dataSource={rows}
        pagination={false}
        locale={{ emptyText: '暂无资产' }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <Text strong>小计（USD）</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3}>
              <Text strong>{formatUsd(total)}</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={4} />
          </Table.Summary.Row>
        )}
      />
    </div>
  );
});

export default ContentPanel;
