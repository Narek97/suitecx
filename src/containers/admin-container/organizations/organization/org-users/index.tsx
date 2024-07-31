import React, { useMemo } from 'react';
import { useQueryParam } from '@/hooks/useQueryParam';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import {
  GetSuiteUsersQuery,
  useGetSuiteUsersQuery,
} from '@/gql/queries/generated/getSuiteUsers.generated';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ORGS_USERS_TABLE } from '@/utils/constants/table';
import { Box } from '@mui/material';

const OrgUsers = () => {
  const { getQueryParamValue } = useQueryParam();
  const id = getQueryParamValue('id');

  const {
    data: users,
    isLoading: isLoadingOrgUsers,
    error: errorOrgUsers,
  } = useGetSuiteUsersQuery<GetSuiteUsersQuery, Error>(
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
    return users?.getSuiteUsers.users.map(itm => ({ ...itm, id: itm.user_id })) || [];
  }, [users?.getSuiteUsers]);

  if (isLoadingOrgUsers) {
    return <CustomLoader />;
  }

  if (errorOrgUsers) {
    return <CustomError error={errorOrgUsers?.message} />;
  }

  if (!isLoadingOrgUsers && !rows?.length) {
    return <EmptyDataInfo icon={<Box />} message={'There is no org org-users'} />;
  }

  return (
    <div className={'organization--users'}>
      <CustomTable isTableHead={true} rows={rows} columns={ORGS_USERS_TABLE()} />
    </div>
  );
};

export default OrgUsers;
