import { FC } from 'react';

import { Tooltip } from '@mui/material';

interface IRowDescription {
  value: string;
}
const RowDescription: FC<IRowDescription> = ({ value }) => {
  return (
    <Tooltip title={value}>
      <span className={`custom-table--description`} data-testid="custom-table-description-test-id">
        {value}
      </span>
    </Tooltip>
  );
};

export default RowDescription;
