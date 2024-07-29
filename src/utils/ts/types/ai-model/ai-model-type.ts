export type AiModelType = {
  id: number;
  name?: string | null;
  prompt: string;
  universal: boolean;
  transcriptPlace: number;
  attachmentUrl?: string | null;
  selectedOrgIds: Array<number>;
};

export type AiModelFormType = {
  name: string;
  prompt: string;
  universal: boolean;
  orgIds: Array<number>;
};
