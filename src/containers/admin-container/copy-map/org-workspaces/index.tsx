import { FC, useCallback } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useSetRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import WorkspaceItem from '@/containers/admin-container/copy-map/org-workspaces/workspace-item';
import {
  GetWorkspacesForPastQuery,
  useGetWorkspacesForPastQuery,
} from '@/gql/queries/generated/getWorkspacesForPaste.generated';
import LeftArrowIcon from '@/public/base-icons/left-secondary-arrow.svg';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { CopyMapLevelTemplateEnum, MapCopyLevelEnum } from '@/utils/ts/enums/global-enums';

interface IOrgWorkspace {
  orgId: number;
  level: MapCopyLevelEnum;
}

const OrgWorkspace: FC<IOrgWorkspace> = ({ orgId, level }) => {
  const setCopyMapDetailsData = useSetRecoilState(copyMapState);

  const {
    isLoading: isLoadingWorkspaces,
    error: errorWorkspaces,
    data: dataWorkspaces,
  } = useGetWorkspacesForPastQuery<GetWorkspacesForPastQuery, Error>(
    {
      orgId: orgId!,
    },
    {
      enabled: !!orgId,
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );
  const workspaceItemCLick = useCallback(
    (itm: { id: number }) => {
      setCopyMapDetailsData(prev => ({
        ...prev,
        template: CopyMapLevelTemplateEnum.BOARDS,
        workspaceId: itm?.id,
      }));
    },
    [setCopyMapDetailsData],
  );

  const workspaces = dataWorkspaces?.getWorkspaces || [];

  return (
    <>
      {errorWorkspaces ? (
        <div className={'workspaces-error'}>
          <div className={'workspaces-error--text'}>{errorWorkspaces?.message}</div>
        </div>
      ) : (
        <>
          {level === MapCopyLevelEnum.ORG && (
            <div
              onClick={() => {
                setCopyMapDetailsData(prev => ({
                  ...prev,
                  template: CopyMapLevelTemplateEnum.ORGS,
                  boardId: null,
                  workspaceId: null,
                }));
              }}
              className={'go-back'}>
              <div className={'go-back--icon'}>
                <LeftArrowIcon />
              </div>
              <div className={'go-back--text'}>Go to Orgs</div>
            </div>
          )}
          <div className={'workspaces-list'}>
            <div className={'workspaces-list--content'}>
              {isLoadingWorkspaces && !workspaces?.length ? (
                <div className={'workspaces-list-loading-section'}>
                  <CustomLoader />
                </div>
              ) : (
                <>
                  {workspaces?.length ? (
                    <ul className={'workspaces-list--content-workspaces'}>
                      {workspaces?.map(itm => (
                        <WorkspaceItem
                          key={itm?.id}
                          workspace={itm}
                          handleClick={() => workspaceItemCLick(itm)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <EmptyDataInfo icon={<Box />} message={'There are no workspaces yet'} />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default OrgWorkspace;
