import { Alert, Button, Input, Modal, Result, Select, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { sendStore } from '../stores/SendStore';
import { networkStore } from '../stores/NetworkStore';
import {
  buildAssetValue,
  buildExplorerTxUrl,
  getSendAssetOptions,
} from '../constants/chains';
import { useT } from '../i18n/I18nProvider';

const { Text } = Typography;

/** 发送 ETH / AVAX / BTC / USDT / USDC 弹窗（支持多链，按当前网络环境发送） */
const SendModal = observer(() => {
  const store = sendStore;
  const t = useT();

  const currentChain = store.currentChain;
  const isBtc = currentChain?.kind === 'bitcoin';
  const isSol = currentChain?.kind === 'solana';
  const isMainnet = networkStore.isMainnet;

  // 锁定时只保留当前选中的币种，用户无法切换到其它资产
  const selectedAssetValue = buildAssetValue(store.chain, store.asset);
  const assetOptions = store.lockAsset
    ? getSendAssetOptions(networkStore.network).filter(
        (option) => option.value === selectedAssetValue,
      )
    : getSendAssetOptions(networkStore.network);

  const handleSubmit = async () => {
    try {
      await store.submit();
      message.success(t('send.submitted'));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('err.sendFailed'));
    }
  };

  const footer = store.txHash
    ? [
        <Button key="close" type="primary" onClick={() => store.close()}>
          {t('common.close')}
        </Button>,
      ]
    : [
        <Button key="cancel" onClick={() => store.close()}>
          {t('common.cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={store.sending}
          disabled={!store.canSubmit || store.sending}
          onClick={handleSubmit}
        >
          {t('send.confirm')}
        </Button>,
      ];

  return (
    <Modal
      open={store.visible}
      title={t('send.title')}
      width={480}
      maskClosable={false}
      onCancel={() => store.close()}
      footer={footer}
    >
      {store.error && (
        <Alert type="error" showIcon message={store.error} style={{ marginBottom: 16 }} />
      )}

      {store.txHash ? (
        <Result
          status="success"
          title={t('send.submitted')}
          subTitle={t('send.broadcast', {
            chain: currentChain?.name ?? '',
            network: networkStore.label,
          })}
          extra={
            <Text copyable={{ text: store.txHash }} style={{ wordBreak: 'break-all' }}>
              {store.txHash}
            </Text>
          }
        >
          {store.txHash && buildExplorerTxUrl(currentChain, store.txHash) && (
            <Button
              type="link"
              href={buildExplorerTxUrl(currentChain, store.txHash)}
              target="_blank"
              rel="noreferrer"
            >
              {t('send.viewExplorer')}
            </Button>
          )}
        </Result>
      ) : (
        <>
          {isMainnet && (
            <Alert
              type="warning"
              showIcon
              message={t('send.mainnetAlertTitle', { symbol: currentChain?.nativeSymbol ?? '' })}
              description={t('send.mainnetAlertDesc')}
              style={{ marginBottom: 16 }}
            />
          )}

          <div style={{ marginBottom: 12 }}>
            <Text strong>{t('common.asset')}</Text>
            <Select
              value={selectedAssetValue}
              onChange={(value: string) => store.setSelection(value)}
              options={assetOptions}
              disabled={store.lockAsset}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong>{t('send.from')}</Text>
            <div style={{ marginTop: 4 }}>
              <Text code copyable={Boolean(store.fromAddress)} style={{ wordBreak: 'break-all' }}>
                {store.fromAddress ?? '—'}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong>{t('send.to')}</Text>
            <Input
              value={store.to}
              placeholder={
                isBtc ? (networkStore.isMainnet ? 'bc1…' : 'tb1…') : isSol ? 'base58…' : '0x…'
              }
              onChange={(e) => store.setTo(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Text strong>{t('send.amount')}</Text>
              <Text type="secondary">
                {t('send.available', {
                  amount: store.available === undefined ? '—' : store.available,
                  asset: store.asset,
                })}
              </Text>
            </div>
            <Input
              value={store.amount}
              placeholder={t('send.amountPlaceholder', { asset: store.asset })}
              onChange={(e) => store.setAmount(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>
        </>
      )}
    </Modal>
  );
});

export default SendModal;
