import { Table, Typography, Alert, Spin } from 'antd';
import { observer } from 'mobx-react-lite';
import { menuStore } from '../stores/MenuStore';
import EthAccountCard from './EthAccountCard';

const { Title } = Typography;

/** 固定列顺序（保证各分区表头稳定） */
const COLUMN_ORDER: Record<string, string[]> = {
  dashboard: ['address', 'balance', 'createdAt'],
  accounts: ['address', 'balance', 'createdAt'],
  balance: ['address', 'balance'],
  about: ['item', 'value'],
};

const COLUMN_LABEL: Record<string, string> = {
  address: '地址',
  balance: '余额',
  createdAt: '创建时间',
  hash: '交易哈希',
  from: '转出',
  to: '转入',
  amount: '金额',
  status: '状态',
  item: '项目',
  value: '值',
};

const ContentPanel = observer(() => {
  const keys = COLUMN_ORDER[menuStore.selectedKey] ?? [];
  const columns = keys.map((k) => ({
    title: COLUMN_LABEL[k] ?? k,
    dataIndex: k,
    key: k,
  }));

  return (
    <div>
      <Title level={3}>{menuStore.currentLabel}</Title>

      {/* 解锁后展示由助记词派生的 ETH 账户 */}
      <EthAccountCard />

      {menuStore.error && (
        <Alert type="error" showIcon message={menuStore.error} style={{ marginBottom: 16 }} />
      )}

      <Spin spinning={menuStore.loading}>
        <Table
          rowKey="key"
          size="small"
          columns={columns}
          dataSource={menuStore.rows}
          pagination={false}
          locale={{ emptyText: '暂无数据' }}
        />
      </Spin>
    </div>
  );
});

export default ContentPanel;