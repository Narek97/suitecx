import { ObjectKeysType } from '@/utils/ts/types/global-types';

const TOOLS_COLORS: Array<{ color: string }> = [
  { color: '#9825fb' },
  { color: '#fc0d1b' },
  { color: '#fffd38' },
  { color: '#29fd2f' },
  { color: '#0b24fb' },
  { color: '#12892b' },
];

const DRAW_COLORS: Array<{ color: string }> = [
  { color: '#000000' },
  { color: '#df4b26' },
  { color: '#1b87e6' },
  { color: '#545e6b' },
  { color: '#058D10' },
];

const NOTE_COLORS: Array<{
  id: number;
  color: string;
  foldedAngleColor: string;
}> = [
  { id: 1, color: '#FFE589', foldedAngleColor: '#f8d251' },
  { id: 2, color: '#9BE3E3', foldedAngleColor: '#4cd9d9' },
  { id: 3, color: '#F599F2', foldedAngleColor: '#e179df' },
  { id: 4, color: '#A7FFDA', foldedAngleColor: '#6df6bd' },
  { id: 5, color: '#BEC8FF', foldedAngleColor: '#acb4d3' },
  { id: 6, color: '#98DAFF', foldedAngleColor: '#54c2ff' },
];

const PRODUCT_SWITCHER_COLORS: ObjectKeysType = {
  'Survey Software': '#C7E2FA',
  'Research Workspace': '#1b87e6',
  'Customer Experience': '#C5EBD7',
  Workforce: '#E7D2FA',
  'Engagement Tools': '#FFBEE7',
};

const PRODUCT_SWITCHER_HOVER_COLORS: ObjectKeysType = {
  'Survey Software': '#1B87E6',
  'Research Workspace': '#1b3480',
  'Customer Experience': '#17C266',
  Workforce: '#A554EB',
  'Engagement Tools': '#ED22A1',
};

const PERSON_SECTION_COLORS: Array<{
  id: number;
  color: string;
}> = [
  { id: 1, color: '#ffffff' },
  { id: 2, color: '#545E6B' },
  { id: 3, color: '#FFD6D9' },
  { id: 4, color: '#EEEBAC' },
  { id: 5, color: '#A7F0D6' },
];

export {
  TOOLS_COLORS,
  DRAW_COLORS,
  NOTE_COLORS,
  PRODUCT_SWITCHER_COLORS,
  PRODUCT_SWITCHER_HOVER_COLORS,
  PERSON_SECTION_COLORS,
};
