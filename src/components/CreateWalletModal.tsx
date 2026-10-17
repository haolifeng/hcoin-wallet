import { Alert, Button, Col, Input, Modal, Row, Spin, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { createWalletStore } from '../stores/CreateWalletStore';
import { startupStore } from '../stores/StartupStore';
import { useT } from '../i18n/I18nProvider';
import type { MessageKey } from '../i18n/messages';

const { Text, Paragraph } = Typography;

/** 三步向导的标题文案 key，随语言切换 */
const STEP_TITLE_KEYS: MessageKey[] = [
  'create.stepMnemonic',
  'create.stepVerify',
  'create.stepPassword',
];

const CreateWalletModal = observer(() => {
  const store = createWalletStore;
  const t = useT();

  const handleSubmit = async () => {
    try {
      const result = await store.submit();
      message.success(t('create.success', { address: result.ethAddress }));
      // 记录当前账户（启动流程中还会由此放行进入主界面）
      startupStore.markCreated(result);
      store.close();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('err.createFailed'));
    }
  };

  /** 第一步：展示 12 个助记词（按钮形式）+ 保存提示 */
  const renderMnemonicStep = () => (
    <>
      {store.startup && (
        <Alert
          type="info"
          showIcon
          message={t('startup.welcome')}
          description={t('create.welcomeDesc')}
          style={{ marginBottom: 16 }}
        />
      )}
      <Alert
        type="warning"
        showIcon
        message={t('create.saveTitle')}
        description={t('create.saveDesc')}
        style={{ marginBottom: 16 }}
      />
      <Spin spinning={store.loading}>
        <Row gutter={[8, 8]}>
          {store.mnemonic.map((word, index) => (
            <Col span={8} key={`${word}-${index}`}>
              <Button block style={{ textAlign: 'left' }}>
                {`${index + 1}. ${word}`}
              </Button>
            </Col>
          ))}
        </Row>
      </Spin>
      {store.mnemonic.length === 0 && !store.loading && (
        <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          {t('create.emptyMnemonic')}
        </Paragraph>
      )}
    </>
  );

  /** 第二步：随机 4 个序号，手动回填对应单词 */
  const renderVerifyStep = () => (
    <>
      <Alert
        type="info"
        showIcon
        message={t('create.verifyTitle')}
        description={t('create.verifyDesc')}
        style={{ marginBottom: 16 }}
      />
      {store.verifyIndexes.map((wordIndex, i) => {
        const value = store.verifyInputs[i] ?? '';
        const filled = value.trim().length > 0;
        const wrong = filled && !store.isVerifyCorrect(i);
        return (
          <div key={wordIndex} style={{ marginBottom: 12 }}>
            <Text strong>{t('create.wordIndex', { index: wordIndex + 1 })}</Text>
            <Input
              value={value}
              placeholder={t('create.wordPlaceholder')}
              status={wrong ? 'error' : undefined}
              onChange={(e) => store.setVerifyInput(i, e.target.value)}
              style={{ marginTop: 4 }}
            />
            {wrong && <Text type="danger">{t('create.wordWrong')}</Text>}
          </div>
        );
      })}
    </>
  );

  /** 第三步：设置密码 */
  const renderPasswordStep = () => {
    const confirmFilled = store.confirmPassword.length > 0;
    const showConfirmError = confirmFilled && !store.passwordMatched;
    return (
      <>
        <Alert
          type="info"
          showIcon
          message={t('create.setPasswordTitle')}
          description={t('create.setPasswordDesc')}
          style={{ marginBottom: 16 }}
        />
        <div style={{ marginBottom: 12 }}>
          <Text strong>{t('common.password')}</Text>
          <Input.Password
            value={store.password}
            placeholder={t('common.passwordPlaceholder')}
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
              {t('password.valid')}
            </Text>
          )}
        </div>
        <div>
          <Text strong>{t('common.confirmPassword')}</Text>
          <Input.Password
            value={store.confirmPassword}
            placeholder={t('common.confirmPasswordPlaceholder')}
            status={showConfirmError ? 'error' : undefined}
            onChange={(e) => store.setConfirmPassword(e.target.value)}
            style={{ marginTop: 4 }}
          />
          {showConfirmError && <Text type="danger">{t('password.mismatch')}</Text>}
        </div>
      </>
    );
  };

  const footers: Record<number, JSX.Element> = {
    1: (
      <>
        {/* 注意：mobx 的 makeAutoObservable 不会绑定原型方法，必须用箭头函数包裹调用 */}
        {/* 启动流程中不允许取消，用户必须完成创建才能进入主界面 */}
        {!store.startup && <Button onClick={() => store.close()}>{t('common.cancel')}</Button>}
        <Button
          type="primary"
          disabled={store.mnemonic.length === 0 || store.loading}
          onClick={() => store.goVerify()}
        >
          {t('common.continue')}
        </Button>
      </>
    ),
    2: (
      <>
        <Button onClick={() => store.backToMnemonic()}>{t('common.back')}</Button>
        <Button
          type="primary"
          disabled={!store.verifyPassed}
          onClick={() => store.goSetPassword()}
        >
          {t('common.next')}
        </Button>
      </>
    ),
    3: (
      <>
        <Button onClick={() => store.backToVerify()} disabled={store.loading}>
          {t('common.back')}
        </Button>
        <Button
          type="primary"
          loading={store.loading}
          disabled={!store.canSubmit || store.loading}
          onClick={handleSubmit}
        >
          {t('create.confirm')}
        </Button>
      </>
    ),
  };

  return (
    <Modal
      open={store.visible}
      title={t('create.title', { step: t(STEP_TITLE_KEYS[store.step - 1]) })}
      width={560}
      maskClosable={false}
      closable={!store.startup}
      keyboard={!store.startup}
      onCancel={() => {
        if (!store.startup) store.close();
      }}
      footer={footers[store.step]}
    >
      {store.error && (
        <Alert type="error" showIcon message={store.error} style={{ marginBottom: 16 }} />
      )}
      {store.step === 1 && renderMnemonicStep()}
      {store.step === 2 && renderVerifyStep()}
      {store.step === 3 && renderPasswordStep()}
    </Modal>
  );
});

export default CreateWalletModal;
