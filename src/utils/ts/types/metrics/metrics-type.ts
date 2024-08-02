import { MetricsDateRangeEnum, MetricsSourceEnum, MetricsTypeEnum } from '@/gql/types';

type MetricsFormType = {
  name: string;
  descriptionEnabled: boolean;
  description?: string;
  source: MetricsSourceEnum;
  type: MetricsTypeEnum;
  dateRange: MetricsDateRangeEnum;
  survey: number | null;
  question: number | null;
  goal: number;
};

type DataPointType = {
  valueOne: number;
  valueTwo: number;
  valueThree: number;
};

type NpsType = {
  date: Date | string;
  detractor: number;
  passive: number;
  promoter: number;
};

type CsatType = {
  date: Date | string;
  satisfied: number;
  neutral: number;
  dissatisfied: number;
};

type CesType = {
  date: Date | string;
  easy: number;
  neutral: number;
  difficult: number;
};

type DatapointType = (NpsType | CsatType | CesType) & {
  id: string | number;
  repeat?: boolean | null;
};

type SurveyLanguageType = {
  languageID: number;
  name: string;
  contents: any; // You might want to specify the type here if you have more information
  default: boolean;
};

type MetricsSurveyItemType = {
  surveyID: number;
  folderID: number;
  name: string;
  url: string;
  status: string;
  creationDate: string;
  modifiedDate: string;
  thankYouMessage: string;
  responseQuota: number;
  expiryDate: string | null; // Consider using a Date object if you parse the date string
  inactiveText: string;
  abbs: boolean;
  saveAndContinue: boolean;
  surveyFinishMode: number;
  completedText: string;
  terminatedText: string;
  quotaOverlimitText: string;
  hasScoringLogic: boolean;
  completedResponses: number;
  viewedResponses: number;
  startedResponses: number;
  terminatedResponses: number;
  lastResponseReceived: string;
  surveyLanguages: SurveyLanguageType[];
};

type RowType = {
  rowID: number;
  text: string;
  required: boolean;
  prefix: string;
  suffix: string;
  displayTextBoxBySide: boolean;
  characterLimit: number;
  columns: ColumnType[];
};

type ColumnType = {
  columnID: number;
  isDefault: boolean;
};

type MetricsSurveyQuestionItemType = {
  questionID: number;
  blockID: number;
  type: string;
  text: string;
  code: string;
  orderNumber: number;
  rows: RowType[];
};

export type {
  MetricsFormType,
  DataPointType,
  NpsType,
  CsatType,
  CesType,
  DatapointType,
  MetricsSurveyItemType,
  MetricsSurveyQuestionItemType,
};
