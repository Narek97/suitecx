import { FC } from 'react';
import './row-options.scss';
import { MenuOptionsType } from '@/utils/ts/types/global-types';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';

interface IRowOptions {
  options: MenuOptionsType[];
  row: any;
  className?: string;
}
const RowOptions: FC<IRowOptions> = ({ options, row, className }) => {
  return (
    <div className={`table-option ${className || ''}`}>
      <CustomLongMenu
        item={row}
        options={options}
        sxStyles={{
          display: 'inline-block',
          padding: '0 4px',
          background: 'transparent',
        }}
      />
    </div>
  );
};

export default RowOptions;
