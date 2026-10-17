import {
  SUPPORTED_CHAINS,
  fetchNativeBalance,
  fetchChainTokenBalance,
} from './chains';
import { fetchBtcBalance } from './bitcoin';
import { fetchSolBalance } from './solana';
import { listAccounts, setChainNativeBalance, setChainTokenBalances } from './db';

/** 后台轮询间隔（毫秒）：15s 查一次各测试网并写库 */
const POLL_INTERVAL_MS = 15_000;

let timer: ReturnType<typeof setInterval> | null = null;
/** 防止上一轮尚未结束又启动下一轮（RPC 较慢时可能出现） */
let polling = false;

/**
 * 执行一轮轮询：遍历所有账户，逐条链查询余额并写入数据库，供渲染进程查询展示。
 * - EVM 链（ETH / AVAX）：用 EVM 通用地址查询原生代币与 ERC-20 余额
 * - BTC 链：用独立 BIP84 地址查询原生 BTC 余额
 * 缺少对应地址的链会跳过；单条链失败不影响其它。
 */
export async function pollEthBalancesOnce(): Promise<void> {
  if (polling) return;
  polling = true;
  try {
    const accounts = await listAccounts();
    await Promise.all(
      accounts.map(async (account) => {
        await Promise.all(
          SUPPORTED_CHAINS.map(async (chain) => {
            if (chain.kind === 'bitcoin') {
              const address = account.btcAddress;
              if (!address) return;
              try {
                const balance = await fetchBtcBalance(address);
                await setChainNativeBalance(account.address, chain.key, balance);
              } catch (err) {
                console.error(
                  `[balance] 查询/写入 ${address} ${chain.nativeSymbol} 余额失败:`,
                  err,
                );
              }
              return;
            }

            if (chain.kind === 'solana') {
              const address = account.solAddress;
              if (!address) return;
              try {
                const balance = await fetchSolBalance(address);
                await setChainNativeBalance(account.address, chain.key, balance);
              } catch (err) {
                console.error(
                  `[balance] 查询/写入 ${address} ${chain.nativeSymbol} 余额失败:`,
                  err,
                );
              }
              return;
            }

            const address = account.ethAddress;
            if (!address) return;

            // 并行查询该链的原生代币与所有代币余额；单个失败不影响其它
            const results = await Promise.allSettled([
              fetchNativeBalance(chain.key, address),
              ...chain.tokens.map((token) =>
                fetchChainTokenBalance(chain.key, address, token.symbol),
              ),
            ]);

            const [nativeResult, ...tokenResults] = results;

            if (nativeResult.status === 'fulfilled') {
              await setChainNativeBalance(
                account.address,
                chain.key,
                nativeResult.value,
              ).catch((err) =>
                console.error(
                  `[balance] 写入 ${account.address} ${chain.nativeSymbol} 余额失败:`,
                  err,
                ),
              );
            } else {
              console.error(
                `[balance] 查询 ${address} ${chain.nativeSymbol} 余额失败:`,
                nativeResult.reason,
              );
            }

            const tokenBalances: Record<string, number> = {};
            tokenResults.forEach((result, index) => {
              const token = chain.tokens[index];
              if (result.status === 'fulfilled') {
                tokenBalances[token.symbol] = result.value;
              } else {
                console.error(
                  `[balance] 查询 ${address} ${chain.name}/${token.symbol} 余额失败:`,
                  result.reason,
                );
              }
            });

            if (Object.keys(tokenBalances).length > 0) {
              await setChainTokenBalances(account.address, chain.key, tokenBalances).catch((err) =>
                console.error(
                  `[balance] 写入 ${account.address} ${chain.name} 代币余额失败:`,
                  err,
                ),
              );
            }
          }),
        );
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
  const summary = SUPPORTED_CHAINS.map(
    (c) => `${c.nativeSymbol}/${c.tokens.map((t) => t.symbol).join('/')}（${c.name}）`,
  ).join('、');
  console.log(`[balance] 启动余额轮询：${summary}`);
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
