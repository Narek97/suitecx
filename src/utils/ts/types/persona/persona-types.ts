import { DemographicInfoTypeEnum, PersonaStateEnum } from '@/gql/types';

export type AttachmentType = {
  color?: string;
  key: string;
  url: string;
};

export type MapPersonaStateItemType = {
  boxId: number;
  columnId: number;
  stepId: number;
  rowId: number;
  state: PersonaStateEnum;
};

export type PersonaType = {
  id: number;
  name: string;
  attachmentId?: number | null;
  color?: string | null;
  isSelected?: boolean;
  isDisabledForSocket?: boolean;
  isDisabledForThisRow?: boolean;
  personaStates?: MapPersonaStateItemType[];
  type: string;
  journeys?: number;
  attachment?: AttachmentType | null;
};

export type PinnedPersonaItemsType = {
  demographicInfos: Array<PersonaDemographicInfoType>;
  pinnedSections: Array<PinnedSectionType>;
};

export type PersonaInfoType = Pick<PersonaType, 'id' | 'name' | 'type' | 'color' | 'attachment'>;

export type PersonaImageBoxType = {
  color: string;
  isSelected?: boolean;
  attachment: AttachmentType;
};

export type PinnedSectionType = {
  id: number;
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  section: {
    id: number;
    key: string;
    color: string;
    content: string;
  };
};

export type PersonaDemographicInfoType = {
  id: number;
  key: string;
  personaId: number;
  type: string;
  value?: string | null | undefined;
  isPinned?: boolean | null;
};

export type PersonSectionType = {
  id: number;
  w: number;
  h: number;
  x: number;
  y: number;
  i: string;
  color: string;
  content: string;
  key: string;
  isPinned?: boolean | null;
};

export type PersonaDemographicInfoPopoverType = {
  id: number;
  name: string;
  type: DemographicInfoTypeEnum;
};

export type PersonaGalleryType = {
  id: number;
  url: string;
  key: string;
  name: string;
  type: string;
};
