import { Alert, Spin, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore, type StartupPhase } from '../stores/StartupStore';

const { Title, Text } = Typography;

const STATUS_TEXT: Record<StartupPhase, string> = {
  checking: '正在检查本地钱包数据…',
  create: '未检测到助记词，请先创建钱包',
  unlock: '已检测到助记词，请输入密码解锁',
  ready: '',
};

/**
 * 启动界面：应用打开时的全屏封面。
 * 检测数据库 → 无助记词则弹出创建窗口，有助记词则弹出密码窗口。
 */
const StartupScreen = observer(() => {
  if (startupStore.phase === 'ready') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        // 低于 antd Modal（默认 z-index 1000），保证弹窗浮在启动界面之上
        zIndex: 900,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(160deg, #001529 0%, #0a3d6b 60%, #0958a5 100%)',
      }}
    >
      <div style={{ fontSize: 56, color: '#fff', lineHeight: 1 }}>◈</div>
      <Title level={2} style={{ color: '#fff', margin: '16px 0 4px' }}>
        HCoinWallet
      </Title>
      <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
        安全 · 自托管 · 助记词只保存在本机
      </Text>

      <Spin size="large" style={{ marginTop: 36 }} />
      <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 16 }}>
        {STATUS_TEXT[startupStore.phase]}
      </Text>

      {startupStore.error && (
        <Alert
          type="error"
          showIcon
          message={startupStore.error}
          style={{ marginTop: 16, maxWidth: 420 }}
        />
      )}
    </div>
  );
});

export default StartupScreen;
