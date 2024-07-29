import { FC, ReactNode } from 'react';
import './style.scss';

interface IEmptyDataInfo {
  message: string | ReactNode;
  icon: ReactNode;
}

const EmptyDataInfo: FC<IEmptyDataInfo> = ({ message, icon }) => {
  return (
    <div className={'empty-data-info'} data-testid="empty-data-test-id">
      <div className={'empty-data-info--message'}>{message}</div>
      <div className={'empty-data-info--icon'}>{icon}</div>
    </div>
  );
};

export default EmptyDataInfo;
