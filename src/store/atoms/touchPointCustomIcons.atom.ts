import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { JourneyMapTouchpointIconsType } from '@/utils/ts/types/journey-map/journey-map-types';

export const touchPointCustomIconsState = atom({
  key: uuidv4(),
  default: [] as Array<JourneyMapTouchpointIconsType>,
});
