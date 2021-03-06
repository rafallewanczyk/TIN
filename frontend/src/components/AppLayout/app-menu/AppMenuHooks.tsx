import React, { ReactNode } from 'react';
import SettingFilled from '@ant-design/icons/SettingFilled';
import UnorderedListOutlined from '@ant-design/icons/UnorderedListOutlined';
import VideoCameraOutlined from '@ant-design/icons/VideoCameraOutlined';
import { useLocation } from '@reach/router';

export interface MenuTabItem {
  key: string;
  icon: ReactNode;
  to: string;
  title: string;
}

const menuTabs: MenuTabItem[] = [
  {
    key: '1',
    icon: <UnorderedListOutlined />,
    to: '/',
    title: 'Devices list',
  },
  {
    key: '2',
    icon: <VideoCameraOutlined />,
    to: '/newDevice',
    title: 'Add new device',
  },
  {
    key: '3',
    icon: <SettingFilled />,
    to: '/newRegulator',
    title: 'Add new regulator',
  },
];
const findMatchingMenuItem = (location: string) => menuTabs.find((tab) => tab.to === location);

export const useMenuTabs = (): [MenuTabItem[], string[]] => {
  const location = useLocation();
  const matchingTab = findMatchingMenuItem(location.pathname);

  return [menuTabs, matchingTab?.key ? [matchingTab?.key] : []];
};
