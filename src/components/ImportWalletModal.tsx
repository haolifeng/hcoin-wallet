import { Alert, Button, Input, Modal, Tag, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { importWalletStore } from '../stores/ImportWalletStore';
import { startupStore } from '../stores/StartupStore';
import { useT } from '../i18n/I18nProvider';

const { Text, Paragraph } = Typography;

const WORD_COUNT = 12;

/** 导入助记词：输入已有 12 词 → 设置密码 → 加密存入数据库并派生 ETH 账户 */
const ImportWalletModal = observer(() => {
  const store = importWalletStore;
  const t = useT();

  const handleSubmit = async () => {
    try {
      const result = await store.submit();
      message.success(t('import.success', { address: result.ethAddress }));
      // 记录当前账户（启动流程中还会由此放行进入主界面）
      startupStore.markCreated(result);
      store.close();
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('err.importFailed'));
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
          message={t('import.enterPhraseTitle')}
          description={t('import.enterPhraseDesc')}
          style={{ marginBottom: 16 }}
        />
        <Text strong>{t('import.mnemonic')}</Text>
        <Input.TextArea
          value={store.phrase}
          rows={4}
          placeholder={t('import.phrasePlaceholder')}
          onChange={(e) => store.setPhrase(e.target.value)}
          style={{ marginTop: 4 }}
        />
        <div style={{ marginTop: 8 }}>
          <Text type={store.countOk ? 'success' : 'secondary'}>
            {t('import.wordCount', { current: words.length, total: WORD_COUNT })}
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
            {t('import.countError', { total: WORD_COUNT })}
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
          message={t('create.setPasswordTitle')}
          description={t('import.setPasswordDesc')}
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

  // 启动流程中不允许取消，必须完成导入才能进入主界面
  const stepFooter: JSX.Element[] =
    store.step === 1
      ? [
          ...(store.startup
            ? []
            : [
                <Button key="cancel" onClick={() => store.close()}>
                  {t('common.cancel')}
                </Button>,
              ]),
          <Button
            key="next"
            type="primary"
            loading={store.checking}
            disabled={!store.countOk || store.checking}
            onClick={() => void store.goSetPassword()}
          >
            {t('common.next')}
          </Button>,
        ]
      : [
          <Button key="back" onClick={() => store.backToPhrase()} disabled={store.loading}>
            {t('common.back')}
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={store.loading}
            disabled={!store.canSubmit || store.loading}
            onClick={handleSubmit}
          >
            {t('import.confirm')}
          </Button>,
        ];

  return (
    <Modal
      open={store.visible}
      title={store.step === 1 ? t('import.titlePhrase') : t('import.titlePassword')}
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
