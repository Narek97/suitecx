import { useCallback } from 'react';

import deepcopy from 'deepcopy';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { onDragEndMap } from '@/containers/journey-map-container/helpers/on-drag-end-map';
import { useAddBoxElementMutation } from '@/gql/mutations/generated/addBoxElement.generated';
import { useCreateMapLinkMutation } from '@/gql/mutations/generated/createLink.generated';
import { useCreateTouchPointsMutation } from '@/gql/mutations/generated/createTouchPoints.generated';
import { useCreateUpdateOutcomeMutation } from '@/gql/mutations/generated/createUpdateOutcome.generated';
import { useDeleteMapLinkMutation } from '@/gql/mutations/generated/deleteLink.generated';
import { useDeleteMetricsMutation } from '@/gql/mutations/generated/deleteMetrics.generated';
import { useDeleteOutcomeMutation } from '@/gql/mutations/generated/deleteOutcome.generated';
import { useDeleteTouchPointMutation } from '@/gql/mutations/generated/deleteTouchPoint.generated';
import { useRemoveBoxElementMutation } from '@/gql/mutations/generated/removeBoxElement.generated';
import { useRestoreMetricsMutation } from '@/gql/mutations/generated/restoreMetrics.generated';
import { useRetrieveMetricsDataMutation } from '@/gql/mutations/generated/retrieveMetricsData.generated';
import { useUpdateBoxElementMutation } from '@/gql/mutations/generated/updateBoxElement.generated';
import { useUpdateItemFlippedTextMutation } from '@/gql/mutations/generated/updateItemFlippedText.generated';
import { useUpdateMapLinkMutation } from '@/gql/mutations/generated/updateLink.generated';
import { useUpdateMetricsMutation } from '@/gql/mutations/generated/updateMetrics.generated';
import { useUpdateTouchPointMutation } from '@/gql/mutations/generated/updateTouchPoint.generated';
import { AddLinkInput, EditLinkInput, LinkTypeEnum } from '@/gql/types';
import { journeyMapState, selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { ActionsEnum, JourneyMapRowActionEnum, UndoRedoEnum } from '@/utils/ts/enums/global-enums';

export const useUpdateMap = () => {
  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);
  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);
  const setUndoActions = useSetRecoilState(undoActionsState);
  const setRedoActions = useSetRecoilState(redoActionsState);

  const { mutate: addBoxElement } = useAddBoxElementMutation();
  const { mutate: updateBoxElement } = useUpdateBoxElementMutation();
  const { mutate: removeBoxElement } = useRemoveBoxElementMutation();
  const { mutate: addTouchPoints } = useCreateTouchPointsMutation();
  const { mutate: updateTouchPoint } = useUpdateTouchPointMutation();
  const { mutate: removeTouchPoint } = useDeleteTouchPointMutation();
  const { mutate: updateMetrics } = useUpdateMetricsMutation();
  const { mutate: restoreMetrics } = useRestoreMetricsMutation();
  const { mutate: retryMetrics } = useRetrieveMetricsDataMutation();
  const { mutate: removeMetrics } = useDeleteMetricsMutation();
  const { mutate: addOrUpdateOutcome } = useCreateUpdateOutcomeMutation();
  const { mutate: removeOutcome } = useDeleteOutcomeMutation();
  const { mutate: addLink } = useCreateMapLinkMutation();
  const { mutate: updateLink } = useUpdateMapLinkMutation();
  const { mutate: removeLink } = useDeleteMapLinkMutation();
  const { mutate: updateFlippedText } = useUpdateItemFlippedTextMutation();

  const onHandleDrag = useCallback(
    (data: any, type: string, undoRedo?: UndoRedoEnum | null) => {
      let source = data.destination;
      let destination = data.source;
      if (undoRedo === UndoRedoEnum.UNDO) {
        source = data.source;
        destination = data.destination;
      }

      const dropData: any = onDragEndMap(
        {
          source,
          destination,
        },
        data.isDroppedAnotherRow,
        type,
        deepcopy(journeyMap.rows),
      );

      setJourneyMap(prev => ({
        ...prev,
        rows: dropData.rows,
      }));
    },
    [journeyMap.rows, setJourneyMap],
  );

  const addMapNewItem = useCallback(
    (item: any, boxKey: 'boxElements' | 'touchPoints' | 'outcomes' | 'metrics' | 'links') => {
      setJourneyMap(prev => {
        const rows = prev.rows.map(r => {
          if (r.id === item.rowId) {
            return {
              ...r,
              boxes: r.boxes?.map(box => {
                if (box.step.id === item.stepId) {
                  return {
                    ...box,
                    [boxKey]: [...box[boxKey], item],
                  };
                }
                return box;
              }),
            };
          }
          return r;
        });
        return { ...prev, rows };
      });
    },
    [setJourneyMap],
  );

  const deleteMapItem = useCallback(
    (data: any, boxKey: 'boxElements' | 'touchPoints' | 'outcomes' | 'metrics' | 'links') => {
      setJourneyMap(prev => {
        const rows = prev.rows.map(r => {
          if (r.id === data.rowId) {
            return {
              ...r,
              boxes: r.boxes?.map(box => {
                if (box.step.id === data.stepId) {
                  return {
                    ...box,
                    // @ts-ignore
                    [boxKey]: box[boxKey]?.filter(
                      (boxElement: { id: number }) => boxElement.id !== data.id,
                    ),
                  };
                }
                return box;
              }),
            };
          }
          return r;
        });
        return { ...prev, rows };
      });
    },
    [setJourneyMap],
  );

  const updateMapByType = useCallback(
    (
      type: JourneyMapRowActionEnum,
      action: ActionsEnum,
      data: any,
      undoRedo?: UndoRedoEnum | null,
      subAction?: ActionsEnum | null,
    ) => {
      switch (type) {
        case JourneyMapRowActionEnum.BOX_TEXT_ELEMENT: {
          if (undoRedo) {
            updateBoxElement({
              updateBoxDataInput: {
                boxElementId: data.id,
                text: undoRedo === UndoRedoEnum.UNDO ? data.previousText : data.text,
              },
            });
          }
          setJourneyMap(prev => {
            const rows = prev.rows.map(r => {
              if (r.id === data.rowId) {
                return {
                  ...r,
                  boxes: r.boxes?.map(box => {
                    if (box.step.id === data.stepId) {
                      let text = data.text;
                      if (undoRedo === UndoRedoEnum.UNDO) {
                        text = data.previousText;
                      }
                      return {
                        ...box,
                        boxTextElement: { ...data, text },
                      };
                    }
                    return box;
                  }),
                };
              }
              return r;
            });
            return { ...prev, rows };
          });
          break;
        }
        case JourneyMapRowActionEnum.ROW_COLLAPSE: {
          setJourneyMap(prev => {
            const rows = prev.rows.map(r => {
              if (r.id === data.rowId) {
                let isCollapsed = data.isCollapsed;
                if (undoRedo === UndoRedoEnum.UNDO) {
                  isCollapsed = !data.isCollapsed;
                }
                return {
                  ...r,
                  isCollapsed,
                };
              }
              return r;
            });
            return { ...prev, rows };
          });
          break;
        }
        case JourneyMapRowActionEnum.ROW_DISABLE: {
          setJourneyMap(prev => {
            const rows = prev.rows.map(r => {
              if (r.id === data.rowId) {
                let isLocked = data.isLocked;
                if (undoRedo === UndoRedoEnum.UNDO) {
                  isLocked = !data.isLocked;
                }
                return {
                  ...r,
                  isLocked,
                };
              }
              return r;
            });
            return { ...prev, rows };
          });
          break;
        }
        case JourneyMapRowActionEnum.ROW_LABEL: {
          setJourneyMap(prev => {
            const rows = prev.rows.map(r => {
              if (r.id === data.rowId) {
                let label = data.label;
                if (undoRedo === UndoRedoEnum.UNDO) {
                  label = data.previousLabel;
                }
                return {
                  ...r,
                  label,
                };
              }
              return r;
            });
            return { ...prev, rows };
          });
          break;
        }
        case JourneyMapRowActionEnum.BACK_CARD: {
          if (undoRedo) {
            updateFlippedText({
              updateItemFlippedTextInput: {
                itemId: data.id,
                rowId: data.rowId,
                text: undoRedo === UndoRedoEnum.UNDO ? data.previousFlippedText : data.flippedText,
              },
            });
          }
          setJourneyMap(prev => {
            const rows = prev.rows.map(r => {
              if (r.id === data.rowId) {
                return {
                  ...r,
                  boxes: r.boxes?.map(box => {
                    if (box.step.id === data.stepId) {
                      return {
                        ...box,
                        // @ts-ignore
                        [data.itemKey]: box[data.itemKey].map(boxElement => {
                          if (boxElement.id === data.id) {
                            let flippedText = data.flippedText;
                            if (undoRedo === UndoRedoEnum.UNDO) {
                              flippedText = data.previousFlippedText;
                            }
                            return {
                              ...boxElement,
                              flippedText,
                            };
                          }
                          return boxElement;
                        }),
                      };
                    }
                    return box;
                  }),
                };
              }
              return r;
            });
            return { ...prev, rows };
          });
          break;
        }
        case JourneyMapRowActionEnum.BOX_ELEMENT: {
          switch (action) {
            case ActionsEnum.CREATE: {
              if (undoRedo) {
                addBoxElement(
                  {
                    addBoxElementInput: {
                      rowId: data.rowId,
                      stepId: data.stepId,
                      columnId: data.columnId,
                      text: data.text,
                      personaId: selectedPerson?.id || null,
                    },
                  },
                  {
                    onSuccess: response => {
                      addMapNewItem(response?.addBoxElement, 'boxElements');

                      setUndoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.addBoxElement },
                            };
                          }
                          return el;
                        }),
                      );
                      setRedoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.addBoxElement, text: el.data.text },
                            };
                          }
                          return el;
                        }),
                      );
                    },
                  },
                );
              } else {
                addMapNewItem(data, 'boxElements');
              }
              break;
            }
            case ActionsEnum.UPDATE: {
              if (undoRedo) {
                updateBoxElement({
                  updateBoxDataInput: {
                    boxElementId: data.id,
                    text: undoRedo === UndoRedoEnum.UNDO ? data.previousText : data.text,
                  },
                });
              }
              setJourneyMap(prev => {
                const rows = prev.rows.map(r => {
                  if (r.id === data.rowId) {
                    return {
                      ...r,
                      boxes: r.boxes?.map(box => {
                        if (box.step.id === data.stepId) {
                          return {
                            ...box,
                            boxElements: box.boxElements.map(boxElement => {
                              if (boxElement.id === data.id) {
                                let text = data.text;
                                if (undoRedo === UndoRedoEnum.UNDO) {
                                  text = data.previousText;
                                }
                                const updateData = {
                                  ...boxElement,
                                  text,
                                };
                                if (data.attachmentId) {
                                  updateData.attachmentId = data.attachmentId;
                                }
                                return updateData;
                              }
                              return boxElement;
                            }),
                          };
                        }
                        return box;
                      }),
                    };
                  }
                  return r;
                });
                return { ...prev, rows };
              });
              break;
            }
            case ActionsEnum.DELETE: {
              if (undoRedo) {
                removeBoxElement({
                  removeBoxElementInput: {
                    boxElementId: data.id!,
                  },
                });
              }
              deleteMapItem(data, 'boxElements');
              break;
            }
            case ActionsEnum.DRAG: {
              updateBoxElement({
                updateBoxDataInput: {
                  boxElementId: data?.id as number,
                  positionInput: data.undoPositionInput,
                },
              });
              onHandleDrag(data, 'BOX_ELEMENT', undoRedo);
              break;
            }
          }

          break;
        }
        case JourneyMapRowActionEnum.TOUCHPOINTS: {
          switch (action) {
            case ActionsEnum.CREATE: {
              const updateMap = (boxItem: any) => {
                setJourneyMap(prev => {
                  const rows = prev.rows.map(r => {
                    if (r.id === boxItem.rowId) {
                      return {
                        ...r,
                        boxes: r.boxes?.map(box => {
                          if (box.step.id === boxItem.stepId) {
                            return {
                              ...box,
                              touchPoints: [...box.touchPoints, ...boxItem.touchPoints],
                            };
                          }
                          return box;
                        }),
                      };
                    }
                    return r;
                  });
                  return { ...prev, rows };
                });
              };

              if (undoRedo) {
                addTouchPoints(
                  {
                    createTouchPointInput: {
                      rowId: data.rowId,
                      mapId: data.mapID,
                      stepId: data.stepId,
                      columnId: data.columnId,
                      // personaId: selectedPerson?.id || null,
                      touchPoints: data.touchPoints.map(
                        (touchPoint: { title: string; iconUrl: string }) => ({
                          title: touchPoint.title,
                          iconId: touchPoint.iconUrl,
                        }),
                      ),
                    },
                  },
                  {
                    onSuccess: response => {
                      const newData = {
                        ...data,
                        touchPoints: response.createTouchPoints,
                      };
                      updateMap(newData);

                      const updateTouchpointsData = (
                        historyData: Array<{
                          id: string;
                          type: JourneyMapRowActionEnum;
                          action: ActionsEnum;
                          data: any;
                        }>,
                      ) => {
                        return historyData.map(el => {
                          if (el.id === data.parentId) {
                            return {
                              ...el,
                              data: newData,
                            };
                          } else if (
                            el.type === JourneyMapRowActionEnum.TOUCHPOINTS &&
                            el.action !== ActionsEnum.DRAG
                          ) {
                            return {
                              ...el,
                              data: {
                                ...el.data,
                                touchPoints: el.data.touchPoints.map((tp: { id: number }) => {
                                  const positionIndex = data.touchPoints.findIndex(
                                    (dataTp: { id: number }) => dataTp.id === tp.id,
                                  );
                                  if (positionIndex !== -1) {
                                    return {
                                      ...tp,
                                      id: newData.touchPoints[positionIndex].id,
                                    };
                                  }
                                  return tp;
                                }),
                              },
                            };
                          }
                          return el;
                        });
                      };

                      setUndoActions(prev => updateTouchpointsData(prev));
                      setRedoActions(prev => updateTouchpointsData(prev));
                    },
                  },
                );
              } else {
                updateMap(data);
              }
              break;
            }
            case ActionsEnum.UPDATE: {
              if (undoRedo) {
                data.touchPoints.forEach(
                  (touchPoint: { id: number; touchPoint: string; bgColor: string }) => {
                    updateTouchPoint({
                      updateTouchPointInput: {
                        id: touchPoint.id,
                        bgColor:
                          undoRedo === UndoRedoEnum.UNDO
                            ? touchPoint.touchPoint
                            : touchPoint.bgColor,
                      },
                    });
                  },
                );
              }
              setJourneyMap(prev => {
                const rows = prev.rows.map(r => {
                  if (r.id === data.rowId) {
                    return {
                      ...r,
                      boxes: r.boxes?.map(box => {
                        if (box.step.id === data.stepId) {
                          return {
                            ...box,
                            touchPoints: box.touchPoints.map(touchPoint => {
                              const tp = data.touchPoints.find(
                                (dataTouchPoint: { id: number }) =>
                                  dataTouchPoint.id === touchPoint.id,
                              );
                              if (tp) {
                                let bgColor = tp.bgColor;
                                if (undoRedo === UndoRedoEnum.UNDO) {
                                  bgColor = tp.previousBgColor;
                                }
                                return {
                                  ...touchPoint,
                                  bgColor,
                                };
                              }
                              return touchPoint;
                            }),
                          };
                        }
                        return box;
                      }),
                    };
                  }
                  return r;
                });
                return { ...prev, rows };
              });
              break;
            }
            case ActionsEnum.DELETE: {
              if (undoRedo) {
                data.touchPoints.forEach((touchPoint: { id: number }) => {
                  removeTouchPoint({
                    id: touchPoint.id,
                  });
                });
              }
              setJourneyMap(prev => {
                const rows = prev.rows.map(r => {
                  if (r.id === data.rowId) {
                    return {
                      ...r,
                      boxes: r.boxes?.map(box => {
                        if (box.step.id === data.stepId) {
                          return {
                            ...box,
                            touchPoints: box.touchPoints.filter(
                              (touchPoint: { id: number }) =>
                                !data.touchPoints.some(
                                  (dataTouchPoint: { id: number }) =>
                                    dataTouchPoint.id === touchPoint.id,
                                ),
                            ),
                          };
                        }
                        return box;
                      }),
                    };
                  }
                  return r;
                });
                return { ...prev, rows };
              });
              break;
            }
            case ActionsEnum.DRAG: {
              updateTouchPoint({
                updateTouchPointInput: {
                  id: data?.id as number,
                  positionInput: data.undoPositionInput,
                },
              });
              onHandleDrag(data, 'TOUCHPOINTS', undoRedo);
              break;
            }
          }
          break;
        }
        case JourneyMapRowActionEnum.METRICS: {
          switch (action) {
            case ActionsEnum.CREATE: {
              if (undoRedo) {
                restoreMetrics(
                  {
                    id: data.id,
                  },
                  {
                    onSuccess: response => {
                      const newData = {
                        ...response.restoreMetrics,
                        rowId: data.rowId,
                        stepId: data.stepId,
                      };
                      addMapNewItem(newData, 'metrics');

                      setUndoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.restoreMetrics },
                            };
                          }
                          return el;
                        }),
                      );
                      setRedoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: {
                                ...el.data,
                                ...response?.restoreMetrics,
                              },
                            };
                          }
                          return el;
                        }),
                      );
                    },
                  },
                );
              } else {
                addMapNewItem(data, 'metrics');
              }
              break;
            }
            case ActionsEnum.UPDATE: {
              const updateMapMetrics = (metrics: any) => {
                setJourneyMap(prev => {
                  const rows = prev.rows.map(r => {
                    if (r.id === data.rowId) {
                      return {
                        ...r,
                        boxes: r.boxes?.map(box => {
                          if (box.step.id === data.stepId) {
                            return {
                              ...box,
                              metrics: box.metrics.map(metricsElement => {
                                if (metricsElement.id === data.id) {
                                  return metrics;
                                }
                                return metricsElement;
                              }),
                            };
                          }
                          return box;
                        }),
                      };
                    }
                    return r;
                  });
                  return { ...prev, rows };
                });
              };

              if (undoRedo) {
                retryMetrics(
                  {
                    id: data.id,
                    previous: undoRedo === UndoRedoEnum.UNDO,
                  },
                  {
                    onSuccess: response => {
                      const newData = {
                        ...response.retrieveMetricsData,
                        rowId: data.rowId,
                        stepId: data.stepId,
                      };

                      updateMapMetrics(newData);

                      setUndoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.retrieveMetricsData },
                            };
                          }
                          return el;
                        }),
                      );
                      setRedoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: {
                                ...el.data,
                                ...response?.retrieveMetricsData,
                              },
                            };
                          }
                          return el;
                        }),
                      );
                    },
                  },
                );
              } else {
                updateMapMetrics(data);
              }

              break;
            }
            case ActionsEnum.DELETE: {
              if (undoRedo) {
                removeMetrics({
                  id: data.id,
                });
              }
              deleteMapItem(data, 'metrics');
              break;
            }
            case ActionsEnum.DRAG: {
              retryMetrics({
                id: data.id,
                previous: undoRedo === UndoRedoEnum.UNDO,
              });
              updateMetrics({
                updateMetricsInput: {
                  id: data?.id as number,
                  positionInput: data.undoPositionInput,
                },
              });
              onHandleDrag(data, 'METRICS', undoRedo);
              break;
            }
          }
          break;
        }
        case JourneyMapRowActionEnum.OUTCOMES: {
          const createOutcome = (outcomeElement: any) => {
            setJourneyMap(prev => {
              const rows = prev.rows.map(r => {
                if (r.id === outcomeElement.rowId) {
                  return {
                    ...r,
                    boxes: r.boxes?.map(box => {
                      let title = data.title;
                      let description = data.description;
                      let stepId = data.stepId;
                      let rowId = data.rowId;

                      if (undoRedo === UndoRedoEnum.UNDO) {
                        title = data.previousTitle;
                        description = data.previousDescription;
                        stepId = data.previousStepId;
                        rowId = data.previousRowId;
                      }
                      if (box.step.id === stepId) {
                        return {
                          ...box,
                          outcomes: [
                            ...box.outcomes,
                            { ...outcomeElement, title, description, stepId, rowId },
                          ],
                        };
                      }
                      return box;
                    }),
                  };
                }
                return r;
              });
              return { ...prev, rows };
            });
          };

          const deleteOutcome = () => {
            setJourneyMap(prev => {
              const rows = prev.rows.map(r => {
                if (r.id === data.rowId) {
                  return {
                    ...r,
                    boxes: r.boxes?.map(box => {
                      let stepId = data.previousStepId;
                      if (undoRedo === UndoRedoEnum.UNDO) {
                        stepId = data.stepId;
                      }
                      if (box.step.id === stepId) {
                        return {
                          ...box,
                          outcomes: box.outcomes.filter(
                            (outcomeElement: { id: number }) => outcomeElement.id !== data.id,
                          ),
                        };
                      }
                      return box;
                    }),
                  };
                }
                return r;
              });
              return { ...prev, rows };
            });
          };

          const updateOutcome = () => {
            setJourneyMap(prev => {
              const rows = prev.rows.map(r => {
                if (r.id === data.rowId) {
                  return {
                    ...r,
                    boxes: r.boxes?.map(box => {
                      if (box.step.id === data.stepId) {
                        return {
                          ...box,
                          outcomes: box.outcomes.map(outcomeElement => {
                            if (outcomeElement.id === data.id) {
                              let title = data.title;
                              let description = data.description;
                              if (undoRedo === UndoRedoEnum.UNDO) {
                                title = data.previousTitle;
                                description = data.previousDescription;
                              }
                              return { ...outcomeElement, title, description };
                            }
                            return outcomeElement;
                          }),
                        };
                      }
                      return box;
                    }),
                  };
                }
                return r;
              });
              return { ...prev, rows };
            });
          };

          switch (action) {
            case ActionsEnum.CREATE: {
              if (undoRedo) {
                addOrUpdateOutcome(
                  {
                    createUpdateOutcomeInput: {
                      createOutcomeInput: {
                        title: data.title,
                        description: data.description,
                        personaId: data.personaId,
                        positionInput: {
                          mapId: data.map.id,
                          columnId: data.columnId,
                          stepId: data.stepId,
                        },
                        outcomeGroupId: data.outcomeGroupId,
                        workspaceId: data.workspaceId,
                      },
                    },
                  },
                  {
                    onSuccess: response => {
                      createOutcome(response?.createUpdateOutcome);

                      setUndoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: {
                                ...data,
                                ...response?.createUpdateOutcome,
                              },
                            };
                          }
                          return el;
                        }),
                      );
                      setRedoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: {
                                ...data,
                                ...response?.createUpdateOutcome,
                              },
                            };
                          }
                          return el;
                        }),
                      );
                    },
                  },
                );
              } else {
                createOutcome(data);
              }
              break;
            }
            case ActionsEnum.UPDATE: {
              if (undoRedo) {
                addOrUpdateOutcome({
                  createUpdateOutcomeInput: {
                    updateOutcomeInput: {
                      personaId: data.personaId,
                      id: data.id,
                      title: undoRedo === UndoRedoEnum.UNDO ? data.previousTtle : data.title,
                      description:
                        undoRedo === UndoRedoEnum.UNDO
                          ? data.previousDescription
                          : data.description,
                      positionInput: {
                        positionChange: {
                          columnId: data.columnId,
                          stepId: data.stepId,
                        },
                      },
                    },
                  },
                });
              }
              if (subAction) {
                if (subAction === ActionsEnum['CREATE-DELETE']) {
                  deleteOutcome();
                  createOutcome(data);
                }
                if (subAction === ActionsEnum.DELETE) {
                  deleteOutcome();
                  if (undoRedo === UndoRedoEnum.UNDO) {
                    createOutcome(data);
                  }
                }
              } else {
                updateOutcome();
              }

              break;
            }

            case ActionsEnum.DELETE: {
              if (undoRedo) {
                removeOutcome({
                  id: +data.id,
                });
              }
              deleteOutcome();
              break;
            }

            case ActionsEnum.DRAG: {
              addOrUpdateOutcome({
                createUpdateOutcomeInput: {
                  updateOutcomeInput: {
                    id: data?.id as number,
                    positionInput: {
                      index: data.undoPositionInput.index,
                      positionChange: {
                        stepId: data.undoPositionInput.stepId,
                        rowId: data.undoPositionInput.rowId,
                        columnId: data.undoPositionInput.columnId,
                      },
                    },
                  },
                },
              });
              onHandleDrag(data, 'OUTCOMES', undoRedo);
              break;
            }
          }
          break;
        }
        case JourneyMapRowActionEnum.LINKS: {
          switch (action) {
            case ActionsEnum.CREATE: {
              if (undoRedo) {
                const linkInput: AddLinkInput = {
                  personaId: selectedPerson?.id || null,
                  stepId: data.stepId,
                  rowId: data.rowId,
                  type: data.type,
                };
                if (data.type === LinkTypeEnum.External) {
                  linkInput.title = data.title;
                  linkInput.url = data.url;
                } else {
                  linkInput.linkedMapId = data.linkedJourneyMapId;
                }
                addLink(
                  {
                    addLinkInput: linkInput,
                  },
                  {
                    onSuccess: response => {
                      addMapNewItem({ ...response?.addLink, stepId: data.stepId }, 'links');

                      setUndoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.addLink },
                            };
                          }
                          return el;
                        }),
                      );
                      setRedoActions(prev =>
                        prev.map(el => {
                          if (el.data.id === data.id) {
                            return {
                              ...el,
                              data: { ...el.data, ...response?.addLink },
                            };
                          }
                          return el;
                        }),
                      );
                    },
                  },
                );
              } else {
                addMapNewItem(data, 'links');
              }
              break;
            }
            case ActionsEnum.UPDATE: {
              if (undoRedo) {
                const linkInout: EditLinkInput = {
                  id: data.id,
                  type: data.type,
                };

                if (data.type === LinkTypeEnum.External) {
                  linkInout.title = data.title;
                  linkInout.url = data.url;
                } else {
                  linkInout.linkedMapId = data.linkedMapId;
                }
                updateLink({
                  editLinkInput: linkInout,
                });
              }
              setJourneyMap(prev => {
                const rows = prev.rows.map(r => {
                  if (r.id === data.rowId) {
                    return {
                      ...r,
                      boxes: r.boxes?.map(box => {
                        if (box.step.id === data.stepId) {
                          return {
                            ...box,
                            links: box.links.map(linkElement => {
                              if (linkElement.id === data.id) {
                                let title = data.title;
                                let linkType = data.type;
                                let mapPersonaImages = data.mapPersonaImages;
                                let linkedJourneyMapId = data.linkedJourneyMapId;
                                let icon = data.icon;
                                let url = data.url;

                                if (undoRedo === UndoRedoEnum.UNDO) {
                                  title = data.previousTitle;
                                  linkType = data.previousType;
                                  mapPersonaImages = data.previousMapPersonaImages;
                                  linkedJourneyMapId = data.previousLinkedJourneyMapId;
                                  icon = data.previousIcon;
                                  url = data.previousUrl;
                                }
                                return {
                                  ...linkElement,
                                  title,
                                  type: linkType,
                                  mapPersonaImages,
                                  linkedJourneyMapId,
                                  icon,
                                  url,
                                };
                              }
                              return linkElement;
                            }),
                          };
                        }
                        return box;
                      }),
                    };
                  }
                  return r;
                });
                return { ...prev, rows };
              });
              break;
            }
            case ActionsEnum.DELETE: {
              if (undoRedo) {
                removeLink({
                  id: data.id,
                });
              }
              deleteMapItem(data, 'links');
              break;
            }
            case ActionsEnum.DRAG: {
              updateLink({
                editLinkInput: {
                  id: data?.id as number,
                  positionInput: data.undoPositionInput,
                },
              });
              onHandleDrag(data, 'LINKS', undoRedo);
              break;
            }
          }

          break;
        }
      }
    },
    [
      addBoxElement,
      addLink,
      addMapNewItem,
      addOrUpdateOutcome,
      addTouchPoints,
      deleteMapItem,
      onHandleDrag,
      removeBoxElement,
      removeLink,
      removeMetrics,
      removeOutcome,
      removeTouchPoint,
      restoreMetrics,
      retryMetrics,
      selectedPerson?.id,
      setJourneyMap,
      setRedoActions,
      setUndoActions,
      updateBoxElement,
      updateFlippedText,
      updateLink,
      updateMetrics,
      updateTouchPoint,
    ],
  );

  return { updateMapByType };
};
