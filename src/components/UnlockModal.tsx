import { Alert, Button, Input, Modal, Select, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';

const { Text } = Typography;

/**
 * 解锁弹窗：数据库已存在助记词时，由用户输入密码 →
 * 主进程解密助记词 → 派生 ETH 账户 → 界面展示。
 */
const UnlockModal = observer(() => {
  const store = startupStore;

  const handleUnlock = async () => {
    try {
      const { ethAddress } = await store.unlock();
      message.success(`解锁成功，ETH 账户：${ethAddress}`);
    } catch (err) {
      message.error(err instanceof Error ? err.message : '解锁失败');
    }
  };

  return (
    <Modal
      open={store.phase === 'unlock'}
      title="解锁钱包"
      width={480}
      maskClosable={false}
      closable={false}
      keyboard={false}
      footer={[
        <Button
          key="unlock"
          type="primary"
          loading={store.loading}
          disabled={!store.selectedAddress || !store.password || store.loading}
          onClick={handleUnlock}
        >
          解锁
        </Button>,
      ]}
    >
      <Alert
        type="info"
        showIcon
        message="请输入该账户的密码"
        description="密码用于解密本机保存的助记词，验证通过后会派生 ETH 账户并展示在界面上。"
        style={{ marginBottom: 16 }}
      />

      {store.accounts.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>选择账户</Text>
          <Select
            value={store.selectedAddress ?? undefined}
            onChange={(value: string) => store.setSelectedAddress(value)}
            options={store.accounts.map(({ address }) => ({ value: address, label: address }))}
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      )}

      {store.accounts.length === 1 && store.selectedAddress && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>账户</Text>
          <div style={{ marginTop: 4 }}>
            <Text code style={{ wordBreak: 'break-all' }}>
              {store.selectedAddress}
            </Text>
          </div>
        </div>
      )}

      <div>
        <Text strong>密码</Text>
        <Input.Password
          value={store.password}
          placeholder="请输入密码"
          autoFocus
          onChange={(e) => store.setPassword(e.target.value)}
          onPressEnter={handleUnlock}
          style={{ marginTop: 4 }}
        />
      </div>

      {store.error && (
        <Alert type="error" showIcon message={store.error} style={{ marginTop: 16 }} />
      )}
    </Modal>
  );
});

export default UnlockModal;
