'use client';
import { FC } from 'react';

import './style.scss';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { userState } from '@/store/atoms/user.atom';
import { MenuTabType } from '@/utils/ts/types/global-types';

interface IHoverMenuPanel {
  topTabs: Array<MenuTabType>;
  bottomTabs?: Array<MenuTabType>;
}

const HoverMenuPanel: FC<IHoverMenuPanel> = ({ topTabs, bottomTabs }) => {
  const user = useRecoilValue(userState);
  const pathname = usePathname();
  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  return (
    <div className={'hover-menu-panel'} data-testid="hover-menu-panel-test-id">
      <div className={'hover-menu-panel--top'}>
        {topTabs.map(topTab => (
          <Link
            href={topTab.url}
            key={topTab.url}
            className={`hover-menu-panel--nav-link  ${topTab.regexp && topTab.regexp.test(pathname) ? 'active' : ''}`}
            onClick={() => setBreadcrumb(prev => prev.slice(0, topTab.breadcrumbSlice))}>
            <span className={'hover-menu-panel--nav-link-icon'}>{topTab.icon}</span>
            <span className={'hover-menu-panel--nav-link-name'}>{topTab.name}</span>
          </Link>
        ))}
      </div>
      <div className={'hover-menu-panel--bottom'}>
        {bottomTabs?.map((bottomTab, index) => {
          if (!user?.isAdmin && bottomTab?.name === 'Admin') {
            return null;
          }
          return (
            <Link
              href={bottomTab.url}
              key={bottomTab.name + index}
              className={`hover-menu-panel--nav-link  ${bottomTab.regexp && bottomTab.regexp.test(pathname) ? 'active' : ''}`}
              onClick={() => setBreadcrumb(prev => prev.slice(0, bottomTab.breadcrumbSlice))}>
              <span className={'hover-menu-panel--nav-link-icon'}>{bottomTab.icon}</span>
              <span className={'hover-menu-panel--nav-link-name'}>{bottomTab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HoverMenuPanel;
