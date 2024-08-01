import React, { FC } from 'react';

import './style.scss';

import dynamic from 'next/dynamic';

import Footer from '@/components/templates/footer';
import BaseLayout from '@/layouts/base-layout/base-layout';

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
        <Footer />
      </BaseLayout>
    </>
  );
};

export default HeaderLayout;
