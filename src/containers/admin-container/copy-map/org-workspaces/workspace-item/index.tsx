import React, { FC } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';

interface IWorkspaceItem {
  workspace: { id: number; name: string };
  handleClick: () => void;
}

const WorkspaceItem: FC<IWorkspaceItem> = ({ workspace, handleClick }) => {
  return (
    <li
      key={workspace?.id}
      data-testid={`workspace-item-test-id-${workspace?.id}`}
      className={`workspace-list--item`}
      onClick={() => handleClick()}>
      <div className="workspace-list--item--content">
        <Tooltip title={workspace?.name} arrow placement={'bottom'}>
          <div
            className={`workspace-list--item--content--title ${
              !workspace.name?.length ? 'no-title' : ''
            }`}>
            {workspace?.name || 'No name'}
          </div>
        </Tooltip>
      </div>
    </li>
  );
};
export default WorkspaceItem;
