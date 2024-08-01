import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { NoteType } from '@/utils/ts/types/global-types';

export const noteState = atom({
  key: uuidv4(),
  default: null as NoteType | null,
});
