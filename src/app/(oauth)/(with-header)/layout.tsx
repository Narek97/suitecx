import React, { FC } from 'react';
import './style.scss';
import BaseLayout from '@/layouts/base-layout/base-layout';
import dynamic from 'next/dynamic';

interface IHeaderLayout {
  children: React.ReactNode;
}
const HeaderLayout: FC<IHeaderLayout> = ({ children }) => {
  const Header = dynamic(() => import('@/components/templates/header'), { ssr: false });

  return (
    <>
      <BaseLayout>
        <header className={'base-layout--header'}>
          <Header />
        </header>
        <main className={'base-layout--main'}>{children}</main>
      </BaseLayout>
    </>
  );
};

export default HeaderLayout;
