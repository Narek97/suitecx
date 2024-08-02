import { useCallback } from 'react';

import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';

export const useCrudMapBoxElement = () => {
  const { updateMapByType } = useUpdateMap();

  const setUndoActions = useSetRecoilState(undoActionsState);
  const setRedoActions = useSetRecoilState(redoActionsState);

  const crudBoxElement = useCallback(
    (data: any, action: ActionsEnum) => {
      switch (action) {
        case ActionsEnum.CREATE: {
          updateMapByType(JourneyMapRowActionEnum.BOX_ELEMENT, ActionsEnum.CREATE, data);
          setRedoActions([]);
          setUndoActions(prev => [
            ...prev,
            {
              id: uuidv4(),
              type: JourneyMapRowActionEnum.BOX_ELEMENT,
              action: ActionsEnum.DELETE,
              data,
            },
          ]);
          break;
        }
        case ActionsEnum.UPDATE: {
          updateMapByType(JourneyMapRowActionEnum.BOX_ELEMENT, ActionsEnum.UPDATE, data);
          setRedoActions([]);
          setUndoActions(undoPrev => [
            ...undoPrev,
            {
              id: uuidv4(),
              type: JourneyMapRowActionEnum.BOX_ELEMENT,
              action: ActionsEnum.UPDATE,
              data,
            },
          ]);
          break;
        }
        case ActionsEnum.DELETE: {
          updateMapByType(JourneyMapRowActionEnum.BOX_ELEMENT, ActionsEnum.DELETE, data);
          setRedoActions([]);
          setUndoActions(undoPrev => [
            ...undoPrev,
            {
              id: uuidv4(),
              type: JourneyMapRowActionEnum.BOX_ELEMENT,
              action: ActionsEnum.CREATE,
              data,
            },
          ]);
          break;
        }
      }
    },
    [setRedoActions, setUndoActions, updateMapByType],
  );

  return { crudBoxElement };
};
