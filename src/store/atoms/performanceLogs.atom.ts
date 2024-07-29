import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { PerformanceLogsType } from '@/utils/ts/types/global-types';

export const performanceLogsState = atom({
  key: uuidv4(),
  default: [] as Array<PerformanceLogsType>,
});
