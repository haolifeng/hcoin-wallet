import { Alert, Button, Divider, Modal, Segmented, Space, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { settingsStore } from '../stores/SettingsStore';
import { networkStore } from '../stores/NetworkStore';
import { localeStore } from '../stores/LocaleStore';
import { NETWORK_OPTIONS, type NetworkType } from '../constants/network';
import { LOCALE_LABEL_KEY, LOCALE_OPTIONS } from '../constants/locale';
import { useT } from '../i18n/I18nProvider';
import type { Locale } from '../i18n/messages';

const { Text } = Typography;

/** 设置弹窗：语言切换（中文 / English）+ 网络环境（主网 / 测试网）+ 功能入口 */
const SettingsModal = observer(() => {
  const store = settingsStore;
  const t = useT();
  const network = networkStore.network;
  const locale = localeStore.locale;

  const handleNotImplemented = (name: string) => {
    message.info(t('settings.notImplemented', { name }));
  };

  /** 切换到主网前二次确认：主网使用真实资金，交易不可撤销 */
  const handleNetworkChange = async (value: NetworkType) => {
    if (value === network || networkStore.switching) return;

    const apply = async () => {
      try {
        await networkStore.setNetwork(value);
        message.success(t('network.switched', { label: networkStore.label }));
      } catch (err) {
        message.error(err instanceof Error ? err.message : t('network.switchFailed'));
      }
    };

    if (value === 'mainnet') {
      Modal.confirm({
        title: t('network.switchTitle'),
        content: t('network.switchContent'),
        okText: t('network.confirmSwitch'),
        cancelText: t('common.cancel'),
        onOk: apply,
      });
      return;
    }
    void apply();
  };

  /** 切换语言：立即生效（整体文案随 LocaleStore 重建） */
  const handleLocaleChange = (value: Locale) => {
    if (value === locale) return;
    void localeStore.setLocale(value).then(() => {
      // 提示语用切换后的语言（此刻组件的 t 仍绑定旧语言）
      message.success(
        localeStore.t('locale.switched', { label: localeStore.t(LOCALE_LABEL_KEY[value]) }),
      );
    });
  };

  return (
    <Modal
      open={store.settingsVisible}
      title={t('settings.title')}
      width={360}
      maskClosable={false}
      onCancel={() => store.closeSettings()}
      footer={[
        <Button key="close" onClick={() => store.closeSettings()}>
          {t('common.close')}
        </Button>,
      ]}
    >
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        <div>
          <Text strong>{t('locale.language')}</Text>
          <div style={{ marginTop: 8 }}>
            <Segmented
              block
              value={locale}
              options={LOCALE_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onChange={(value) => handleLocaleChange(value as Locale)}
            />
          </div>
        </div>

        <div>
          <Text strong>{t('network.env')}</Text>
          <div style={{ marginTop: 8 }}>
            <Segmented
              block
              value={network}
              disabled={networkStore.switching}
              options={NETWORK_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              }))}
              onChange={(value) => void handleNetworkChange(value as NetworkType)}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t(NETWORK_OPTIONS.find((o) => o.value === network)?.descKey ?? 'network.testnetDesc')}
            </Text>
          </div>
        </div>

        {networkStore.isMainnet && (
          <Alert
            type="warning"
            showIcon
            message={t('network.currentMainnet')}
            description={t('network.mainnetWarning')}
          />
        )}

        <Divider style={{ margin: '4px 0' }} />

        <Button block type="primary" onClick={() => void store.openBackup()}>
          {t('settings.backup')}
        </Button>
        <Button block onClick={() => handleNotImplemented(t('settings.about'))}>
          {t('settings.about')}
        </Button>
      </Space>
    </Modal>
  );
});

export default SettingsModal;
