import { HDNodeWallet, Mnemonic } from 'ethers';

/** BIP44 标准 ETH 派生路径（与 MetaMask 等主流钱包一致） */
export const ETH_DERIVE_PATH = "m/44'/60'/0'/0/0";

export interface EthAccount {
  /** EIP-55 校验和地址，如 0xAbC… */
  address: string;
  /** 压缩公钥（十六进制） */
  publicKey: string;
  /** 派生路径 */
  path: string;
  /**
   * 私钥仅存在于主进程内存中，绝不落盘、绝不通过 IPC 回传渲染进程。
   * 后续若需签名，应在主进程内重新派生使用。
   */
  privateKey: string;
}

/**
 * 由 BIP39 助记词派生 ETH 账户。
 * 解密后的明文助记词只在主进程内短暂存在，派生完成即随函数返回被回收。
 */
export function deriveEthAccount(mnemonic: string): EthAccount {
  const phrase = mnemonic.trim().toLowerCase();
  if (!Mnemonic.isValidMnemonic(phrase)) {
    throw new Error('助记词不合法，无法派生 ETH 账户');
  }

  const wallet = HDNodeWallet.fromPhrase(phrase, undefined, ETH_DERIVE_PATH);
  return {
    address: wallet.address,
    publicKey: wallet.publicKey,
    path: ETH_DERIVE_PATH,
    privateKey: wallet.privateKey,
  };
}
