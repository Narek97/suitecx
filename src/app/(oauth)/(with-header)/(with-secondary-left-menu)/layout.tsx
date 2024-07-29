'use client';
import React, { FC, useMemo } from 'react';
import LeftMenuPanelLayout from '@/layouts/left-menu-panel-layout/left-menu-panel-layout';
import { MENU_PANEL_BOTTOM_TABS, SECONDARY_MENU_PANEL_TOP_TABS } from '@/utils/constants/tabs';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { workspaceState } from '@/store/atoms/workspace.atom';
import useGetOutcomeGroups from '@/hooks/useGetOutcomeGroups';
import {
  GetBoardByIdQuery,
  useGetBoardByIdQuery,
} from '@/gql/queries/generated/getBoardById.generated';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import {
  GetWorkspaceByIdQuery,
  useGetWorkspaceByIdQuery,
} from '@/gql/queries/generated/getWorkspaceById.generated';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import AtlasIcon from '@/public/left-menu-panel/atlas.svg';
import { useParams } from 'next/navigation';

interface IHeaderLayout {
  children: React.ReactNode;
}
const HeaderLayout: FC<IHeaderLayout> = ({ children }) => {
  const { boardID, workspaceID } = useParams();

  const workspace = useRecoilValue(workspaceState);
  const setWorkspace = useSetRecoilState(workspaceState);

  const { getOutcomesList } = useGetOutcomeGroups(
    true,
    // /^\/board\/\d+\/journey-map\/\d+$/.test(location.pathname)
  );
  // const { boardID, workspaceID } = useParams();

  const { error: errorBoard, data: dataBoard } = useGetBoardByIdQuery<GetBoardByIdQuery, Error>(
    {
      id: +boardID!,
    },
    {
      keepPreviousData: true,
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
      enabled: !!boardID,
    },
  );

  const workspaceId: number | undefined = useMemo(() => {
    return workspace?.id || dataBoard?.getBoardById?.workspace?.id;
  }, [dataBoard?.getBoardById?.workspace?.id, workspace?.id]);

  const { isLoading: isLoadingWorkspace } = useGetWorkspaceByIdQuery<GetWorkspaceByIdQuery, Error>(
    {
      id: +workspaceID! || (workspaceId as number),
    },
    {
      enabled: !!workspaceId || !!workspaceID,
      onSuccess: data => {
        setWorkspace(data.getWorkspaceById as any);
      },
    },
  );

  const topTabs = useMemo(() => {
    if (!workspaceId) return [];
    const outcomes =
      getOutcomesList()?.map(itm => {
        let regexPattern = new RegExp(`^\\/workspace\\/\\d+\\/outcome\\/${itm.value}$`);
        return {
          url: `/workspace/${workspaceId}/outcome/${itm?.value}`,
          regexp: regexPattern,
          name: itm?.label,
          ...itm,
          icon: itm?.icon ? (
            <AtlasIcon />
          ) : (
            // <Image src={itm?.icon} alt={'icon'} width={16} height={16} />
            <AtlasIcon />
          ),
        };
      }) || [];

    return [
      ...SECONDARY_MENU_PANEL_TOP_TABS({
        workspaceID: String(workspaceId),
      }),
      ...outcomes,
    ];
  }, [getOutcomesList, workspaceId]);

  if (errorBoard) {
    return <CustomError error={errorBoard?.message} />;
  }

  if (isLoadingWorkspace) {
    return <CustomLoader />;
  }

  return (
    <>
      <LeftMenuPanelLayout topTabs={topTabs} bottomTabs={MENU_PANEL_BOTTOM_TABS}>
        {children}
      </LeftMenuPanelLayout>
    </>
  );
};

export default HeaderLayout;
