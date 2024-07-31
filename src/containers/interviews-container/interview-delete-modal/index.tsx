import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeleteInterviewMutation,
  useDeleteInterviewMutation,
} from '@/gql/mutations/generated/deleteInterview.generated';
import { InterviewType } from '@/utils/ts/types/interview/interview-type';
import React, { FC } from 'react';

interface IInterviewDeleteModal {
  isOpen: boolean;
  interview: InterviewType | null;
  onHandleFilterInterview: (id: number) => void;
  handleClose: (item: null) => void;
}

const InterviewDeleteModal: FC<IInterviewDeleteModal> = ({
  isOpen,
  interview,
  onHandleFilterInterview,
  handleClose,
}) => {
  const { mutate: deleteInterviewMutate, isLoading } = useDeleteInterviewMutation<
    DeleteInterviewMutation,
    Error
  >({
    onSuccess: () => {
      onHandleFilterInterview(+interview?.id!);
      onHandleCloseModal();
    },
  });

  const onHandleCloseModal = () => {
    handleClose(null);
  };

  const onHandleDeleteWorkspaceItem = () => {
    deleteInterviewMutate({
      id: +interview?.id!,
    });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoading}>
      <DeleteModalFrame
        item={{ type: 'Interview', name: interview?.name || 'Interview' }}
        handleClose={onHandleCloseModal}
        handleDelete={onHandleDeleteWorkspaceItem}
        isLoading={isLoading}
      />
    </CustomModal>
  );
};

export default InterviewDeleteModal;
