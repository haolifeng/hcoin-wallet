/**
 * 文案字典：渲染进程与主进程共用同一份，避免两处文案漂移。
 * - zh 为基准（`MessageKey` 由其推导）
 * - en 受 `Record<MessageKey, string>` 约束，漏译会在编译期报错
 * 支持 `{name}` 占位参数，由 translate 的第二个入参填充。
 */
export type Locale = 'zh' | 'en';

/** 文案占位参数 */
export type MessageParams = Record<string, string | number>;

/** 默认语言 */
export const DEFAULT_LOCALE: Locale = 'zh';

/** 语言本地缓存键（非 Electron 环境或主进程不可用时的兜底） */
export const LOCALE_STORAGE_KEY = 'hcoin-wallet:locale';

const zh = {
  // —— 通用 ——
  'common.cancel': '取消',
  'common.close': '关闭',
  'common.back': '上一步',
  'common.next': '下一步',
  'common.continue': '继续',
  'common.settings': '设置',
  'common.send': '发送',
  'common.password': '密码',
  'common.confirmPassword': '确认密码',
  'common.passwordPlaceholder': '请输入密码',
  'common.confirmPasswordPlaceholder': '请再次输入密码',
  'common.selectAccount': '选择账户',
  'common.account': '账户',
  'common.asset': '资产',
  'common.balance': '余额',
  'common.priceUsd': '价格（USD）',
  'common.valueUsd': '估值（USD）',
  'common.action': '操作',
  'common.noData': '暂无资产',

  // —— 顶栏 ——
  'header.notLoggedIn': '未登录',

  // —— 左侧菜单 ——
  'menu.overview': '总览',

  // —— 网络环境 ——
  'network.env': '网络环境',
  'network.mainnet': '主网',
  'network.testnet': '测试网',
  'network.mainnetDesc': 'Ethereum / Avalanche / Bitcoin / Solana',
  'network.testnetDesc': 'Sepolia / Fuji / Bitcoin Testnet / Devnet',
  'network.currentMainnet': '当前为主网',
  'network.mainnetWarning': '所有转账使用真实资金，且不可撤销。',
  'network.switchTitle': '切换到主网？',
  'network.switchContent': '主网使用真实资金，交易一旦广播不可撤销。请确认已核对地址与网络。',
  'network.confirmSwitch': '确认切换',
  'network.switched': '已切换到{label}',
  'network.switchFailed': '切换网络失败',

  // —— 语言 ——
  'locale.language': '语言',
  'locale.zh': '中文',
  'locale.en': 'English',
  'locale.switched': '已切换为{label}',

  // —— 设置 ——
  'settings.title': '设置',
  'settings.backup': '备份',
  'settings.about': '关于',
  'settings.notImplemented': '{name} 功能暂未实现',

  // —— 备份 ——
  'backup.title': '备份助记词',
  'backup.confirm': '确认备份',
  'backup.enterPasswordTitle': '请输入该账户的密码',
  'backup.enterPasswordDesc':
    '密码用于解密数据库中保存的助记词密文，验证通过后会显示明文助记词。',
  'backup.noBackable': '暂无可备份的账户，请先创建账户。',
  'backup.noSecret': '（无备份数据）',
  'backup.saveTitle': '请您保存好助记词',
  'backup.saveDesc': '以下是解密后的明文助记词，请勿截图或通过网络发送；关闭弹窗后不会保留。',

  // —— 解锁 ——
  'unlock.title': '解锁钱包',
  'unlock.action': '解锁',
  'unlock.enterPasswordTitle': '请输入该账户的密码',
  'unlock.enterPasswordDesc':
    '密码用于解密本机保存的助记词，验证通过后会派生 ETH 账户并展示在界面上。',
  'unlock.success': '解锁成功，ETH 账户：{address}',

  // —— 启动流程 ——
  'startup.welcome': '欢迎使用 HCoinWallet',
  'startup.noMnemonic': '本机尚未检测到助记词，请选择一种方式开始：',
  'startup.createNew': '创建新的助记词',
  'startup.importExisting': '导入已有助记词',
  'startup.slogan': '安全 · 自托管 · 助记词只保存在本机',
  'startup.status.checking': '正在检查本地钱包数据…',
  'startup.status.choose': '未检测到助记词，请选择创建或导入',
  'startup.status.create': '正在创建新的助记词钱包…',
  'startup.status.import': '正在导入已有助记词…',
  'startup.status.unlock': '已检测到助记词，请输入密码解锁',
  'startup.status.ready': '',

  // —— 创建钱包 ——
  'create.title': '创建钱包 · {step}',
  'create.stepMnemonic': '生成助记词',
  'create.stepVerify': '校验助记词',
  'create.stepPassword': '设置密码',
  'create.welcomeDesc':
    '本机尚未创建助记词，请先完成下方步骤创建钱包。助记词将加密保存在本机数据库中。',
  'create.saveTitle': '请您保存好助记词',
  'create.saveDesc':
    '助记词是恢复该账户的唯一凭证。请按顺序抄写并离线保管，切勿截图或通过网络发送；一旦丢失将无法找回。',
  'create.emptyMnemonic': '暂无助记词，请稍候或重新打开弹窗。',
  'create.verifyTitle': '请回填对应序号的助记词',
  'create.verifyDesc': '为确保您已备份助记词，请按顺序输入下列序号对应的单词。',
  'create.wordIndex': '第 {index} 个助记词',
  'create.wordPlaceholder': '请输入对应单词',
  'create.wordWrong': '单词不正确，请核对后重试',
  'create.setPasswordTitle': '请设置账户密码',
  'create.setPasswordDesc':
    '密码用于加密保存助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。',
  'create.confirm': '确认创建',
  'create.success': '账户创建成功，ETH 账户：{address}',

  // —— 导入钱包 ——
  'import.titlePhrase': '导入助记词 · 输入助记词',
  'import.titlePassword': '导入助记词 · 设置密码',
  'import.enterPhraseTitle': '请输入您的助记词',
  'import.enterPhraseDesc':
    '按原有顺序输入 12 个英文助记词，用空格分隔，也可直接整段粘贴。助记词仅在本机加密保存。',
  'import.mnemonic': '助记词',
  'import.phrasePlaceholder': '例如：apple banana cat ...（共 12 个单词）',
  'import.wordCount': '已输入 {current} / {total} 个',
  'import.countError': '助记词数量应为 {total} 个，请检查后重试。',
  'import.setPasswordDesc':
    '密码用于加密保存导入的助记词，至少 8 位，需包含数字、字母与特殊字符，且至少包含 1 个大写字母和 1 个特殊字符。',
  'import.confirm': '确认导入',
  'import.success': '导入成功，ETH 账户：{address}',

  // —— 密码规则 ——
  'password.minLength': '至少 8 位',
  'password.needDigit': '至少包含一个数字',
  'password.needLetter': '至少包含一个字母',
  'password.needUpper': '至少包含一个大写字母',
  'password.needSpecial': '至少包含一个特殊字符',
  'password.valid': '密码符合要求',
  'password.mismatch': '两次输入的密码不一致',

  // —— 总览 ——
  'overview.chain': '链',
  'overview.totalTitle': '资产总额（USD）',
  'overview.priceSource': '价格来源：CoinGecko · 更新于 {time}',
  'overview.priceFallback': '价格来源：CoinGecko · 暂用兜底价格',

  // —— 单链内容区 ——
  'content.accountTitle': '{symbol} 账户',
  'content.lockedHint': '钱包未解锁，请先解锁后查看 {symbol} 账户信息。',
  'content.addressLabel': '{symbol} 地址',
  'content.network': '网络',
  'content.derivationPath': '派生路径',
  'content.walletAccount': '钱包账户',
  'content.subtotal': '小计（USD）',

  // —— 发送 ——
  'send.title': '发送',
  'send.confirm': '确认发送',
  'send.submitted': '交易已提交',
  'send.broadcast': '交易已广播到 {chain} {network}，等待打包确认。',
  'send.viewExplorer': '在区块浏览器中查看',
  'send.from': '发送方（From）',
  'send.to': '接收地址',
  'send.amount': '数量',
  'send.available': '可用：{amount} {asset}',
  'send.amountPlaceholder': '请输入发送的 {asset} 数量',
  'send.mainnetAlertTitle': '{symbol} 为主网，使用真实资金',
  'send.mainnetAlertDesc': '交易一旦广播不可撤销，请务必核对接收地址与数量。',

  // —— 右侧广告位 ——
  'right.ad': '广告',
  'right.sponsor': 'AD · 赞助商位置',
  'right.ad1Title': 'HCoin 理财',
  'right.ad1Desc': '稳健收益，年化 8%',
  'right.ad2Title': '邀请好友',
  'right.ad2Desc': '双方各得 10 HCoin',
  'right.ad3Title': '安全中心',
  'right.ad3Desc': '开启二次验证',

  // —— 关于（主进程分区数据） ——
  'about.name': '钱包名称',
  'about.network': '网络环境',
  'about.version': '客户端版本',
  'about.storage': '数据存储',
  'about.totalAccounts': '共 {count} 个账户',

  // —— 渲染进程错误提示 ——
  'err.envBackup': '当前环境不支持备份（未检测到 Electron 接口）',
  'err.envUnlock': '当前环境不支持解锁（未检测到 Electron 接口）',
  'err.envSend': '当前环境不支持发送（未检测到 Electron 接口）',
  'err.envCreate': '当前环境不支持创建账户（未检测到 Electron 接口）',
  'err.envImport': '当前环境不支持导入（未检测到 Electron 接口）',
  'err.selectBackupAccount': '请选择要备份的账户',
  'err.selectUnlockAccount': '请选择要解锁的账户',
  'err.enterPassword': '请输入密码',
  'err.backupFailed': '备份失败',
  'err.loadAccountsFailed': '读取账户列表失败',
  'err.unlockFailed': '解锁失败',
  'err.startupCheckFailed': '启动检测失败',
  'err.sendFailed': '发送失败',
  'err.unlockFirst': '请先解锁钱包',
  'err.createFailed': '创建账户失败',
  'err.importFailed': '导入失败',
  'err.mnemonicGenerateFailed': '助记词生成失败',
  'err.passwordInvalid': '密码不符合要求',
  'err.checkPhraseAndPassword': '请检查助记词与密码',
  'err.mnemonicInvalidInput': '助记词不合法，请检查单词拼写与顺序',
  'err.mnemonicCheckFailed': '助记词校验失败',
  'err.wordCountMismatch': '请输入 {total} 个助记词，当前 {current} 个',

  // —— 主进程错误提示 ——
  'err.dbNotReady': '数据库尚未就绪，请稍后重试',
  'err.invalidMnemonic': '助记词不合法',
  'err.deriveMnemonicInvalid': '助记词不合法，无法派生 ETH 账户',
  'err.passwordRequired': '密码不能为空',
  'err.accountExists': '该账户已存在',
  'err.accountNotFound': '账户不存在',
  'err.noSecret': '该账户没有可用于备份的加密助记词',
  'err.wrongPassword': '密码错误，无法解密助记词',
  'err.chainNotSupported': '不支持的链：{key}',
  'err.notEvmChain': '链 {name} 不是 EVM 链',
  'err.tokenNotSupported': '链 {name} 不支持代币：{symbol}',
  'err.assetNotSupported': '链 {name} 不支持资产：{asset}',
  'err.btcDeriveFailed': 'BTC 账户派生失败',
  'err.btcAddressFailed': 'BTC 地址生成失败',
  'err.btcAddressInvalid': '无效的 BTC 收款地址',
  'err.btcApiFailed': 'BTC API 请求失败：{status} {statusText}',
  'err.broadcastFailed': '广播失败：{status} {detail}',
  'err.amountFormat': '发送数量格式不正确',
  'err.amountPositive': '请输入有效的发送数量',
  'err.enterRecipient': '请输入接收地址',
  'err.noUtxo': '可用余额为 0，无法发送',
  'err.insufficient': '余额不足以支付发送数量与手续费',
  'err.solAddressInvalid': '无效的 Solana 收款地址',
  'err.walletLocked': '钱包未解锁，无法发送',
  'err.accountMismatch': '当前解锁账户与发送账户不一致',
};

export type MessageKey = keyof typeof zh;

const en: Record<MessageKey, string> = {
  // —— 通用 ——
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.continue': 'Continue',
  'common.settings': 'Settings',
  'common.send': 'Send',
  'common.password': 'Password',
  'common.confirmPassword': 'Confirm password',
  'common.passwordPlaceholder': 'Enter password',
  'common.confirmPasswordPlaceholder': 'Re-enter password',
  'common.selectAccount': 'Select account',
  'common.account': 'Account',
  'common.asset': 'Asset',
  'common.balance': 'Balance',
  'common.priceUsd': 'Price (USD)',
  'common.valueUsd': 'Value (USD)',
  'common.action': 'Action',
  'common.noData': 'No assets',

  // —— 顶栏 ——
  'header.notLoggedIn': 'Not signed in',

  // —— 左侧菜单 ——
  'menu.overview': 'Overview',

  // —— 网络环境 ——
  'network.env': 'Network',
  'network.mainnet': 'Mainnet',
  'network.testnet': 'Testnet',
  'network.mainnetDesc': 'Ethereum / Avalanche / Bitcoin / Solana',
  'network.testnetDesc': 'Sepolia / Fuji / Bitcoin Testnet / Devnet',
  'network.currentMainnet': 'Currently on mainnet',
  'network.mainnetWarning': 'All transfers use real funds and cannot be reversed.',
  'network.switchTitle': 'Switch to mainnet?',
  'network.switchContent':
    'Mainnet uses real funds and transactions cannot be reversed once broadcast. Please double-check the address and network.',
  'network.confirmSwitch': 'Confirm',
  'network.switched': 'Switched to {label}',
  'network.switchFailed': 'Failed to switch network',

  // —— 语言 ——
  'locale.language': 'Language',
  'locale.zh': '中文',
  'locale.en': 'English',
  'locale.switched': 'Language switched to {label}',

  // —— 设置 ——
  'settings.title': 'Settings',
  'settings.backup': 'Backup',
  'settings.about': 'About',
  'settings.notImplemented': '{name} is not available yet',

  // —— 备份 ——
  'backup.title': 'Back up recovery phrase',
  'backup.confirm': 'Confirm',
  'backup.enterPasswordTitle': 'Enter the password for this account',
  'backup.enterPasswordDesc':
    'The password decrypts the recovery phrase stored locally. The phrase will be shown once it checks out.',
  'backup.noBackable': 'No account available for backup. Please create one first.',
  'backup.noSecret': '(no backup data)',
  'backup.saveTitle': 'Keep your recovery phrase safe',
  'backup.saveDesc':
    'This is the decrypted recovery phrase. Do not screenshot it or send it online; it is cleared when this dialog closes.',

  // —— 解锁 ——
  'unlock.title': 'Unlock wallet',
  'unlock.action': 'Unlock',
  'unlock.enterPasswordTitle': 'Enter the password for this account',
  'unlock.enterPasswordDesc':
    'The password decrypts the locally stored recovery phrase, after which the ETH account is derived and shown.',
  'unlock.success': 'Unlocked. ETH account: {address}',

  // —— 启动流程 ——
  'startup.welcome': 'Welcome to HCoinWallet',
  'startup.noMnemonic': 'No recovery phrase found on this device. Choose how to start:',
  'startup.createNew': 'Create a new recovery phrase',
  'startup.importExisting': 'Import an existing recovery phrase',
  'startup.slogan': 'Secure · Self-custody · Seed phrase stays on this device',
  'startup.status.checking': 'Checking local wallet data…',
  'startup.status.choose': 'No recovery phrase found, please create or import one',
  'startup.status.create': 'Creating a new wallet…',
  'startup.status.import': 'Importing your recovery phrase…',
  'startup.status.unlock': 'Recovery phrase found, please enter your password',
  'startup.status.ready': '',

  // —— 创建钱包 ——
  'create.title': 'Create wallet · {step}',
  'create.stepMnemonic': 'Generate phrase',
  'create.stepVerify': 'Verify phrase',
  'create.stepPassword': 'Set password',
  'create.welcomeDesc':
    'No recovery phrase exists on this device yet. Finish the steps below to create a wallet; the phrase is encrypted and stored locally.',
  'create.saveTitle': 'Keep your recovery phrase safe',
  'create.saveDesc':
    'The phrase is the only way to recover this account. Write it down in order and store it offline. Never screenshot it or send it online — once lost, it cannot be recovered.',
  'create.emptyMnemonic': 'No phrase yet, please wait or reopen this dialog.',
  'create.verifyTitle': 'Enter the words for the numbered slots',
  'create.verifyDesc': 'To confirm your backup, enter the words matching the numbers below.',
  'create.wordIndex': 'Word #{index}',
  'create.wordPlaceholder': 'Enter the word',
  'create.wordWrong': 'Incorrect word, please check and retry',
  'create.setPasswordTitle': 'Set an account password',
  'create.setPasswordDesc':
    'The password encrypts the recovery phrase. It must be at least 8 characters and include digits, letters, at least one uppercase letter and one special character.',
  'create.confirm': 'Create',
  'create.success': 'Account created. ETH account: {address}',

  // —— 导入钱包 ——
  'import.titlePhrase': 'Import phrase · Enter phrase',
  'import.titlePassword': 'Import phrase · Set password',
  'import.enterPhraseTitle': 'Enter your recovery phrase',
  'import.enterPhraseDesc':
    'Enter the 12 English words in the original order, separated by spaces, or paste the whole phrase. It is only encrypted and stored on this device.',
  'import.mnemonic': 'Recovery phrase',
  'import.phrasePlaceholder': 'e.g. apple banana cat ... (12 words)',
  'import.wordCount': '{current} / {total} entered',
  'import.countError': 'The phrase must contain {total} words. Please check and retry.',
  'import.setPasswordDesc':
    'The password encrypts the imported recovery phrase. It must be at least 8 characters and include digits, letters, at least one uppercase letter and one special character.',
  'import.confirm': 'Import',
  'import.success': 'Imported. ETH account: {address}',

  // —— 密码规则 ——
  'password.minLength': 'At least 8 characters',
  'password.needDigit': 'Must contain a digit',
  'password.needLetter': 'Must contain a letter',
  'password.needUpper': 'Must contain an uppercase letter',
  'password.needSpecial': 'Must contain a special character',
  'password.valid': 'Password meets the requirements',
  'password.mismatch': 'Passwords do not match',

  // —— 总览 ——
  'overview.chain': 'Chain',
  'overview.totalTitle': 'Total value (USD)',
  'overview.priceSource': 'Prices from CoinGecko · updated at {time}',
  'overview.priceFallback': 'Prices from CoinGecko · fallback prices',

  // —— 单链内容区 ——
  'content.accountTitle': '{symbol} account',
  'content.lockedHint': 'Wallet is locked. Unlock it to view the {symbol} account.',
  'content.addressLabel': '{symbol} address',
  'content.network': 'Network',
  'content.derivationPath': 'Derivation path',
  'content.walletAccount': 'Wallet account',
  'content.subtotal': 'Subtotal (USD)',

  // —— 发送 ——
  'send.title': 'Send',
  'send.confirm': 'Confirm',
  'send.submitted': 'Transaction submitted',
  'send.broadcast': 'Broadcast to {chain} {network}, waiting for confirmation.',
  'send.viewExplorer': 'View on block explorer',
  'send.from': 'From',
  'send.to': 'Recipient address',
  'send.amount': 'Amount',
  'send.available': 'Available: {amount} {asset}',
  'send.amountPlaceholder': 'Enter the {asset} amount to send',
  'send.mainnetAlertTitle': '{symbol} is on mainnet and uses real funds',
  'send.mainnetAlertDesc':
    'Transactions cannot be reversed once broadcast. Please verify the recipient address and amount.',

  // —— 右侧广告位 ——
  'right.ad': 'Ad',
  'right.sponsor': 'AD · Sponsored',
  'right.ad1Title': 'HCoin Earn',
  'right.ad1Desc': 'Steady returns, 8% APY',
  'right.ad2Title': 'Refer friends',
  'right.ad2Desc': 'Both get 10 HCoin',
  'right.ad3Title': 'Security center',
  'right.ad3Desc': 'Enable two-factor authentication',

  // —— 关于（主进程分区数据） ——
  'about.name': 'Wallet name',
  'about.network': 'Network',
  'about.version': 'Client version',
  'about.storage': 'Storage',
  'about.totalAccounts': '{count} accounts',

  // —— 渲染进程错误提示 ——
  'err.envBackup': 'Backup is unavailable (no Electron interface detected)',
  'err.envUnlock': 'Unlock is unavailable (no Electron interface detected)',
  'err.envSend': 'Sending is unavailable (no Electron interface detected)',
  'err.envCreate': 'Account creation is unavailable (no Electron interface detected)',
  'err.envImport': 'Import is unavailable (no Electron interface detected)',
  'err.selectBackupAccount': 'Select the account to back up',
  'err.selectUnlockAccount': 'Select the account to unlock',
  'err.enterPassword': 'Enter your password',
  'err.backupFailed': 'Backup failed',
  'err.loadAccountsFailed': 'Failed to load the account list',
  'err.unlockFailed': 'Unlock failed',
  'err.startupCheckFailed': 'Startup check failed',
  'err.sendFailed': 'Transaction failed',
  'err.unlockFirst': 'Please unlock the wallet first',
  'err.createFailed': 'Failed to create the account',
  'err.importFailed': 'Import failed',
  'err.mnemonicGenerateFailed': 'Failed to generate the recovery phrase',
  'err.passwordInvalid': 'Password does not meet the requirements',
  'err.checkPhraseAndPassword': 'Please check the recovery phrase and password',
  'err.mnemonicInvalidInput': 'Invalid recovery phrase, please check the words and their order',
  'err.mnemonicCheckFailed': 'Failed to validate the recovery phrase',
  'err.wordCountMismatch': 'Enter {total} words, currently {current}',

  // —— 主进程错误提示 ——
  'err.dbNotReady': 'Database is not ready, please try again later',
  'err.invalidMnemonic': 'Invalid recovery phrase',
  'err.deriveMnemonicInvalid': 'Invalid recovery phrase, cannot derive the ETH account',
  'err.passwordRequired': 'Password is required',
  'err.accountExists': 'This account already exists',
  'err.accountNotFound': 'Account not found',
  'err.noSecret': 'This account has no encrypted recovery phrase to back up',
  'err.wrongPassword': 'Wrong password, cannot decrypt the recovery phrase',
  'err.chainNotSupported': 'Unsupported chain: {key}',
  'err.notEvmChain': '{name} is not an EVM chain',
  'err.tokenNotSupported': '{name} does not support token: {symbol}',
  'err.assetNotSupported': '{name} does not support asset: {asset}',
  'err.btcDeriveFailed': 'Failed to derive the BTC account',
  'err.btcAddressFailed': 'Failed to generate the BTC address',
  'err.btcAddressInvalid': 'Invalid BTC recipient address',
  'err.btcApiFailed': 'BTC API request failed: {status} {statusText}',
  'err.broadcastFailed': 'Broadcast failed: {status} {detail}',
  'err.amountFormat': 'Invalid amount format',
  'err.amountPositive': 'Enter a valid amount',
  'err.enterRecipient': 'Enter the recipient address',
  'err.noUtxo': 'Available balance is 0, nothing to send',
  'err.insufficient': 'Insufficient balance for the amount and fee',
  'err.solAddressInvalid': 'Invalid Solana recipient address',
  'err.walletLocked': 'Wallet is locked, cannot send',
  'err.accountMismatch': 'The unlocked account does not match the sender',
};

export const MESSAGES: Record<Locale, Record<MessageKey, string>> = { zh, en };

/** 把 `{name}` 占位替换为实际参数 */
function format(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

/** 按语言取文案，缺 key 时回落到中文 */
export function translate(locale: Locale, key: MessageKey, params?: MessageParams): string {
  const dict = MESSAGES[locale] ?? MESSAGES.zh;
  return format(dict[key] ?? MESSAGES.zh[key], params);
}

/** 判断入参是否为合法语言 */
export function isLocale(value: unknown): value is Locale {
  return value === 'zh' || value === 'en';
}
