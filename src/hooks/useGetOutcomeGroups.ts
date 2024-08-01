import { useCallback, useState } from 'react';

import {
  GetOutcomeGroupsQuery,
  useGetOutcomeGroupsQuery,
} from '@/gql/queries/generated/getOutcomeGroups.generated';

const useGetOutcomeGroups = (needToGet: boolean) => {
  const [outcomesList, setOutcomesList] = useState<
    { label: string; value: string; icon?: string | null }[]
  >([]);
  useGetOutcomeGroupsQuery<GetOutcomeGroupsQuery, Error>(
    {
      getOutcomeGroupsInput: {
        limit: 100,
        offset: 0,
      },
    },
    {
      enabled: needToGet,
      onSuccess: data => {
        setOutcomesList(
          data?.getOutcomeGroups?.outcomeGroups?.map(itm => ({
            label: itm?.pluralName || '',
            value: String(itm?.id),
            icon: itm.icon,
          })) || [],
        );
      },
    },
  );

  const getOutcomesList = useCallback(() => {
    return outcomesList;
  }, [outcomesList]);

  return {
    getOutcomesList,
  };
};

export default useGetOutcomeGroups;
