import { useRouter } from 'next/navigation';
import React, { useMemo } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import {
  GetProjectsQuery,
  useGetProjectsQuery,
} from '@/gql/queries/generated/getSuiteUserBoards.generated';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ORG_BOARDS } from '@/utils/constants/table';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { Box } from '@mui/material';

const OrgBoards = () => {
  const router = useRouter();
  const { getQueryParamValue } = useQueryParam();
  const id = getQueryParamValue('id');

  const {
    isLoading: isLoadingBoards,
    error: errorBoards,
    data: userBoards,
  } = useGetProjectsQuery<GetProjectsQuery, Error>(
    {
      orgId: +id!,
    },
    {
      enabled: !!id,
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const rows = useMemo(() => {
    return userBoards?.getProjects.map(itm => ({ ...itm, id: itm.pro_project_id })) || [];
  }, [userBoards?.getProjects]);

  const onClickRow = ({ pro_project_id }: ObjectKeysType) => {
    router.push(`/admin?tab=organization&id=${id}&projectId=${pro_project_id}&view=maps`);
  };

  if (isLoadingBoards) {
    return <CustomLoader />;
  }

  if (errorBoards) {
    return <CustomError error={errorBoards?.message} />;
  }

  if (!isLoadingBoards && !rows?.length) {
    return <EmptyDataInfo icon={<Box />} message={'There is no projects'} />;
  }

  return (
    <div className={'organization--boards'}>
      <CustomTable onClickRow={onClickRow} isTableHead={true} rows={rows} columns={ORG_BOARDS} />
    </div>
  );
};

export default OrgBoards;
