'use client';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import Drawer from '@mui/material/Drawer';
import deepcopy from 'deepcopy';
import { useParams } from 'next/navigation';
import { useRecoilState, useSetRecoilState } from 'recoil';

import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import ErrorBoundary from '@/components/templates/error-boundary';
import CommentsDrawer from '@/containers/journey-map-container/journey-map-card-comments-drawer';
import JourneyMapColumns from '@/containers/journey-map-container/journey-map-columns';
import JourneyMapFooter from '@/containers/journey-map-container/journey-map-footer';
import JourneyMapHeader from '@/containers/journey-map-container/journey-map-header';
import JourneyMapRows from '@/containers/journey-map-container/journey-map-rows';
import JourneyMapSelectedPersona from '@/containers/journey-map-container/journey-map-selected-persona';
import JourneyMapSteps from '@/containers/journey-map-container/journey-map-steps';
import {
  GetJourneyMapRowsQuery,
  useInfiniteGetJourneyMapRowsQuery,
} from '@/gql/infinite-queries/generated/getJourneyMapRows.generated';
import { useClearUserMapsHistoryMutation } from '@/gql/mutations/generated/clearUserMapsHistory.generated';
import { useUpdateJourneyMapColumnMutation } from '@/gql/mutations/generated/updateJourneyMapColumn.generated';
import {
  GetJourneyMapQuery,
  useGetJourneyMapQuery,
} from '@/gql/queries/generated/getJourneyMap.generated';
import {
  GetMapSelectedPersonasQuery,
  useGetMapSelectedPersonasQuery,
} from '@/gql/queries/generated/getMapSelectedPersonas.generated';
import {
  GetOrganizationUsersQuery,
  useGetOrganizationUsersQuery,
} from '@/gql/queries/generated/getOrganizationUsers.generated';
import {
  GetMapOutcomeGroupsForRowCreationQuery,
  useGetMapOutcomeGroupsForRowCreationQuery,
} from '@/gql/queries/generated/getOutcomeGroupsForMap.generated';
import { MapRowTypeEnum } from '@/gql/types';
import { debounced800 } from '@/hooks/useDebounce';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import {
  isOpenSelectedJourneyMapPersonaInfoState,
  journeyMapRowsCountState,
  journeyMapState,
  mapAssignedPersonasState,
  selectedJourneyMapPersona,
} from '@/store/atoms/journeyMap.atom';
import { notesAndCommentsDrawerState } from '@/store/atoms/notesAndCommentsDrawer.atom';
import { orgUsersState } from '@/store/atoms/orgUsers.atom';
import { mapOutcomesState } from '@/store/atoms/outcomeGroups.atom';
import { JOURNEY_MAP_LIMIT } from '@/utils/constants/pagination';
import { unEmitToSocket } from '@/utils/helpers/socket-connection';
import { JourneyMapEventsEnum } from '@/utils/ts/enums/global-enums';
import {
  BoxItemType,
  JourneyMapRowType,
  JourneyMapType,
} from '@/utils/ts/types/journey-map/journey-map-types';
import { MapPersonaStateItemType } from '@/utils/ts/types/persona/persona-types';

interface IJourneyMapContainer {
  isGuest: boolean;
}

const JourneyMapContainer: FC<IJourneyMapContainer> = ({ isGuest }) => {
  const { mapID } = useParams();

  const setBreadcrumb = useSetRecoilState(breadcrumbState);
  const setAllUsers = useSetRecoilState(orgUsersState);
  const setOutcomes = useSetRecoilState(mapOutcomesState);
  const setIsOpenSelectedJourneyMapPersonaInfo = useSetRecoilState(
    isOpenSelectedJourneyMapPersonaInfoState,
  );
  const setSelectedJourneyMapPersona = useSetRecoilState(selectedJourneyMapPersona);
  const setJourneyMapRowsCount = useSetRecoilState(journeyMapRowsCountState);
  const [commentsDrawer, setCommentsDrawer] = useRecoilState(notesAndCommentsDrawerState);
  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);
  const [selectedPersona, setSelectedPersona] = useRecoilState(selectedJourneyMapPersona);
  const [mapAssignedPersonas, setMapAssignedPersonas] = useRecoilState(mapAssignedPersonasState);

  const [isLoadingJourneyMapRows, setIsLoadingJourneyMapRows] = useState(true);
  const [isScrollPagination, setIsScrollPagination] = useState<boolean>(false);

  const { mutate: clearUserMapsHistory } = useClearUserMapsHistoryMutation();

  const { isLoading: isLoadingMapSelectedPersonas } = useGetMapSelectedPersonasQuery<
    GetMapSelectedPersonasQuery,
    Error
  >(
    {
      mapId: +mapID!,
    },
    {
      cacheTime: 0,
      staleTime: 0,
      onSuccess: response => {
        setMapAssignedPersonas(response?.getMapSelectedPersonas);
      },
    },
  );

  useGetOrganizationUsersQuery<GetOrganizationUsersQuery, Error>(
    {
      paginationInput: {
        page: 1,
        perPage: 100,
      },
    },
    {
      enabled: !isGuest,
      onSuccess: response => {
        const usersList = response?.getOrganizationUsers?.users?.map(userItem => ({
          ...userItem,
          value: userItem?.firstName + ' ' + userItem?.lastName,
        }));
        setAllUsers(usersList);
      },
      cacheTime: 0,
      keepPreviousData: false,
    },
  );

  useGetMapOutcomeGroupsForRowCreationQuery<GetMapOutcomeGroupsForRowCreationQuery, Error>(
    {
      mapId: +mapID!,
    },
    {
      onSuccess: data => {
        if (data?.getMapOutcomeGroupsForRowCreation?.length) {
          setOutcomes(data?.getMapOutcomeGroupsForRowCreation || []);
        }
      },
    },
  );

  const getActiveHeaderPersonas = useCallback(() => {
    const activePersonas: number[] = [];
    mapAssignedPersonas.forEach(itm => {
      if (itm.isSelected) {
        activePersonas.push(itm.id);
      }
    });
    return activePersonas;
  }, [mapAssignedPersonas]);

  const inputParams = useMemo(
    () => ({
      mapId: +mapID!,
      personaIds: selectedPersona ? [selectedPersona.id] : getActiveHeaderPersonas(),
      overView: !selectedPersona,
      columnLimit: 100,
      columnOffset: 0,
    }),
    [getActiveHeaderPersonas, mapID, selectedPersona],
  );

  const { mutate: updateColumn } = useUpdateJourneyMapColumnMutation();

  const {
    isFetching: isFetchingNextPageJourneyMapRows,
    fetchNextPage: fetchNextPageJourneyMapRows,
  } = useInfiniteGetJourneyMapRowsQuery<GetJourneyMapRowsQuery, Error>(
    {
      getJourneyMapInput: {
        ...inputParams,
        rowLimit: JOURNEY_MAP_LIMIT,
        rowOffset: 0,
      },
    },
    {
      enabled: !isLoadingMapSelectedPersonas,
      onSuccess: response => {
        setJourneyMapRowsCount(response.pages[0].getJourneyMap.rowCount);

        if (isScrollPagination) {
          setJourneyMap(prev => ({
            ...prev,
            rows: [
              ...journeyMap.rows,
              ...((
                response.pages.at(-1) || {
                  getJourneyMap: {
                    rows: [],
                  },
                }
              ).getJourneyMap.rows as Array<JourneyMapRowType>),
            ],
          }));
          setIsScrollPagination(false);
        } else {
          const mapRows: Array<JourneyMapRowType> = [];

          response.pages.forEach(row => {
            mapRows.push(...(row.getJourneyMap.rows as Array<JourneyMapRowType>));
          });
          setJourneyMap(prev => ({
            ...prev,
            rows: mapRows,
          }));
        }
        setIsLoadingJourneyMapRows(false);
      },
      onError: () => {
        setIsLoadingJourneyMapRows(false);
      },
    },
  );

  const {
    isLoading: isLoadingJourneyMap,
    error: errorJourneyMap,
    data: dataJourneyMap,
  } = useGetJourneyMapQuery<GetJourneyMapQuery, Error>(
    {
      getJourneyMapInput: {
        mapId: +mapID!,
        rowLimit: JOURNEY_MAP_LIMIT,
        rowOffset: 0,
        columnLimit: 100,
        columnOffset: 0,
      },
    },
    {
      onSuccess: response => {
        const journeyMapGeneralData = response?.getJourneyMap;
        setBreadcrumb(() => [
          {
            name: 'Workspaces',
            pathname: '/workspaces',
          },
          {
            name: `${journeyMapGeneralData?.map?.board?.workspace?.name}`,
            pathname: `/workspace/${journeyMapGeneralData?.map?.board?.workspace.id}/boards`,
          },
          {
            name: `${journeyMapGeneralData?.map?.board?.name}`,
            pathname: `/board/${journeyMapGeneralData?.map.board?.id}/journies`,
          },
          {
            name: `${journeyMapGeneralData?.map?.title}`,
          },
        ]);

        setJourneyMap(prev => ({
          title: journeyMapGeneralData?.map?.title || '',
          workspaceId: journeyMapGeneralData?.map?.board?.workspace?.id || null,
          columns: journeyMapGeneralData?.columns || [],
          rows: prev.rows,
        }));
      },
    },
  );

  const updateColumnByFieldName = useCallback(
    ({
      fieldName,
      value,
      columnId,
    }: {
      fieldName: string;
      value: string | number;
      columnId: number;
      sourceIndex?: number | null;
    }) => {
      debounced800(() => {
        setJourneyMap(prev => {
          const journeyMapCopy: JourneyMapType = deepcopy(prev);
          const updatedColumns = journeyMapCopy?.columns?.map(itm => {
            if (itm?.id === columnId) {
              return { ...itm, [fieldName]: value };
            }
            return itm;
          });
          return { ...prev, columns: updatedColumns };
        });

        updateColumn(
          {
            updateColumnInput: {
              columnId,
              [fieldName]: value,
            },
          },
          {
            onSuccess: () => {},
          },
        );
      });
    },
    [setJourneyMap, updateColumn],
  );

  const onColumnDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return;
      const { source, destination } = result;
      if (destination?.index !== source?.index) {
        const journeyMapColumns = deepcopy(journeyMap.columns) || [];
        const journeyMapRows = deepcopy(journeyMap.rows) || [];
        const [draggedItem] = journeyMapColumns.splice(result.source.index, 1);
        journeyMapColumns.splice(result.destination.index, 0, draggedItem);

        const newJourneyMapRows = journeyMapRows.map(row => {
          const boxes = row.boxes ? [...row.boxes] : [];
          const newBoxes: Array<BoxItemType> = [...boxes];
          const dragBoxes: Array<BoxItemType> = [];

          let destinationIndex = result.destination.index;

          boxes.forEach((box, index) => {
            if (box.columnId === +result.draggableId) {
              newBoxes.splice(index - dragBoxes.length, 1);
              dragBoxes.push(box);
            }
          });

          if (result.destination.index) {
            let startIndex = 0;
            const beforeDropColumns = journeyMapColumns.slice(0, destinationIndex);

            beforeDropColumns.forEach(c => {
              startIndex += c.size;
            });

            newBoxes.splice(startIndex, 0, ...dragBoxes);
          } else {
            newBoxes.splice(0, 0, ...dragBoxes);
          }

          if (row?.rowFunction === MapRowTypeEnum.Sentiment) {
            const newRowWithPersonas = row.rowWithPersonas.map(rowPersonaItem => {
              const statesList = rowPersonaItem?.personaStates
                ? [...(rowPersonaItem?.personaStates || [])]
                : [];
              const newPersonaStates: MapPersonaStateItemType[] = [...statesList];
              const dragPersonaBoxes: any[] = [];
              statesList.forEach((box, index) => {
                if (box.columnId === +result.draggableId) {
                  newPersonaStates.splice(index - dragPersonaBoxes.length, 1);
                  dragPersonaBoxes.push(box);
                }
              });
              if (result.destination.index) {
                let startIndex = 0;
                const beforeDropColumns = journeyMapColumns.slice(0, destinationIndex);
                beforeDropColumns.forEach(c => {
                  startIndex += c.size;
                });
                newPersonaStates.splice(startIndex, 0, ...dragPersonaBoxes);
              } else {
                newPersonaStates.splice(0, 0, ...dragPersonaBoxes);
              }
              return { ...rowPersonaItem, personaStates: newPersonaStates };
            });
            return {
              ...row,
              rowWithPersonas: newRowWithPersonas,
              boxes: newBoxes,
            };
          }
          return {
            ...row,
            boxes: newBoxes,
          };
        });
        setJourneyMap(prev => ({
          ...prev,
          rows: newJourneyMapRows,
          columns: journeyMapColumns,
        }));
        updateColumnByFieldName({
          fieldName: 'index',
          sourceIndex: source?.index + 1,
          value: destination?.index + 1,
          columnId: draggedItem?.id,
        });
      }
    },
    [journeyMap.columns, journeyMap.rows, setJourneyMap, updateColumnByFieldName],
  );

  const onHandleFetchNextPageJourneyMapRows = useCallback(async () => {
    setIsScrollPagination(true);
    await fetchNextPageJourneyMapRows({
      pageParam: {
        getJourneyMapInput: {
          ...inputParams,
          rowLimit: JOURNEY_MAP_LIMIT,
          rowOffset: journeyMap.rows.length,
        },
      },
    });
  }, [fetchNextPageJourneyMapRows, inputParams, journeyMap.rows.length]);

  const onHandleCloseDrawer = () => {
    setCommentsDrawer(prev => ({
      ...prev,
      isOpen: !prev?.isOpen,
    }));
  };

  const mapColumns = useMemo(() => {
    return journeyMap?.columns || [];
  }, [journeyMap?.columns]);

  const mapSteps = useMemo(() => {
    return journeyMap?.rows[0] || [];
  }, [journeyMap?.rows]);

  useEffect(() => {
    return () => {
      clearUserMapsHistory({});
      setJourneyMap({
        title: '',
        workspaceId: null,
        columns: [],
        rows: [],
      });
      setSelectedPersona(null);
      setSelectedJourneyMapPersona(null);
      setIsOpenSelectedJourneyMapPersonaInfo(false);
      unEmitToSocket(JourneyMapEventsEnum.LEAVE_JOURNEY_MAP);
    };
  }, [
    clearUserMapsHistory,
    setIsOpenSelectedJourneyMapPersonaInfo,
    setJourneyMap,
    setSelectedJourneyMapPersona,
    setSelectedPersona,
  ]);

  if (isLoadingJourneyMap) {
    return <CustomLoader />;
  }

  if (errorJourneyMap) {
    return <CustomError error={errorJourneyMap?.message} />;
  }

  return (
    <div>
      <ErrorBoundary>
        <Drawer
          anchor={'left'}
          data-testid="drawer-test-id"
          open={commentsDrawer.isOpen}
          onClose={() => onHandleCloseDrawer()}>
          <CommentsDrawer commentsDrawer={commentsDrawer} onClose={() => onHandleCloseDrawer()} />
        </Drawer>
      </ErrorBoundary>

      <JourneyMapHeader
        title={journeyMap?.title}
        isGuest={isGuest || !!journeyMap?.isTitleDisabled}
      />

      <div className={'journey-map-wrapper'}>
        <ErrorBoundary>
          <JourneyMapSelectedPersona />
        </ErrorBoundary>

        <div className={'journey-map-wrapper--map-block'}>
          <div className={`${isGuest ? 'journey-map-guest' : ''} journey-map`} id={'journey-map'}>
            <>
              <ErrorBoundary>
                <JourneyMapColumns
                  onColumnDragEnd={onColumnDragEnd}
                  updateColumnByFieldName={updateColumnByFieldName}
                  columns={mapColumns}
                  isGuest={isGuest}
                />
              </ErrorBoundary>

              {isLoadingJourneyMapRows ? (
                <>
                  <CustomLoader />
                </>
              ) : (
                <>
                  <ErrorBoundary>
                    <JourneyMapSteps steps={mapSteps} columns={mapColumns} isGuest={isGuest} />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <JourneyMapRows
                      isFetchingNextPageJourneyMapRows={isFetchingNextPageJourneyMapRows}
                      onHandleFetchNextPageJourneyMapRows={onHandleFetchNextPageJourneyMapRows}
                      isGuest={isGuest}
                    />
                  </ErrorBoundary>
                </>
              )}
            </>
          </div>
        </div>
      </div>

      <JourneyMapFooter
        isGuest={isGuest}
        workspaceId={dataJourneyMap?.getJourneyMap?.map?.board?.workspaceId!}
      />
    </div>
  );
};

export default JourneyMapContainer;
