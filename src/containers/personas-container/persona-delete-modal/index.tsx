import { FC } from 'react';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  DeletePersonaMutation,
  useDeletePersonaMutation,
} from '@/gql/mutations/generated/deletePersona.generated';

interface IPersonaDeleteModal {
  isOpen: boolean;
  personaId: number | null;
  handleClose: () => void;
  onHandleFilterPersona: (id: number) => void;
}

const PersonaDeleteModal: FC<IPersonaDeleteModal> = ({
  personaId,
  isOpen,
  handleClose,
  onHandleFilterPersona,
}) => {
  const { mutate, isLoading } = useDeletePersonaMutation<DeletePersonaMutation, Error>();

  const handleDeletePersona = () => {
    mutate(
      {
        id: personaId!,
      },
      {
        onSuccess: () => {
          onHandleFilterPersona(personaId!);
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
          type: 'persona',
          name: 'Persona',
        }}
        handleClose={handleClose}
        handleDelete={handleDeletePersona}
        isLoading={isLoading}
      />
    </CustomModal>
  );
};

export default PersonaDeleteModal;
