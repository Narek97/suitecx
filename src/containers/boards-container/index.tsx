'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './style.scss';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { BoardType } from '@/utils/ts/types/board/board-types';
import { useParams } from 'next/navigation';
import {
  GetMyBoardsQuery,
  useGetMyBoardsQuery,
} from '@/gql/infinite-queries/generated/getBoards.generated';
import { BOARDS_LIMIT } from '@/utils/constants/pagination';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { useCreateBoardMutation } from '@/gql/mutations/generated/createBoard.generated';
import { CreateBoardInput, UpdateBoardInput } from '@/gql/types';
import { ActionsEnum } from '@/utils/ts/enums/global-enums';
import {
  UpdateBoardMutation,
  useUpdateBoardMutation,
} from '@/gql/mutations/generated/updateBoard.generated';
import { arrayMove } from '@/utils/helpers/general';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import { Box } from '@mui/material';
import SortableBoards from '@/containers/boards-container/sortable-boards';
import CreateItem from '@/components/templates/create-item';
import { workspaceState } from '@/store/atoms/workspace.atom';
import Pagination from '@/components/templates/pagination';

const BoardsContainer = () => {
  const workspace = useRecoilValue(workspaceState);
  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  const [boardTitle, setBoardTitle] = useState<string>('');
  const [boards, setBoards] = useState<Array<BoardType>>([]);
  const [selectedBoard, setSelectedBoard] = useState<BoardType | null>(null);
  const [boardsCount, setBoardsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isOpenBoardDeleteModal, setIsOpenBoardDeleteModal] = useState<boolean>(false);
  const [isOpenAllPinnedOutcomesModal, setIsOpenAllPinnedOutcomesModal] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpenCreateUpdateBoard, setIsOpenCreateUpdateBoard] = useState<boolean>(false);
  const [boardName, setBoardName] = useState<string>('');


  console.log(isOpenBoardDeleteModal);
  console.log(isOpenAllPinnedOutcomesModal);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const { workspaceID } = useParams();

  const {
    isLoading: isLoadingBoards,
    error: errorBoards,
    data: dataBoards,
  } = useGetMyBoardsQuery<GetMyBoardsQuery, Error>(
    {
      getMyBoardsInput: {
        workspaceId: +workspaceID!,
        offset: BOARDS_LIMIT * 3 * offset,
        limit: BOARDS_LIMIT * 3,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
      onSuccess: response => {
        if (response) {
          setBoardTitle(response?.getMyBoards.workspace.name);
          setBoards(prev => [...prev, ...(response?.getMyBoards?.boards as any)]);
          setBoardsCount(response?.getMyBoards.count || 0);
          if (isLoading) {
            setIsLoading(false);
          }
        }
      },
    },
  );

  const { isLoading: isLoadingCreateBoard, mutate: mutateCreateBoard } = useCreateBoardMutation<
    CreateBoardInput,
    Error
  >({
    onSuccess: response => {
      onHandleUpdateBoardByType(response.createBoard as BoardType, ActionsEnum.CREATE);
      onToggleCreateUpdateBoard();
    },
  });

  const { isLoading: isLoadingUpdateBoard, mutate: mutateUpdateBoard } = useUpdateBoardMutation<
    UpdateBoardMutation,
    Error
  >();

  const boardsData: Array<BoardType> = useMemo(
    () => (boards.length ? boards : (dataBoards?.getMyBoards.boards as Array<BoardType>) || []),
    [boards, dataBoards?.getMyBoards.boards],
  );

  const boardsDataCount: number = boardsCount ? boardsCount : dataBoards?.getMyBoards.count || 0;

  const onHandleCreateBoard = () => {
    mutateCreateBoard({
      createBoardInput: {
        name: boardName,
        workspaceId: +workspaceID!,
      },
    });
  };

  const onHandleUpdateBoard = () => {
    mutateUpdateBoard(
      {
        updateBoardInput: {
          name: boardName,
          id: selectedBoard?.id!,
        },
      },
      {
        onSuccess: response => {
          onHandleUpdateBoardByType(response.updateBoard as BoardType, ActionsEnum.UPDATE);
          onToggleCreateUpdateBoard();
        },
      },
    );
  };

  const updateBoardData = useCallback(
    (data: UpdateBoardInput) => {
      mutateUpdateBoard({
        updateBoardInput: data,
      });
    },
    [mutateUpdateBoard],
  );

  const onToggleBoardDeleteModal = useCallback((board?: BoardType) => {
    setSelectedBoard(board || null);
    setIsOpenBoardDeleteModal(prev => !prev);
  }, []);

  const onToggleAllPinnedOutcomesModal = useCallback((board?: BoardType) => {
    setSelectedBoard(board || null);
    setIsOpenAllPinnedOutcomesModal(prev => !prev);
  }, []);

  const onToggleCreateUpdateBoard = (board?: BoardType) => {
    setBoardName('');
    if (board) {
      setSelectedBoard(board);
      setBoardName(board?.name);
      setIsOpenCreateUpdateBoard(true);
    } else {
      setIsOpenCreateUpdateBoard(prev => !prev);
      !isOpenCreateUpdateBoard && nameInputRef.current?.focus();
    }
  };

  // const onHandleFilterBoard = useCallback(
  //   (id: number) => {
  //     setBoards(prev => prev.filter(board => board.id !== id));
  //     setBoardsCount(prev => prev - 1);
  //     if (
  //       currentPage !== 1 &&
  //       currentPage === Math.ceil(boardsCount / BOARDS_LIMIT) &&
  //       boardsData.slice((currentPage - 1) * BOARDS_LIMIT, currentPage * BOARDS_LIMIT).length === 1
  //     ) {
  //       setCurrentPage(prev => prev - 1);
  //     }
  //     if ((boards.length - 1) % BOARDS_LIMIT === 0) {
  //       setOffset(prev => prev + 1);
  //     }
  //   },
  //   [boards.length, boardsCount, boardsData, currentPage],
  // );

  const onHandleUpdateBoardByType = (newBoard: BoardType, type: ActionsEnum) => {
    if (type === ActionsEnum.CREATE) {
      setCurrentPage(1);
      setBoards(() => [newBoard, ...boardsData]);
      setBoardsCount(prev => prev + 1);
    }
    if (type === ActionsEnum.UPDATE) {
      setBoards(() =>
        boardsData.map(b => {
          if (b.id === newBoard.id) {
            b.name = newBoard.name;
          }
          return b;
        }),
      );
    }
  };

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (dataBoards?.getMyBoards && boardsData.length < boardsDataCount && newPage % 2 === 0) {
        setOffset(prev => prev + 1);
      }
      if (
        boardsData.length >= newPage * BOARDS_LIMIT ||
        boardsData.length + BOARDS_LIMIT > boardsDataCount
      ) {
        setCurrentPage(newPage);
      } else {
        setIsLoading(true);
      }
    },
    [boardsData.length, boardsDataCount, dataBoards?.getMyBoards],
  );

  const onBoardSortEnd = useCallback(
    ({ oldIndex, newIndex }: { oldIndex: number; newIndex: number }) => {
      document.body.style.cursor = 'default';
      const board = boards[oldIndex];
      const sortedBoards = arrayMove({ list: boards, oldIndex, newIndex });
      setBoards(sortedBoards);
      updateBoardData({
        id: board?.id,
        index: newIndex + 1,
      });
    },
    [boards, updateBoardData],
  );

  useEffect(() => {
    setBreadcrumb([
      {
        name: 'Workspaces',
        pathname: '/workspaces',
      },
      {
        name: dataBoards?.getMyBoards.workspace.name || 'Boards',
        pathname: `/workspace/${workspace.id}/boards`,
      },
    ]);
  }, [dataBoards?.getMyBoards.workspace.name, setBreadcrumb, workspace.id, workspace.name]);

  if (errorBoards) {
    return <CustomError error={errorBoards?.message} />;
  }

  return (
    <div className={'boards'} data-testid={'boards-test-id'}>
      <div className={'boards--header'}>
        <h3 className={'base-title'}>{boardTitle}</h3>

        <CreateItem
          inputPlaceholder={'Board Name'}
          createButtonText={'New board'}
          value={boardName}
          onChange={(value: any) => setBoardName(value)}
          isDisabledInput={isLoadingCreateBoard || isLoadingUpdateBoard}
          isDisabledButton={(!isLoadingCreateBoard || !isLoadingUpdateBoard) && !boardName}
          selectedItem={selectedBoard}
          isLoading={isLoadingCreateBoard || isLoadingUpdateBoard}
          onToggleCreateUpdateFunction={onToggleCreateUpdateBoard}
          isOpenCreateUpdateItem={isOpenCreateUpdateBoard}
          onHandleCreateFunction={onHandleCreateBoard}
          onHandleUpdateFunction={onHandleUpdateBoard}
        />
      </div>

      <div className={'boards--body'}>
        {isLoadingBoards && !boardsData.length ? (
          <CustomLoader />
        ) : (
          <>
            {boardsData.length ? (
              <SortableBoards
                axis="xy"
                useDragHandle
                onSortStart={() => {
                  document.body.style.cursor = 'grabbing';
                }}
                onSortEnd={onBoardSortEnd}
                items={
                  boardsData.slice((currentPage - 1) * BOARDS_LIMIT, currentPage * BOARDS_LIMIT) ||
                  []
                }
                updateBoardName={updateBoardData}
                onToggleBoardDeleteModal={onToggleBoardDeleteModal}
                onToggleAllPinnedOutcomesModal={onToggleAllPinnedOutcomesModal}
              />
            ) : (
              <EmptyDataInfo icon={<Box />} message={'There are no boards yet'} />
            )}
          </>
        )}
      </div>
      {boardsDataCount > BOARDS_LIMIT && (
        <Pagination
          perPage={BOARDS_LIMIT}
          currentPage={currentPage}
          allCount={boardsDataCount}
          changePage={onHandleChangePage}
        />
      )}
    </div>
  );
};

export default BoardsContainer;
