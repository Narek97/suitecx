import { FC } from 'react';
import { useSetRecoilState } from 'recoil';
import { performanceLogsState } from '@/store/atoms/performanceLogs.atom';
import {
  DeletePerformanceMutation,
  useDeletePerformanceMutation,
} from '@/gql/mutations/generated/deletePerformancheLogs.generated';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';

interface IPerformanceLogsDeleteModal {
  isOpen: boolean;
  handleClose: (item: null) => void;
}

const PerformanceLogsDeleteModal: FC<IPerformanceLogsDeleteModal> = ({ isOpen, handleClose }) => {
  const setPerformanceLogs = useSetRecoilState(performanceLogsState);

  const { mutate: deletePerformanceLogsMutate, isLoading } = useDeletePerformanceMutation<
    DeletePerformanceMutation,
    Error
  >({
    onSuccess: () => {
      setPerformanceLogs([]);
      onHandleCloseModal();
    },
  });

  const onHandleCloseModal = () => {
    handleClose(null);
  };

  const onHandleDeleteWorkspaceItem = () => {
    deletePerformanceLogsMutate({});
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoading}>
      <DeleteModalFrame
        item={{ type: 'Performance logs', name: 'performance logs' }}
        handleClose={onHandleCloseModal}
        handleDelete={onHandleDeleteWorkspaceItem}
        isLoading={isLoading}
        text={'Are you sure you want to delete all performance logs'}
      />
    </CustomModal>
  );
};

export default PerformanceLogsDeleteModal;
