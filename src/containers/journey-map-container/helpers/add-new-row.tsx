import { useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useSetRecoilState } from 'recoil';

import { useCreateJourneyMapRowMutation } from '@/gql/mutations/generated/createJourneyMapRow.generated';
import { MapRowTypeEnum } from '@/gql/types';
import { mapOutcomesState } from '@/store/atoms/outcomeGroups.atom';
import { getMapColumnNameByType } from '@/utils/helpers/general';
import { ObjectKeysType } from '@/utils/ts/types/global-types';

export const useAddNewRow = (onToggleDrawer: () => void) => {
  const { mapID } = useParams();
  const queryClient = useQueryClient();
  const setOutcomes = useSetRecoilState(mapOutcomesState);

  const updateJourneyMap = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['GetJourneyMapRows.infinite'],
    });
    onToggleDrawer();
  };

  const { mutate: createRow, isLoading: isLoadingCreateRow } = useCreateJourneyMapRowMutation({
    onSuccess: async () => {
      await updateJourneyMap();
    },
    onError: async () => {
      await updateJourneyMap();
    },
  });

  const createJourneyMapRow = useCallback(
    (rowIndex: number, type: MapRowTypeEnum, additionalFields?: ObjectKeysType) => {
      const name = getMapColumnNameByType(type?.toLowerCase());
      let label = name.charAt(0)?.toUpperCase() + name.slice(1)?.toLowerCase();
      if (type === MapRowTypeEnum.Outcomes) {
        label = additionalFields?.label;
        setOutcomes(data => {
          return data?.filter(itm => {
            return +itm?.id !== additionalFields?.outcomeGroupId;
          });
        });
      }
      createRow({
        createRowInput: {
          index: rowIndex,
          size: 1,
          mapId: +mapID!,
          label,
          rowFunction: type as MapRowTypeEnum,
          ...additionalFields,
        },
      });
    },
    [createRow, mapID, setOutcomes],
  );

  return { createJourneyMapRow, isLoadingCreateRow };
};
