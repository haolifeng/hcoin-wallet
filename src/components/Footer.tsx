/**
 * Footer 内容：居中显示版权 / 说明文字。
 * 高度由外层 Layout.Footer 固定为 50px。
 */
export default function Footer() {
  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      © 2026 HCoinWallet · v0.0.1
    </div>
  );
}