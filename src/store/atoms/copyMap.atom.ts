import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { CopyMapLevelTemplateEnum } from '@/utils/ts/enums/global-enums';

export const copyMapState = atom({
  key: uuidv4(),
  default: {
    orgId: null,
    mapId: null,
    workspaceId: null,
    boardId: null,
    template: CopyMapLevelTemplateEnum.WORKSPACES,
    isProcessing: false,
  } as {
    orgId: null | number;
    mapId: null | number;
    workspaceId: null | number;
    boardId: null | number;
    template: CopyMapLevelTemplateEnum;
    isProcessing: boolean;
  },
});
