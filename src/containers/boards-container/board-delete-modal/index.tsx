import { FC } from 'react';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeleteBoardMutation,
  useDeleteBoardMutation,
} from '@/gql/mutations/generated/deleteBoard.generated';

interface IBoardDeleteModal {
  isOpen: boolean;
  boardID: number | null;
  handleClose: () => void;
  onHandleFilterBoard: (id: number) => void;
}

const BoardDeleteModal: FC<IBoardDeleteModal> = ({
  boardID,
  isOpen,
  handleClose,
  onHandleFilterBoard,
}) => {
  const { mutate, isLoading } = useDeleteBoardMutation<DeleteBoardMutation, Error>();

  const handleDeleteBoard = () => {
    mutate(
      {
        id: boardID!,
      },
      {
        onSuccess: () => {
          onHandleFilterBoard(boardID!);
          handleClose();
        },
        onError: () => {
          handleClose();
        },
      },
    );
  };

  return (
    <CustomModal isOpen={isOpen} handleClose={handleClose} canCloseWithOutsideClick={!isLoading}>
      <DeleteModalFrame
        item={{
          type: 'Board',
          name: 'board',
        }}
        handleClose={handleClose}
        handleDelete={handleDeleteBoard}
        isLoading={isLoading}
      />
    </CustomModal>
  );
};

export default BoardDeleteModal;
