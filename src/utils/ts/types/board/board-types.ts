import { PinnedOutcomeGroupType } from '@/utils/ts/types/outcome/outcome-type';
import { JourneyMapCardType } from '@/utils/ts/types/journey-map/journey-map-types';

export type WorkspaceType = {
  id: number;
  feedbackId: number;
  name: string;
  journeyMapCount: number;
  personasCount: number;
};

export type BoardType = {
  id: number;
  createdAt: number;
  defaultMapId: number | null;
  journeyMapCount: number;
  maps: Array<JourneyMapCardType>;
  name: string;
  personasCount: number;
  updatedAt: number;
  workspaceId: number;
  pinnedOutcomeGroupCount: number;
  outcomeGroupWithOutcomeCounts: PinnedOutcomeGroupType[];
};
