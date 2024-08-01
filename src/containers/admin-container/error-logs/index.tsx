import { useCallback, useMemo, useState } from 'react';

import './style.scss';
import { Box } from '@mui/material';
import { useRecoilState } from 'recoil';

import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ErrorLogDeleteModal from '@/containers/admin-container/error-logs/error-log-delete-modal';
import {
  GetErrorLogsQuery,
  useInfiniteGetErrorLogsQuery,
} from '@/gql/infinite-queries/generated/getErrorLogs.generated';
import { ErrorLog } from '@/gql/types';
import { errorLogsState } from '@/store/atoms/errorLogs.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ERROR_LOGS_LIMIT } from '@/utils/constants/pagination';
import { ADMIN_ERROR_TABLE_COLUMNS } from '@/utils/constants/table';

const ErrorLogs = () => {
  const [errorLogs, setErrorLogs] = useRecoilState(errorLogsState);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);

  const {
    isLoading: isLoadingErrorLogs,
    isFetchingNextPage: isFetchingNextPageErrorLogs,
    error: errorErrorLogs,
    data: dataErrorLogs,
    fetchNextPage: fetchNextPageGetErrorLogs,
  } = useInfiniteGetErrorLogsQuery<GetErrorLogsQuery, Error>(
    {
      paginationInput: {
        limit: ERROR_LOGS_LIMIT,
        offset: 0,
      },
    },
    {
      onSuccess: response => {
        const newErrorLogs: Array<ErrorLog> = [];
        response.pages.forEach(log => {
          newErrorLogs.push(...log.getErrorLogs.errorLogs);
        });

        setErrorLogs(newErrorLogs || []);
      },
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const toggleDeleteModal = useCallback(() => {
    setIsOpenDeleteModal(prev => !prev);
  }, []);

  const onHandleFetch = useCallback(() => {
    if (
      !isFetchingNextPageErrorLogs &&
      !isLoadingErrorLogs &&
      errorLogs.length < dataErrorLogs?.pages[0].getErrorLogs.count!
    ) {
      fetchNextPageGetErrorLogs({
        pageParam: {
          limit: ERROR_LOGS_LIMIT,
          offset: errorLogs.length,
        },
      }).then(() => {});
    }
  }, [
    dataErrorLogs?.pages,
    errorLogs.length,
    fetchNextPageGetErrorLogs,
    isFetchingNextPageErrorLogs,
    isLoadingErrorLogs,
  ]);

  const rows = useMemo(() => {
    return errorLogs;
  }, [errorLogs]);

  const columns = useMemo(() => {
    return ADMIN_ERROR_TABLE_COLUMNS({ toggleDeleteModal });
  }, [toggleDeleteModal]);

  if (isLoadingErrorLogs) {
    return <CustomLoader />;
  }

  if (errorErrorLogs) {
    return <CustomError error={errorErrorLogs?.message} />;
  }

  if (!isLoadingErrorLogs && !errorLogs.length) {
    return <EmptyDataInfo icon={<Box />} message={'There are no error logs'} />;
  }

  return (
    <div className={'error-logs'}>
      {isOpenDeleteModal && (
        <ErrorLogDeleteModal handleClose={toggleDeleteModal} isOpen={isOpenDeleteModal} />
      )}
      <CustomTable isTableHead={true} rows={rows} columns={columns} onHandleFetch={onHandleFetch} />
    </div>
  );
};

export default ErrorLogs;
