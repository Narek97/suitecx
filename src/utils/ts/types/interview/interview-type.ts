export type interviewType = {
  id: number;
  mapId: number;
  name: string;
  text: string;
  boardId: number;
  aiJourneyModelId?: number | null;
};

export type InterviewFormType = {
  name: string;
  aiJourneyModelId: number;
  text: string;
  boardId: number;
};
