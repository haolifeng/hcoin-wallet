import { Alert, Button, Input, Modal, Select, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { useT } from '../i18n/I18nProvider';

const { Text } = Typography;

/**
 * 解锁弹窗：数据库已存在助记词时，由用户输入密码 →
 * 主进程解密助记词 → 派生 ETH 账户 → 界面展示。
 */
const UnlockModal = observer(() => {
  const store = startupStore;
  const t = useT();

  const handleUnlock = async () => {
    try {
      const { ethAddress } = await store.unlock();
      message.success(t('unlock.success', { address: ethAddress }));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('err.unlockFailed'));
    }
  };

  return (
    <Modal
      open={store.phase === 'unlock'}
      title={t('unlock.title')}
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
          {t('unlock.action')}
        </Button>,
      ]}
    >
      <Alert
        type="info"
        showIcon
        message={t('unlock.enterPasswordTitle')}
        description={t('unlock.enterPasswordDesc')}
        style={{ marginBottom: 16 }}
      />

      {store.accounts.length > 1 && (
        <div style={{ marginBottom: 12 }}>
          <Text strong>{t('common.selectAccount')}</Text>
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
          <Text strong>{t('common.account')}</Text>
          <div style={{ marginTop: 4 }}>
            <Text code style={{ wordBreak: 'break-all' }}>
              {store.selectedAddress}
            </Text>
          </div>
        </div>
      )}

      <div>
        <Text strong>{t('common.password')}</Text>
        <Input.Password
          value={store.password}
          placeholder={t('common.passwordPlaceholder')}
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
