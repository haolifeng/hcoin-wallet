/** 账户地址去掉项目前缀 "HC"（HC0xABCD1234 → 0xABCD1234） */
export function stripHcPrefix(address: string): string {
  return address.startsWith('HC') ? address.slice(2) : address;
}

/**
 * 账户地址显示：先去 "HC" 前缀，再缩略为 前 4 位 + 3 个点 + 后 4 位。
 * 例如 HC0xABCD1234 → 0xAB...1234；过短（≤ 8 位）时原样返回。
 */
export function formatAccountAddress(address: string): string {
  const normalized = stripHcPrefix(address);
  if (!normalized || normalized.length <= 8) return normalized;
  return `${normalized.slice(0, 4)}...${normalized.slice(-4)}`;
}
