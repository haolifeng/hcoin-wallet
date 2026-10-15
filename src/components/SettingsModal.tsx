import { Button, Modal, Space, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';

/** 设置弹窗：纵向排列的功能入口（备份 / Network / about） */
const SettingsModal = observer(() => {
  const store = settingsStore;

  const handleNotImplemented = (name: string) => {
    message.info(`${name} 功能暂未实现`);
  };

  return (
    <Modal
      open={store.settingsVisible}
      title="设置"
      width={320}
      maskClosable={false}
      onCancel={() => store.closeSettings()}
      footer={[
        <Button key="close" onClick={() => store.closeSettings()}>
          关闭
        </Button>,
      ]}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <Button block type="primary" onClick={() => void store.openBackup()}>
          备份
        </Button>
        <Button block onClick={() => handleNotImplemented('Network')}>
          Network
        </Button>
        <Button block onClick={() => handleNotImplemented('about')}>
          about
        </Button>
      </Space>
    </Modal>
  );
});

export default SettingsModal;
