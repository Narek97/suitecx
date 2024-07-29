export type CreateUserElementType = {
  name: 'firstName' | 'lastName' | 'emailAddress';
  title: string;
  placeholder: string;
  type: string;
};

export type OutcomesElementType = {
  name: 'name' | 'pluralName';
  title: string;
  placeholder: string;
  type: string;
};

export type NPSDataPointElementType = {
  name: 'valueOne' | 'valueTwo' | 'valueThree';
  title: string;
  placeholder: string;
  type: string;
};

export type InterviewElementType = {
  name: 'name' | 'journeyType' | 'text';
  title: string;
  placeholder: string;
  type: string;
  isMultiline?: boolean;
};

export type AiModelElementType = {
  name: 'name' | 'prompt';
  title: string;
  type: string;
  placeholder?: string;
  isMultiline?: boolean;
};
