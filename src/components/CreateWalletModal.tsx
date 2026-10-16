import { Alert, Button, Col, Input, Modal, Row, Spin, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { createWalletStore } from '../stores/CreateWalletStore';
import { startupStore } from '../stores/StartupStore';

const { Text, Paragraph } = Typography;

const STEP_TITLES = ['生成助记词', '校验助记词', '设置密码'];

const CreateWalletModal = observer(() => {
  const store = createWalletStore;

  const handleSubmit = async () => {
    try {
      const result = await store.submit();
      message.success(`账户创建成功，ETH 账户：${result.ethAddress}`);
      // 记录当前账户（启动流程中还会由此放行进入主界面）
      startupStore.markCreated(result);
      store.close();
    } catch (err) {
      message.error(err instanceof Error ? err.message : '创建账户失败');
    }
  };

  /** 第一步：展示 12 个助记词（按钮形式）+ 保存提示 */
  const renderMnemonicStep = () => (
    <>
      {store.startup && (
        <Alert
          type="info"
          showIcon
          message="欢迎使用 HCoinWallet"
          description="本机尚未创建助记词，请先完成下方步骤创建钱包。助记词将加密保存在本机数据库中。"
          style={{ marginBottom: 16 }}
        />
      )}
      <Alert
        type="warning"
        showIcon
        message="请您保存好助记词"
        description="助记词是恢复该账户的唯一凭证。请按顺序抄写并离线保管，切勿截图或通过网络发送；一旦丢失将无法找回。"
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
          暂无助记词，请稍候或重新打开弹窗。
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
        message="请回填对应序号的助记词"
        description="为确保您已备份助记词，请按顺序输入下列序号对应的单词。"
        style={{ marginBottom: 16 }}
      />
      {store.verifyIndexes.map((wordIndex, i) => {
        const value = store.verifyInputs[i] ?? '';
        const filled = value.trim().length > 0;
        const wrong = filled && !store.isVerifyCorrect(i);
        return (
          <div key={wordIndex} style={{ marginBottom: 12 }}>
            <Text strong>第 {wordIndex + 1} 个助记词</Text>
            <Input
              value={value}
              placeholder="请输入对应单词"
              status={wrong ? 'error' : undefined}
              onChange={(e) => store.setVerifyInput(i, e.target.value)}
              style={{ marginTop: 4 }}
            />
            {wrong && <Text type="danger">单词不正确，请核对后重试</Text>}
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
          message="请设置账户密码"
          description="密码用于加密保存助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。"
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

  const footers: Record<number, JSX.Element> = {
    1: (
      <>
        {/* 注意：mobx 的 makeAutoObservable 不会绑定原型方法，必须用箭头函数包裹调用 */}
        {/* 启动流程中不允许取消，用户必须完成创建才能进入主界面 */}
        {!store.startup && <Button onClick={() => store.close()}>取消</Button>}
        <Button
          type="primary"
          disabled={store.mnemonic.length === 0 || store.loading}
          onClick={() => store.goVerify()}
        >
          继续
        </Button>
      </>
    ),
    2: (
      <>
        <Button onClick={() => store.backToMnemonic()}>上一步</Button>
        <Button
          type="primary"
          disabled={!store.verifyPassed}
          onClick={() => store.goSetPassword()}
        >
          下一步
        </Button>
      </>
    ),
    3: (
      <>
        <Button onClick={() => store.backToVerify()} disabled={store.loading}>
          上一步
        </Button>
        <Button
          type="primary"
          loading={store.loading}
          disabled={!store.canSubmit || store.loading}
          onClick={handleSubmit}
        >
          确认创建
        </Button>
      </>
    ),
  };

  return (
    <Modal
      open={store.visible}
      title={`创建钱包 · ${STEP_TITLES[store.step - 1]}`}
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
