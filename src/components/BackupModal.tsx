import { Alert, Button, Col, Input, Modal, Row, Select, Spin, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';
import { formatAccountAddress } from '../utils/format';

const { Text } = Typography;

/** 备份弹窗：输入密码 → 解密数据库中的助记词 → 明文展示 */
const BackupModal = observer(() => {
  const store = settingsStore;

  const handleSubmit = async () => {
    try {
      await store.submitBackup();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '备份失败');
    }
  };

  const renderPasswordForm = () => (
    <>
      <Alert
        type="info"
        showIcon
        message="请输入该账户的密码"
        description="密码用于解密数据库中保存的助记词密文，验证通过后会显示明文助记词。"
        style={{ marginBottom: 16 }}
      />
      {store.accounts.length > 0 ? (
        <div style={{ marginBottom: 12 }}>
          <Text strong>选择账户</Text>
          <Select
            value={store.selectedAddress ?? undefined}
            onChange={(value: string) => store.setSelectedAddress(value)}
            options={store.accounts.map(({ address, hasSecret }) => ({
              value: address,
              label: hasSecret
                ? formatAccountAddress(address)
                : `${formatAccountAddress(address)}（无备份数据）`,
              disabled: !hasSecret,
            }))}
            style={{ width: '100%', marginTop: 4 }}
          />
        </div>
      ) : (
        <Text type="secondary">暂无可备份的账户，请先创建账户。</Text>
      )}
      <div>
        <Text strong>密码</Text>
        <Input.Password
          value={store.password}
          placeholder="请输入密码"
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
        message="请您保存好助记词"
        description="以下是解密后的明文助记词，请勿截图或通过网络发送；关闭弹窗后不会保留。"
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
      title="备份助记词"
      width={560}
      maskClosable={false}
      onCancel={() => store.closeBackup()}
      footer={
        hasMnemonic
          ? [
              <Button key="close" type="primary" onClick={() => store.closeBackup()}>
                关闭
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={() => store.closeBackup()}>
                取消
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={store.loading}
                disabled={!store.selectedAddress || !store.password || store.loading}
                onClick={handleSubmit}
              >
                确认备份
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
