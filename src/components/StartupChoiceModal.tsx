import { Button, Modal, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';

const { Paragraph } = Typography;

/**
 * 启动选择弹窗：本机尚无助记词时，让用户选择
 * 「创建新的助记词」或「导入已有助记词」。
 */
const StartupChoiceModal = observer(() => {
  return (
    <Modal
      open={startupStore.phase === 'choose'}
      title="欢迎使用 HCoinWallet"
      width={420}
      maskClosable={false}
      closable={false}
      keyboard={false}
      footer={null}
    >
      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
        本机尚未检测到助记词，请选择一种方式开始：
      </Paragraph>
      <Button
        block
        type="primary"
        size="large"
        style={{ marginBottom: 12 }}
        onClick={() => void startupStore.chooseCreate()}
      >
        创建新的助记词
      </Button>
      <Button block size="large" onClick={() => void startupStore.chooseImport()}>
        导入已有助记词
      </Button>
    </Modal>
  );
});

export default StartupChoiceModal;
