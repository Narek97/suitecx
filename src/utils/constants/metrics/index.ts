import { MetricsTypeEnum } from '@/gql/types';

const METRICS_DEFAULT_DATA = {
  name: '',
  descriptionEnabled: false,
  description: '',
  source: undefined,
  dateRange: undefined,
  type: MetricsTypeEnum.Nps,
  survey: null,
  question: null,
  goal: 0,
};

const DATA_POINT_DEFAULT_DATA = {
  valueOne: 0,
  valueTwo: 0,
  valueThree: 0,
  goal: 0,
};

const NPS_TEMPLATE = [
  { Date: new Date(), Detractor: 0, Passive: 0, Promoter: 0 },
  { Date: new Date(), Detractor: 0, Passive: 0, Promoter: 0 },
  { Date: new Date(), Detractor: 0, Passive: 0, Promoter: 0 },
  { Date: new Date(), Detractor: 0, Passive: 0, Promoter: 0 },
  { Date: new Date(), Detractor: 0, Passive: 0, Promoter: 0 },
];

const CSAT_TEMPLATE = [
  { Date: new Date(), Satisfied: 0, Neutral: 0, Dissatisfied: 0 },
  { Date: new Date(), Satisfied: 0, Neutral: 0, Dissatisfied: 0 },
  { Date: new Date(), Satisfied: 0, Neutral: 0, Dissatisfied: 0 },
  { Date: new Date(), Satisfied: 0, Neutral: 0, Dissatisfied: 0 },
  { Date: new Date(), Satisfied: 0, Neutral: 0, Dissatisfied: 0 },
];

const CES_TEMPLATE = [
  { Date: new Date(), Easy: 0, Neutral: 0, Difficult: 0 },
  { Date: new Date(), Easy: 0, Neutral: 0, Difficult: 0 },
  { Date: new Date(), Easy: 0, Neutral: 0, Difficult: 0 },
  { Date: new Date(), Easy: 0, Neutral: 0, Difficult: 0 },
  { Date: new Date(), Easy: 0, Neutral: 0, Difficult: 0 },
];

export { METRICS_DEFAULT_DATA, DATA_POINT_DEFAULT_DATA, NPS_TEMPLATE, CSAT_TEMPLATE, CES_TEMPLATE };
