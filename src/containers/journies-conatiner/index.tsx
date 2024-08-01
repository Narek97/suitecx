'use client';
import React, { useCallback, useEffect, useState } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { useParams, useRouter } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Pagination from '@/components/templates/pagination';
import WorkspaceAnalytics from '@/components/templates/workspace-analytics';
import CopyMapModal from '@/containers/admin-container/copy-map/copy-map-modal';
import BoardPinnedOutcomesModal from '@/containers/boards-container/pinned-outcome-modal';
import JourneyDeleteModal from '@/containers/journies-conatiner/journey-delete-modal';
import SortableJourneys from '@/containers/journies-conatiner/sortable-journeys';
import {
  CreateJourneyMapMutation,
  useCreateJourneyMapMutation,
} from '@/gql/mutations/generated/createJourneyMap.generated';
import {
  GetJourniesQuery,
  useGetJourniesQuery,
} from '@/gql/mutations/generated/getJournies.generated';
import {
  UpdateJourneyMapMutation,
  useUpdateJourneyMapMutation,
} from '@/gql/mutations/generated/updateJourneyMap.generated';
import {
  GetBoardByIdQuery,
  useGetBoardByIdQuery,
} from '@/gql/queries/generated/getBoardById.generated';
import {
  GetBoardOutcomesStatQuery,
  useGetBoardOutcomesStatQuery,
} from '@/gql/queries/generated/getBoardOutcomesStat.generated';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { userState } from '@/store/atoms/user.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { JOURNIES_LIMIT, PINNED_OUTCOMES_LIMIT } from '@/utils/constants/pagination';
import { arrayMove } from '@/utils/helpers/general';
import { emitToSocketMap, unEmitToSocketMap } from '@/utils/helpers/socket-connection';
import {
  CopyMapLevelTemplateEnum,
  JourneyMapEventsEnum,
  MapCopyLevelEnum,
} from '@/utils/ts/enums/global-enums';
import { JourneyMapCardType } from '@/utils/ts/types/journey-map/journey-map-types';
dayjs.extend(fromNow);

const JourniesContainer = () => {
  const { boardID } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const user = useRecoilValue(userState);
  const setCopyMapDetailsData = useSetRecoilState(copyMapState);
  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  const [journeys, setJournies] = useState<Array<JourneyMapCardType>>([]);
  const [selectedJourney, setSelectedJourney] = useState<JourneyMapCardType | null>(null);
  const [journiesCount, setJourniesCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [isOpenDeleteMapModal, setIsOpenDeleteMapModal] = useState<boolean>(false);
  const [isOpenAllPinnedOutcomesModal, setIsOpenAllPinnedOutcomesModal] = useState<boolean>(false);
  const [isOpenCopyPasteMapModal, setIsOpenCopyPasteMapModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { mutate: mutateUpdateJourneyMap } = useUpdateJourneyMapMutation<
    UpdateJourneyMapMutation,
    Error
  >();

  const { data: pinnedOutcomes } = useGetBoardOutcomesStatQuery<GetBoardOutcomesStatQuery, Error>(
    {
      boardId: +boardID!,
      limit: PINNED_OUTCOMES_LIMIT,
    },
    {
      enabled: !!boardID,
    },
  );

  const {
    isLoading: isLoadingGetJournies,
    error: errorGetJournies,
    data: dataGetJournies,
  } = useGetJourniesQuery<GetJourniesQuery, Error>(
    {
      getMapsInput: {
        boardId: +boardID!,
        offset: JOURNIES_LIMIT * 3 * offset,
        limit: JOURNIES_LIMIT * 3,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
      onSuccess: response => {
        if (response) {
          setJournies(prev => {
            const journeysList: JourneyMapCardType[] = [
              ...(response?.getMaps.maps as Array<JourneyMapCardType>),
            ];
            return !offset ? journeysList : [...prev, ...journeysList];
          });
          setJourniesCount(response?.getMaps.count || 0);
          if (isLoading) {
            setIsLoading(false);
          }
        }
      },
    },
  );

  const { mutate: mutateCreatMap, isLoading: isLoadingCreatMap } = useCreateJourneyMapMutation<
    CreateJourneyMapMutation,
    Error
  >({
    onSuccess: (response: any) => {
      router.push(`/board/${boardID}/journey-map/${response?.createJourneyMap?.mapId}`);
    },
  });

  const boardData: GetBoardByIdQuery | undefined = queryClient.getQueryData(
    useGetBoardByIdQuery.getKey({ id: +boardID! }),
  );

  const journiesData: Array<any> = journeys.length
    ? journeys
    : (dataGetJournies?.getMaps.maps as Array<any>) || [];

  const journiesDataCount: number = journiesCount
    ? journiesCount
    : dataGetJournies?.getMaps.count || 0;

  const onToggleJourneyDeleteModal = (journey?: any) => {
    setSelectedJourney(journey || null);
    setIsOpenDeleteMapModal(prev => !prev);
  };

  const onToggleMapCopyModal = useCallback((journey?: any) => {
    setSelectedJourney(journey || null);
    setIsOpenCopyPasteMapModal(prev => !prev);
  }, []);

  const onHandleFilterJourney = (id: number) => {
    setJournies(prev => prev.filter(journey => journey.id !== id));
    setJourniesCount(prev => prev - 1);
    if (
      currentPage !== 1 &&
      currentPage === Math.ceil(journiesCount / JOURNIES_LIMIT) &&
      journiesData.slice((currentPage - 1) * JOURNIES_LIMIT, currentPage * JOURNIES_LIMIT)
        .length === 1
    ) {
      setCurrentPage(prev => prev - 1);
    }
    if ((journeys.length - 1) % JOURNIES_LIMIT === 0) {
      setOffset(prev => prev + 1);
    }
  };

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (
        dataGetJournies?.getMaps &&
        journiesData.length < journiesDataCount &&
        newPage % 2 === 0
      ) {
        setOffset(prev => prev + 1);
      }
      if (
        journiesData.length >= newPage * JOURNIES_LIMIT ||
        journiesData.length + JOURNIES_LIMIT > journiesDataCount
      ) {
        setCurrentPage(newPage);
      } else {
        setIsLoading(true);
      }
    },
    [dataGetJournies?.getMaps, journiesData.length, journiesDataCount],
  );

  const createNewJourney = useCallback(() => {
    mutateCreatMap({
      createJourneyMapInput: {
        boardId: +boardID!,
        title: 'Untitled',
      },
    });
  }, [mutateCreatMap, boardID]);

  const onJourneySortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      document.body.style.cursor = 'default';
      const map = journeys[oldIndex];
      const sortedArray = arrayMove({ list: journeys, oldIndex, newIndex });
      setJournies(sortedArray);
      mutateUpdateJourneyMap({
        updateJourneyMapInput: {
          mapId: +map.id!,
          index: newIndex + 1,
        },
      });
    },
    [journeys, mutateUpdateJourneyMap],
  );

  useEffect(() => {
    dataGetJournies?.getMaps &&
      setBreadcrumb(() => [
        {
          name: 'Workspaces',
          pathname: '/workspaces',
        },
        {
          name: dataGetJournies?.getMaps.board.workspace.name || 'Workspaces',
          pathname: `/workspace/${dataGetJournies?.getMaps.board.workspace.id}/boards`,
        },
        {
          name: dataGetJournies?.getMaps.board.name || 'Board',
        },
      ]);
  }, [dataGetJournies?.getMaps, setBreadcrumb]);

  useEffect(() => {
    emitToSocketMap(JourneyMapEventsEnum.BOARD_EVENT, { id: +boardID! });
    return () => {
      unEmitToSocketMap(JourneyMapEventsEnum.LEAVE_JOURNEY_MAP);
    };
  }, [boardID]);

  // useEffect(() => {
  //   socketMap?.on(JourneyMapEventsEnum.BOARD_EVENT, (socketData: any) => {});
  // }, []);

  const onToggleAllPinnedOutcomesModal = useCallback(() => {
    setIsOpenAllPinnedOutcomesModal(prev => !prev);
  }, []);

  const closeCopyMapModal = useCallback(() => {
    onToggleMapCopyModal();
    setCopyMapDetailsData({
      mapId: null,
      workspaceId: null,
      orgId: null,
      boardId: null,
      template: CopyMapLevelTemplateEnum.WORKSPACES,
      isProcessing: false,
    });
  }, [onToggleMapCopyModal, setCopyMapDetailsData]);

  const onHandleCopyMap = useCallback(
    (item: JourneyMapCardType) => {
      onToggleMapCopyModal();
      setCopyMapDetailsData(prev => ({
        ...prev,
        mapId: item.id,
        orgId: user.orgID!,
        template: CopyMapLevelTemplateEnum.WORKSPACES,
      }));
    },
    [onToggleMapCopyModal, setCopyMapDetailsData, user.orgID],
  );

  if (errorGetJournies) {
    return <CustomError error={errorGetJournies?.message} />;
  }
  if (isLoading) {
    return <CustomLoader />;
  }
  return (
    <div className={'journeys'} data-testid="journeys-test-id">
      {isOpenDeleteMapModal && (
        <JourneyDeleteModal
          journeyID={selectedJourney?.id!}
          isOpen={isOpenDeleteMapModal}
          handleClose={onToggleJourneyDeleteModal}
          onHandleFilterJourney={onHandleFilterJourney}
        />
      )}
      {isOpenAllPinnedOutcomesModal && boardID && (
        <BoardPinnedOutcomesModal
          handleClose={onToggleAllPinnedOutcomesModal}
          isOpen={isOpenAllPinnedOutcomesModal}
          boardId={+boardID}
        />
      )}
      {isOpenCopyPasteMapModal && (
        <CopyMapModal
          level={MapCopyLevelEnum.WORKSPACE}
          isOpen={isOpenCopyPasteMapModal}
          handleClose={() => {
            closeCopyMapModal();
            setCopyMapDetailsData({
              orgId: null,
              mapId: null,
              workspaceId: null,
              boardId: null,
              template: CopyMapLevelTemplateEnum.WORKSPACES,
              isProcessing: false,
            });
          }}
        />
      )}
      <div className="journeys--top-section">
        <div className="journeys--top-section--left">
          <div className={'base-page-header'}>
            <div className={'base-page-header--left-side'}>
              <p className={'base-title'}>{dataGetJournies?.getMaps.board.name || 'Maps'}</p>
              <div className={'journies-date'}>
                {dayjs(boardData?.getBoardById?.createdAt)?.format('MMMM D, YYYY')}
              </div>
            </div>
          </div>
        </div>
        <div className="journeys--top-section--analytics">
          <WorkspaceAnalytics
            showType={'horizontal-type'}
            outcomeGroups={pinnedOutcomes?.getBoardOutcomesStat?.outcomeStats}
            data={{
              journeyMapCount: pinnedOutcomes?.getBoardOutcomesStat?.journeysCount || 0,
              personasCount: pinnedOutcomes?.getBoardOutcomesStat?.personasCount || 0,
            }}
            viewAll={() => {
              onToggleAllPinnedOutcomesModal();
            }}
            pinnedOutcomeGroupCount={boardData?.getBoardById?.pinnedOutcomeGroupCount}
          />
        </div>
      </div>
      <div className={'journeys--button-block'}>
        <CustomButton
          data-testid={'create-new-journey-test-id'}
          id={'create-new-journey'}
          startIcon={true}
          isLoading={isLoadingCreatMap}
          onClick={createNewJourney}>
          New journey
        </CustomButton>
      </div>
      <div className={'journeys--body'}>
        {isLoadingGetJournies && !journiesData.length ? (
          <CustomLoader />
        ) : (
          <>
            {journiesData.length ? (
              <SortableJourneys
                axis="xy"
                useDragHandle
                onSortStart={() => {
                  document.body.style.cursor = 'grabbing';
                }}
                onSortEnd={onJourneySortEnd}
                onHandleDelete={onToggleJourneyDeleteModal}
                onHandleCopy={onHandleCopyMap}
                items={
                  journiesData.slice(
                    (currentPage - 1) * JOURNIES_LIMIT,
                    currentPage * JOURNIES_LIMIT,
                  ) || []
                }
              />
            ) : (
              <EmptyDataInfo icon={<Box />} message={'There are no journeys yet'} />
            )}
            {journiesDataCount > JOURNIES_LIMIT && (
              <Pagination
                perPage={JOURNIES_LIMIT}
                currentPage={currentPage}
                allCount={journiesDataCount}
                changePage={onHandleChangePage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default JourniesContainer;
