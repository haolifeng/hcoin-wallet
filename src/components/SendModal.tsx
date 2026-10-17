import { Alert, Button, Input, Modal, Result, Select, Typography, message } from 'antd';
import { observer } from 'mobx-react-lite';
import { sendStore } from '../stores/SendStore';
import type { SendAsset } from '../types/global';

const { Text } = Typography;

const ASSET_OPTIONS: { value: SendAsset; label: string }[] = [
  { value: 'ETH', label: 'ETH' },
  { value: 'USDT', label: 'USDT' },
  { value: 'USDC', label: 'USDC' },
];

/** 测试网区块浏览器地址（Sepolia） */
const EXPLORER_TX_URL = 'https://sepolia.etherscan.io/tx/';

/** 发送 ETH / USDT / USDC 弹窗 */
const SendModal = observer(() => {
  const store = sendStore;

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
          subTitle="交易已广播到 Sepolia 测试网，等待打包确认。"
          extra={
            <Text copyable={{ text: store.txHash }} style={{ wordBreak: 'break-all' }}>
              {store.txHash}
            </Text>
          }
        >
          <Button
            type="link"
            href={`${EXPLORER_TX_URL}${store.txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            在区块浏览器中查看
          </Button>
        </Result>
      ) : (
        <>
          <div style={{ marginBottom: 12 }}>
            <Text strong>资产</Text>
            <Select
              value={store.asset}
              onChange={(value: SendAsset) => store.setAsset(value)}
              options={ASSET_OPTIONS}
              style={{ width: '100%', marginTop: 4 }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Text strong>接收地址</Text>
            <Input
              value={store.to}
              placeholder="0x…"
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
