import { FC, useCallback, useRef, useState } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ErrorBoundary from '@/components/templates/error-boundary';
import BoardItem from '@/containers/admin-container/copy-map/workspace-boards/board-item';
import {
  GetWorkspaceBoardsQuery,
  useInfiniteGetWorkspaceBoardsQuery,
} from '@/gql/infinite-queries/generated/getWorkspaceBoards.generated';
import LeftArrowIcon from '@/public/base-icons/left-secondary-arrow.svg';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { BOARDS_LIMIT } from '@/utils/constants/pagination';
import { CopyMapLevelTemplateEnum } from '@/utils/ts/enums/global-enums';

interface IWorkspaceBoards {
  workspaceId: number;
  mapId: number;
  isLoadingCopyMap: boolean;
}

const WorkspaceBoards: FC<IWorkspaceBoards> = ({ workspaceId, mapId, isLoadingCopyMap }) => {
  const [selectedItem, setSelectedItem] = useState<null | number>(null);
  const [copyMapDetailsData, setCopyMapDetailsData] = useRecoilState(copyMapState);
  const [boards, setBoards] = useState<any[]>([]);
  const childRef = useRef<HTMLUListElement>(null);
  const [processingItemId, setProcessingItemId] = useState<number | null>(null);

  const {
    data: organizationBoardsData,
    isLoading: organizationBoardsIsLoading,
    isFetching: organizationBoardsIsFetchingNextPage,
    fetchNextPage: organizationBoardsFetchNextPage,
  } = useInfiniteGetWorkspaceBoardsQuery<GetWorkspaceBoardsQuery, Error>(
    {
      getWorkspaceBoardsInput: {
        offset: 0,
        limit: BOARDS_LIMIT,
        workspaceId: workspaceId,
      },
    },
    {
      enabled: !!workspaceId,
      onSuccess: responseData => {
        const newBoards: any = [];
        responseData.pages.forEach(personaData => {
          newBoards.push(...(personaData?.getWorkspaceBoards.boards || []));
        });
        setBoards(newBoards);
      },
      keepPreviousData: true,
      cacheTime: 0,
    },
  );

  const onHandleFetchWorkspaces = (e: React.UIEvent<HTMLElement>, childOffsetHeight: number) => {
    const target = e.currentTarget as HTMLDivElement | null;
    if (
      e.target &&
      childOffsetHeight &&
      target &&
      target.offsetHeight + target.scrollTop + 100 >= childOffsetHeight &&
      !organizationBoardsIsFetchingNextPage &&
      !organizationBoardsIsLoading &&
      boards.length < organizationBoardsData?.pages[0].getWorkspaceBoards.count!
    ) {
      organizationBoardsFetchNextPage({
        pageParam: {
          getBoardsFourOutcomeGroupInput: {
            workspaceId,
            mapId: +mapId!,
            limit: BOARDS_LIMIT,
            offset: boards.length,
          },
        },
      }).then();
    }
  };

  const handlePasteMap = useCallback(
    (boardId: number) => {
      setSelectedItem(boardId);
      setProcessingItemId(boardId);
      if (!copyMapDetailsData?.mapId) {
        setCopyMapDetailsData(prev => ({
          ...prev,
          template: CopyMapLevelTemplateEnum.MAPS,
          boardId: boardId,
        }));
      } else {
        setCopyMapDetailsData(prev => ({
          ...prev,
          boardId: boardId,
        }));
      }
    },
    [copyMapDetailsData, setCopyMapDetailsData],
  );

  return (
    <div className={`boards-list ${isLoadingCopyMap ? 'disabled-section' : ''}`}>
      <div className={'boards-list--content'}>
        {organizationBoardsIsLoading && !boards?.length ? (
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
              <button disabled={isLoadingCopyMap} className={`go-back--text`}>
                Go to workspaces
              </button>
            </div>
            {boards?.length ? (
              <div
                className={'boards-list--content-boards'}
                onScroll={e => {
                  onHandleFetchWorkspaces(e, childRef.current?.offsetHeight || 0);
                }}>
                <ul ref={childRef}>
                  {boards?.map(board => (
                    <ErrorBoundary key={board?.id}>
                      <BoardItem
                        key={board?.id}
                        board={board}
                        handlePasteMap={(id: number) => handlePasteMap(id)}
                        isLoadingCopyMap={isLoadingCopyMap && processingItemId === board?.id}
                        isSelected={selectedItem === board?.id}
                      />
                    </ErrorBoundary>
                  ))}
                </ul>
              </div>
            ) : (
              <EmptyDataInfo icon={<Box />} message={'There are no workspaces yet'} />
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default WorkspaceBoards;
