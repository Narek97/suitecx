import React from 'react';

import './style.scss';

import { useRouter } from 'next/navigation';

import CustomTabs from '@/components/atoms/custom-tabs/custom-tabs';
import BoardMaps from '@/containers/admin-container/organizations/organization/board-maps';
import { useQueryParam } from '@/hooks/useQueryParam';
import { ORGANIZATION_TABS, ORGANIZATION_TABS_PANELS } from '@/utils/constants/tabs';

const Organization = () => {
  const { getQueryParamValue } = useQueryParam();
  const router = useRouter();

  const id = getQueryParamValue('id');
  const view = getQueryParamValue('view') || 'users';

  const onSelectTab = (tabValue: string) => {
    router.push(`/admin?tab=organization&id=${id}&view=${tabValue}`);
  };

  const navigateToMainSettings = () => {
    router.push('/admin?tab=organizations');
  };

  const navigateToBoards = () => {
    router.push(`/admin?tab=organization&id=${id}&view=boards`);
  };

  return (
    <div className={'organization'}>
      <div className={'organization--breadcrumb'}>
        <button
          className={'organization--breadcrumb--organizations go-back-btn'}
          onClick={navigateToMainSettings}>
          View All Organizations
        </button>
        {view === 'maps' && (
          <button
            className={'organization--breadcrumb--boards go-back-btn'}
            onClick={navigateToBoards}>
            View All Boards
          </button>
        )}
      </div>
      {view === 'maps' ? (
        <BoardMaps />
      ) : (
        <CustomTabs
          tabValue={view || 'error-logs'}
          setTabValue={onSelectTab}
          activeColor={'#545E6B'}
          inactiveColor={'#9B9B9B'}
          tabsBottomBorderColor={'#FFFFFF'}
          tabs={ORGANIZATION_TABS}
          tabPanels={ORGANIZATION_TABS_PANELS}
        />
      )}
    </div>
  );
};

export default Organization;
