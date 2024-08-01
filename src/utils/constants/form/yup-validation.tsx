import * as yup from 'yup';

import {
  LinkTypeEnum,
  MetricsDateRangeEnum,
  MetricsSourceEnum,
  MetricsTypeEnum,
} from '@/gql/types';

const CREATE_USER_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    emailAddress: yup.string().email('Invalid email').required(`Email is required`).max(50),
    firstName: yup.string().required(`First name is required`).max(50),
    lastName: yup.string().required(`Last name is required`),
  })
  .required();

const OUTCOMES_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    name: yup.string().required(`Singular name is required`),
    pluralName: yup.string().required(`Plural name is required`).max(50),
  })
  .required();

const spaceFolderValidationSchema = yup
  .object()
  .shape({
    name: yup.string().required('Name is required'),
  })
  .required();

const outcomeItemValidationSchema = yup
  .object()
  .shape({
    name: yup.string().required('Title is required'),
    description: yup.string().default(''),
    map: yup.number().nullable().default(null),
    stage: yup
      .number()
      .when('map', {
        is: (value: number) => value,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable().default(null),
      })
      .nullable()
      .default(null),
    step: yup
      .number()
      .when('stage', {
        is: (value: number) => value,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable().default(null),
      })
      .nullable()
      .default(null),
    persona: yup.number().required().nullable().default(null),
  })
  .required();

const CREATE_METRICS_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    name: yup.string().required('Name is required').max(40),
    descriptionEnabled: yup.boolean().default(false),
    description: yup.string().when('descriptionEnabled', {
      is: (value: boolean) => value,
      then: () => yup.string().required('Description is required'),
      otherwise: () => yup.string().default(''),
    }),
    type: yup.mixed<MetricsTypeEnum>().default(MetricsTypeEnum.Nps),
    source: yup.mixed<MetricsSourceEnum>().required('Source is required'),
    dateRange: yup.mixed<MetricsDateRangeEnum>().default(MetricsDateRangeEnum.Custom),
    survey: yup
      .number()
      .when('source', {
        is: (value: MetricsSourceEnum) => value === MetricsSourceEnum.Survey,
        then: () => yup.number().required('Survey is required'),
        otherwise: () => yup.number().nullable().default(null),
      })
      .nullable()
      .default(null),
    question: yup
      .number()
      .when('survey', {
        is: (value: number | null) => typeof value === 'number',
        then: () => yup.number().required('Question is required'),
        otherwise: () => yup.number().nullable().default(null),
      })
      .nullable()
      .default(null),
    goal: yup
      .number()
      .transform(value => (isNaN(value) ? undefined : value))
      .nullable()
      .required('Goal is required'),
  })
  .required();

const ADD_DATA_POINT_VALIDATION_SCHEMA = yup.object().shape({
  valueOne: yup.number().typeError('This field is required').required('This field is required'),
  valueTwo: yup.number().typeError('This field is required').required('This field is required'),
  valueThree: yup.number().typeError('This field is required').required('This field is required'),
});

const CREATE_LINK_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    type: yup.string().required(''),
    title: yup.string().nullable().default(null),
    linkedMapId: yup
      .number()
      .when('type', {
        is: (value: string) => value === LinkTypeEnum.Journey,
        then: () => yup.number().required('Map is required'),
        otherwise: () => yup.number().nullable().default(null),
      })
      .nullable()
      .default(null),
    url: yup
      .string()
      .when('type', {
        is: (value: string) => value === LinkTypeEnum.External,
        then: () =>
          yup
            .string()
            .matches(/(^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$)/, 'Enter correct url!')
            .required(),
        otherwise: () => yup.string().nullable().default(null),
      })
      .nullable()
      .default(null),
  })
  .required();

const CREATE_INTERVIEW_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    name: yup.string().required('Name is required'),
    aiJourneyModelId: yup.number().required('Ai  model is required'),
    text: yup.string().required('Transcript is required'),
    boardId: yup.number().required('Board is required'),
  })
  .required();

const CREATE_AI_MODEL_VALIDATION_SCHEMA = yup
  .object()
  .shape({
    name: yup.string().required('Name is required'),
    prompt: yup.string().required('Prompt is required'),
    universal: yup.boolean().default(false),
    orgIds: yup
      .array()
      .of(yup.number().required())
      .when('universal', {
        is: (value: boolean) => !value,
        then: () =>
          yup.array().min(1, 'Select at least one organization').required('Org ids is required'),
        otherwise: () => yup.array().of(yup.number().required()).default([]),
      })
      .default([]),
  })
  .required();

export {
  CREATE_USER_VALIDATION_SCHEMA,
  OUTCOMES_VALIDATION_SCHEMA,
  spaceFolderValidationSchema,
  CREATE_METRICS_VALIDATION_SCHEMA,
  ADD_DATA_POINT_VALIDATION_SCHEMA,
  CREATE_LINK_VALIDATION_SCHEMA,
  CREATE_INTERVIEW_VALIDATION_SCHEMA,
  CREATE_AI_MODEL_VALIDATION_SCHEMA,
  outcomeItemValidationSchema,
};
