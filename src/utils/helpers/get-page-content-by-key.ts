import { GetPageContentParamsType } from '@/utils/ts/types/global-types';

export const getPageContentByKey = ({ content, defaultPage, key }: GetPageContentParamsType) => {
  return key && content[key] ? content[key] : defaultPage;
};
