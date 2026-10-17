import { Alert, Button, Col, Input, Modal, Row, Select, Spin, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';
import { formatAccountAddress } from '../utils/format';
import { useT } from '../i18n/I18nProvider';

const { Text } = Typography;

/** 备份弹窗：输入密码 → 解密数据库中的助记词 → 明文展示 */
const BackupModal = observer(() => {
  const store = settingsStore;
  const t = useT();

  const handleSubmit = async () => {
    try {
      await store.submitBackup();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('err.backupFailed'));
    }
  };

  const renderPasswordForm = () => (
    <>
      <Alert
        type="info"
        showIcon
        message={t('backup.enterPasswordTitle')}
        description={t('backup.enterPasswordDesc')}
        style={{ marginBottom: 16 }}
      />
      {store.accounts.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          <Text strong>{t('common.selectAccount')}</Text>
          <Select
            value={store.selectedAddress ?? undefined}
            onChange={(value: string) => store.setSelectedAddress(value)}
            options={store.accounts.map(({ address, hasSecret }) => ({
              value: address,
              label: hasSecret
                ? formatAccountAddress(address)
                : `${formatAccountAddress(address)}${t('backup.noSecret')}`,
              disabled: !hasSecret,
            }))}
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      ) : (
        <Text type="secondary">{t('backup.noBackable')}</Text>
      )}
      <div>
        <Text strong>{t('common.password')}</Text>
        <Input.Password
          value={store.password}
          placeholder={t('common.passwordPlaceholder')}
          onChange={(e) => store.setPassword(e.target.value)}
          style={{ marginTop: 4 }}
        />
      </div>
    </>
  );

  const renderMnemonic = () => (
    <>
      <Alert
        type="warning"
        showIcon
        message={t('backup.saveTitle')}
        description={t('backup.saveDesc')}
        style={{ marginBottom: 16 }}
      />
      <Row gutter={[8, 8]}>
        {store.mnemonic.map((word, index) => (
          <Col span={8} key={`${word}-${index}`}>
            <Button block style={{ textAlign: 'left' }}>
              {`${index + 1}. ${word}`}
            </Button>
          </Col>
        ))}
      </Row>
    </>
  );

  const hasMnemonic = store.mnemonic.length > 0;

  return (
    <Modal
      open={store.backupVisible}
      title={t('backup.title')}
      width={560}
      maskClosable={false}
      onCancel={() => store.closeBackup()}
      footer={
        hasMnemonic
          ? [
              <Button key="close" type="primary" onClick={() => store.closeBackup()}>
                {t('common.close')}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={() => store.closeBackup()}>
                {t('common.cancel')}
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={store.loading}
                disabled={!store.selectedAddress || !store.password || store.loading}
                onClick={handleSubmit}
              >
                {t('backup.confirm')}
              </Button>,
            ]
      }
    >
      {store.error && (
        <Alert type="error" showIcon message={store.error} style={{ marginBottom: 16 }} />
      )}
      <Spin spinning={store.loading}>
        {hasMnemonic ? renderMnemonic() : renderPasswordForm()}
      </Spin>
    </Modal>
  );
});

export default BackupModal;
