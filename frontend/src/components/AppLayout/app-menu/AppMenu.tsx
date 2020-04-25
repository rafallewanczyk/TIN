import React, { ReactNode } from 'react';
import { Link } from '@reach/router';
import { Menu } from 'antd';
import { MenuTabItem, useMenuTabs } from './AppMenuHooks';

export interface MenuProps {}

export const AppMenu: React.FC<MenuProps> = (props) => {
  const [menuTabs, selectedKey] = useMenuTabs();
  const MenuTab = ({ icon, key, title, to }: MenuTabItem): ReactNode => (
    <Menu.Item key={key}>
      {icon}
      <Link to={to}>
        <span>{title}</span>
      </Link>
    </Menu.Item>
  );

  return (
    <Menu mode="inline" selectedKeys={[selectedKey]} theme="dark">
      {menuTabs.map(MenuTab)}
    </Menu>
  );
};
