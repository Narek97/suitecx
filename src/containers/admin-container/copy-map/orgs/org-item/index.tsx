import React, { FC } from 'react';
import './style.scss';

import { Tooltip } from '@mui/material';

import HighlightedText from '@/components/templates/hightlited-text';

interface IOrgItem {
  org: { orgId: number; name: string };
  search: string;
  handleClick: () => void;
}

const OrgItem: FC<IOrgItem> = ({ org, search, handleClick }) => {
  return (
    <li
      key={org?.orgId}
      data-testid={`org-item-test-id-${org?.orgId}`}
      className={`org-list--item`}
      onClick={() => handleClick()}>
      <div className="org-list--item--content">
        <Tooltip title={org?.name} arrow placement={'bottom'}>
          <div className={`org-list--item--content--title ${!org.name?.length ? 'no-title' : ''}`}>
            <HighlightedText name={org?.orgId + ' / ' + (org?.name || 'No name')} search={search} />
          </div>
        </Tooltip>
      </div>
    </li>
  );
};
export default OrgItem;
