import React, { useCallback, useMemo } from 'react';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import {
  GetSuiteOrgsQuery,
  useGetSuiteOrgsQuery,
} from '@/gql/queries/generated/getSuiteOrgs.generated';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ORG_USERS_TABLE } from '@/utils/constants/table';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';

const SuiteOrgs = () => {
  const router = useRouter();

  const {
    data: orgUsers,
    isLoading: isLoadingOrgUsers,
    error: errorOrgs,
  } = useGetSuiteOrgsQuery<GetSuiteOrgsQuery, Error>(
    {},
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const onHandleClickRow = useCallback(
    ({ acc_id }: { acc_id: number }) => {
      router.push(`/admin?tab=organization&id=${acc_id}&view=org-users`);
    },
    [router],
  );

  const rows = useMemo(() => {
    return orgUsers?.getSuiteOrgs.map(itm => ({ ...itm, id: itm.acc_id })) || [];
  }, [orgUsers]);

  if (isLoadingOrgUsers) {
    return <CustomLoader />;
  }

  if (errorOrgs) {
    return <CustomError error={errorOrgs?.message} />;
  }

  if (!isLoadingOrgUsers && !rows?.length) {
    return <EmptyDataInfo icon={<Box />} message={'There is no org org-users'} />;
  }

  return (
    <div className={'organizations'}>
      <CustomTable
        isTableHead={true}
        rows={rows}
        columns={ORG_USERS_TABLE}
        onClickRow={onHandleClickRow}
      />
    </div>
  );
};

export default SuiteOrgs;
