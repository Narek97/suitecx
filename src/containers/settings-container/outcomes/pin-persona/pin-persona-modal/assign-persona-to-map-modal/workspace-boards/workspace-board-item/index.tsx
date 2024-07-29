import React, { FC, memo } from 'react';
import './style.scss';
import { Tooltip } from '@mui/material';

interface IWorkspaceBoardItem {
  itm: any;
  isSelected: boolean;
  handleSelectPersona: (id: number, isSelected: boolean) => void;
}

const WorkspaceBoardItem: FC<IWorkspaceBoardItem> = memo(
  ({ itm, isSelected, handleSelectPersona }) => {
    return (
      <li
        data-testid={`board-item-test-id-${itm?.id}`}
        className={`board-item ${isSelected ? 'selected-persona' : ''}`}
        onClick={() => handleSelectPersona(itm?.id, !isSelected)}>
        <div>
          <div className={'board-item-text-info'}>
            <Tooltip title={itm?.name} arrow placement={'bottom'}>
              <div className={'persona-text-info--title'}>{itm?.name}</div>
            </Tooltip>
          </div>
        </div>
      </li>
    );
  },
);
export default WorkspaceBoardItem;
