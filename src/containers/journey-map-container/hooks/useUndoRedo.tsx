import { useCallback, useEffect } from 'react';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useRecoilState } from 'recoil';

import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { ActionsEnum, UndoRedoEnum } from '@/utils/ts/enums/global-enums';

const actions = {
  [ActionsEnum.CREATE]: ActionsEnum.DELETE,
  [ActionsEnum.DELETE]: ActionsEnum.CREATE,
  [ActionsEnum.UPDATE]: ActionsEnum.UPDATE,
  [ActionsEnum.DRAG]: ActionsEnum.DRAG,
  [ActionsEnum.DISABLE]: ActionsEnum.DISABLE,
  [ActionsEnum.ENABLE]: ActionsEnum.ENABLE,
  [ActionsEnum['CREATE-DELETE']]: ActionsEnum['CREATE-DELETE'],
};

export const useUndoRedo = () => {
  const { updateMapByType } = useUpdateMap();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const [undoActions, setUndoActions] = useRecoilState(undoActionsState);
  const [redoActions, setRedoActions] = useRecoilState(redoActionsState);

  const handleUndo = useCallback(async () => {
    const item = undoActions[undoActions.length - 1];
    if (item && !isFetching && !isMutating) {
      setUndoActions(prev => prev.filter(p => p.id !== item.id));
      setRedoActions(prev => [...prev, { ...item, action: actions[item.action] }]);
      updateMapByType(
        item.type,
        item.action,
        { ...item.data, parentId: item.id },
        UndoRedoEnum.UNDO,
        item.subAction,
      );
    }
  }, [undoActions, isFetching, isMutating, setUndoActions, setRedoActions, updateMapByType]);

  const handleRedo = useCallback(async () => {
    const item = redoActions[redoActions.length - 1];
    if (item && !isFetching && !isMutating) {
      setRedoActions(prev => prev.filter(p => p.id !== item.id));
      setUndoActions(prev => [...prev, { ...item, action: actions[item.action] }]);
      updateMapByType(
        item.type,
        item.action,
        { ...item.data, parentId: item.id },
        UndoRedoEnum.REDO,
        item.subAction,
      );
    }
  }, [isFetching, isMutating, redoActions, setRedoActions, setUndoActions, updateMapByType]);

  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

      if (isMac) {
        const isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';

        if (isUndo) {
          if (event.shiftKey) {
            await handleRedo();
            event.stopPropagation();
            event.preventDefault();
            // Ctrl + Shift + Z or Cmd + Shift + Z
          } else {
            await handleUndo();
            event.stopPropagation();
            event.preventDefault();
            // Ctrl + Z or Cmd + Z
          }
        }
      } else {
        let isUndo = (event.ctrlKey || event.metaKey) && event.key === 'z';
        let isRedo = event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'z';
        if (isUndo) {
          await handleUndo();
          event.stopPropagation();
          event.preventDefault();
          // Ctrl + Z or Cmd + Z
        }
        if (isRedo) {
          await handleRedo();
          event.stopPropagation();
          event.preventDefault();
          // Ctrl + Shift + Z or Cmd + Shift + Z
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Cleanup event listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleRedo, handleUndo]);

  return { handleUndo, handleRedo };
};
