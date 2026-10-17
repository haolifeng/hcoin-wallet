import { Alert, Button, Input, Modal, Result, Select, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { sendStore } from '../stores/SendStore';
import { networkStore } from '../stores/NetworkStore';
import {
  buildAssetValue,
  buildExplorerTxUrl,
  getSendAssetOptions,
} from '../constants/chains';

const { Text } = Typography;

/** 发送 ETH / AVAX / BTC / USDT / USDC 弹窗（支持多链，按当前网络环境发送） */
const SendModal = observer(() => {
  const store = sendStore;

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
      message.success('交易已提交');
    } catch (err) {
      message.error(err instanceof Error ? err.message : '发送失败');
    }
  };

  const footer = store.txHash
    ? [
        <Button key="close" type="primary" onClick={() => store.close()}>
          关闭
        </Button>,
      ]
    : [
        <Button key="cancel" onClick={() => store.close()}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={store.sending}
          disabled={!store.canSubmit || store.sending}
          onClick={handleSubmit}
        >
          确认发送
        </Button>,
      ];

  return (
    <Modal
      open={store.visible}
      title="发送"
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
          title="交易已提交"
          subTitle={`交易已广播到 ${currentChain?.name ?? ''}${isMainnet ? ' 主网' : ' 测试网'}，等待打包确认。`}
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
              在区块浏览器中查看
            </Button>
          )}
        </Result>
      ) : (
        <>
          {isMainnet && (
            <Alert
              type="warning"
              showIcon
              message={`${currentChain?.nativeSymbol ?? ''} 为主网，使用真实资金`}
              description="交易一旦广播不可撤销，请务必核对接收地址与数量。"
              style={{ marginBottom: 16 }}
            />
          )}

          <div style={{ marginBottom: 12 }}>
            <Text strong>资产</Text>
            <Select
              value={selectedAssetValue}
              onChange={(value: string) => store.setSelection(value)}
              options={assetOptions}
              disabled={store.lockAsset}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong>发送方（From）</Text>
            <div style={{ marginTop: 4 }}>
              <Text code copyable={Boolean(store.fromAddress)} style={{ wordBreak: 'break-all' }}>
                {store.fromAddress ?? '—'}
              </Text>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong>接收地址</Text>
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
              <Text strong>数量</Text>
              <Text type="secondary">
                可用：{store.available === undefined ? '—' : store.available} {store.asset}
              </Text>
            </div>
            <Input
              value={store.amount}
              placeholder={`请输入发送的 ${store.asset} 数量`}
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
