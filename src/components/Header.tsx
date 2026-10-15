import { Avatar, Button, Space, Typography } from 'antd';
import { createWalletStore } from '../stores/CreateWalletStore';
import { settingsStore } from '../stores/SettingsStore';

const { Text } = Typography;

/**
 * Header 内部内容：左（Logo）/ 中（导航）/ 右（用户区）。
 * 高度由外层 Layout.Header 固定为 60px，这里只负责横向分布。
 */
export default function Header() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* 左：Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 20 }}>◈</span>
        <Text strong style={{ color: '#fff', fontSize: 18, whiteSpace: 'nowrap' }}>
          HCoinWallet
        </Text>
      </div>

      {/* 中：导航 */}
      <nav style={{ display: 'flex', gap: 24 }}>
        <a style={{ color: 'rgba(255,255,255,0.85)' }} href="#dashboard">总揽</a>
        <a style={{ color: 'rgba(255,255,255,0.85)' }} href="#accounts">账户</a>
        <a style={{ color: 'rgba(255,255,255,0.85)' }} href="#balance">余额</a>
        <a style={{ color: 'rgba(255,255,255,0.85)' }} href="#about">关于</a>
      </nav>

      {/* 右：用户区 */}
      <Space size={8} style={{ flexShrink: 0 }}>
        <Button type="primary" size="small" onClick={() => void createWalletStore.open()}>
          创建
        </Button>
        <Button size="small" onClick={() => settingsStore.openSettings()}>
          设置
        </Button>
        <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>H</Avatar>
        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Admin</Text>
      </Space>
    </div>
  );
}