import React, { FC, useState } from 'react';

import { Box, Tooltip } from '@mui/material';
import './style.scss';
import { useRecoilState, useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ModalHeader from '@/components/templates/modal-header';
import WorkspaceBoards from '@/containers/settings-container/outcomes/pin-persona/pin-persona-modal/workspace-boards';
import {
  GetAllPinnedBoardsQuery,
  useGetAllPinnedBoardsQuery,
} from '@/gql/queries/generated/getAllPinnedBoards.generated';
import {
  GetWorkspacesByOrganizationIdQuery,
  useGetWorkspacesByOrganizationIdQuery,
} from '@/gql/queries/generated/getWorkspaces.generated';
import { outcomePinBoardsState } from '@/store/atoms/outcomePinBoards.atom';
import { userState } from '@/store/atoms/user.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { WORKSPACES_LIMIT } from '@/utils/constants/pagination';

interface IPinPersonaModal {
  isOpen: boolean;
  outcomeGroupId: null | number;
  handleClose: () => void;
}

const PinPersonaModal: FC<IPinPersonaModal> = ({ isOpen, outcomeGroupId, handleClose }) => {
  const user = useRecoilValue(userState);
  const [outcomePinBoards, setOutcomePinBoards] = useRecoilState(outcomePinBoardsState);

  const [workspaceId, setWorkspaceId] = useState<number | null>(null);

  useGetAllPinnedBoardsQuery<GetAllPinnedBoardsQuery, Error>(
    {
      outcomeGroupId: outcomeGroupId!,
    },
    {
      enabled: !!outcomeGroupId,
      onSuccess: response => {
        setOutcomePinBoards(prev => ({ ...prev, defaultSelected: response?.getAllPinnedBoards }));
      },
    },
  );

  const {
    isLoading: isLoadingWorkspaces,
    error: errorWorkspaces,
    data: dataWorkspaces,
  } = useGetWorkspacesByOrganizationIdQuery<GetWorkspacesByOrganizationIdQuery, Error>(
    {
      getWorkspacesInput: {
        limit: WORKSPACES_LIMIT,
        offset: 0,
        organizationId: +user.orgID!,
      },
    },
    {
      enabled: !!user.orgID,
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const workspaces = dataWorkspaces?.getWorkspacesByOrganizationId?.workspaces;

  return (
    <CustomModal
      isOpen={isOpen}
      modalSize={'md'}
      handleClose={handleClose}
      canCloseWithOutsideClick={!isLoadingWorkspaces}>
      <ModalHeader title={<div className={'assign-modal-header'}>Pin boards</div>} />
      {errorWorkspaces ? (
        <div className={'pin-persona-error'}>
          <div className={'pin-persona-error--text'}>{errorWorkspaces?.message}</div>
        </div>
      ) : (
        <>
          <div className={'info-text'}>Choose workspace for selecting boards</div>
          {outcomePinBoards?.defaultSelected.length > 0 && (
            <div className={'pinned-boards'}>
              There are
              <span className={'pinned-boards-count'}>
                {outcomePinBoards?.defaultSelected.length}
              </span>
              selected boards
            </div>
          )}
          {workspaceId ? (
            <WorkspaceBoards
              handleClose={() => {
                setWorkspaceId(null);
              }}
              outcomeGroupId={outcomeGroupId}
              workspaceId={workspaceId}
            />
          ) : (
            <div className={'workspaces-list'}>
              <div className={'workspaces-list--content'}>
                {isLoadingWorkspaces && !workspaces?.length ? (
                  <div className={'workspaces-list-loading-section'}>
                    <CustomLoader />
                  </div>
                ) : (
                  <>
                    {dataWorkspaces?.getWorkspacesByOrganizationId?.workspaces?.length ? (
                      <ul className={'workspaces-list--content-workspaces'}>
                        {workspaces?.map(itm => (
                          <li
                            key={itm?.id}
                            data-testid="persona-item-test-id"
                            className={`workspaces-list--content-workspaces-item`}
                            onClick={() => {
                              setWorkspaceId(itm?.id);
                            }}>
                            <div className="workspaces-list--content-workspaces-item--left">
                              <div className={'persona-text-info'}>
                                <div className={'persona-text-info'}>
                                  <Tooltip title={itm?.name} arrow placement={'bottom'}>
                                    <div className={'persona-text-info--title'}>{itm?.name}</div>
                                  </Tooltip>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyDataInfo icon={<Box />} message={'There are no workspaces yet'} />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </CustomModal>
  );
};

export default PinPersonaModal;
