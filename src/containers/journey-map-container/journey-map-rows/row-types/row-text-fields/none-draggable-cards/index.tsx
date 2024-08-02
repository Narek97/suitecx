import React, { FC, memo, useCallback } from 'react';

import './style.scss';

import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import CardInput from '@/containers/journey-map-container/journey-map-rows/row-types/row-text-fields/none-draggable-cards/card-input';
import { useUpdateTextRowsMutation } from '@/gql/mutations/generated/updateTextRows.generated';
import { debounced400 } from '@/hooks/useDebounce';
import TextIcon from '@/public/journey-map/text.svg';
import InsightsIcon from '@/public/journey-map/text.svg';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import {
  JourneyMapDraggableTextFields,
  JourneyMapRowType,
} from '@/utils/ts/types/journey-map/journey-map-types';

interface INoneDraggableCards {
  row: JourneyMapRowType;
  type: JourneyMapDraggableTextFields;
  width: number;
  headerColor: string;
  bodyColor: string;
  disabled: boolean;
}

const NoneDraggableCards: FC<INoneDraggableCards> = memo(
  ({ row, type, width, headerColor, bodyColor, disabled }) => {
    const { updateMapByType } = useUpdateMap();

    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);

    const itemIcon: ObjectKeysType = {
      [JourneyMapRowActionEnum.TEXT]: <TextIcon />,
      [JourneyMapRowActionEnum.INSIGHTS]: <InsightsIcon />,
    };

    const { mutate: updateTextRowData } = useUpdateTextRowsMutation({
      onSuccess: response => {
        updateMapByType(
          JourneyMapRowActionEnum.BOX_TEXT_ELEMENT,
          ActionsEnum.UPDATE,
          response.updateTextRows,
        );
        setRedoActions([]);
        setUndoActions(prev => [
          ...prev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.BOX_TEXT_ELEMENT,
            action: ActionsEnum.UPDATE,
            data: response.updateTextRows,
          },
        ]);
      },
    });

    const onHandleUpdateBoxElement = useCallback(
      ({ value, columnId, stepId }: { value: string; columnId: number; stepId: number }) => {
        debounced400(() => {
          updateTextRowData({
            updateTextRowInput: {
              text: value,
              rowId: row.id,
              columnId,
              stepId,
            },
          });
        });
      },
      [row.id, updateTextRowData],
    );

    return (
      <>
        {row?.boxes?.map((rowItem, index) => (
          <React.Fragment key={`text_area_${row?.id}_${index}`}>
            {rowItem.isLoading ? (
              <div className={'journey-map-row--loading'}>
                <CustomLoader />
              </div>
            ) : (
              <div
                className={'text-insights'}
                style={{
                  width: `${width}px`,
                  minWidth: `${width}px`,
                }}
                key={`text_area_${row?.id}_${index}`}>
                <CardInput
                  icon={itemIcon[type]}
                  headerColor={headerColor}
                  bodyColor={bodyColor}
                  disabled={disabled}
                  rowItem={rowItem}
                  onHandleUpdateBoxElement={onHandleUpdateBoxElement}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </>
    );
  },
);

export default NoneDraggableCards;
