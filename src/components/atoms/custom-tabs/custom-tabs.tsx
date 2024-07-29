'use client';
import React, { FC, Suspense } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabPanel from '@mui/lab/TabPanel';
import { TabPanelType, TabType } from '@/utils/ts/types/global-types';
import { Tab, Tabs } from '@mui/material';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';

type indicatorTypes = 'linear' | 'circular';

interface ICustomTabs {
  orientation?: 'vertical' | 'horizontal';
  tabsBottomBorderColor: string;
  tabs: TabType[];
  tabValue: string;
  setTabValue: (tab: string, label?: string) => void;
  tabPanels: TabPanelType[];
  indicatorType?: indicatorTypes;
  showTabsBottomLine?: boolean;
  disableRipple?: boolean;
  activeColor?: string;
  inactiveColor: string;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
}

const CustomTabs: FC<ICustomTabs> = ({
  orientation = 'horizontal',
  tabValue,
  setTabValue,
  tabs = [],
  tabPanels,
  tabsBottomBorderColor,
  indicatorType = 'linear',
  showTabsBottomLine = true,
  disableRipple = true,
  activeColor,
  inactiveColor,
  variant,
}) => {
  const onPageChange = (tabName: string, label: string) => {
    setTabValue(tabName, label);
  };
  const getTabStyleByIndicatorType = (type: indicatorTypes) => {
    const primaryStyle = {
      '&.MuiTabs-root': {
        '.MuiTabScrollButton-root': {
          width: '32px',
        },
      },
      '& .MuiTab-root': {
        color: inactiveColor,
      },
      '& .MuiTab-root.Mui-selected': {
        color: activeColor,
      },
    };
    let tabStyle = {};
    switch (type) {
      case 'linear':
        tabStyle = {
          minHeight: '25px',
        };
        break;
      case 'circular':
        tabStyle = {
          '& .MuiTab-root.Mui-selected': {
            color: activeColor,
          },
          '& .MuiTabs-indicator': {
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: 'transparent',
          },
        };
        break;
    }
    return {
      ...primaryStyle,
      ...tabStyle,
    };
  };

  const getIndicatorStyleByIndicatorType = (type: indicatorTypes) => {
    switch (type) {
      case 'linear':
        return {};
      case 'circular':
        return {
          children: <span className="MuiTabs-indicatorSpan" />,
          sx: {
            bottom: '4px',
            '& .MuiTabs-indicatorSpan': {
              width: 4,
              height: 4,
              borderRadius: '30px',
              backgroundColor: activeColor,
            },
          },
        };
    }
  };

  const tabsStyles = getTabStyleByIndicatorType(indicatorType);

  const tabIndicatorProps = getIndicatorStyleByIndicatorType(indicatorType);

  return (
    <div className={'custom-tabs'}>
      <TabContext value={tabValue}>
        <div className={'custom-tabs--content'}>
          {showTabsBottomLine && (
            <div
              className={'tabs-divider-line'}
              style={{ backgroundColor: tabsBottomBorderColor }}
            />
          )}
          <Tabs
            orientation={orientation}
            value={tabValue}
            sx={tabsStyles}
            variant={variant}
            TabIndicatorProps={tabIndicatorProps}
            className={'custom-tabs--tabs'}>
            {tabs.map((tab, index) => (
              <Tab
                {...tab}
                key={index}
                className={'custom-tabs--tab'}
                data-testid="custom-tab-test-id"
                disableRipple={disableRipple}
                sx={{ minWidth: 0 }}
                onClick={() => onPageChange(tab.value, tab?.label as string)}
              />
            ))}
          </Tabs>
        </div>
        {tabPanels.map(({ page, value }, index) => (
          <TabPanel value={value} key={index} className={'custom-tabs--panel'} sx={{ padding: 0 }}>
            <Suspense fallback={<CustomLoader />}>{page}</Suspense>
          </TabPanel>
        ))}
      </TabContext>
    </div>
  );
};

export default CustomTabs;
