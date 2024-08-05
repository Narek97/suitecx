import React, { FC } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';

interface IBoardItem {
  board: { id: number; name: string };
  handlePasteMap: (id: number) => void;
  isLoadingCopyMap: boolean;
  isSelected: boolean;
}

const BoardItem: FC<IBoardItem> = ({ board, handlePasteMap, isLoadingCopyMap, isSelected }) => {
  return (
    <li
      data-testid={`board-item-test-id-${board?.id}`}
      className={`board-item ${isLoadingCopyMap ? 'processing' : ''}  ${
        isSelected ? 'selected-item' : ''
      }`}
      onClick={() => handlePasteMap(board?.id)}>
      <div className={'board-item-text-info'}>
        <Tooltip title={board?.name} arrow placement={'bottom'}>
          <div className={'board-item-text-info--title'}>{board?.name}</div>
        </Tooltip>
      </div>
    </li>
  );
};
export default BoardItem;
