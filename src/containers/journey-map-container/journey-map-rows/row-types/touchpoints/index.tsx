import React, { FC, useCallback, useState } from 'react';

import './style.scss';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CardFlip from '@/components/templates/card-flip';
import ErrorBoundary from '@/components/templates/error-boundary';
import MapItemBackCard from '@/components/templates/map-item-back-card';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import AddRowBoxElementBtn from '@/containers/journey-map-container/journey-map-rows/add-row-box-element-btn';
import TouchpointCard from '@/containers/journey-map-container/journey-map-rows/row-types/touchpoints/touchpoint-card';
import TouchpointDrawer from '@/containers/journey-map-container/journey-map-rows/row-types/touchpoints/touchpoint-drawer';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ITouchpoints {
  width: number;
  row: JourneyMapRowType;
  rowIndex: number;
  disabled: boolean;
}

const Touchpoints: FC<ITouchpoints> = ({ width, row, rowIndex, disabled }) => {
  const { updateMapByType } = useUpdateMap();

  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [setSelectedStepId, setSetSelectedStepId] = useState<number | null>(null);

  const onHandleToggleTouchpointDrawer = useCallback((columnId?: number, stepId?: number) => {
    setSelectedColumnId(columnId || null);
    setSetSelectedStepId(stepId || null);
    setIsOpenDrawer(prev => !prev);
  }, []);

  const onHandleUpdateMapByType = useCallback(
    (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => {
      updateMapByType(type, action, data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={'journey-map-touchpoints'}>
      {!disabled && (
        <TouchpointDrawer
          rowItemID={row.id}
          setSelectedStepId={setSelectedStepId}
          selectedColumnId={selectedColumnId}
          isOpenDrawer={isOpenDrawer}
          onHandleToggleTouchpointDrawer={onHandleToggleTouchpointDrawer}
        />
      )}

      {row?.boxes?.map((rowItem, boxIndex) => (
        <React.Fragment
          key={`${JourneyMapRowActionEnum.TOUCHPOINTS}*${rowIndex}*${String(row.id)}*${boxIndex}`}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'}>
              <CustomLoader />
            </div>
          ) : (
            <Droppable
              droppableId={`${JourneyMapRowActionEnum.TOUCHPOINTS}*${rowIndex}*${String(
                row.id,
              )}*${boxIndex}*${rowItem.step.id}`}
              key={`${JourneyMapRowActionEnum.TOUCHPOINTS}*${rowIndex}*${String(
                row.id,
              )}*${boxIndex}`}
              type={JourneyMapRowActionEnum.TOUCHPOINTS}>
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={'journey-map-touchpoints--column'}
                  data-testid={`touchpoint-column-${boxIndex}-test-id`}
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                  }}>
                  <div className={'journey-map-touchpoints--column--item map-item'}>
                    {rowItem?.touchPoints?.map((touchpoint, touchpointIndex: number) => {
                      return (
                        <Draggable
                          key={
                            touchpoint?.id +
                            '_' +
                            touchpointIndex +
                            '_' +
                            JourneyMapRowActionEnum.TOUCHPOINTS
                          }
                          draggableId={
                            String(touchpoint?.id) + '_' + JourneyMapRowActionEnum.TOUCHPOINTS
                          }
                          index={touchpointIndex}
                          isDragDisabled={disabled}>
                          {provided2 => {
                            return (
                              <div
                                {...provided2.draggableProps}
                                className={'journey-map-touchpoints--card map-item'}
                                data-testid={'touchpoint-item-test-id'}
                                ref={provided2.innerRef}>
                                <CardFlip
                                  frontCard={
                                    <ErrorBoundary>
                                      <TouchpointCard
                                        touchpoint={touchpoint}
                                        rowItem={rowItem}
                                        disabled={disabled}
                                        rowId={row.id}
                                        onHandleUpdateMapByType={onHandleUpdateMapByType}
                                        dragHandleProps={provided2.dragHandleProps!}
                                      />
                                    </ErrorBoundary>
                                  }
                                  backCard={
                                    <MapItemBackCard
                                      className={`journey-map-touchpoints--back-card`}
                                      annotationValue={touchpoint.flippedText}
                                      rowId={row?.id}
                                      stepId={rowItem.step.id}
                                      itemId={touchpoint.id}
                                      itemKey={'touchPoints'}
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
                      itemsLength={rowItem?.touchPoints.length}
                      label={row?.label?.toLowerCase() || ''}
                      boxIndex={boxIndex}
                      handleClick={() => {
                        onHandleToggleTouchpointDrawer(rowItem.columnId, rowItem.step.id);
                      }}
                    />
                  </div>

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Touchpoints;
