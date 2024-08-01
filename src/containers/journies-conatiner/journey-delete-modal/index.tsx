import { FC } from 'react';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeleteMapMutation,
  useDeleteMapMutation,
} from '@/gql/mutations/generated/deleteMap.generated';

interface IDeleteCxMapTable {
  journeyID: number | null;
  isOpen: boolean;
  handleClose: () => void;
  onHandleFilterJourney: (id: number) => void;
}

const JourneyDeleteModal: FC<IDeleteCxMapTable> = ({
  journeyID,
  isOpen,
  handleClose,
  onHandleFilterJourney,
}) => {
  const { mutate, isLoading: isLoadingDeleteWorkspaceItem } = useDeleteMapMutation<
    DeleteMapMutation,
    Error
  >({
    onSuccess: () => {
      onHandleFilterJourney(journeyID!);
      handleClose();
    },
    onError: () => {
      handleClose();
    },
  });

  const handleDeleteMapItem = () => {
    mutate({
      id: journeyID!,
    });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={!isLoadingDeleteWorkspaceItem}>
      <DeleteModalFrame
        item={{
          type: 'Journey',
          name: 'journey',
        }}
        handleClose={handleClose}
        handleDelete={handleDeleteMapItem}
        isLoading={isLoadingDeleteWorkspaceItem}
      />
    </CustomModal>
  );
};

export default JourneyDeleteModal;
