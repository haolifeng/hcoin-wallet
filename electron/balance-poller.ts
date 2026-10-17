import {
  fetchEthBalance,
  fetchTokenBalance,
  SUPPORTED_TOKENS,
  ETH_TESTNET_NAME,
} from './eth';
import { listAccounts, setEthBalance, setTokenBalances } from './db';

/** 后台轮询间隔（毫秒）：15s 查一次测试网并写库 */
const POLL_INTERVAL_MS = 15_000;

let timer: ReturnType<typeof setInterval> | null = null;
/** 防止上一轮尚未结束又启动下一轮（RPC 较慢时可能出现） */
let polling = false;

/**
 * 执行一轮轮询：遍历所有已派生 ETH 地址的账户，
 * 查询其在本测试网（Sepolia）上的 ETH 与 ERC-20（USDT / USDC）余额并写入数据库，
 * 供渲染进程查询展示。
 */
export async function pollEthBalancesOnce(): Promise<void> {
  if (polling) return;
  polling = true;
  try {
    const accounts = (await listAccounts()).filter(
      (a): a is typeof a & { ethAddress: string } => Boolean(a.ethAddress),
    );
    await Promise.all(
      accounts.map(async (account) => {
        // 并行查询 ETH 与所有代币余额；单个失败不影响其它
        const results = await Promise.allSettled([
          fetchEthBalance(account.ethAddress),
          ...SUPPORTED_TOKENS.map((token) => fetchTokenBalance(account.ethAddress, token)),
        ]);

        const [ethResult, ...tokenResults] = results;

        if (ethResult.status === 'fulfilled') {
          await setEthBalance(account.address, ethResult.value).catch((err) =>
            console.error(`[balance] 写入 ${account.address} ETH 余额失败:`, err),
          );
        } else {
          console.error(`[balance] 查询 ${account.ethAddress} ETH 余额失败:`, ethResult.reason);
        }

        const tokenBalances: Record<string, number> = {};
        tokenResults.forEach((result, index) => {
          const token = SUPPORTED_TOKENS[index];
          if (result.status === 'fulfilled') {
            tokenBalances[token.symbol] = result.value;
          } else {
            console.error(
              `[balance] 查询 ${account.ethAddress} ${token.symbol} 余额失败:`,
              result.reason,
            );
          }
        });

        if (Object.keys(tokenBalances).length > 0) {
          await setTokenBalances(account.address, tokenBalances).catch((err) =>
            console.error(`[balance] 写入 ${account.address} 代币余额失败:`, err),
          );
        }
      }),
    );
  } catch (err) {
    console.error('[balance] 轮询余额失败:', err);
  } finally {
    polling = false;
  }
}

/** 启动后台轮询（立即执行一次，之后按固定间隔执行） */
export function startEthBalancePolling(): void {
  if (timer) return;
  console.log(`[balance] 启动余额轮询（${ETH_TESTNET_NAME} 测试网 · ETH/USDT/USDC）`);
  void pollEthBalancesOnce();
  timer = setInterval(() => {
    void pollEthBalancesOnce();
  }, POLL_INTERVAL_MS);
}

/** 停止后台轮询（应用退出时调用，释放定时器） */
export function stopEthBalancePolling(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
