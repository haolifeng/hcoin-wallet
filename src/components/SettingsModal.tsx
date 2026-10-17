import { Alert, Button, Divider, Modal, Segmented, Space, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';
import { networkStore } from '../stores/NetworkStore';
import { NETWORK_OPTIONS, type NetworkType } from '../constants/network';

const { Text } = Typography;

/** 设置弹窗：网络环境切换（主网 / 测试网）+ 功能入口（备份 / about） */
const SettingsModal = observer(() => {
  const store = settingsStore;
  const network = networkStore.network;

  const handleNotImplemented = (name: string) => {
    message.info(`${name} 功能暂未实现`);
  };

  /** 切换到主网前二次确认：主网使用真实资金，交易不可撤销 */
  const handleNetworkChange = async (value: NetworkType) => {
    if (value === network || networkStore.switching) return;

    const apply = async () => {
      try {
        await networkStore.setNetwork(value);
        message.success(`已切换到${networkStore.label}`);
      } catch (err) {
        message.error(err instanceof Error ? err.message : '切换网络失败');
      }
    };

    if (value === 'mainnet') {
      Modal.confirm({
        title: '切换到主网？',
        content: '主网使用真实资金，交易一旦广播不可撤销。请确认已核对地址与网络。',
        okText: '确认切换',
        cancelText: '取消',
        onOk: apply,
      });
      return;
    }
    void apply();
  };

  return (
    <Modal
      open={store.settingsVisible}
      title="设置"
      width={360}
      maskClosable={false}
      onCancel={() => store.closeSettings()}
      footer={[
        <Button key="close" onClick={() => store.closeSettings()}>
          关闭
        </Button>,
      ]}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Text strong>网络环境</Text>
          <div style={{ marginTop: 8 }}>
            <Segmented
              block
              value={network}
              disabled={networkStore.switching}
              options={NETWORK_OPTIONS.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              onChange={(value) => void handleNetworkChange(value as NetworkType)}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {NETWORK_OPTIONS.find((o) => o.value === network)?.description}
            </Text>
          </div>
        </div>

        {networkStore.isMainnet && (
          <Alert
            type="warning"
            showIcon
            message="当前为主网"
            description="所有转账使用真实资金，且不可撤销。"
          />
        )}

        <Divider style={{ margin: '4px 0' }} />

        <Button block type="primary" onClick={() => void store.openBackup()}>
          备份
        </Button>
        <Button block onClick={() => handleNotImplemented('about')}>
          about
        </Button>
      </Space>
    </Modal>
  );
});

export default SettingsModal;
