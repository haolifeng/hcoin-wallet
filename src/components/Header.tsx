import { Avatar, Button, Space, Tag, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';
import { startupStore } from '../stores/StartupStore';
import { networkStore } from '../stores/NetworkStore';
import { formatAccountAddress } from '../utils/format';

const { Text } = Typography;

/**
 * Header 内部内容：左（Logo）/ 右（用户区）。
 * 高度由外层 Layout.Header 固定为 60px，这里只负责横向分布。
 */
const Header = observer(() => {
  const address = startupStore.account?.address;

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

      {/* 右：当前网络环境 + 用户区（数据库账户地址替代原 Admin） */}
      <Space size={8} style={{ flexShrink: 0 }}>
        <Tag color={networkStore.isMainnet ? 'red' : 'orange'} style={{ marginInlineEnd: 0 }}>
          {networkStore.label}
        </Tag>
        <Button size="small" onClick={() => settingsStore.openSettings()}>
          设置
        </Button>
        <Avatar size="small" style={{ backgroundColor: '#1677ff' }}>H</Avatar>
        <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
          {address ? formatAccountAddress(address) : '未登录'}
        </Text>
      </Space>
    </div>
  );
});

export default Header;
