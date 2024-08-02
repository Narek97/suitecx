import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';

import './style.scss';

import deepcopy from 'deepcopy';
import { useRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import StepInput from '@/containers/journey-map-container/journey-map-steps/draggable-item/step-input';
import {
  AddOrUpdateColumnStepMutation,
  useAddOrUpdateColumnStepMutation,
} from '@/gql/mutations/generated/addOrUpdateColumnStep.generated';
import {
  DeleteColumnStepMutation,
  useDeleteColumnStepMutation,
} from '@/gql/mutations/generated/deleteColumnStep.generated';
import { debounced800 } from '@/hooks/useDebounce';
import DragIcon from '@/public/base-icons/drag-icon.svg';
import PlusSignIcon from '@/public/operations/plus.svg';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { JOURNEY_MAP_COLUM_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ChildRef {
  createNewColumn: () => void;
}

interface IDraggableItem {
  stepItem: BoxItemType;
  index: number;
  stageStepCount: number;
  isGuest: boolean;
  onHandleCreateNewStep: (
    columnId: number,
    id: number,
    stepIndex: number,
    position: number,
  ) => void;
  onHandleDeleteStep: (id: number, columnId: number) => void;
  dragHandleProps?: any;
}

const DraggableItem = forwardRef<ChildRef, IDraggableItem>((props, ref) => {
  const {
    stepItem,
    index,
    stageStepCount,
    isGuest,
    onHandleCreateNewStep,
    onHandleDeleteStep,
    dragHandleProps,
  } = props;

  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);

  const { mutate: deleteColumnStepMutate } = useDeleteColumnStepMutation<
    DeleteColumnStepMutation,
    Error
  >();

  const { mutate: createOrUpdateStepMutate } = useAddOrUpdateColumnStepMutation<
    AddOrUpdateColumnStepMutation,
    Error
  >();

  const onHandleCreateStep = useCallback(
    (position: number) => {
      let dragIndex = position;
      const columnId = stepItem.columnId!;
      const columnIndex = journeyMap.columns.findIndex(c => c.id === columnId);

      for (let i = 0; i < columnIndex; i++) {
        dragIndex -= journeyMap.columns[i].size;
      }

      createOrUpdateStepMutate(
        {
          addOrUpdateColumnStepInput: {
            add: {
              columnId,
              name: '',
              index: dragIndex,
            },
          },
        },
        {
          onSuccess: response => {
            const { id, index: stepIndex } = response.addOrUpdateColumnStep.columnStep;
            // emitToSocketMap(JourneyMapEventsEnum.JOURNEY_MAP_STEP_EVENT, {
            //   mapId: +mapID!,
            //   type: ActionsEnum.CREATE,
            //   columnId,
            //   id,
            //   stepIndex,
            //   position: position - 1,
            // });

            onHandleCreateNewStep(columnId, id, stepIndex, position - 2);
          },
        },
      );
    },
    [stepItem.columnId, journeyMap.columns, createOrUpdateStepMutate, onHandleCreateNewStep],
  );

  const onHandleDelete = useCallback(
    (deletedStepItem: BoxItemType) => {
      deleteColumnStepMutate(
        {
          id: deletedStepItem.step.id,
        },
        {
          onSuccess: () => {
            // emitToSocketMap(JourneyMapEventsEnum.JOURNEY_MAP_STEP_EVENT, {
            //   mapId: +mapID!,
            //   type: ActionsEnum.DELETE,
            //   id: deletedStepItem.step.id,
            //   columnId: deletedStepItem.step.columnId,
            // });
            onHandleDeleteStep(deletedStepItem.step.id, deletedStepItem.step.columnId);
          },
        },
      );
    },
    [deleteColumnStepMutate, onHandleDeleteStep],
  );

  const onHandleUpdateStepColumn = useCallback(
    ({ id, value, columnId }: { id: number; value: string; columnId: number }) => {
      debounced800(() => {
        setJourneyMap(prev => {
          let rows = deepcopy(prev?.rows);
          rows[0].boxes?.forEach(itm => {
            if (itm?.step.id === id) {
              itm.step.name = value;
            }
          });
          return { ...prev, rows };
        });
        createOrUpdateStepMutate(
          {
            addOrUpdateColumnStepInput: {
              update: {
                columnId,
                id,
                name: value,
              },
            },
          },
          {
            onSuccess: () => {
              // emitToSocketMap(JourneyMapEventsEnum.JOURNEY_MAP_STEP_EVENT, {
              //   mapId: +mapID!,
              //   columnId,
              //   id,
              //   name: value,
              //   type: ActionsEnum.UPDATE,
              // });
            },
          },
        );
      });
    },
    [createOrUpdateStepMutate, setJourneyMap],
  );

  const options = useMemo(() => {
    return JOURNEY_MAP_COLUM_OPTIONS({
      onHandleDelete,
    });
  }, [onHandleDelete]);

  useImperativeHandle(ref, () => ({
    createNewColumn() {
      onHandleCreateStep(1);
    },
  }));

  return (
    <>
      {stepItem.isLoading ? (
        <div className={'step-draggable-item--loading'}>
          <div {...dragHandleProps} />
          <CustomLoader />
        </div>
      ) : (
        <div className={'step-draggable-item'}>
          <div className={'step-draggable-item--drag-area'} {...dragHandleProps}>
            <DragIcon />
          </div>

          <div>
            <StepInput
              rowId={stepItem?.id}
              index={index}
              columnId={stepItem.columnId!}
              updateStepColumn={data => {
                onHandleUpdateStepColumn({
                  value: data.value,
                  columnId: stepItem.columnId!,
                  id: stepItem.step?.id,
                });
              }}
              label={stepItem?.step?.name || 'Untitled'}
              id={stepItem?.step?.id!}
              disabled={isGuest || !!stepItem?.isDisabled}
            />
          </div>

          {stageStepCount > 1 ? (
            <div className={'step-draggable-item--menu'}>
              <CustomLongMenu
                type={menuViewTypeEnum.VERTICAL}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                item={stepItem}
                options={options}
                disabled={isGuest}
                sxStyles={{
                  display: 'inline-block',
                  background: 'transparent',
                }}
              />
            </div>
          ) : null}

          <div className={'journey-map-step--new-step-button-block'}>
            <button
              aria-label={'plus'}
              className={'journey-map-step--new-step-button-block--button'}
              disabled={isGuest}
              onClick={() => onHandleCreateStep(index + 1)}>
              <PlusSignIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default DraggableItem;
