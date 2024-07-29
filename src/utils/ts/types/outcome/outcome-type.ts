import { OutcomeStatusEnum } from '@/gql/types';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

export type OutcomeType = {
  id: number;
  name: string;
  pluralName: string;
  createdAt: number;
  icon: string;
  user: {
    firstName: string;
    lastName: string;
  };
};

export type OutcomeGroupItemType = {
  id: number;
  title: string;
  description?: string | null;
  createdAt: any;
  status: OutcomeStatusEnum;
  rowId?: number | null;
  columnId?: number | null;
  stepId?: number | null;
  personaId?: number | null;
  commentsCount: number;
  flippedText?: string | null;
  outcomeGroupId: number;
  column?: { label?: string | null } | null;
  map?: { id: number; title?: string | null } | null;
  user?: { firstName: string; lastName: string } | null;
  persona?: {
    id: number;
    name: string;
    type: string;
    attachment?: { url: string; key: string } | null;
  } | null;
};

export type OutcomeGroupType = {
  id: number;
  name: string;
  pluralName: string;
  icon: string;
};

export type MapOutcomeItemType = {
  id: number;
  title: string;
  description: string;
  commentsCount: number;
  columnId: number;
  stepId: number;
  rowId: number;
  icon: string;
  personaId: number | null;
  status: OutcomeStatusEnum | string;
  flippedText: string | null;
  createdAt?: number;
  user?: {
    firstName: string;
    lastName: string;
  };
  persona?: PersonaType | null;
  map?: {
    id: number;
    title: string;
  };
};

export type OutcomeFormType = {
  name: string;
  description: string;
  map: number | null;
  stage: number | null;
  step: number | null;
  persona: number | null;
};

export type PinnedOutcomeGroupType = {
  count: number;
  name?: string | null;
  icon: string;
  id: number;
};
