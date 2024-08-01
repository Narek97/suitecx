import { FC } from 'react';

import { useSetRecoilState } from 'recoil';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeleteErrorLogsMutation,
  useDeleteErrorLogsMutation,
} from '@/gql/mutations/generated/deleteErrorLogs.generated';
import { errorLogsState } from '@/store/atoms/errorLogs.atom';

interface IErrorLogDeleteModal {
  isOpen: boolean;
  handleClose: (item: null) => void;
}

const ErrorLogDeleteModal: FC<IErrorLogDeleteModal> = ({ isOpen, handleClose }) => {
  const setErrorLogs = useSetRecoilState(errorLogsState);

  const { mutate: mutateDeleteErrorLogs, isLoading: isLoadingDeleteErrorLogs } =
    useDeleteErrorLogsMutation<DeleteErrorLogsMutation, Error>({
      onSuccess: () => {
        setErrorLogs([]);
        onHandleCloseModal();
      },
    });

  const onHandleCloseModal = () => {
    handleClose(null);
  };

  const onHandleDeleteWorkspaceItem = () => {
    mutateDeleteErrorLogs({});
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoadingDeleteErrorLogs}>
      <DeleteModalFrame
        item={{
          type: 'Error logs',
          name: 'error logs',
        }}
        handleClose={onHandleCloseModal}
        handleDelete={onHandleDeleteWorkspaceItem}
        isLoading={isLoadingDeleteErrorLogs}
        text={'Are you sure you want to delete all error logs'}
      />
    </CustomModal>
  );
};

export default ErrorLogDeleteModal;
