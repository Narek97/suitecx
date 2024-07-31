import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import { useCopyMapMutation } from '@/gql/mutations/generated/copyMap.generated';
import { DeleteErrorLogsMutation } from '@/gql/mutations/generated/deleteErrorLogs.generated';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { CopyMapLevelTemplateEnum, MapCopyLevelEnum } from '@/utils/ts/enums/global-enums';
import { useParams } from 'next/navigation';
import React, { FC } from 'react';
import './style.scss';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useQueryClient } from '@tanstack/react-query';

interface IAssignPersonaToMapModal {
  isOpen: boolean;
  orgId?: number;
  level: MapCopyLevelEnum;
  handleClose: () => void;
}

const CopyMapModal: FC<IAssignPersonaToMapModal> = ({ isOpen, orgId, handleClose, level }) => {
  const queryClient = useQueryClient();
  console.log(orgId);
  console.log(level);
  const { boardID } = useParams();

  const setSnackbarItem = useSetRecoilState(snackbarState);

  const copyMapData = useRecoilValue(copyMapState);
  const [copyMapDetailsData, setCopyMapDetailsData] = useRecoilState(copyMapState);
  const { mutate: copyMap, isLoading: isLoadingCopyMap } = useCopyMapMutation<
    DeleteErrorLogsMutation,
    Error
  >({
    onSuccess: () => {
      setCopyMapDetailsData(prev => ({ ...prev, isProcessing: false }));
    },
    onError: () => {
      setCopyMapDetailsData(prev => ({ ...prev, isProcessing: false }));
    },
  });

  const handleCopyMap = () => {
    if (!copyMapDetailsData?.mapId) {
      setCopyMapDetailsData(prev => ({
        ...prev,
        template: CopyMapLevelTemplateEnum.MAPS,
        boardId: copyMapData?.boardId,
      }));
    } else {
      setCopyMapDetailsData(prev => ({ ...prev, isProcessing: true }));

      copyMap(
        {
          copyMapInput: {
            boardId: copyMapDetailsData?.boardId!,
            mapId: copyMapDetailsData?.mapId,
          },
        },
        {
          onSuccess: async () => {
            setSnackbarItem(prev => ({
              ...prev,
              open: true,
              message: 'The map was copied to the selected board successfully.',
            }));

            setCopyMapDetailsData({
              orgId: null,
              mapId: null,
              workspaceId: null,
              boardId: null,
              template: CopyMapLevelTemplateEnum.WORKSPACES,
              isProcessing: false,
            });
            if (copyMapData?.boardId === +boardID!) {
              await queryClient.invalidateQueries(['GetJournies']);
            }
            handleClose();
          },
        },
      );
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      modalSize={'md'}
      handleClose={handleClose}
      canCloseWithOutsideClick={!copyMapData?.isProcessing}>
      <ModalHeader title={<div className={'assign-modal-header'}>Map copy</div>} />
      <div className={'copy-map-modal--info'}>
        {copyMapData?.mapId
          ? ' * Select workspace, then board for pasting the map'
          : 'Choose workspaces, then boards for paste the map'}
      </div>
      {/*todo*/}
      {/*{getPageContentByKey({*/}
      {/*  content: {*/}
      {/*    [CopyMapLevelTemplateEnum.ORGS]: <Orgs />,*/}
      {/*    [CopyMapLevelTemplateEnum.WORKSPACES]: (*/}
      {/*      <OrgWorkspaces level={level} orgId={(copyMapData.orgId || orgId)!} />*/}
      {/*    ),*/}
      {/*    [CopyMapLevelTemplateEnum.BOARDS]: (*/}
      {/*      <WorkspaceBoardsForPaste*/}
      {/*        isLoadingCopyMap={isLoadingCopyMap}*/}
      {/*        handleClose={handleClose}*/}
      {/*        mapId={copyMapData?.mapId!}*/}
      {/*        workspaceId={copyMapData?.workspaceId!}*/}
      {/*      />*/}
      {/*    ),*/}
      {/*    [CopyMapLevelTemplateEnum.MAPS]: <BoardsMap boardId={copyMapData.boardId!} />,*/}
      {/*  },*/}
      {/*  key: copyMapData.template,*/}
      {/*  defaultPage: <OrgWorkspaces level={level} orgId={(copyMapData.orgId || orgId)!} />,*/}
      {/*})}*/}
      <div className={'copy-map-modal--footer'}>
        <CustomButton
          type={'submit'}
          disabled={!(copyMapData?.mapId && copyMapData?.boardId)}
          data-testid="submit-outcome-test-id"
          variant={'contained'}
          isLoading={isLoadingCopyMap}
          startIcon={false}
          onClick={handleCopyMap}>
          Copy
        </CustomButton>
      </div>
    </CustomModal>
  );
};

export default CopyMapModal;
