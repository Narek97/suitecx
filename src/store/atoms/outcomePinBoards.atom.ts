import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const outcomePinBoardsState = atom({
  key: uuidv4(),
  default: {
    defaultSelected: [],
    selectedIdList: [],
    rejectedIdList: [],
  } as {
    defaultSelected: Array<number>;
    selectedIdList: Array<number>;
    rejectedIdList: Array<number>;
  },
});
