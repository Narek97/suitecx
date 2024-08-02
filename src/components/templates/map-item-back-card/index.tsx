import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react';

import './style.scss';

import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import {
  UpdateItemFlippedTextMutation,
  useUpdateItemFlippedTextMutation,
} from '@/gql/mutations/generated/updateItemFlippedText.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';

interface IMapItemBackCard {
  className: string;
  annotationValue: string | null;
  itemId: number;
  stepId: number;
  rowId: number;
  itemKey: 'boxElements' | 'touchPoints' | 'outcomes' | 'metrics' | 'links';
}
const MapItemBackCard: FC<IMapItemBackCard> = ({
  className,
  annotationValue = '',
  itemId,
  stepId,
  rowId,
  itemKey,
}) => {
  const { updateMapByType } = useUpdateMap();

  const setUndoActions = useSetRecoilState(undoActionsState);
  const setRedoActions = useSetRecoilState(redoActionsState);

  const [annotation, setAnnotation] = useState<string>(annotationValue || '');

  const { mutate: mutateItemFlippedText } = useUpdateItemFlippedTextMutation<
    UpdateItemFlippedTextMutation,
    Error
  >({
    onSuccess: () => {
      const data = {
        id: itemId,
        stepId,
        rowId,
        itemKey,
        flippedText: annotation,
        previousFlippedText: annotationValue,
      };
      updateMapByType(JourneyMapRowActionEnum.BACK_CARD, ActionsEnum.UPDATE, data);
      setRedoActions([]);
      setUndoActions(prev => [
        ...prev,
        {
          id: uuidv4(),
          type: JourneyMapRowActionEnum.BACK_CARD,
          action: ActionsEnum.UPDATE,
          data,
        },
      ]);
    },
  });

  const onHandleChangeOuterView = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setAnnotation(e.target.value);
      debounced400(() => {
        mutateItemFlippedText({
          updateItemFlippedTextInput: {
            itemId,
            rowId,
            text: e.target.value,
          },
        });
      });
    },
    [itemId, mutateItemFlippedText, rowId],
  );

  useEffect(() => {
    setAnnotation(annotationValue || '');
  }, [annotationValue]);

  return (
    <div className={`map-item-back-card ${className}`}>
      <div className={'map-item-back-card--header'}>
        <p>Flipside</p>
      </div>
      <CustomInput
        style={{
          background: '#eeeeee',
        }}
        inputType={'secondary'}
        multiline={true}
        minRows={3}
        placeholder={'Write down your annotation here'}
        data-testid="map-item-back-card-input-test-id"
        value={annotation}
        onChange={onHandleChangeOuterView}

        // onKeyDown={event => {
        //   if (event.keyCode === 13) {
        //     event.preventDefault();
        //     (event.target as HTMLElement).blur();
        //   }
        // }}
      />
    </div>
  );
};

export default MapItemBackCard;
