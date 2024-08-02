import React, { FC, memo, useCallback, useMemo, useState } from 'react';

import './style.scss';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CardHeader from '@/containers/journey-map-container/journey-map-rows/card-header';
import { CreateUpdateOutcomeWorkspaceLevelMutation } from '@/gql/mutations/generated/createOrUpdateOutcomeWorkspaceLevel.generated';
import { useDeleteOutcomeMutation } from '@/gql/mutations/generated/deleteOutcome.generated';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { JOURNEY_MAP_OUTCOME_ITEM_OPTIONS } from '@/utils/constants/options';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';
import { MapOutcomeItemType } from '@/utils/ts/types/outcome/outcome-type';

interface IOutcomeCard {
  outcome: MapOutcomeItemType;
  disabled: boolean;
  workspaceId: number | null;
  rowItem: BoxItemType;
  dragHandleProps: any;
  openDrawer: (data?: MapOutcomeItemType) => void;
  onHandleUpdateMapByType: (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => void;
}

const OutcomeCard: FC<IOutcomeCard> = memo(
  ({
    outcome,
    disabled,
    workspaceId,
    rowItem,
    dragHandleProps,
    openDrawer,
    onHandleUpdateMapByType,
  }) => {
    const { mapID } = useParams();

    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);

    const [isOpenNote, setIsOpenNote] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { mutate: deleteOutcome } = useDeleteOutcomeMutation<
      CreateUpdateOutcomeWorkspaceLevelMutation,
      Error
    >({
      onSuccess: () => {
        const data = {
          ...outcome,
          previousStepId: outcome.stepId,
          workspaceId,
          map: {
            id: +mapID!,
          },
        };

        onHandleUpdateMapByType(JourneyMapRowActionEnum.OUTCOMES, ActionsEnum.DELETE, data);
        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.OUTCOMES,
            action: ActionsEnum.CREATE,
            data,
          },
        ]);
        setIsLoading(false);
      },
    });

    const onHandleToggleNote = useCallback(() => {
      setIsOpenNote(prev => !prev);
    }, []);

    const onHandleEdit = useCallback(() => {
      openDrawer(outcome);
    }, [openDrawer, outcome]);

    const onHandleDelete = useCallback(() => {
      setIsLoading(true);

      deleteOutcome({
        id: outcome.id,
      });
    }, [deleteOutcome, outcome.id]);

    const options = useMemo(() => {
      return JOURNEY_MAP_OUTCOME_ITEM_OPTIONS({
        onHandleEdit,
        onHandleDelete,
      });
    }, [onHandleDelete, onHandleEdit]);

    const commentRelatedData = {
      title: outcome.title,
      itemId: outcome.id,
      rowId: outcome.rowId,
      columnId: rowItem.columnId!,
      stepId: rowItem.step.id,
      type: CommentAndNoteModelsEnum.Outcome,
    };

    return (
      <div className={`outcome-item`}>
        <div className={`${isLoading ? 'outcome-item--loading' : ''}`} />

        <CardHeader
          icon={
            <>
              <Image
                src={outcome.icon}
                alt="Icon"
                width={200}
                height={200}
                style={{ width: '16px', height: '16px' }}
              />
            </>
          }
          isShowPerson={!!outcome.persona}
          persona={{
            name: outcome.persona?.name || '',
            url: outcome.persona?.attachment?.url || '',
            key: outcome.persona?.attachment?.key || '',
          }}
          isShowNote={isOpenNote}
          note={{
            id: outcome.id,
            type: CommentAndNoteModelsEnum.Outcome,
            rowId: outcome.rowId,
            stepId: rowItem?.step.id,
            onHandleOpenNote: onHandleToggleNote,
            onClickAway: onHandleToggleNote,
          }}
          comment={{
            count: outcome?.commentsCount,
            item: commentRelatedData,
          }}
          menu={{
            item: commentRelatedData,
            options,
            disabled,
          }}
          dragHandleProps={dragHandleProps}
        />

        <div className="outcome-item--content">
          <div className="outcome-item--content--title">{outcome?.title}</div>
          <div className="outcome-item--content--description">{outcome?.description}</div>
        </div>
      </div>
    );
  },
);

export default OutcomeCard;
