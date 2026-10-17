import { Alert, Spin, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore, type StartupPhase } from '../stores/StartupStore';
import { useT } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/messages';

const { Title, Text } = Typography;

/** 各启动阶段的状态文案 key */
const STATUS_KEY: Record<StartupPhase, MessageKey> = {
  checking: 'startup.status.checking',
  choose: 'startup.status.choose',
  create: 'startup.status.create',
  import: 'startup.status.import',
  unlock: 'startup.status.unlock',
  ready: 'startup.status.ready',
};

/**
 * 启动界面：应用打开时的全屏封面。
 * 检测数据库 → 无助记词则弹出创建窗口，有助记词则弹出密码窗口。
 */
const StartupScreen = observer(() => {
  const t = useT();
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
      <Text style={{ color: 'rgba(255,255,255,0.65)' }}>{t('startup.slogan')}</Text>

      <Spin size="large" style={{ marginTop: 36 }} />
      <Text style={{ color: 'rgba(255,255,255,0.85)', marginTop: 16 }}>
        {t(STATUS_KEY[startupStore.phase])}
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
