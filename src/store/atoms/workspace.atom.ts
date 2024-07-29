import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { WorkspaceType } from '@/utils/ts/types/board/board-types';

export const workspaceState = atom({
  key: uuidv4(),
  default: {} as WorkspaceType,
});
