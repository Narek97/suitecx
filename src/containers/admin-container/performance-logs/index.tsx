import { useCallback, useMemo, useState } from 'react';
import './style.scss';
import { useRecoilState } from 'recoil';
import {
  GetPerformanceLogsQuery,
  useInfiniteGetPerformanceLogsQuery,
} from '@/gql/infinite-queries/generated/getPerformance.generated';
import { performanceLogsState } from '@/store/atoms/performanceLogs.atom';
import { PERFORMANCE_LOGS_LIMIT } from '@/utils/constants/pagination';
import { PerformanceLogsType } from '@/utils/ts/types/global-types';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ADMIN_PERFORMANCE_TABLE_COLUMNS } from '@/utils/constants/table';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomError from '@/components/atoms/custom-error/custome-error';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import { Box } from '@mui/material';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import PerformanceLogsDeleteModal from '@/containers/admin-container/performance-logs/performance-logs-delete-modal';
import PerformanceLogsQueryModal from '@/containers/admin-container/performance-logs/performance-logs-query-modal';

const PerformanceLogs = () => {
  const [performanceLogs, setPerformanceLogs] = useRecoilState(performanceLogsState);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [isOpenQueriesModal, setIsOpenQueriesModal] = useState<boolean>(false);
  const [selectedItemQueries, setSelectedItemQueries] = useState<Array<string>>([]);

  const {
    data: dataPerformanceLogs,
    isLoading: isLoadingPerformanceLogs,
    isFetchingNextPage: isFetchingNextPagePerformanceLogs,
    error: errorPerformanceLogs,
    fetchNextPage: fetchNextPageGetPerformanceLogs,
  } = useInfiniteGetPerformanceLogsQuery<GetPerformanceLogsQuery, Error>(
    {
      paginationInput: {
        limit: PERFORMANCE_LOGS_LIMIT,
        offset: 0,
      },
    },
    {
      onSuccess: response => {
        const newPerformanceLogs: Array<PerformanceLogsType> = [];
        response.pages.forEach(log => {
          newPerformanceLogs.push(...log.getPerformanceLogs.performanceLogs);
        });

        setPerformanceLogs(newPerformanceLogs || []);
      },
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const toggleDeleteModal = useCallback(() => {
    setIsOpenDeleteModal(prev => !prev);
  }, []);

  const toggleQueriesModal = useCallback((queries?: Array<string>) => {
    if (queries) {
      setSelectedItemQueries(queries);
    } else {
      setSelectedItemQueries([]);
    }
    setIsOpenQueriesModal(prev => !prev);
  }, []);

  const onHandleFetch = useCallback(() => {
    if (
      !isFetchingNextPagePerformanceLogs &&
      !isLoadingPerformanceLogs &&
      performanceLogs.length < dataPerformanceLogs?.pages[0].getPerformanceLogs.count!
    ) {
      fetchNextPageGetPerformanceLogs({
        pageParam: {
          limit: PERFORMANCE_LOGS_LIMIT,
          offset: performanceLogs.length,
        },
      }).then(() => {});
    }
  }, [
    dataPerformanceLogs?.pages,
    fetchNextPageGetPerformanceLogs,
    isFetchingNextPagePerformanceLogs,
    isLoadingPerformanceLogs,
    performanceLogs.length,
  ]);

  const onHandleClickRow = useCallback(
    (performanceLogItem: PerformanceLogsType) => {
      toggleQueriesModal(performanceLogItem?.sqlRowQueries!);
    },
    [toggleQueriesModal],
  );

  const rows = useMemo(() => {
    return performanceLogs;
  }, [performanceLogs]);

  const columns = useMemo(() => {
    return ADMIN_PERFORMANCE_TABLE_COLUMNS({ toggleDeleteModal });
  }, [toggleDeleteModal]);

  if (isLoadingPerformanceLogs) {
    return <CustomLoader />;
  }

  if (errorPerformanceLogs) {
    return <CustomError error={errorPerformanceLogs?.message} />;
  }

  if (!isLoadingPerformanceLogs && !performanceLogs.length) {
    return <EmptyDataInfo icon={<Box />} message={'There is no performance logs'} />;
  }

  return (
    <div className={'performance-logs'}>
      {isOpenDeleteModal && (
        <PerformanceLogsDeleteModal handleClose={toggleDeleteModal} isOpen={isOpenDeleteModal} />
      )}
      {isOpenQueriesModal && (
        <PerformanceLogsQueryModal
          queries={selectedItemQueries}
          isOpen={isOpenQueriesModal}
          handleClose={toggleQueriesModal}
        />
      )}
      <CustomTable
        isTableHead={true}
        rows={rows}
        columns={columns}
        onHandleFetch={onHandleFetch}
        onClickRow={onHandleClickRow}
      />
    </div>
  );
};

export default PerformanceLogs;
