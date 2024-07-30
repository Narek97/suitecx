'use client';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import CopyMapModal from '@/containers/admin-container/copy-map/copy-map-modal';
import { GetOrgsQuery, useGetOrgsQuery } from '@/gql/queries/generated/getOrgs.generated';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ORGS_TABLE_COLUMNS } from '@/utils/constants/table';
import { CopyMapLevelTemplateEnum, MapCopyLevelEnum } from '@/utils/ts/enums/global-enums';
import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import './style.scss';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import { useSetRecoilState } from 'recoil';

const CopyMap = () => {
  const [orgId, setOrgId] = useState<number | null>(null);
  const [isOpenOrgsWorkspaces, setIsOpenOrgsWorkspaces] = useState<boolean>(false);

  const setCopyMapDetailsData = useSetRecoilState(copyMapState);

  const {
    isLoading: isLoadingOrgs,
    data: dataOrgsList,
    error: errorOrgs,
  } = useGetOrgsQuery<GetOrgsQuery, Error>(
    {},
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const rows = useMemo(() => {
    return dataOrgsList?.getOrgs?.map(itm => ({ ...itm, id: itm.orgId }));
  }, [dataOrgsList?.getOrgs]);

  const columns = useMemo(() => {
    return ORGS_TABLE_COLUMNS();
  }, []);

  if (isLoadingOrgs) {
    return <CustomLoader />;
  }

  if (errorOrgs) {
    return <CustomError error={errorOrgs?.message} />;
  }

  if (!isLoadingOrgs && !rows?.length) {
    return <EmptyDataInfo icon={<Box />} message={'There are no organizations'} />;
  }

  return (
    <div className={'copy-map'}>
      {isOpenOrgsWorkspaces && orgId && (
        <CopyMapModal
          orgId={orgId}
          level={MapCopyLevelEnum.ORG}
          isOpen={isOpenOrgsWorkspaces}
          handleClose={() => {
            setIsOpenOrgsWorkspaces(false);
            setCopyMapDetailsData({
              orgId: null,
              mapId: null,
              workspaceId: null,
              boardId: null,
              template: CopyMapLevelTemplateEnum.WORKSPACES,
              isProcessing: false,
            });
          }}
        />
      )}
      <CustomTable
        isTableHead={true}
        rows={rows || []}
        columns={columns}
        onClickRow={data => {
          setOrgId(data?.orgId);
          setIsOpenOrgsWorkspaces(prev => !prev);
        }}
      />
    </div>
  );
};

export default CopyMap;
