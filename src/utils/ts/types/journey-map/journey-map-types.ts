import { PersonaType } from '@/utils/ts/types/persona/persona-types';
import {
  ImgScaleTypeEnum,
  MapRowTypeEnum,
  MetricsDateRangeEnum,
  MetricsSourceEnum,
  MetricsTypeEnum,
  PersonaStateEnum,
} from '@/gql/types';
import { MapOutcomeItemType, OutcomeGroupType } from '@/utils/ts/types/outcome/outcome-type';
import { LinkType } from '@/utils/ts/types/link/link-type';
import { JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';

type JourneyMapCardOwnerType = {
  firstName: string;
  lastName: string;
  emailAddress: string;
};

export type JourneyMapCardType = {
  title: string;
  id: number;
  type: string;
  createdAt: number;
  updatedAt: number;
  owner?: JourneyMapCardOwnerType;
  selectedPersonas: Array<{
    id: number;
    color: string;
    attachment: { url: string };
  }>;
};

export type JourneyMapType = {
  title: string;
  isTitleDisabled?: boolean;
  workspaceId: number | null;
  columns: JourneyMapColumnType[];
  isDisabled?: boolean;
  rows: JourneyMapRowType[];
};

export type JourneyMapColumnType = {
  id: number;
  isLoading?: boolean;
  label?: string | null;
  isDisabled?: boolean;
  size: number;
};

type elementPrimaryType = {
  text: string;
  flippedText: string | null;
  digsiteUrl: string | null;
  commentsCount: number;
  rowId: number;
  persona: PersonaType | null;
  attachmentId: number | null;
  attachment?: {
    imgScaleType: ImgScaleTypeEnum;
  };
  attachmentPosition?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isDisabled?: boolean;
};

export type BoxElementType = elementPrimaryType & {
  id: number;
};

export type BoxTextElementType = elementPrimaryType & {
  id?: number;
};

export type StepType = {
  id: number;
  name: string;
  index: number;
  columnId: number;
};

export type TouchPointType = {
  id: number;
  title: string;
  iconUrl: string;
  commentsCount: number;
  columnId: number;
  rowId: number;
  bgColor: string | null;
  flippedText: string | null;
  persona?: PersonaType | null;
};

export type MetricsType = {
  id: number;
  rowId: number;
  columnId: number;
  name: string;
  commentsCount: number;
  descriptionEnabled: boolean;
  description: string;
  value: number | null;
  goal: number;
  typeData: any;
  surveyId: number | null;
  questionId: number | null;
  source: MetricsSourceEnum;
  type: MetricsTypeEnum;
  dateRange: MetricsDateRangeEnum | null;
  startDate: Date | null;
  endDate: Date | null;
  flippedText: string | null;
  persona?: PersonaType | null;
  overall: number;
  nps: number;
  csat: number;
  ces: number;
  x: number;
  y: number;
  z: number;
};

export type BoxItemType = {
  columnId?: number;
  id: number | null;
  isLoading?: boolean;
  isDisabled?: boolean;
  average?: number;
  step: StepType;
  boxTextElement?: BoxTextElementType | null;
  boxElements: BoxElementType[];
  touchPoints: TouchPointType[];
  outcomes: MapOutcomeItemType[];
  metrics: MetricsType[];
  links: LinkType[];
  personaStates?: { [key: string]: any };
};

export type JourneyMapRowType = {
  id: number;
  isLocked: boolean;
  isCollapsed: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  label?: string | null;
  index?: number;
  createdAt?: string;
  updatedAt?: number;
  rowFunction?: MapRowTypeEnum | null | undefined;
  size: number;
  isPersonaAverageDisabled?: boolean;
  outcomeGroup: OutcomeGroupType | null;
  boxes?: BoxItemType[] | null | undefined;
  rowWithPersonas: PersonaType[];
};

export type JourneyMapTextAreaRowsType =
  | JourneyMapRowActionEnum.TEXT
  | JourneyMapRowActionEnum.INSIGHTS;

export type JourneyMapDraggableTextFields =
  | JourneyMapRowActionEnum.INTERACTIONS
  | JourneyMapRowActionEnum.PROS
  | JourneyMapRowActionEnum.CONS
  | JourneyMapRowActionEnum.OPPORTUNITIES
  | JourneyMapRowActionEnum.LIST_ITEM;

export type JourneyMapTouchpointIconsType = {
  id: string | number;
  name: string;
  key: string;
  url?: string;
  type?: string;
};

export type JourneyMapNounProjectIconsType = {
  id: string;
  term: string;
  thumbnail_url: string;
};

type EmotionGroupType = {
  rowId: number;
  boxId: number;
  columnId: number;
  state: string;
  personaId: number;
  color: string;
  text: string;
};

export type SentimentBoxType = {
  [PersonaStateEnum.VeryHappy]: EmotionGroupType[];
  [PersonaStateEnum.Happy]: EmotionGroupType;
  [PersonaStateEnum.Neutral]: EmotionGroupType;
  [PersonaStateEnum.Sad]: EmotionGroupType;
  [PersonaStateEnum.VerySad]: EmotionGroupType;
  id: number;
};

export type CommentItemType =
  | JourneyMapDraggableTextFields
  | JourneyMapTextAreaRowsType
  | JourneyMapRowActionEnum.IMAGE;
