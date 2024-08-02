import React, { ChangeEvent, FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CardHeader from '@/containers/journey-map-container/journey-map-rows/card-header';
import {
  DeleteTouchPointMutation,
  useDeleteTouchPointMutation,
} from '@/gql/mutations/generated/deleteTouchPoint.generated';
import {
  UpdateTouchPointMutation,
  useUpdateTouchPointMutation,
} from '@/gql/mutations/generated/updateTouchPoint.generated';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import TouchPointIcon from '@/public/journey-map/touchpoint.svg';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { TOUCHPOINT_ITEM_OPTIONS } from '@/utils/constants/options';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { CommentButtonItemType } from '@/utils/ts/types/global-types';
import { BoxItemType, TouchPointType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ITouchpointItem {
  touchpoint: TouchPointType;
  disabled: boolean;
  rowItem: BoxItemType;
  rowId: number;
  onHandleUpdateMapByType: (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => void;
  dragHandleProps: any;
}

const TouchpointCard: FC<ITouchpointItem> = memo(
  ({ touchpoint, disabled, rowItem, rowId, dragHandleProps, onHandleUpdateMapByType }) => {
    const { mapID } = useParams();

    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
    const [cardBgColor, setCardBgColor] = useState<string | null>(touchpoint.bgColor);

    const { mutate: mutateUpdateTouchPoint } = useUpdateTouchPointMutation<
      UpdateTouchPointMutation,
      Error
    >({
      onSuccess: () => {
        onHandleUpdateMapByType(JourneyMapRowActionEnum.TOUCHPOINTS, ActionsEnum.UPDATE, {
          touchPoints: [
            { ...touchpoint, bgColor: cardBgColor, previousBgColor: touchpoint.bgColor },
          ],
          rowId,
          stepId: rowItem?.step.id,
          columnId: touchpoint.columnId,
          mapID: +mapID!,
        });
        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.TOUCHPOINTS,
            action: ActionsEnum.UPDATE,
            data: {
              touchPoints: [
                { ...touchpoint, bgColor: cardBgColor, previousBgColor: touchpoint.bgColor },
              ],
              rowId,
              stepId: rowItem?.step.id,
              columnId: touchpoint.columnId,
              mapID: +mapID!,
            },
          },
        ]);
      },
    });

    const { mutate: mutateDeleteTouchPoint } = useDeleteTouchPointMutation<
      DeleteTouchPointMutation,
      Error
    >({
      onSuccess: () => {
        onHandleUpdateMapByType(JourneyMapRowActionEnum.TOUCHPOINTS, ActionsEnum.DELETE, {
          touchPoints: [
            { ...touchpoint, bgColor: cardBgColor, previousBgColor: touchpoint.bgColor },
          ],
          rowId,
          stepId: rowItem?.step.id,
          columnId: touchpoint.columnId,
          mapID: +mapID!,
        });
        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.TOUCHPOINTS,
            action: ActionsEnum.CREATE,
            data: {
              touchPoints: [
                { ...touchpoint, bgColor: cardBgColor, previousBgColor: touchpoint.bgColor },
              ],
              rowId,
              stepId: rowItem?.step.id,
              columnId: touchpoint.columnId,
              mapID: +mapID!,
            },
          },
        ]);
        setIsLoading(false);
      },
    });

    const onHandleUpdateTouchpoint = () => {
      if (cardBgColor !== touchpoint.bgColor) {
        mutateUpdateTouchPoint({
          updateTouchPointInput: {
            id: touchpoint.id,
            bgColor: cardBgColor,
          },
        });
      }
    };

    const onHandleDelete = useCallback(() => {
      setIsLoading(true);
      mutateDeleteTouchPoint({
        id: touchpoint.id,
      });
    }, [mutateDeleteTouchPoint, touchpoint?.id]);

    const onHandleOpenNote = useCallback(() => {
      setSelectedNoteId(touchpoint.id);
    }, [touchpoint.id]);

    const onHandleChangeColor = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      setCardBgColor(e.target.value);
    }, []);

    const options = useMemo(() => {
      return TOUCHPOINT_ITEM_OPTIONS({
        onHandleDelete,
        onHandleChangeColor,
      });
    }, [onHandleDelete, onHandleChangeColor]);

    const commentRelatedData: CommentButtonItemType = {
      title: touchpoint.title,
      itemId: touchpoint.id,
      rowId: touchpoint.rowId,
      columnId: rowItem.columnId!,
      stepId: rowItem.step.id,
      type: CommentAndNoteModelsEnum.Touchpoint,
    };

    useEffect(() => {
      setCardBgColor(touchpoint.bgColor);
    }, [touchpoint]);

    return (
      <div
        className={'touchpoint-item'}
        data-testid={'touchpoint-card-test-id'}
        id={'touchpoint-card'}>
        <div className={`${isLoading ? 'touchpoint-item--loading' : ''}`} />

        <CardHeader
          icon={<TouchPointIcon />}
          isShowPerson={!!touchpoint.persona}
          persona={{
            name: touchpoint.persona?.name || '',
            url: touchpoint.persona?.attachment?.url || '',
            key: touchpoint.persona?.attachment?.key || '',
          }}
          isShowNote={selectedNoteId === touchpoint.id}
          note={{
            id: touchpoint.id,
            type: CommentAndNoteModelsEnum.Touchpoint,
            rowId: touchpoint.rowId,
            stepId: rowItem?.step.id,
            onHandleOpenNote,
            onClickAway: () => setSelectedNoteId(null),
          }}
          comment={{
            count: touchpoint?.commentsCount,
            item: commentRelatedData,
          }}
          menu={{
            item: commentRelatedData,
            options,
            disabled,
            onCloseFunction: onHandleUpdateTouchpoint,
          }}
          dragHandleProps={dragHandleProps}
        />

        <div
          className={'touchpoint-item--content'}
          style={{
            backgroundColor: cardBgColor || '#f5f7ff',
          }}>
          <Image
            src={touchpoint.iconUrl}
            alt={touchpoint.title}
            width={200}
            height={200}
            style={{ width: '16px', height: '16px' }}
          />
          <p className={'touchpoint-item--content--title'}>{touchpoint.title}</p>
        </div>
      </div>
    );
  },
);

export default TouchpointCard;
