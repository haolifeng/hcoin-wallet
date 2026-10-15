import { Card, Typography } from 'antd';

const { Text, Paragraph } = Typography;

/** 单个广告位 */
function AdSlot({ title, desc }: { title: string; desc: string }) {
  return (
    <Card size="small" title="广告" style={{ marginBottom: 16 }}>
      <div
        style={{
          height: 120,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%)',
          borderRadius: 6,
          marginBottom: 8,
        }}
      >
        <Text strong>{title}</Text>
        <Paragraph type="secondary" style={{ margin: 0, fontSize: 12 }}>
          {desc}
        </Paragraph>
      </div>
      <Text type="secondary" style={{ fontSize: 12 }}>
        AD · 赞助商位置
      </Text>
    </Card>
  );
}

const RightPanel = () => {
  return (
    <div style={{ padding: 16, height: '100%', overflow: 'auto' }}>
      <AdSlot title="HCoin 理财" desc="稳健收益，年化 8%" />
      <AdSlot title="邀请好友" desc="双方各得 10 HCoin" />
      <AdSlot title="安全中心" desc="开启二次验证" />
    </div>
  );
};

export default RightPanel;
