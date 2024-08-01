import React, { FC, useCallback } from 'react';

import './style.scss';

import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';

import WorkspaceAnalytics from '@/components/templates/workspace-analytics';
import DescriptionIcon from '@/public/workspace/description.svg';
import { WorkspaceAnalyticsEnumType } from '@/utils/ts/enums/global-enums';
import { WorkspaceType } from '@/utils/ts/types/global-types';

dayjs.extend(fromNow);

interface IWorkspaceItem {
  workspace: WorkspaceType;
}

const WorkspaceCard: FC<IWorkspaceItem> = ({ workspace }) => {
  const router = useRouter();

  const onHandleNavigateToBoards = useCallback(() => {
    router.push(`/workspace/${workspace.id}/boards`);
  }, [router, workspace.id]);

  return (
    <li
      className={'workspace-card'}
      onClick={onHandleNavigateToBoards}
      data-testid="workspace-card-test-id">
      <div className={'workspace-card--info'}>
        <p className={'workspace-card--info--title'}>{workspace.name}</p>
        <p className={'workspace-card--info--day'}>
          {dayjs(workspace.createdAt)?.format('MMMM D, YYYY')}
        </p>
        {workspace.description && (
          <div className={'workspace-card--info--description'}>
            <DescriptionIcon />
            <p>{workspace.description}</p>
          </div>
        )}
      </div>
      <WorkspaceAnalytics
        showType={WorkspaceAnalyticsEnumType.BIG}
        data={{
          journeyMapCount: workspace.journeyMapCount || 0,
          personasCount: workspace.personasCount || 0,
        }}
      />
    </li>
  );
};

export default WorkspaceCard;
