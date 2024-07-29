'use client';
import React from 'react';
import CustomTabs from '@/components/atoms/custom-tabs/custom-tabs';
import { useQueryParam } from '@/hooks/useQueryParam';
import { SETTINGS_TAB_PANELS, SETTINGS_TABS } from '@/utils/constants/tabs';

const SettingsContainer = () => {
  const { getQueryParamValue, createQueryParam } = useQueryParam();
  const tab = getQueryParamValue('tab');

  const onSelectTab = (tabValue: string) => {
    createQueryParam('tab', tabValue);
  };

  return (
    <>
      <CustomTabs
        tabValue={tab || 'outcomes'}
        setTabValue={onSelectTab}
        showTabsBottomLine={true}
        activeColor={'#545E6B'}
        inactiveColor={'#9B9B9B'}
        tabsBottomBorderColor={'#D8D8D8'}
        tabs={SETTINGS_TABS}
        tabPanels={SETTINGS_TAB_PANELS}
      />
    </>
  );
};

export default SettingsContainer;
