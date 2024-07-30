'use client';
import AiModel from '@/containers/admin-container/ai-model';
import CopyMap from '@/containers/admin-container/copy-map';
import React, { useMemo } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/atoms/user.atom';
import { ADMIN_TAB_PANELS, ADMIN_TABS } from '@/utils/constants/tabs';
import { USERS_FOR_COPY_ACTION } from '@/utils/constants/general';
import { getPageContentByKey } from '@/utils/helpers/get-page-content-by-key';
import CustomTabs from '@/components/atoms/custom-tabs/custom-tabs';

const AdminContainer = () => {
  const { getQueryParamValue, createQueryParam } = useQueryParam();
  const tab = getQueryParamValue('tab');

  const user = useRecoilValue(userState);

  const onSelectTab = (tabValue: string) => {
    createQueryParam('tab', tabValue);
  };

  const adminTabsList = useMemo(() => {
    const baseTabs = ADMIN_TABS;
    if (USERS_FOR_COPY_ACTION.includes(user?.userID!)) {
      return [
        ...baseTabs,
        { label: 'Copy map', value: 'copy-map' },
        { label: 'Ai model', value: 'ai-model' },
      ];
    }
    return baseTabs;
  }, [user]);

  const adminTabPanels = useMemo(() => {
    const basePanels = ADMIN_TAB_PANELS;
    if (USERS_FOR_COPY_ACTION.includes(user?.userID!)) {
      return [
        ...basePanels,
        { page: <CopyMap />, value: 'copy-map' },
        { page: <AiModel />, value: 'ai-model' },
      ];
    }
    return basePanels;
  }, [user]);

  return (
    <>
      {getPageContentByKey({
        content: {
          organization: <></>,
        },
        key: tab,
        defaultPage: (
          <CustomTabs
            tabValue={tab || 'error-logs'}
            setTabValue={onSelectTab}
            activeColor={'#545E6B'}
            inactiveColor={'#9B9B9B'}
            tabsBottomBorderColor={'#FFFFFF'}
            tabs={adminTabsList}
            tabPanels={adminTabPanels}
          />
        ),
      })}
    </>
  );
};

export default AdminContainer;
