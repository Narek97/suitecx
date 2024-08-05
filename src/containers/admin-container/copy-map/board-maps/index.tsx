import React, { FC, useRef, useState } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ErrorBoundary from '@/components/templates/error-boundary';
import MapItem from '@/containers/admin-container/copy-map/board-maps/map-item';
import {
  GetJourneysForCopyQuery,
  useInfiniteGetJourneysForCopyQuery,
} from '@/gql/infinite-queries/generated/getJourniesForCopy.generated';
import LeftArrowIcon from '@/public/base-icons/left-secondary-arrow.svg';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { BOARDS_LIMIT } from '@/utils/constants/pagination';
import { CopyMapLevelTemplateEnum } from '@/utils/ts/enums/global-enums';

interface IWorkspaceBoardsModal {
  boardId: number;
}

const BoardMaps: FC<IWorkspaceBoardsModal> = ({ boardId }) => {
  const [copyMapDetailsData, setCopyMapDetailsData] = useRecoilState(copyMapState);
  const [maps, setMaps] = useState<any[]>([]);
  const childRef = useRef<HTMLUListElement>(null);

  const {
    data: boardMaps,
    isLoading: organizationBoardsIsLoading,
    isFetching: organizationBoardsIsFetchingNextPage,
    fetchNextPage: boardsMapsFetchNextPage,
  } = useInfiniteGetJourneysForCopyQuery<GetJourneysForCopyQuery, Error>(
    {
      getMapsInput: {
        offset: 0,
        limit: BOARDS_LIMIT,
        boardId: boardId,
      },
    },
    {
      enabled: !!boardId,
      onSuccess: responseData => {
        const newBoards: any = [];
        responseData.pages.forEach(personaData => {
          newBoards.push(...(personaData?.getMaps.maps || []));
        });
        setMaps(newBoards);
      },
      keepPreviousData: true,
      cacheTime: 0,
    },
  );

  const onHandleFetch = (e: React.UIEvent<HTMLElement>, childOffsetHeight: number) => {
    const target = e.currentTarget as HTMLDivElement | null;
    if (
      e.target &&
      childOffsetHeight &&
      target &&
      target.offsetHeight + target.scrollTop + 100 >= childOffsetHeight &&
      !organizationBoardsIsFetchingNextPage &&
      !organizationBoardsIsLoading &&
      maps.length < boardMaps?.pages[0].getMaps.count!
    ) {
      boardsMapsFetchNextPage({
        pageParam: {
          getMapsInput: {
            boardId: boardId,
            limit: BOARDS_LIMIT,
            offset: maps.length,
          },
        },
      }).then();
    }
  };

  return (
    <div className={`boards-list ${copyMapDetailsData?.isProcessing ? 'disabled-section' : ''}`}>
      <div className={'boards-list--content'}>
        {organizationBoardsIsLoading && !maps?.length ? (
          <div className={'boards-list-loading-section'}>
            <CustomLoader />
          </div>
        ) : (
          <>
            <div
              onClick={() => {
                setCopyMapDetailsData(prev => ({
                  ...prev,
                  template: CopyMapLevelTemplateEnum.WORKSPACES,
                  boardId: null,
                }));
              }}
              className={`go-back`}>
              <div className={'go-back--icon'}>
                <LeftArrowIcon />
              </div>
              <button disabled={copyMapDetailsData?.isProcessing} className={`go-back--text  `}>
                Go to workspaces
              </button>
            </div>
            {maps?.length ? (
              <div
                className={'boards-list--content-boards'}
                onScroll={e => {
                  onHandleFetch(e, childRef.current?.offsetHeight || 0);
                }}>
                <ul ref={childRef}>
                  {maps?.map(itm => (
                    <ErrorBoundary key={itm?.id}>
                      <MapItem key={itm?.id} map={itm} />
                    </ErrorBoundary>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyDataInfo icon={<Box />} message={'There are no maps yet'} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default BoardMaps;
