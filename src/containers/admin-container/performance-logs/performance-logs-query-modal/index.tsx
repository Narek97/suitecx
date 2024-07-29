import { FC } from 'react';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';

interface IPerformanceLogsQueryModal {
  isOpen: boolean;
  handleClose: () => void;
  queries: string[];
}

const PerformanceLogsQueryModal: FC<IPerformanceLogsQueryModal> = ({
  queries,
  isOpen,
  handleClose,
}) => {
  return (
    <CustomModal
      modalSize={'md'}
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}>
      <ModalHeader title={'Queries'} />

      <div className={'query-modal-content'}>
        {queries.map(query => (
          <div className={'query-modal-content-item'} key={query}>
            {query}
          </div>
        ))}
      </div>
    </CustomModal>
  );
};

export default PerformanceLogsQueryModal;
