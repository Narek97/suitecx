import React, { FC, memo, useCallback, useRef } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import deepcopy from 'deepcopy';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useRecoilState } from 'recoil';

import DraggableItem from '@/containers/journey-map-container/journey-map-steps/draggable-item';
import {
  AddOrUpdateColumnStepMutation,
  useAddOrUpdateColumnStepMutation,
} from '@/gql/mutations/generated/addOrUpdateColumnStep.generated';
import { MapRowTypeEnum, PersonaStateEnum } from '@/gql/types';
import PlusSignIcon from '@/public/operations/plus.svg';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { JOURNEY_MAP_LOADING_ROW } from '@/utils/constants/general';
import { scrollNeighbours } from '@/utils/helpers/general';
import {
  JourneyMapColumnType,
  JourneyMapRowType,
} from '@/utils/ts/types/journey-map/journey-map-types';

interface IStep {
  steps: JourneyMapRowType;
  columns: JourneyMapColumnType[];
  isGuest: boolean;
}

const JourneyMapSteps: FC<IStep> = memo(({ steps, columns, isGuest }) => {
  const queryClient = useQueryClient();
  const childRef = useRef<any>(null);

  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);

  const { mutate: createOrUpdateStepMutate } = useAddOrUpdateColumnStepMutation<
    AddOrUpdateColumnStepMutation,
    Error
  >();

  const updateJourneyMap = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['GetJourneyMapRows.infinite'],
    });
  }, [queryClient]);

  const onHandleScroll = () => {
    const stages = document.getElementById('stages');
    const stepsContent = document.getElementById('steps');
    const rows = document.getElementById('rows');
    scrollNeighbours(stepsContent?.scrollLeft || 0, [stages!, rows!]);
  };

  const onHandleCreateNewStep = useCallback(
    (columnId: number, id: number, stepIndex: number, position: number) => {
      const newBox = {
        id,
        columnId,
        boxElements: [],
        boxTextElement: null,
        metrics: [],
        touchPoints: [],
        outcomes: [],
        links: [],
        average: 3,
        step: {
          id,
          columnId,
          index: stepIndex,
          name: '',
        },
      };

      setJourneyMap(prev => {
        const rowsCopy = deepcopy(prev.rows);
        const columnsCopy = deepcopy(prev.columns);
        return {
          ...prev,
          columns: columnsCopy.map(c => {
            if (c.id === columnId) {
              c.size += 1;
            }
            return c;
          }),
          rows: rowsCopy.map(r => {
            r.boxes?.splice(position + 1, 0, { ...newBox });
            if (r?.rowWithPersonas?.length) {
              r?.rowWithPersonas?.forEach(rowWithPersonaItem => {
                rowWithPersonaItem?.personaStates?.splice(position + 1, 0, {
                  boxId: newBox?.id!,
                  columnId: newBox?.columnId!,
                  stepId: newBox?.id!,
                  rowId: r?.id!,
                  state: PersonaStateEnum.Neutral,
                });
              });
            }
            return {
              ...r,
              boxes: r.boxes,
            };
          }),
        };
      });
    },
    [setJourneyMap],
  );

  const onHandleDeleteStep = useCallback(
    (id: number, columnId: number) => {
      setJourneyMap(prev => {
        const columnsCopy = deepcopy(prev.columns);
        return {
          ...prev,
          columns: columnsCopy.map(c => {
            if (c.id === columnId) {
              c.size -= 1;
            }
            return c;
          }),
          rows: prev.rows.map(r => {
            return {
              ...r,
              boxes: r.boxes?.filter(b => b.step.id !== id),
            };
          }),
        };
      });
    },
    [setJourneyMap],
  );

  const onHandleUpdateRow = useCallback(
    (
      columnId: number,
      id: number,
      index: number,
      // socketResult: {
      //   destinationIndex: number;
      //   sourceIndex: number;
      //   itemId: number;
      // },
    ) => {
      createOrUpdateStepMutate(
        {
          addOrUpdateColumnStepInput: {
            update: {
              columnId,
              id,
              index,
            },
          },
        },
        {
          onSuccess: async response => {
            // emitToSocketMap(JourneyMapEventsEnum.JOURNEY_MAP_STEP_EVENT, {
            //   mapId: +mapID!,
            //   ...socketResult,
            //   type: ActionsEnum.DRAG,
            // });

            response.addOrUpdateColumnStep.createdColumnStep?.id && (await updateJourneyMap());
          },
          onError: async () => {
            await updateJourneyMap();
          },
        },
      );
    },
    [createOrUpdateStepMutate, updateJourneyMap],
  );

  const onHandleDragEnd = useCallback(
    (result: any) => {
      const destinationIndex = +result.destination.index;
      const sourceIndex = +result.source.index;

      const itemId = +result.draggableId;
      if (result.destination && destinationIndex !== sourceIndex) {
        const journeyMapColumns = deepcopy(journeyMap.columns) || [];
        const journeyMapRows = deepcopy(journeyMap.rows) || [];

        const columnsPositionId: Array<number> = [];
        journeyMapColumns.forEach(column => {
          let columnSize = Array(column.size).fill(column);
          columnSize.forEach(c => {
            columnsPositionId.push(c.id);
          });
        });

        let incrementColumnId: number | null = null;
        let decrementColumnId: number | null = null;
        let draggableColumnId: number = 0;
        let dragIndex: number = destinationIndex;

        const newJourneyMapRows = journeyMapRows.map(row => {
          const boxes = row.boxes ? [...row.boxes] : [];
          const [draggedRowItem] = boxes.splice(sourceIndex, 1);
          draggableColumnId = +draggedRowItem.columnId!;

          if (draggedRowItem.columnId !== columnsPositionId[destinationIndex]) {
            draggableColumnId = +columnsPositionId[destinationIndex];
            incrementColumnId = columnsPositionId[destinationIndex] || null;
            decrementColumnId = draggedRowItem.columnId || null;
            draggedRowItem.columnId = columnsPositionId[destinationIndex];
            draggedRowItem.step.columnId = columnsPositionId[destinationIndex];
          }
          boxes.splice(destinationIndex, 0, draggedRowItem);
          if (row?.rowFunction === MapRowTypeEnum.Sentiment) {
            let rowWithPersonas = [...row.rowWithPersonas];
            let rowBoxes = row.boxes || [];
            const [draggedItemData] = rowBoxes.splice(result.source.index, 1);
            rowBoxes.splice(result.destination.index, 0, draggedItemData);
            rowWithPersonas = rowWithPersonas?.map(persona => {
              let personaStates = [...(persona?.personaStates || [])];
              const [sentimentDraggedRowItem] = personaStates.splice(result.source.index, 1);
              personaStates.splice(result.destination.index, 0, sentimentDraggedRowItem);
              return {
                ...persona,
                personaStates,
              };
            });
            return {
              ...row,
              boxes,
              rowWithPersonas,
            };
          }
          return {
            ...row,
            boxes,
          };
        });

        const newJourneyMapColumns = journeyMapColumns.map((column, index) => {
          if (column.id === (incrementColumnId || draggableColumnId)) {
            const beforeDropColumns = journeyMapColumns.slice(0, index);
            beforeDropColumns.forEach(c => {
              dragIndex -= c.size;
            });
          }
          if (column.id === incrementColumnId) {
            column.size += 1;
          }
          if (column.id === decrementColumnId) {
            if (column.size > 1) {
              column.size -= 1;
            } else {
              newJourneyMapRows.map(row => ({
                ...row,
                boxes: row.boxes?.splice(
                  sourceIndex + (sourceIndex > destinationIndex ? 1 : 0),
                  0,
                  JOURNEY_MAP_LOADING_ROW,
                ),
              }));
            }
          }
          return column;
        });

        if (!result.socket) {
          onHandleUpdateRow(draggableColumnId, itemId, dragIndex + 1);
          // onHandleUpdateRow(draggableColumnId, itemId, dragIndex + 1, {
          //   destinationIndex,
          //   sourceIndex,
          //   itemId,
          // });
        }

        setJourneyMap(prev => {
          return {
            ...prev,
            rows: newJourneyMapRows,
            columns: newJourneyMapColumns,
          };
        });
      }
    },
    [journeyMap.columns, journeyMap.rows, onHandleUpdateRow, setJourneyMap],
  );

  // useEffect(() => {
  //   socketMap?.on(JourneyMapEventsEnum.JOURNEY_MAP_STEP_EVENT, (socketData: any) => {
  //     switch (socketData.type) {
  //       case ActionsEnum.DRAG: {
  //         onHandleDragEnd({
  //           destination: {
  //             index: socketData.destinationIndex,
  //           },
  //           source: {
  //             index: socketData.sourceIndex,
  //           },
  //           itemId: socketData.itemId,
  //           socket: true,
  //         });
  //         break;
  //       }
  //       case ActionsEnum.CREATE: {
  //         onHandleCreateNewStep(
  //           socketData.columnId,
  //           socketData.id,
  //           socketData.stepIndex,
  //           socketData.position,
  //         );
  //         break;
  //       }
  //       case ActionsEnum.UPDATE: {
  //         setJourneyMap(prev => {
  //           const rowsCopy = deepcopy(prev.rows);
  //           return {
  //             ...prev,
  //             rows: rowsCopy.map((r, index) => {
  //               if (index === 0) {
  //                 r.boxes = r.boxes?.map(b => {
  //                   if (b.step.id === socketData.id) {
  //                     b.step.name = socketData.name;
  //                   }
  //                   return b;
  //                 });
  //               }
  //               return r;
  //             }),
  //           };
  //         });
  //         break;
  //       }
  //       case ActionsEnum.DELETE: {
  //         onHandleDeleteStep(socketData.id, socketData.columnId);
  //         break;
  //       }
  //     }
  //   });
  // }, []);

  return (
    <div className={'journey-map-step'} id={'steps'} onScroll={onHandleScroll}>
      <DragDropContext onDragEnd={result => onHandleDragEnd(result)}>
        <div className={'journey-map-step--start-step'}>
          <p className={'journey-map-step--start-step--title'}>Steps</p>
          <div className={'journey-map-step--new-step-button-block'}>
            <button
              aria-label={'plus'}
              className={'journey-map-step--new-step-button-block--button'}
              data-testid="add-step-btn-test-id"
              onClick={() => childRef.current?.createNewColumn()}>
              <PlusSignIcon />
            </button>
          </div>
        </div>
        <Droppable droppableId={'step'} key={'step'} direction="horizontal">
          {provided => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={'journey-map-step--steps'}
              data-testid="journey-map-step-steps-test-id">
              {steps?.boxes?.map((stepItem, index) => {
                return (
                  <Draggable
                    key={String(stepItem.step.id)}
                    draggableId={String(stepItem.step.id)}
                    index={index}
                    isDragDisabled={isGuest}>
                    {provided2 => {
                      const stage = columns.find(c => c.id === stepItem.step.columnId);
                      return (
                        <div
                          ref={provided2.innerRef}
                          {...provided2.draggableProps}
                          key={stepItem?.id}
                          data-testid={`journey-map-step-${stepItem.step.id}-test-id`}>
                          <div
                            className={'journey-map-step--steps--item'}
                            style={{
                              width: 280,
                            }}>
                            <DraggableItem
                              ref={index === 0 ? childRef : null}
                              key={String(stepItem.step.id)}
                              stepItem={stepItem}
                              index={index + 1}
                              stageStepCount={stage?.size || 1}
                              isGuest={isGuest}
                              onHandleCreateNewStep={onHandleCreateNewStep}
                              onHandleDeleteStep={onHandleDeleteStep}
                              dragHandleProps={provided2.dragHandleProps}
                            />
                          </div>
                        </div>
                      );
                    }}
                  </Draggable>
                );
              })}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
});

export default JourneyMapSteps;
