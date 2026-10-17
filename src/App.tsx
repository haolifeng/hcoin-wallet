import { useEffect } from 'react';
import { Layout } from 'antd';
import Header from './components/Header';
import Footer from './components/Footer';
import SideMenu from './components/SideMenu';
import ContentPanel from './components/ContentPanel';
import RightPanel from './components/RightPanel';
import CreateWalletModal from './components/CreateWalletModal';
import SettingsModal from './components/SettingsModal';
import BackupModal from './components/BackupModal';
import StartupScreen from './components/StartupScreen';
import StartupChoiceModal from './components/StartupChoiceModal';
import UnlockModal from './components/UnlockModal';
import ImportWalletModal from './components/ImportWalletModal';
import SendModal from './components/SendModal';
import { startupStore } from './stores/StartupStore';
import { priceStore } from './stores/PriceStore';

const { Header: AHeader, Content, Footer: AFooter, Sider } = Layout;

/** 价格刷新间隔（毫秒） */
const PRICE_POLL_INTERVAL = 60000;

export default function App() {
  // 启动流程：检测助记词 → 创建 / 解锁
  useEffect(() => {
    void startupStore.init();
  }, []);

  // 全局拉取币种价格（总览 / 单链视图共用）
  useEffect(() => {
    void priceStore.refresh();
    const timer = window.setInterval(() => {
      void priceStore.refresh();
    }, PRICE_POLL_INTERVAL);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <Layout
      // 关键修复：两个 Sider 嵌在 Content 内部，但 antd 的 Sider 挂载时会向
      // 任意祖先 Layout 注册自身，导致外层 Layout 被自动加上 `ant-layout-has-sider`。
      // 该类自带的规则 `.ant-layout-has-sider > .ant-layout-content { width: 0 }`
      // 会把 Content 宽度压成 0，配合 overflow:hidden 使整个中间区域（含侧栏菜单
      // 文字）被裁剪而不可见。这里显式声明 hasSider=false 覆盖自动探测。
      hasSider={false}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 页面整体不出现滚动条
      }}
    >
      {/* 上层 Header：固定高度 60px，不随内容滚动 */}
      <AHeader
        style={{
          height: 60,
          lineHeight: 'normal',
          flex: '0 0 60px',
          padding: '0 24px',
          background: '#001529',
          zIndex: 1,
          boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        <Header />
      </AHeader>

      {/* 中间主体：撑满 Header 与 Footer 之间的剩余高度 */}
      <Content
        style={{
          flex: 1,
          minHeight: 0, // 关键：允许内部滚动而不是撑高外层
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        {/* 左侧栏：固定 220px，不伸缩 */}
        <Sider
          width={220}
          breakpoint="lg"
          collapsedWidth={0}
          style={{
            background: '#fff',
            flex: '0 0 220px',
            borderRight: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <SideMenu />
        </Sider>

        {/* 中间区：自适应剩余宽度，内容过多时内部独立滚动 */}
        <main
          style={{
            flex: 1,
            minWidth: 0,
            padding: 24,
            overflow: 'auto',
            background: '#f5f7fa',
          }}
        >
          <ContentPanel />
        </main>

        {/* 右侧栏：固定 260px，不伸缩 */}
        <Sider
          width={260}
          breakpoint="xl"
          collapsedWidth={0}
          style={{
            background: '#fff',
            flex: '0 0 260px',
            borderLeft: '1px solid #f0f0f0',
            overflow: 'auto',
          }}
        >
          <RightPanel />
        </Sider>
      </Content>

      {/* 下层 Footer：固定高度 50px，不随内容滚动 */}
      <AFooter
        style={{
          height: 50,
          padding: 0,
          flex: '0 0 50px',
          lineHeight: 'normal',
          color: 'rgba(0,0,0,0.45)',
          background: '#fafafa',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <Footer />
      </AFooter>

      {/* 创建钱包向导（助记词 → 校验 → 密码加密保存） */}
      <CreateWalletModal />
      {/* 设置入口与备份助记词 */}
      <SettingsModal />
      <BackupModal />

      {/* 启动界面：未完成创建/导入/解锁前覆盖在主界面之上 */}
      <StartupScreen />
      {/* 无助记词时的「创建 / 导入」选择窗口 */}
      <StartupChoiceModal />
      {/* 已有助记词时的密码解锁窗口 */}
      <UnlockModal />
      {/* 导入助记词向导 */}
      <ImportWalletModal />
      {/* 发送 ETH / USDT / USDC */}
      <SendModal />
    </Layout>
  );
}