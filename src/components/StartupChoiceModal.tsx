import { Button, Modal, Typography } from 'antd';
import { observer } from 'mobx-react-lite';
import { startupStore } from '../stores/StartupStore';
import { useT } from '../i18n/I18nProvider';

const { Paragraph } = Typography;

/**
 * 启动选择弹窗：本机尚无助记词时，让用户选择
 * 「创建新的助记词」或「导入已有助记词」。
 */
const StartupChoiceModal = observer(() => {
  const t = useT();

  return (
    <Modal
      open={startupStore.phase === 'choose'}
      title={t('startup.welcome')}
      width={420}
      maskClosable={false}
      closable={false}
      keyboard={false}
      footer={null}
    >
      <Paragraph type="secondary" style={{ marginBottom: 20 }}>
        {t('startup.noMnemonic')}
      </Paragraph>
      <Button
        block
        type="primary"
        size="large"
        style={{ marginBottom: 12 }}
        onClick={() => void startupStore.chooseCreate()}
      >
        {t('startup.createNew')}
      </Button>
      <Button block size="large" onClick={() => void startupStore.chooseImport()}>
        {t('startup.importExisting')}
      </Button>
    </Modal>
  );
});

export default StartupChoiceModal;
