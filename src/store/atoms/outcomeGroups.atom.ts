import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { OutcomeGroupType } from '@/utils/ts/types/outcome/outcome-type';

export const mapOutcomesState = atom({
  key: uuidv4(),
  default: [] as Array<OutcomeGroupType>,
});
