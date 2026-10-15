import { Menu } from 'antd';
import { observer } from 'mobx-react-lite';
import { menuStore } from '../stores/MenuStore';

const SideMenu = observer(() => {
  return (
    <Menu
      mode="inline"
      selectedKeys={[menuStore.selectedKey]}
      onClick={({ key }) => menuStore.select(key)}
      style={{ height: '100%', borderRight: 0 }}
    >
      <Menu.Item key="dashboard">总揽</Menu.Item>
      <Menu.Item key="accounts">账户</Menu.Item>
      <Menu.Item key="balance">余额</Menu.Item>
      <Menu.Item key="about">关于</Menu.Item>
    </Menu>
  );
});

export default SideMenu;