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
      items={menuStore.menuItems.map((item) => ({ key: item.key, label: item.label }))}
    />
  );
});

export default SideMenu;
