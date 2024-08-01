import { MetricsDateRangeEnum, MetricsSourceEnum, MetricsTypeEnum } from '@/gql/types';
import { PersonaGenderEnum, PersonaTypeEnum } from '@/utils/ts/enums/global-enums';
import { DropdownSelectItemType } from '@/utils/ts/types/global-types';

const whiteboardContentMenuItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: 'All canvas',
    value: 'All',
  },
  { id: 2, name: 'My canvas', value: 'Mine' },
];

const fontSizes: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: '10',
    value: '10',
  },
  {
    id: 2,
    name: '12',
    value: '12',
  },
  {
    id: 3,
    name: '14',
    value: '14',
  },
  {
    id: 4,
    name: '24',
    value: '24',
  },
  {
    id: 5,
    name: '36',
    value: '36',
  },
  {
    id: 6,
    name: '48',
    value: '48',
  },
  {
    id: 7,
    name: '64',
    value: '64',
  },
  {
    id: 8,
    name: '80',
    value: '80',
  },
];

const personaTypeMenuItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: 'Customer',
    value: PersonaTypeEnum.Customer,
  },
  { id: 2, name: 'Employee', value: PersonaTypeEnum.Employee },
  { id: 3, name: 'Other', value: PersonaTypeEnum.Others },
];

const personaGenderMenuItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: PersonaGenderEnum.MALE,
    value: PersonaGenderEnum.MALE,
  },
  { id: 2, name: PersonaGenderEnum.FEMALE, value: PersonaGenderEnum.FEMALE },
];

const metricsTypeItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: MetricsTypeEnum.Nps,
    value: MetricsTypeEnum.Nps,
  },
  {
    id: 2,
    name: MetricsTypeEnum.Csat,
    value: MetricsTypeEnum.Csat,
  },
  {
    id: 3,
    name: MetricsTypeEnum.Ces,
    value: MetricsTypeEnum.Ces,
  },
];

const metricsSourceItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: 'CX Surveys',
    value: MetricsSourceEnum.Survey,
  },
  {
    id: 2,
    name: 'Manual/CSV import',
    value: MetricsSourceEnum.Manual,
  },
];

const metricsTrackItems: Array<DropdownSelectItemType> = [
  {
    id: 1,
    name: 'Daily',
    value: MetricsDateRangeEnum.Daily,
  },
  {
    id: 2,
    name: 'Weekly',
    value: MetricsDateRangeEnum.Weekly,
  },
  {
    id: 3,
    name: 'Monthly',
    value: MetricsDateRangeEnum.Monthly,
  },
  {
    id: 4,
    name: 'Yearly',
    value: MetricsDateRangeEnum.Yearly,
  },
  {
    id: 5,
    name: 'Custom',
    value: MetricsDateRangeEnum.Custom,
  },
];

export {
  whiteboardContentMenuItems,
  fontSizes,
  personaTypeMenuItems,
  personaGenderMenuItems,
  metricsTypeItems,
  metricsSourceItems,
  metricsTrackItems,
};
