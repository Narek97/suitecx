import React, { FC, useCallback } from 'react';

import './style.scss';

import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CardFlip from '@/components/templates/card-flip';
import MapItemBackCard from '@/components/templates/map-item-back-card';
import { useCrudMapBoxElement } from '@/containers/journey-map-container/hooks/useCRUDMapBoxElement';
import AddRowBoxElementBtn from '@/containers/journey-map-container/journey-map-rows/add-row-box-element-btn';
import CardInput from '@/containers/journey-map-container/journey-map-rows/row-types/row-text-fields/draggable-cards/card-Input';
import { useAddBoxElementMutation } from '@/gql/mutations/generated/addBoxElement.generated';
import { useRemoveBoxElementMutation } from '@/gql/mutations/generated/removeBoxElement.generated';
import { useUpdateBoxElementMutation } from '@/gql/mutations/generated/updateBoxElement.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { ActionsEnum } from '@/utils/ts/enums/global-enums';
import {
  JourneyMapDraggableTextFields,
  JourneyMapRowType,
} from '@/utils/ts/types/journey-map/journey-map-types';

interface IDraggableCards {
  row: JourneyMapRowType;
  rowIndex: number;
  type: JourneyMapDraggableTextFields;
  width: number;
  headerColor: string;
  bodyColor: string;
  disabled: boolean;
}

const DraggableCards: FC<IDraggableCards> = ({
  row,
  rowIndex,
  type,
  width,
  headerColor,
  bodyColor,
  disabled,
}) => {
  const { crudBoxElement } = useCrudMapBoxElement();
  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);

  const { mutate: addBoxElement } = useAddBoxElementMutation({
    onSuccess: response => {
      crudBoxElement(response?.addBoxElement, ActionsEnum.CREATE);
    },
  });

  const { mutate: updateBoxElement } = useUpdateBoxElementMutation({
    onSuccess: response => {
      crudBoxElement(response?.updateBoxElement, ActionsEnum.UPDATE);
    },
  });

  const { mutate: removeBoxElement, isLoading: isLoadingRemoveBoxElement } =
    useRemoveBoxElementMutation({
      onSuccess: response => {
        crudBoxElement(response?.removeBoxElement, ActionsEnum.DELETE);
      },
    });

  const onHandleAddBoxElement = (columnId: number, stepId: number) => {
    addBoxElement({
      addBoxElementInput: {
        rowId: row?.id,
        stepId,
        columnId: columnId || 1,
        personaId: selectedPerson?.id || null,
        text: '',
      },
    });
  };

  const onHandleUpdateBoxElement = useCallback(
    ({ id, value }: { id: number; value: string }) => {
      debounced400(() => {
        updateBoxElement({
          updateBoxDataInput: {
            boxElementId: id,
            text: value,
          },
        });
      });
    },
    [updateBoxElement],
  );

  const onHandleDeleteBoxElement = useCallback(
    ({ itemId }: { itemId: number }) => {
      removeBoxElement({
        removeBoxElementInput: {
          boxElementId: itemId!,
        },
      });
    },
    [removeBoxElement],
  );

  return (
    <>
      {row?.boxes?.map((rowItem, boxIndex) => (
        <React.Fragment key={`${type}*${rowIndex}*${String(row?.id)}*${boxIndex}`}>
          <div className={'cons-pros-interaction '}>
            {rowItem.isLoading ? (
              <div className={'journey-map-row--loading'}>
                <CustomLoader />
              </div>
            ) : (
              <>
                <Droppable
                  droppableId={`${type}*${rowIndex}*${String(row?.id)}*${boxIndex}*${
                    rowItem.step.id
                  }*${rowItem.step.id}`}
                  type={type}
                  key={`${type}*${rowIndex}*${String(row?.id)}*${boxIndex}`}>
                  {provided => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={'cons-pros-interaction--column'}
                      style={{
                        width: `${width}px`,
                        minWidth: `${width}px`,
                      }}>
                      <div className={'cons-pros-interaction--column--item map-item'}>
                        {rowItem.boxElements.map((item, index: number) => {
                          return (
                            <Draggable
                              key={item?.id + '_' + index}
                              draggableId={String(item?.id)}
                              index={index}
                              isDragDisabled={disabled}>
                              {provided2 => {
                                return (
                                  <div
                                    {...provided2.draggableProps}
                                    className={'cons-pros-interaction--card'}
                                    ref={provided2.innerRef}>
                                    <CardFlip
                                      frontCard={
                                        <>
                                          <CardInput
                                            item={item}
                                            type={type}
                                            headerColor={headerColor}
                                            bodyColor={bodyColor}
                                            rowId={row.id}
                                            stepId={rowItem.step.id}
                                            columnId={rowItem.columnId!}
                                            disabled={disabled || !!item?.isDisabled}
                                            isLoading={isLoadingRemoveBoxElement}
                                            onHandleDeleteBoxElement={onHandleDeleteBoxElement}
                                            onHandleUpdateBoxElement={onHandleUpdateBoxElement}
                                            dragHandleProps={provided2.dragHandleProps}
                                          />
                                        </>
                                      }
                                      backCard={
                                        <MapItemBackCard
                                          className={`cons-pros-interaction--back-card`}
                                          annotationValue={item.flippedText}
                                          rowId={row?.id}
                                          stepId={rowItem.step.id}
                                          itemId={item.id}
                                          itemKey={'boxElements'}
                                        />
                                      }
                                    />
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        })}

                        <AddRowBoxElementBtn
                          itemsLength={rowItem?.boxElements.length}
                          label={row?.label?.toLowerCase() || ''}
                          boxIndex={boxIndex}
                          handleClick={() => {
                            onHandleAddBoxElement(rowItem?.columnId as number, rowItem.step.id);
                          }}
                        />
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </>
            )}
          </div>
        </React.Fragment>
      ))}
    </>
  );
};

export default DraggableCards;
