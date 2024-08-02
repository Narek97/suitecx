import React, { FC, useCallback, useState } from 'react';

import './style.scss';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CardFlip from '@/components/templates/card-flip';
import ErrorBoundary from '@/components/templates/error-boundary';
import MapItemBackCard from '@/components/templates/map-item-back-card';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import AddRowBoxElementBtn from '@/containers/journey-map-container/journey-map-rows/add-row-box-element-btn';
import OutcomeCard from '@/containers/journey-map-container/journey-map-rows/row-types/outcomes/outcome-card';
import OutcomeDrawer from '@/containers/journey-map-container/journey-map-rows/row-types/outcomes/outcome-drawer';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import {
  ActionsEnum,
  JourneyMapRowActionEnum,
  OutcomeLevelEnum,
} from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';
import { MapOutcomeItemType } from '@/utils/ts/types/outcome/outcome-type';

interface ITouchpoints {
  width: number;
  row: JourneyMapRowType;
  rowIndex: number;
  disabled: boolean;
}

const Outcomes: FC<ITouchpoints> = ({ width, row, rowIndex, disabled }) => {
  const { updateMapByType } = useUpdateMap();
  const journeyMap = useRecoilValue(journeyMapState);

  const [selectedColumnStepId, setSelectedColumnStepId] = useState<{
    columnId: number;
    stepId: number;
  } | null>(null);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<MapOutcomeItemType | null>(null);

  const onHandleToggleOutcomeDrawer = useCallback((data?: MapOutcomeItemType) => {
    setSelectedItem(data || null);
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
    <div className={'journey-map-outcomes'}>
      {!disabled && (
        <OutcomeDrawer
          workspaceId={journeyMap?.workspaceId || null}
          singularNameType={row?.outcomeGroup?.name || ''}
          isOpenDrawer={isOpenDrawer}
          level={OutcomeLevelEnum.MAP}
          outcomeGroup={row?.outcomeGroup || null}
          selectedColumnStepId={selectedColumnStepId}
          selectedOutcome={selectedItem}
          onHandleToggleOutcomeDrawer={onHandleToggleOutcomeDrawer}
        />
      )}
      {row?.boxes?.map((rowItem, boxIndex) => (
        <React.Fragment
          key={`${JourneyMapRowActionEnum.OUTCOMES}*${rowIndex}*${String(row.id)}*${boxIndex}`}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'}>
              <CustomLoader />
            </div>
          ) : (
            <Droppable
              droppableId={`${JourneyMapRowActionEnum.OUTCOMES}*${rowIndex}*${String(
                row.id,
              )}*${boxIndex}*${rowItem.step.id}`}
              key={`${JourneyMapRowActionEnum.OUTCOMES}*${rowIndex}*${String(row.id)}*${boxIndex}`}
              type={JourneyMapRowActionEnum.OUTCOMES}>
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={'journey-map-outcomes--column'}
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                  }}>
                  <div className={'journey-map-outcomes--column--item map-item'}>
                    {rowItem?.outcomes?.map((outcome, outcomeIndex: number) => {
                      return (
                        <Draggable
                          key={
                            outcome?.id +
                            '_' +
                            outcomeIndex +
                            '_' +
                            JourneyMapRowActionEnum.OUTCOMES
                          }
                          draggableId={String(outcome?.id) + '_' + JourneyMapRowActionEnum.OUTCOMES}
                          index={outcomeIndex}
                          isDragDisabled={disabled}>
                          {provided2 => {
                            return (
                              <div
                                {...provided2.draggableProps}
                                className={'journey-map-outcomes--card'}
                                data-testid={'outcome-item-test-id'}
                                ref={provided2.innerRef}>
                                <CardFlip
                                  frontCard={
                                    <ErrorBoundary>
                                      <OutcomeCard
                                        outcome={outcome}
                                        rowItem={rowItem}
                                        workspaceId={journeyMap?.workspaceId || null}
                                        disabled={disabled}
                                        dragHandleProps={provided2.dragHandleProps}
                                        openDrawer={onHandleToggleOutcomeDrawer}
                                        onHandleUpdateMapByType={onHandleUpdateMapByType}
                                      />
                                    </ErrorBoundary>
                                  }
                                  backCard={
                                    <MapItemBackCard
                                      className={`journey-map-outcomes--back-card`}
                                      annotationValue={outcome.flippedText || ''}
                                      rowId={row?.id}
                                      stepId={rowItem.step.id}
                                      itemId={outcome.id}
                                      itemKey={'outcomes'}
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
                      itemsLength={rowItem?.outcomes.length}
                      label={row?.label?.toLowerCase() || ''}
                      boxIndex={boxIndex}
                      handleClick={() => {
                        onHandleToggleOutcomeDrawer();
                        setSelectedColumnStepId({
                          columnId: rowItem.columnId!,
                          stepId: rowItem.step.id!,
                        });
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

export default Outcomes;
