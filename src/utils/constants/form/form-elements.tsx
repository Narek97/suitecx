import {
  AiModelElementType,
  CreateUserElementType,
  NPSDataPointElementType,
  OutcomesElementType,
} from '@/utils/ts/types/form/form-elements-type';

export const CREATE_USER_FORM_ELEMENTS: Array<CreateUserElementType> = [
  {
    name: 'firstName',
    title: 'First Name',
    placeholder: 'First Name',
    type: 'sting',
  },
  {
    name: 'lastName',
    title: 'Last Name',
    placeholder: 'Last Name',
    type: 'sting',
  },
  { name: 'emailAddress', title: 'Email', placeholder: 'Email', type: 'sting' },
];

export const OUTCOMES_FORM_ELEMENTS: Array<OutcomesElementType> = [
  {
    name: 'name',
    title: 'Singular',
    placeholder: 'Singular Name',
    type: 'sting',
  },
  {
    name: 'pluralName',
    title: 'Plural',
    placeholder: 'Plural Name',
    type: 'sting',
  },
];

export const NPS_DATA_POINT_ELEMENTS: Array<NPSDataPointElementType> = [
  {
    name: 'valueOne',
    title: 'Detractors',
    placeholder: 'Set detractors',
    type: 'number',
  },
  {
    name: 'valueTwo',
    title: 'Passive',
    placeholder: 'Set neutral',
    type: 'number',
  },
  {
    name: 'valueThree',
    title: 'Promoter',
    placeholder: 'Set promoter',
    type: 'number',
  },
];

export const CSAT_DATA_POINT_ELEMENTS: Array<NPSDataPointElementType> = [
  {
    name: 'valueOne',
    title: 'Satisfied',
    placeholder: 'Set dissatisfied',
    type: 'number',
  },
  {
    name: 'valueTwo',
    title: 'Neutral',
    placeholder: 'Set neutral',
    type: 'number',
  },
  {
    name: 'valueThree',
    title: 'Dissatisfied',
    placeholder: 'Set satisfied',
    type: 'number',
  },
];

export const CES_DATA_POINT_ELEMENTS: Array<NPSDataPointElementType> = [
  {
    name: 'valueOne',
    title: 'Easy',
    placeholder: 'Set detractors',
    type: 'number',
  },
  {
    name: 'valueTwo',
    title: 'Neutral',
    placeholder: 'Set neutral',
    type: 'number',
  },
  {
    name: 'valueThree',
    title: 'Difficult',
    placeholder: 'Set promoter',
    type: 'number',
  },
];

export const AI_MODEL_FORM_ELEMENTS: Array<AiModelElementType> = [
  {
    name: 'name',
    title: 'Name',
    placeholder: 'Type name',
    type: 'sting',
    isMultiline: false,
  },
  {
    name: 'prompt',
    title: 'Prompt',
    placeholder: 'Type prompt',
    type: 'sting',
    isMultiline: true,
  },
];
