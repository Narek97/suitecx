import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { NotesAndCommentsDrawerType } from '@/utils/ts/types/global-types';

export const notesAndCommentsDrawerState = atom({
  key: uuidv4(),
  default: {
    title: '',
    isOpen: false,
    itemId: null,
    type: null,
    rowFunction: null,
    stepId: null,
  } as NotesAndCommentsDrawerType,
});
