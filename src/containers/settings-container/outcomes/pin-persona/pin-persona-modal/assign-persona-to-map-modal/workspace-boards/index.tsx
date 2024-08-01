import React, { FC, useRef, useState } from 'react';

import './style.scss';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { useRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ErrorBoundary from '@/components/templates/error-boundary';
import WorkspaceBoardItem from '@/containers/settings-container/outcomes/pin-persona/pin-persona-modal/assign-persona-to-map-modal/workspace-boards/workspace-board-item';
import {
  GetBoardsForOutcomeGroupQuery,
  useInfiniteGetBoardsForOutcomeGroupQuery,
} from '@/gql/infinite-queries/generated/getBoardsForOutcomeGroup.generated';
import LeftArrowIcon from '@/public/base-icons/left-secondary-arrow.svg';
import { outcomePinBoardsState } from '@/store/atoms/outcomePinBoards.atom';
import { BOARDS_LIMIT } from '@/utils/constants/pagination';

interface IWorkspaceBoards {
  workspaceId: number;
  outcomeGroupId: number | null;
  handleClose: () => void;
}

const WorkspaceBoards: FC<IWorkspaceBoards> = ({ handleClose, workspaceId, outcomeGroupId }) => {
  const { mapID } = useParams();

  const [outcomePinBoards, setOutcomePinBoards] = useRecoilState(outcomePinBoardsState);

  const [boards, setBoards] = useState<any[]>([]);
  const childRef = useRef<HTMLUListElement>(null);

  const {
    data: organizationBoardsData,
    isLoading: organizationBoardsIsLoading,
    isFetching: organizationBoardsIsFetchingNextPage,
    fetchNextPage: organizationBoardsFetchNextPage,
  } = useInfiniteGetBoardsForOutcomeGroupQuery<GetBoardsForOutcomeGroupQuery, Error>(
    {
      getBoardsFourOutcomeGroupInput: {
        workspaceId: workspaceId,
        outcomeGroupId,
        limit: BOARDS_LIMIT,
        offset: 0,
      },
    },
    {
      enabled: !!workspaceId,
      onSuccess: responseData => {
        const newBoards: any = [];
        responseData.pages.forEach(personaData => {
          newBoards.push(...((personaData?.getBoardsForOutcomeGroup?.boards as any) || []));
        });
        setBoards(newBoards);
      },
      keepPreviousData: true,
      cacheTime: 0,
    },
  );

  const handleSelectPersona = (id: number, isPinned: boolean) => {
    const personaIdListCopy = [...outcomePinBoards.selectedIdList];
    const defaultSelected = [...outcomePinBoards.defaultSelected];
    const personaIdListUnselectedCopy = [...outcomePinBoards.rejectedIdList];
    let boardsNewList = [...boards];
    boardsNewList.forEach(itm => {
      if (itm?.id === id) {
        if (!isPinned) {
          const isNewSelected = personaIdListCopy.find(idNumber => idNumber === id);
          setOutcomePinBoards(prev => ({
            defaultSelected: prev?.defaultSelected?.filter(item => item !== id),
            selectedIdList: personaIdListCopy.filter(item => item !== id),
            rejectedIdList: !isNewSelected
              ? [...prev.rejectedIdList, id]
              : personaIdListUnselectedCopy.filter(item => item !== id),
          }));
        } else {
          const existsInOriginalList = defaultSelected.find(itmPersona => itmPersona === id);
          setOutcomePinBoards(prev => ({
            defaultSelected: existsInOriginalList
              ? prev.selectedIdList?.filter(itmData => itmData !== id)
              : [...defaultSelected, id],
            rejectedIdList: personaIdListUnselectedCopy.filter(item => item !== id),
            selectedIdList: existsInOriginalList
              ? prev.selectedIdList?.filter(itmData => itmData !== id)
              : [...personaIdListCopy, id],
          }));
        }

        itm.isPinned = isPinned;
      }
    });
    setBoards(boardsNewList);
  };

  const onHandleFetch = (e: React.UIEvent<HTMLElement>, childOffsetHeight: number) => {
    const target = e.currentTarget as HTMLDivElement | null;
    if (
      e.target &&
      childOffsetHeight &&
      target &&
      target.offsetHeight + target.scrollTop + 100 >= childOffsetHeight &&
      !organizationBoardsIsFetchingNextPage &&
      !organizationBoardsIsLoading &&
      boards.length < organizationBoardsData?.pages[0].getBoardsForOutcomeGroup.count!
    ) {
      organizationBoardsFetchNextPage({
        pageParam: {
          getBoardsFourOutcomeGroupInput: {
            workspaceId,
            mapId: +mapID!,
            limit: BOARDS_LIMIT,
            offset: boards.length,
          },
        },
      }).then();
    }
  };

  return (
    <div className={'boards-list'}>
      <div className={'boards-list--content'}>
        {organizationBoardsIsLoading && !boards?.length ? (
          <div className={'boards-list-loading-section'}>
            <CustomLoader />
          </div>
        ) : (
          <>
            <div
              onClick={() => {
                handleClose();
              }}
              className={'go-back'}>
              <div className={'go-back--icon'}>
                <LeftArrowIcon />
              </div>
              <div className={'go-back--text'}>Go to workspaces</div>
            </div>
            {boards?.length ? (
              <div
                className={'boards-list--content-boards'}
                onScroll={e => {
                  onHandleFetch(e, childRef.current?.offsetHeight || 0);
                }}>
                <ul ref={childRef}>
                  {boards?.map(itm => (
                    <ErrorBoundary key={itm?.id}>
                      <WorkspaceBoardItem
                        key={itm?.id}
                        itm={itm}
                        isSelected={
                          !!outcomePinBoards?.defaultSelected?.find(idItem => idItem === itm?.id)
                        }
                        handleSelectPersona={(id: number, isSelected: boolean) =>
                          handleSelectPersona(id, isSelected)
                        }
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
