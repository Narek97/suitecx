import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { PersonaType, PinnedPersonaItemsType } from '@/utils/ts/types/persona/persona-types';
import { JourneyMapType } from '@/utils/ts/types/journey-map/journey-map-types';

export const journeyMapState = atom({
  key: uuidv4(),
  default: {
    title: '',
    workspaceId: null,
    columns: [],
    rows: [],
  } as JourneyMapType,
});

export const journeyMapRowsCountState = atom({
  key: uuidv4(),
  default: 0 as number,
});

export const selectedJourneyMapPersona = atom({
  key: uuidv4(),
  default: null as null | PersonaType,
});

export const isOpenSelectedJourneyMapPersonaInfoState = atom({
  key: uuidv4(),
  default: false as boolean,
});

export const mapAssignedPersonasState = atom({
  key: uuidv4(),
  default: [] as PersonaType[],
});

export const pinnedPersonaItemsState = atom({
  key: uuidv4(),
  default: {
    demographicInfos: [],
    pinnedSections: [],
  } as PinnedPersonaItemsType,
});
