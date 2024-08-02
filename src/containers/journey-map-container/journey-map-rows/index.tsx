import React, { FC, memo, useCallback } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import deepcopy from 'deepcopy';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import { onDragEndMap } from '@/containers/journey-map-container/helpers/on-drag-end-map';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import JourneyMapRegularRow from '@/containers/journey-map-container/journey-map-rows/journey-map-regular-row';
import JourneyMapSentimentRow from '@/containers/journey-map-container/journey-map-rows/journey-map-sentiment-row';
import RowActionsDrawer from '@/containers/journey-map-container/journey-map-rows/row-name-block/row-actions-drawer';
import {
  CreateUpdateOutcomeMutation,
  useCreateUpdateOutcomeMutation,
} from '@/gql/mutations/generated/createUpdateOutcome.generated';
import {
  UpdateBoxElementMutation,
  useUpdateBoxElementMutation,
} from '@/gql/mutations/generated/updateBoxElement.generated';
import {
  UpdateJourneyMapRowMutation,
  useUpdateJourneyMapRowMutation,
} from '@/gql/mutations/generated/updateJourneyMapRow.generated';
import {
  UpdateMapLinkMutation,
  useUpdateMapLinkMutation,
} from '@/gql/mutations/generated/updateLink.generated';
import {
  UpdateMetricsMutation,
  useUpdateMetricsMutation,
} from '@/gql/mutations/generated/updateMetrics.generated';
import {
  UpdateTouchPointMutation,
  useUpdateTouchPointMutation,
} from '@/gql/mutations/generated/updateTouchPoint.generated';
import { MapRowTypeEnum, UpdateOutcomePositionInput } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import { isElementDraggingState } from '@/store/atoms/isElementDragging.atom';
import { journeyMapRowsCountState, journeyMapState } from '@/store/atoms/journeyMap.atom';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { scrollNeighbours } from '@/utils/helpers/general';
import { getPageContentByKey } from '@/utils/helpers/get-page-content-by-key';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';

import './style.scss';

interface IJourneyMapRows {
  isGuest: boolean;
  isFetchingNextPageJourneyMapRows: boolean;
  onHandleFetchNextPageJourneyMapRows: () => void;
}

const JourneyMapRows: FC<IJourneyMapRows> = memo(
  ({ isGuest, isFetchingNextPageJourneyMapRows, onHandleFetchNextPageJourneyMapRows }) => {
    const { updateMapByType } = useUpdateMap();

    const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);
    const setElementDragging = useSetRecoilState(isElementDraggingState);
    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);
    const journeyMapRowsCount = useRecoilValue(journeyMapRowsCountState);

    const { mutate: updateRow } = useUpdateJourneyMapRowMutation<
      UpdateJourneyMapRowMutation,
      Error
    >();
    const { mutate: updateBoxElement } = useUpdateBoxElementMutation<
      UpdateBoxElementMutation,
      Error
    >();
    const { mutate: creatUpdateOutcome } = useCreateUpdateOutcomeMutation<
      CreateUpdateOutcomeMutation,
      Error
    >();
    const { mutate: mutateUpdateMetrics } = useUpdateMetricsMutation<
      UpdateMetricsMutation,
      Error
    >();
    const { mutate: mutateTouchPoint } = useUpdateTouchPointMutation<
      UpdateTouchPointMutation,
      Error
    >();
    const { mutate: mutateLink } = useUpdateMapLinkMutation<UpdateMapLinkMutation, Error>({});

    const updateRowByFieldName = useCallback(
      ({
        fieldName,
        fieldValue,
        rowId,
      }: {
        fieldName: string;
        fieldValue: string | number;
        rowId: number;
      }) => {
        updateRow(
          {
            updateRowInput: {
              rowId,
              [fieldName]: fieldValue,
            },
          },
          {
            onSuccess: () => {},
          },
        );
      },
      [updateRow],
    );

    const onDragstart = useCallback(() => {
      setElementDragging(true);
    }, [setElementDragging]);

    const updateDataBetweenDifferentRows = useCallback(
      (result: any) => {
        const destData = result?.destination?.droppableId?.split('*');
        const source = result?.source?.droppableId?.split('*');

        const destinationData = {
          rowIndex: destData[1],
          id: destData[2],
          boxIndex: destData[3],
          stepId: +destData[4],
          childIndex: result?.destination?.index,
        };
        const sourceData = {
          rowIndex: source[1],
          id: source[2],
          boxIndex: source[3],
          stepId: +source[4],
          childIndex: result?.source?.index,
        };

        const dropData: any = onDragEndMap(
          {
            source: {
              droppableId: sourceData?.boxIndex,
              index: sourceData?.childIndex,
              rowIndex: sourceData?.rowIndex,
            },
            destination: {
              droppableId: destinationData?.boxIndex,
              index: destinationData?.childIndex,
              rowIndex: destinationData?.rowIndex,
            },
          },
          !(sourceData?.id === destinationData?.id),
          result?.type,
          deepcopy(journeyMap.rows),
        );

        const undoType = {
          [result?.type]: result?.type,
          CONS: 'BOX_ELEMENT',
          PROS: 'BOX_ELEMENT',
          INTERACTIONS: 'BOX_ELEMENT',
          LIST_ITEM: 'BOX_ELEMENT',
        };

        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: undoType[result?.type],
            action: ActionsEnum.DRAG,
            data: {
              id: dropData?.dragItem?.id,
              isDroppedAnotherRow: !(sourceData?.id === destinationData?.id),
              source: {
                droppableId: destinationData?.boxIndex,
                index: destinationData?.childIndex,
                rowIndex: destinationData?.rowIndex,
              },
              destination: {
                droppableId: sourceData?.boxIndex,
                index: sourceData?.childIndex,
                rowIndex: sourceData?.rowIndex,
              },
              undoPositionInput: {
                index: sourceData?.childIndex + 1,
                columnId: dropData.initialColumnId,
                rowId: dropData.initialRowId,
                stepId: dropData.initialsSepId,
              },
            },
          },
        ]);

        if (dropData) {
          switch (result?.type) {
            case MapRowTypeEnum.Touchpoints: {
              mutateTouchPoint(
                {
                  updateTouchPointInput: {
                    id: dropData?.dragItem?.id as number,
                    positionInput: {
                      index: destinationData?.childIndex + 1,
                      columnId: dropData.dragItem.columnId,
                      rowId: dropData.dragItem.rowId,
                      stepId: destinationData.stepId,
                    },
                  },
                },
                {
                  onSuccess: () => {},
                },
              );
              break;
            }
            case MapRowTypeEnum.Outcomes: {
              let positionInput: UpdateOutcomePositionInput = {
                index: destinationData?.childIndex + 1,
              };
              if (
                (sourceData?.rowIndex === destinationData?.rowIndex &&
                  sourceData?.boxIndex !== destinationData?.boxIndex) ||
                sourceData?.rowIndex !== destinationData?.rowIndex
              ) {
                let positionChange: {
                  stepId: number;
                  rowId?: number;
                  columnId?: number;
                } = {
                  stepId: dropData.dragItem.stepId,
                  rowId: dropData.dragItem.rowId,
                  columnId: dropData?.dragItem.columnId,
                };

                positionInput = {
                  index: destinationData?.childIndex + 1,
                  positionChange,
                };
              }

              creatUpdateOutcome(
                {
                  createUpdateOutcomeInput: {
                    updateOutcomeInput: {
                      id: dropData?.dragItem?.id as number,
                      positionInput,
                    },
                  },
                },
                {
                  onSuccess: () => {},
                },
              );
              break;
            }
            case MapRowTypeEnum.Metrics: {
              mutateUpdateMetrics(
                {
                  updateMetricsInput: {
                    id: dropData?.dragItem?.id as number,
                    positionInput: {
                      index: destinationData?.childIndex + 1,
                      columnId: dropData.dragItem.columnId,
                      rowId: dropData.dragItem.rowId,
                      stepId: destinationData.stepId,
                    },
                  },
                },
                {
                  onSuccess: () => {},
                },
              );
              break;
            }
            case MapRowTypeEnum.Links: {
              mutateLink(
                {
                  editLinkInput: {
                    id: dropData?.dragItem?.id as number,
                    positionInput: {
                      index: destinationData?.childIndex + 1,
                      columnId: dropData.dragItem.columnId,
                      rowId: dropData.dragItem.rowId,
                      stepId: destinationData.stepId,
                    },
                  },
                },
                {
                  onSuccess: () => {},
                },
              );
              break;
            }
            default: {
              updateBoxElement(
                {
                  updateBoxDataInput: {
                    boxElementId: dropData?.dragItem?.id as number,
                    positionInput: {
                      index: destinationData?.childIndex + 1,
                      columnId: dropData.dragItem.columnId,
                      rowId: dropData.dragItem.rowId,
                      stepId: destinationData.stepId,
                    },
                  },
                },
                {
                  onSuccess: () => {},
                },
              );
              break;
            }
          }
          setJourneyMap(prev => ({
            ...prev,
            rows: dropData.rows,
          }));
        }
      },
      [
        creatUpdateOutcome,
        journeyMap.rows,
        mutateLink,
        mutateTouchPoint,
        mutateUpdateMetrics,
        setJourneyMap,
        setRedoActions,
        setUndoActions,
        updateBoxElement,
      ],
    );

    const onRowDragEnd = useCallback(
      (result: any) => {
        setElementDragging(false);
        const { source, destination } = result;
        if (!destination) return;

        if (
          destination.droppableId === source.droppableId &&
          destination?.index === source?.index
        ) {
          return;
        }

        switch (result?.type) {
          case 'rows_group': {
            const sourceItems: JourneyMapRowType[] = [...journeyMap.rows];
            const [draggedItem] = sourceItems.splice(result.source.index, 1);
            sourceItems.splice(result.destination.index, 0, draggedItem);
            setJourneyMap(prev => ({
              ...prev,
              rows: sourceItems,
            }));

            updateRowByFieldName({
              fieldName: 'index',
              fieldValue: destination?.index + 1,
              rowId: draggedItem?.id,
            });

            break;
          }
          default:
            updateDataBetweenDifferentRows(result);
        }
      },
      [
        journeyMap.rows,
        setElementDragging,
        setJourneyMap,
        updateDataBetweenDifferentRows,
        updateRowByFieldName,
      ],
    );

    const updateLabel = ({
      rowId,
      previousLabel,
      label,
    }: {
      rowId: number;
      previousLabel: string;
      label: string;
    }) => {
      debounced400(() => {
        const data = {
          rowId,
          previousLabel,
          label,
        };

        updateMapByType(JourneyMapRowActionEnum.ROW_LABEL, ActionsEnum.UPDATE, data);
        setRedoActions([]);
        setUndoActions(prev => [
          ...prev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.ROW_LABEL,
            action: ActionsEnum.DELETE,
            data,
          },
        ]);

        updateRowByFieldName({
          fieldName: 'label',
          fieldValue: label,
          rowId,
        });
      });
    };

    const onHandleScroll = (e: React.UIEvent<HTMLElement>) => {
      const currentScrollHeight = e.currentTarget.scrollTop + e.currentTarget.clientHeight;

      const bottom =
        currentScrollHeight + 100 > e.currentTarget.scrollHeight &&
        currentScrollHeight + 100 < e.currentTarget.scrollHeight + 100;

      if (
        bottom &&
        !isFetchingNextPageJourneyMapRows &&
        journeyMap?.rows.length < journeyMapRowsCount
      ) {
        onHandleFetchNextPageJourneyMapRows();
      }

      const stages = document.getElementById('stages');
      const steps = document.getElementById('steps');
      const rows = document.getElementById('rows');
      scrollNeighbours(rows?.scrollLeft || 0, [stages!, steps!]);
    };

    return (
      <div className={'journey-map-rows'} id="rows" onScroll={onHandleScroll}>
        {journeyMap?.rows?.length > 1 ? (
          <DragDropContext onDragEnd={result => onRowDragEnd(result)} onBeforeCapture={onDragstart}>
            <Droppable droppableId={'rows'} type={'rows_group'}>
              {provided => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    <div className={'journey-map-rows--droppable'}>
                      {journeyMap?.rows.map((rowItem, index: number) => {
                        if (index > 0) {
                          return (
                            //   10000 is for identification * issue
                            <Draggable
                              key={rowItem?.id + '_row_' + index}
                              draggableId={String(rowItem?.id + 10000)}
                              index={index}
                              isDragDisabled={isGuest}>
                              {provided2 => {
                                return (
                                  <div
                                    ref={provided2.innerRef}
                                    {...provided2.draggableProps}
                                    className={`journey-map-rows--droppable-item`}
                                    key={rowItem?.id}>
                                    {getPageContentByKey({
                                      content: {
                                        [JourneyMapRowActionEnum.SENTIMENT]: (
                                          <JourneyMapSentimentRow
                                            dragHandleProps={provided2?.dragHandleProps}
                                            rowItem={rowItem}
                                            index={index}
                                            rowsLength={journeyMap?.rows.length - 1}
                                            disabled={isGuest}
                                            updateLabel={updateLabel}
                                          />
                                        ),
                                      },
                                      key: rowItem.rowFunction!,
                                      defaultPage: (
                                        <JourneyMapRegularRow
                                          key={rowItem?.id}
                                          dragHandleProps={provided2?.dragHandleProps}
                                          rowItem={rowItem}
                                          index={index}
                                          updateLabel={updateLabel}
                                          rowsLength={journeyMap?.rows.length - 1}
                                          disabled={isGuest}
                                        />
                                      ),
                                    })}
                                  </div>
                                );
                              }}
                            </Draggable>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                );
              }}
            </Droppable>
          </DragDropContext>
        ) : (
          <div className={'journey-map-rows--empty-data-block'}>
            <EmptyDataInfo
              icon={<Box />}
              message={
                <>
                  <p className={'journey-map-rows--empty-data-block--title'}>
                    Chart your customer journey!
                  </p>
                  <p className={'journey-map-rows--empty-data-block--sub-title'}>
                    Create impactful journey maps to enhance every customer interaction. Add data
                    lanes to get started.
                  </p>
                </>
              }
            />
            <RowActionsDrawer index={1} />
          </div>
        )}

        {isFetchingNextPageJourneyMapRows && journeyMap?.rows?.length > 1 && (
          <div className={'journey-map-rows--loading-block'}>
            <CustomLoader />
          </div>
        )}
      </div>
    );
  },
);

export default JourneyMapRows;
