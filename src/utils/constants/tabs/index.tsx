import React from 'react';

import ErrorLogs from '@/containers/admin-container/error-logs';
import Organizations from '@/containers/admin-container/organizations';
import OrgBoards from '@/containers/admin-container/organizations/organization/org-boards';
import OrgUsers from '@/containers/admin-container/organizations/organization/org-users';
import PerformanceLogs from '@/containers/admin-container/performance-logs';
import TouchpointIcons from '@/containers/journey-map-container/journey-map-rows/row-types/touchpoints/touchpoint-drawer/touchpoint-Icons';
import Outcomes from '@/containers/settings-container/outcomes';
import AdminIcon from '@/public/left-menu-panel/admin.svg';
import WorkforcesIcon from '@/public/left-menu-panel/folder.svg';
import HomeIcon from '@/public/left-menu-panel/home.svg';
import InterviewsIcon from '@/public/left-menu-panel/interview.svg';
import SettingsIcon from '@/public/left-menu-panel/settings.svg';
import UserIcon from '@/public/left-menu-panel/user.svg';
import {
  COMMUNICATION,
  FINANCE,
  HEALTHCARE,
  HUMAN_RESOURCES,
  RETAIL,
  SALES_MARKETING,
  SOCIAL_MEDIA,
} from '@/utils/constants/touchpoints';
import { TouchpointIconsEnum } from '@/utils/ts/enums/global-enums';
import { MenuTabType, TabPanelType, TabType } from '@/utils/ts/types/global-types';

// admin
export const ADMIN_TABS: TabType[] = [
  { label: 'Error Logs', value: 'error-logs' },
  { label: 'Performance Logs', value: 'performance-logs' },
  { label: 'Organizations', value: 'organizations' },
];

export const ADMIN_TAB_PANELS: TabPanelType[] = [
  { page: <ErrorLogs />, value: 'error-logs' },
  { page: <PerformanceLogs />, value: 'performance-logs' },
  { page: <Organizations />, value: 'organizations' },
];

//organization
export const ORGANIZATION_TABS: TabType[] = [
  { label: 'Org users', value: 'org-users' },
  { label: 'Org boards', value: 'org-boards' },
];

export const ORGANIZATION_TABS_PANELS: TabPanelType[] = [
  { page: <OrgUsers />, value: 'org-users' },
  { page: <OrgBoards />, value: 'org-boards' },
];

export const SETTINGS_TABS: TabType[] = [{ label: 'Outcomes', value: 'outcomes' }];
export const SETTINGS_TAB_PANELS: TabPanelType[] = [{ page: <Outcomes />, value: 'outcomes' }];

// Settings
export const JOURNEY_TOUCHPOINT_SETTINGS_TABS = (customIconCount: number = 0): TabType[] => {
  return [
    {
      label: `All (${COMMUNICATION.length + FINANCE.length})`,
      value: TouchpointIconsEnum.ALL,
    },
    {
      label: `Communication (${COMMUNICATION.length})`,
      value: TouchpointIconsEnum.COMMUNICATION,
    },
    {
      label: `Social Media (${SOCIAL_MEDIA.length})`,
      value: TouchpointIconsEnum.SOCIAL_MEDIA,
    },
    {
      label: `Sales & Marketing (${SALES_MARKETING.length})`,
      value: TouchpointIconsEnum.SALES_MARKETING,
    },
    {
      label: `Finance (${FINANCE.length})`,
      value: TouchpointIconsEnum.FINANCE,
    },
    { label: `Retail (${RETAIL.length})`, value: TouchpointIconsEnum.RETAIL },
    {
      label: `Healthcare (${HEALTHCARE.length})`,
      value: TouchpointIconsEnum.HEALTHCARE,
    },
    {
      label: `Human Resources (${HUMAN_RESOURCES.length})`,
      value: TouchpointIconsEnum.HUMAN_RESOURCES,
    },
    { label: `Custom (${customIconCount})`, value: TouchpointIconsEnum.CUSTOM },
  ];
};
export const JOURNEY_TOUCHPOINT_SETTINGS_TAB_PANELS: TabPanelType[] = [
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.ALL} />,
    value: TouchpointIconsEnum.ALL,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.COMMUNICATION} />,
    value: TouchpointIconsEnum.COMMUNICATION,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.SOCIAL_MEDIA} />,
    value: TouchpointIconsEnum.SOCIAL_MEDIA,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.SALES_MARKETING} />,
    value: TouchpointIconsEnum.SALES_MARKETING,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.FINANCE} />,
    value: TouchpointIconsEnum.FINANCE,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.RETAIL} />,
    value: TouchpointIconsEnum.RETAIL,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.HEALTHCARE} />,
    value: TouchpointIconsEnum.HEALTHCARE,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.HUMAN_RESOURCES} />,
    value: TouchpointIconsEnum.HUMAN_RESOURCES,
  },
  {
    page: <TouchpointIcons type={TouchpointIconsEnum.CUSTOM} />,
    value: TouchpointIconsEnum.CUSTOM,
  },
];

export const PRIMARY_MENU_PANEL_TOP_TABS: Array<MenuTabType> = [
  {
    icon: <HomeIcon />,
    name: 'Workspaces',
    url: '/workspaces',
    regexp: /^(\/workspaces)?$/,
    breadcrumbSlice: 1,
  },
  {
    icon: <UserIcon />,
    name: 'Users',
    url: '/users',
    regexp: /^\/users$/,
    breadcrumbSlice: 1,
  },
];

export const MENU_PANEL_BOTTOM_TABS: Array<MenuTabType> = [
  {
    icon: <AdminIcon />,
    name: 'Admin',
    url: '/admin',
    regexp: /^(\/admin)?$/,
    breadcrumbSlice: 1,
  },
  {
    icon: <SettingsIcon />,
    name: 'Settings',
    url: '/settings',
    regexp: /^(\/settings)?$/,
    breadcrumbSlice: 1,
  },
];

export const SECONDARY_MENU_PANEL_TOP_TABS = ({
  workspaceID,
}: {
  workspaceID: string | undefined;
}): Array<MenuTabType> => {
  const primaryUrl = `/workspace/${workspaceID}/`;
  return [
    {
      icon: <WorkforcesIcon />,
      name: 'Boards',
      url: primaryUrl + 'boards',
      regexp: /^\/workspace\/\d+\/boards$/,
      breadcrumbSlice: 2,
    },
    {
      icon: <UserIcon />,
      name: 'Personas',
      url: primaryUrl + 'personas',
      regexp: /^\/workspace\/\d+\/persona(?:\/\d+)?s?$/,
      breadcrumbSlice: 2,
    },
    {
      icon: <InterviewsIcon />,
      name: 'Interviews',
      url: primaryUrl + 'interviews',
      regexp: /^\/workspace\/\d+\/interviews(?:\/\d+)?s?$/,
      breadcrumbSlice: 2,
    },
    // {
    //   icon: <AtlasIcon />,
    //   name: 'Atlas',
    //   url: primaryUrl + 'atlas',
    //   regexp: /^\/workspace\/\d+\/atlas(?:\/\d+)?s?$/,
    //   breadcrumbSlice: 2,
    // },
  ];
};

export const JOURNEY_MAP_MENU_PANEL_TOP_TABS = ({
  boardId,
}: {
  boardId: string | undefined;
}): Array<MenuTabType> => {
  const mapsUrl = `/board/${boardId}`;

  return [
    {
      icon: <WorkforcesIcon />,
      name: 'Maps',
      url: mapsUrl,
      regexp: /^\/board\/\d+\/boards$/,
    },
  ];
};
