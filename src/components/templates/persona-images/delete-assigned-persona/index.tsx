import { FC, useCallback } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import DeleteModalFrame from '@/components/templates/delete-modal-frame';
import {
  ConnectPersonasToMapMutation,
  useConnectPersonasToMapMutation,
} from '@/gql/mutations/generated/assignPersonaToJourneyMap.generated';
import { useGetMapSelectedPersonasQuery } from '@/gql/queries/generated/getMapSelectedPersonas.generated';

interface IDeleteCxMapTable {
  disconnectedId: number;
  isOpen: boolean;
  handleClose: () => void;
}

const DeleteAssignedPersona: FC<IDeleteCxMapTable> = ({ disconnectedId, isOpen, handleClose }) => {
  const queryClient = useQueryClient();
  const { mapID } = useParams();
  const { mutate: connectOrDisconnectPersonas, isLoading: connectPersonasIsLoading } =
    useConnectPersonasToMapMutation<ConnectPersonasToMapMutation, Error>();

  const handleDeleteMapItem = useCallback(() => {
    connectOrDisconnectPersonas(
      {
        connectPersonasToMapInput: {
          mapId: +mapID!,
          disconnectPersonaIds: [disconnectedId],
        },
      },
      {
        onSuccess: async () => {
          handleClose();
          await queryClient.invalidateQueries({
            queryKey: useGetMapSelectedPersonasQuery.getKey({
              mapId: +mapID!,
            }),
          });
          await queryClient.invalidateQueries({
            queryKey: ['GetJourneyMapRows.infinite'],
          });
        },
      },
    );
  }, [connectOrDisconnectPersonas, disconnectedId, handleClose, mapID, queryClient]);

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={!connectPersonasIsLoading}>
      <DeleteModalFrame
        item={{
          type: 'persona',
          name: 'persona',
        }}
        handleClose={handleClose}
        handleDelete={handleDeleteMapItem}
        isLoading={connectPersonasIsLoading}
      />
    </CustomModal>
  );
};

export default DeleteAssignedPersona;
