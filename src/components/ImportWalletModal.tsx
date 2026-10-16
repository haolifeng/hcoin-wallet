import { Alert, Button, Input, Modal, Tag, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { importWalletStore } from '../stores/ImportWalletStore';
import { startupStore } from '../stores/StartupStore';

const { Text, Paragraph } = Typography;

const WORD_COUNT = 12;

/** 导入助记词：输入已有 12 词 → 设置密码 → 加密存入数据库并派生 ETH 账户 */
const ImportWalletModal = observer(() => {
  const store = importWalletStore;

  const handleSubmit = async () => {
    try {
      const result = await store.submit();
      message.success(`导入成功，ETH 账户：${result.ethAddress}`);
      // 记录当前账户（启动流程中还会由此放行进入主界面）
      startupStore.markCreated(result);
      store.close();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '导入失败');
    }
  };

  /** 第一步：粘贴/输入 12 个助记词 */
  const renderPhraseStep = () => {
    const words = store.words;
    return (
      <>
        <Alert
          type="info"
          showIcon
          message="请输入您的助记词"
          description="按原有顺序输入 12 个英文助记词，用空格分隔，也可直接整段粘贴。助记词仅在本机加密保存。"
          style={{ marginBottom: 16 }}
        />
        <Text strong>助记词</Text>
        <Input.TextArea
          value={store.phrase}
          rows={4}
          placeholder="例如：apple banana cat ...（共 12 个单词）"
          onChange={(e) => store.setPhrase(e.target.value)}
          style={{ marginTop: 4 }}
        />
        <div style={{ marginTop: 8 }}>
          <Text type={store.countOk ? 'success' : 'secondary'}>
            已输入 {words.length} / {WORD_COUNT} 个
          </Text>
        </div>
        {words.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {words.map((word, index) => (
              <Tag
                key={`${word}-${index}`}
                color={index < WORD_COUNT ? 'blue' : 'red'}
                style={{ marginBottom: 4 }}
              >
                {`${index + 1}. ${word}`}
              </Tag>
            ))}
          </div>
        )}
        {!store.countOk && words.length > 0 && (
          <Paragraph type="danger" style={{ marginTop: 8, marginBottom: 0 }}>
            助记词数量应为 {WORD_COUNT} 个，请检查后重试。
          </Paragraph>
        )}
      </>
    );
  };

  /** 第二步：设置密码（与创建钱包相同的密码规则） */
  const renderPasswordStep = () => {
    const confirmFilled = store.confirmPassword.length > 0;
    const showConfirmError = confirmFilled && !store.passwordMatched;
    return (
      <>
        <Alert
          type="info"
          showIcon
          message="请设置账户密码"
          description="密码用于加密保存导入的助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。"
          style={{ marginBottom: 16 }}
        />
        <div style={{ marginBottom: 12 }}>
          <Text strong>密码</Text>
          <Input.Password
            value={store.password}
            placeholder="请输入密码"
            status={store.password.length > 0 && !store.passwordValid ? 'error' : undefined}
            onChange={(e) => store.setPassword(e.target.value)}
            style={{ marginTop: 4 }}
          />
          {store.password.length > 0 && !store.passwordValid && (
            <div style={{ marginTop: 4 }}>
              {store.passwordErrors.map((err) => (
                <div key={err}>
                  <Text type="danger">{err}</Text>
                </div>
              ))}
            </div>
          )}
          {store.passwordValid && (
            <Text type="success" style={{ marginTop: 4, display: 'inline-block' }}>
              密码符合要求
            </Text>
          )}
        </div>
        <div>
          <Text strong>确认密码</Text>
          <Input.Password
            value={store.confirmPassword}
            placeholder="请再次输入密码"
            status={showConfirmError ? 'error' : undefined}
            onChange={(e) => store.setConfirmPassword(e.target.value)}
            style={{ marginTop: 4 }}
          />
          {showConfirmError && <Text type="danger">两次输入的密码不一致</Text>}
        </div>
      </>
    );
  };

  // 启动流程中不允许取消，必须完成导入才能进入主界面
  const stepFooter: JSX.Element[] =
    store.step === 1
      ? [
          ...(store.startup
            ? []
            : [
                <Button key="cancel" onClick={() => store.close()}>
                  取消
                </Button>,
              ]),
          <Button
            key="next"
            type="primary"
            loading={store.checking}
            disabled={!store.countOk || store.checking}
            onClick={() => void store.goSetPassword()}
          >
            下一步
          </Button>,
        ]
      : [
          <Button key="back" onClick={() => store.backToPhrase()} disabled={store.loading}>
            上一步
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={store.loading}
            disabled={!store.canSubmit || store.loading}
            onClick={handleSubmit}
          >
            确认导入
          </Button>,
        ];

  return (
    <Modal
      open={store.visible}
      title={store.step === 1 ? '导入助记词 · 输入助记词' : '导入助记词 · 设置密码'}
      width={560}
      maskClosable={false}
      closable={!store.startup}
      keyboard={!store.startup}
      onCancel={() => {
        if (!store.startup) store.close();
      }}
      footer={stepFooter}
    >
      {store.error && (
        <Alert type="error" showIcon message={store.error} style={{ marginBottom: 16 }} />
      )}
      {store.step === 1 ? renderPhraseStep() : renderPasswordStep()}
    </Modal>
  );
});

export default ImportWalletModal;
