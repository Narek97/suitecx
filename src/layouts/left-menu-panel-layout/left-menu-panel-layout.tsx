'use client';
import { FC, ReactNode } from 'react';
import './left-menu-panel-layout.scss';
import { MenuTabType } from '@/utils/ts/types/global-types';
import HoverMenuPanel from '@/components/templates/hover-menu-panel';

interface ILeftMenuPanelLayout {
  children: ReactNode;
  topTabs: Array<MenuTabType>;
  bottomTabs?: Array<MenuTabType>;
}

const LeftMenuPanelLayout: FC<ILeftMenuPanelLayout> = ({ children, topTabs, bottomTabs }) => {
  return (
    <div className={'left-menu-panel-layout'}>
      <>
        <HoverMenuPanel topTabs={topTabs} bottomTabs={bottomTabs} />
        <section className={'left-menu-panel-layout--children'}>{children}</section>
      </>
    </div>
  );
};

export default LeftMenuPanelLayout;
