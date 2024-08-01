import './style.scss';
import React, { ComponentClass } from 'react';

import { SortableContainer, SortableContainerProps, SortableElement } from 'react-sortable-hoc';

import ErrorBoundary from '@/components/templates/error-boundary';
import BoardCard from '@/containers/boards-container/sortable-boards/board-card';
import { UpdateBoardInput } from '@/gql/types';
import { BoardType } from '@/utils/ts/types/board/board-types';

const SortableBoardComponent = SortableElement<{
  board: BoardType;
  updateBoardName: (data: UpdateBoardInput) => void;
  onToggleBoardDeleteModal: (board?: BoardType) => void;
  onToggleAllPinnedOutcomesModal: (board?: BoardType) => void;
}>(
  ({
    board,
    updateBoardName,
    onToggleBoardDeleteModal,
    onToggleAllPinnedOutcomesModal,
  }: {
    board: BoardType;
    updateBoardName: (data: UpdateBoardInput) => void;
    onToggleBoardDeleteModal: (board?: BoardType) => void;
    onToggleAllPinnedOutcomesModal: (board?: BoardType) => void;
  }) => {
    return (
      <li className={'sortable-boards--list'}>
        <ErrorBoundary>
          <BoardCard
            board={board}
            updateBoardName={updateBoardName}
            onToggleBoardDeleteModal={onToggleBoardDeleteModal}
            onToggleAllPinnedOutcomesModal={onToggleAllPinnedOutcomesModal}
          />
        </ErrorBoundary>
      </li>
    );
  },
);

interface SortableComponentProps extends SortableContainerProps {
  items: BoardType[];
  updateBoardName: (data: UpdateBoardInput) => void;
  onToggleBoardDeleteModal: (board?: BoardType) => void;
  onToggleAllPinnedOutcomesModal: (board?: BoardType) => void;
}

const SortableBoards: ComponentClass<SortableComponentProps & SortableContainerProps> =
  SortableContainer<SortableComponentProps>(
    ({
      items,
      updateBoardName,
      onToggleBoardDeleteModal,
      onToggleAllPinnedOutcomesModal,
    }: {
      items: BoardType[];
      updateBoardName: (data: UpdateBoardInput) => void;
      onToggleBoardDeleteModal: (board?: BoardType) => void;
      onToggleAllPinnedOutcomesModal: (board?: BoardType) => void;
    }) => {
      return (
        <ul className={'sortable-boards'}>
          {items.map((board, index) => (
            <SortableBoardComponent
              key={board?.id}
              updateBoardName={updateBoardName}
              onToggleBoardDeleteModal={onToggleBoardDeleteModal}
              onToggleAllPinnedOutcomesModal={onToggleAllPinnedOutcomesModal}
              index={index}
              board={board}
            />
          ))}
        </ul>
      );
    },
  );

export default SortableBoards;
