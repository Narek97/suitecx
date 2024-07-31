import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import {
  GetProjectMapsQuery,
  useGetProjectMapsQuery,
} from '@/gql/queries/generated/getProjectMaps.generated';
import { useQueryParam } from '@/hooks/useQueryParam';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { PROJECT_MAPS_COLUMNS } from '@/utils/constants/table';
import { Box } from '@mui/material';
import React, { FC, useMemo } from 'react';

const BoardMaps: FC<any> = () => {
  const { getQueryParamValue } = useQueryParam();

  const projectId = getQueryParamValue('projectId');

  const {
    data: userMaps,
    isLoading: isLoadingMaps,
    error: errorMaps,
  } = useGetProjectMapsQuery<GetProjectMapsQuery, Error>(
    {
      projectId: +projectId!,
    },
    {
      enabled: !!projectId,
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const rows = useMemo(() => {
    return userMaps?.getProjectMaps.map(itm => ({ ...itm, id: itm.c_id })) || [];
  }, [userMaps?.getProjectMaps]);

  if (isLoadingMaps) {
    return <CustomLoader />;
  }

  if (errorMaps) {
    return <CustomError error={errorMaps?.message} />;
  }

  if (!isLoadingMaps && !rows?.length) {
    return <EmptyDataInfo icon={<Box />} message={'There is no maps'} />;
  }

  return (
    <div className={'board-maps'}>
      <CustomTable isTableHead={true} rows={rows} columns={PROJECT_MAPS_COLUMNS()} />
    </div>
  );
};

export default BoardMaps;
