import { Tooltip } from '@mui/material';
import { FC } from 'react';

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
