import { LinkTypeEnum } from '@/gql/types';
import { AttachmentType } from '@/utils/ts/types/persona/persona-types';

export type LinkType = {
  id: number;
  title: string;
  url: string;
  index: number;
  rowId: number;
  linkedJourneyMapId: number | null;
  flippedText: string | null;
  icon: string | null;
  type: LinkTypeEnum;
  mapPersonaImages: Array<AttachmentType>;
  personaImage: AttachmentType | null;
  commentsCount: number;
};

export type LinkFormType = {
  type: string;
  linkedMapId: number | null;
  url: string | null;
  title: string | null;
};
