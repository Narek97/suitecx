'use client';
import React, { useCallback, useEffect, useState } from 'react';
import './style.scss';
import { useRecoilValue } from 'recoil';
import '@questionproext/wick-ui-icons/dist/icomoon/css/wick-ui-icon.css';
import '@questionproext/wick-ui-lib/dist/esm/wick-ui-bundle.css';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { removeCookies } from '@/utils/helpers/cookies';
import { TOKEN_NAME } from '@/utils/constants/general';
import { userState } from '@/store/atoms/user.atom';
import { WuAppHeader } from '@questionproext/wick-ui-lib';

const HeaderTemplate = () => {
  const user = useRecoilValue(userState);
  const breadcrumb = useRecoilValue(breadcrumbState);

  const [productSwitcherData, setProductSwitcherData] = useState<any>(null);

  const url = `${process.env.NEXT_PUBLIC_PRODUCT_SWITCHER}?apiToken=${user?.apiToken}&apiKey=${process.env.NEXT_PUBLIC_APP_KEY}&clientID=${process.env.NEXT_PUBLIC_CLIENT_ID}`;

  const getProductSwitcher = useCallback(async () => {
    const response = await fetch(url);
    return response.json();
  }, [url]);

  const logout = () => {
    removeCookies(TOKEN_NAME);
    window.location.href = 'https://www.questionpro.com/a/logout.do';
  };

  useEffect(() => {
    getProductSwitcher().then(r => {
      setProductSwitcherData(r);
    });
  }, [getProductSwitcher]);

  return (
    <div className={'header'} data-testid="header-test-id">
      <WuAppHeader
        activeProductName="Suite CX"
        myAccount={
          productSwitcherData?.headerInfo[1].myAccount || {
            license: {},
            settings: [],
            profile: {},
            usage: {},
            invoice: {},
            issueTrackerCount: 0,
          }
        }
        productCategories={productSwitcherData?.headerInfo[0].productSwitcher.categories || []}
        activeProductColor={'#17c266'}
        breadcrumbs={breadcrumb.map((el, index) => ({
          type: `${index + 1 === breadcrumb.length ? 'labelOnly' : 'link'}`,
          label: el.name,
          url: el.pathname,
        }))}
        onLogoutClick={logout}
      />
    </div>
  );
};

export default HeaderTemplate;
