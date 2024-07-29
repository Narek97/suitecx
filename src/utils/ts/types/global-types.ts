import { ReactNode } from 'react';
import { CommentAndNoteModelsEnum, Member, PerformanceLog } from '@/gql/types';
import { CommentItemType } from '@/utils/ts/types/journey-map/journey-map-types';

export type ObjectKeysType = {
  [key: string]: any;
};

export type CreatUpdateFormGeneralType = {
  [key: string]: string;
};

export type Usertype = {
  emailAddress: string;
  firstName: string;
  lastName: string;
  apiToken: string;
  userID?: number;
  orgID?: number;
  isAdmin?: boolean;
  primaryUserAPIKey?: string;
  businessType?: {
    value: string;
  };
  color?: string;
};

export type OrganizationUserType = Pick<
  Member,
  'firstName' | 'lastName' | 'emailAddress' | 'userId' | 'isShared'
>;

export type WorkspaceType = {
  id: number;
  name: string;
  description?: string;
  boardsCount: number;
  journeyMapCount: number;
  personasCount: number;
  actionsCount: number;
  solutionsCount: number;
  opportunitiesCount: number;
  createdAt?: number;
};

export type MenuOptionsType = {
  id?: number;
  icon?: ReactNode;
  children?: ReactNode;
  label?: ReactNode;
  name?: any;
  isSubOption?: boolean;
  disabled?: boolean;
  isFileUpload?: boolean;
  isColorPicker?: boolean;
  onClick?: (item?: any) => void;
};

export type NotesAndCommentsDrawerType = {
  title: string;
  isOpen: boolean;
  itemId: number | null;
  rowFunction: CommentItemType | null;
  type: CommentAndNoteModelsEnum | null;
  url?: string;
  rowId?: number;
  columnId?: number;
  stepId?: number | null;
};

export type CommentButtonItemType = {
  title: string;
  itemId: number;
  rowId: number;
  columnId: number;
  stepId: number;
  type: CommentAndNoteModelsEnum;
};

export type MenuTabType = {
  icon: ReactNode;
  name: string;
  url: string;
  breadcrumbSlice?: number;
  regexp?: RegExp;
};

export type TabType = {
  label: string | ReactNode;
  value: string;
};

export type TabPanelType = {
  page: ReactNode;
  value: string;
};

export type TableColumnType = {
  id: number | string;
  label: string | ReactNode;
  style?: any;
  renderFunction?: (data: any) => ReactNode;
  onClick?: () => void;
  sortFieldName?: string;
  isAscDescSortable?: boolean;
  isNameSortable?: boolean;
  align?: 'right' | 'left' | 'center';
};

export type GetPageContentParamsType = {
  content: any;
  defaultPage: ReactNode;
  key: string | null;
};

export type TableRowItemChangeType = { id: number | string; key: string; value: number | string };

export type PerformanceLogsType = Omit<PerformanceLog, 'method' | 'user' | 'updatedAt'>;

export type NoteType = {
  id: number;
  text: string;
  itemId: number;
  updatedAt: any;
  owner: {
    color?: string;
    emailAddress: string;
    firstName: string;
    lastName: string;
  };
};
