import React, { FC } from 'react';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeleteAiJourneyModelMutation,
  useDeleteAiJourneyModelMutation,
} from '@/gql/mutations/generated/deleteAiJourneyModel.generated';
import { AiModelType } from '@/utils/ts/types/ai-model/ai-model-type';


interface IAiModelDeleteModal {
  isOpen: boolean;
  aiModel: AiModelType | null;
  onHandleFilterAiModel: (id: number) => void;
  handleClose: (item: null) => void;
}

const AiModelDeleteModal: FC<IAiModelDeleteModal> = ({
  isOpen,
  aiModel,
  onHandleFilterAiModel,
  handleClose,
}) => {
  const { mutate: deleteAiModelMutate, isLoading } = useDeleteAiJourneyModelMutation<
    DeleteAiJourneyModelMutation,
    Error
  >({
    onSuccess: () => {
      onHandleFilterAiModel(+aiModel?.id!);
      onHandleCloseModal();
    },
  });

  const onHandleCloseModal = () => {
    handleClose(null);
  };

  const onHandleDeleteWorkspaceItem = () => {
    deleteAiModelMutate({
      id: +aiModel?.id!,
    });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoading}>
      <DeleteModalFrame
        item={{ type: 'Ai Model', name: aiModel?.name || 'Ai Model' }}
        handleClose={onHandleCloseModal}
        handleDelete={onHandleDeleteWorkspaceItem}
        isLoading={isLoading}
      />
    </CustomModal>
  );
};

export default AiModelDeleteModal;
