'use client';
import React, { FC } from 'react';
import LeftMenuPanelLayout from '@/layouts/left-menu-panel-layout/left-menu-panel-layout';
import { MENU_PANEL_BOTTOM_TABS, PRIMARY_MENU_PANEL_TOP_TABS } from '@/utils/constants/tabs';

interface IHeaderLayout {
  children: React.ReactNode;
}
const HeaderLayout: FC<IHeaderLayout> = ({ children }) => {
  return (
    <>
      <LeftMenuPanelLayout
        topTabs={PRIMARY_MENU_PANEL_TOP_TABS}
        bottomTabs={MENU_PANEL_BOTTOM_TABS}>
        {children}
      </LeftMenuPanelLayout>
    </>
  );
};

export default HeaderLayout;
