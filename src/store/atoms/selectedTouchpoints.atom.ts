import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { JourneyMapTouchpointIconsType } from '@/utils/ts/types/journey-map/journey-map-types';
import { PersonaGalleryType } from '@/utils/ts/types/persona/persona-types';

export const selectedTouchpointsState = atom({
  key: uuidv4(),
  default: [] as Array<JourneyMapTouchpointIconsType>,
});

export const selectedCustomTouchpointsState = atom({
  key: uuidv4(),
  default: [] as Array<PersonaGalleryType>,
});
