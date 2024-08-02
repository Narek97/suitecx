import React, { FC, KeyboardEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import { v4 as uuidv4 } from 'uuid';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CardHeader from '@/containers/journey-map-container/journey-map-rows/card-header';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import ConsIcon from '@/public/journey-map/cons.svg';
import InteractionIcon from '@/public/journey-map/interaction.svg';
import ListIcon from '@/public/journey-map/list.svg';
import ProsIcon from '@/public/journey-map/pros.svg';
import { JOURNEY_MAP_TEXT_FIELD_OPTIONS } from '@/utils/constants/options';
import { JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { CommentButtonItemType, ObjectKeysType } from '@/utils/ts/types/global-types';
import { BoxElementType, BoxTextElementType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ICardInput {
  item: BoxElementType | BoxTextElementType;
  type: JourneyMapRowActionEnum;
  headerColor: string;
  bodyColor: string;
  rowId: number;
  stepId: number;
  columnId: number;
  disabled: boolean;
  isLoading: boolean;
  onHandleDeleteBoxElement: ({ itemId }: { itemId: number }) => void;
  onHandleUpdateBoxElement: ({
    id,
    value,
    rowId,
    columnId,
    stepId,
  }: {
    id: number;
    value: string;
    rowId: number;
    columnId: number;
    stepId: number;
  }) => void;
  dragHandleProps?: any;
}

const CardInput: FC<ICardInput> = memo(
  ({
    item,
    type,
    headerColor,
    bodyColor,
    rowId,
    stepId,
    columnId,
    disabled,
    isLoading,
    onHandleDeleteBoxElement,
    onHandleUpdateBoxElement,
    dragHandleProps,
  }) => {
    const [labelValue, setLabelValue] = useState<string>('');
    const [isOpenNote, setIsOpenNote] = useState<boolean>(false);

    const itemIcon: ObjectKeysType = {
      [JourneyMapRowActionEnum.CONS]: <ConsIcon />,
      [JourneyMapRowActionEnum.PROS]: <ProsIcon />,
      [JourneyMapRowActionEnum.INTERACTIONS]: <InteractionIcon />,
      [JourneyMapRowActionEnum.LIST_ITEM]: <ListIcon />,
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const target = event.target as HTMLInputElement;
        target.blur();
      }
    };

    const onHandleToggleNote = useCallback(() => {
      setIsOpenNote(prev => !prev);
    }, []);

    const options = useMemo(() => {
      return JOURNEY_MAP_TEXT_FIELD_OPTIONS({
        onHandleDelete: onHandleDeleteBoxElement,
      });
    }, [onHandleDeleteBoxElement]);

    const commentRelatedData: CommentButtonItemType = {
      itemId: item.id || 0,
      title: item.text,
      columnId,
      rowId,
      stepId,
      type: CommentAndNoteModelsEnum.BoxElement,
    };

    useEffect(() => {
      setLabelValue(item?.text || '');
    }, [item?.text]);

    return (
      <div
        className={'draggable-input map-item'}
        data-testid={`draggable-input-${item?.id}-test-id`}>
        <div className={`${isLoading ? 'touchpoint-item--loading' : ''}`} />

        <CardHeader
          icon={itemIcon[type]}
          isShowPerson={!!item.persona}
          persona={{
            name: item.persona?.name || '',
            url: item.persona?.attachment?.url || '',
            key: item.persona?.attachment?.key || '',
          }}
          isShowNote={isOpenNote}
          note={{
            id: item.id || 0,
            type: CommentAndNoteModelsEnum.BoxElement,
            rowId,
            stepId,
            onHandleOpenNote: onHandleToggleNote,
            onClickAway: onHandleToggleNote,
          }}
          comment={{
            count: item.commentsCount || 0,
            item: commentRelatedData,
          }}
          menu={{
            item: commentRelatedData,
            options,
            disabled,
          }}
          dragHandleProps={dragHandleProps}
          headerColor={headerColor}
        />

        <CustomInput
          id={String(item?.id) + uuidv4()}
          multiline={true}
          minRows={1}
          disabled={disabled}
          onKeyDown={handleInputKeyDown}
          sxStyles={{
            minWidth: '100%',
            background: `${bodyColor}`,
          }}
          inputType={'secondary'}
          placeholder="Type here..."
          value={labelValue}
          onChange={e => {
            setLabelValue(e.target.value);
            onHandleUpdateBoxElement({
              id: item?.id || 0,
              value: e.target.value,
              rowId,
              columnId,
              stepId,
            });
          }}
        />
      </div>
    );
  },
);

export default CardInput;
