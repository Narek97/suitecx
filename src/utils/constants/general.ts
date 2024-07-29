import { Fira_Sans } from 'next/font/google';

export const queryCacheTime = 30000;
export const querySlateTime = 3000;
export const BOARD_FILE_TYPES = ['JPG', 'PNG'];
export const PERSONA_FILE_TYPES = ['JPG', 'PNG', 'GIF'];
export const EXEL_FILE_TYPES = ['XLS', 'XLSX', 'CSV'];
export const FILE_TYPES = ['JPG', 'PNG', 'PDF', 'DOCX', 'XLSX', 'XLS', 'MP4'];
export const EMBED_MAP_TYPE = ['JPG', 'PNG', 'PDF', 'MP4', 'GIF'];
export const TOKEN_NAME = 'suitecx-token';
export const LOGIN_ERROR_NAME = 'suitecx-login-error';
export const DEFAULT_OUTCOME_ICON = `${process.env.NEXT_PUBLIC_AWS_URL}/default/outcome-group/icon/action.svg`;
export const USERS_FOR_COPY_ACTION = [8, 3618166, 5376055, 4785992, 5817547];

export const JOURNEY_MAP_LOADING_ROW = {
  id: 99999,
  isLoading: true,
  boxElements: [],
  touchPoints: [],
  outcomes: [],
  metrics: [],
  links: [],
  step: {
    id: 99999,
    name: '',
    index: 1,
    columnId: 1,
  },
};

export const firaSans = Fira_Sans({
  weight: ['100', '200', '300', '400'],
  subsets: ['latin'],
});
