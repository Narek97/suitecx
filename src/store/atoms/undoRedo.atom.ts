import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';

export const undoActionsState = atom({
  key: uuidv4(),
  default: [] as Array<{
    id: string;
    type: JourneyMapRowActionEnum;
    action: ActionsEnum;
    data: any;
    subAction?: ActionsEnum | null;
  }>,
});

export const redoActionsState = atom({
  key: uuidv4(),
  default: [] as Array<{
    id: string;
    type: JourneyMapRowActionEnum;
    action: ActionsEnum;
    data: any;
    subAction?: ActionsEnum | null;
  }>,
});
