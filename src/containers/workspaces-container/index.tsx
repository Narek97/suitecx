'use client';
import React from 'react';
import './style.scss';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import {
  GetWorkspacesByOrganizationIdQuery,
  useGetWorkspacesByOrganizationIdQuery,
} from '@/gql/queries/generated/getWorkspaces.generated';
import { WORKSPACES_LIMIT } from '@/utils/constants/pagination';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/atoms/user.atom';
import WorkspaceCard from '@/containers/workspaces-container/workspace-card';
import { WorkspaceType } from '@/utils/ts/types/global-types';
import ErrorBoundary from '@/components/templates/error-boundary';

const WorkspacesContainer = () => {
  const user = useRecoilValue(userState);

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

  if (errorWorkspaces) {
    return <CustomError error={errorWorkspaces?.message} />;
  }

  if (isLoadingWorkspaces) {
    return <CustomLoader />;
  }

  return (
    <ul className={'workspaces-container'}>
      {dataWorkspaces?.getWorkspacesByOrganizationId.workspaces.map(workspace => (
        <ErrorBoundary key={workspace.id}>
          <WorkspaceCard workspace={workspace as WorkspaceType} />
        </ErrorBoundary>
      ))}
    </ul>
  );
};

export default WorkspacesContainer;
