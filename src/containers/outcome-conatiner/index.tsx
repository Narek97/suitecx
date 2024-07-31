'use client';
import AddUpdateOutcomeItemModal from '@/containers/outcome-conatiner/add-update-outcome-item-modal';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './style.scss';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Pagination from '@/components/templates/pagination';
import { useInfiniteGetOutcomeGroupQuery } from '@/gql/infinite-queries/generated/getOutcomeGroup.generated';
import {
  DeleteOutcomeMutation,
  useDeleteOutcomeMutation,
} from '@/gql/mutations/generated/deleteOutcome.generated';
import { OrderByEnum, OutcomeListEnum, SortByEnum } from '@/gql/types';
import { OUTCOME_OPTIONS } from '@/utils/constants/options';
import { OUTCOMES_LIMIT } from '@/utils/constants/pagination';
import { OUTCOME_TABLE_COLUMNS } from '@/utils/constants/table';
import { MapOutcomeItemType, OutcomeGroupItemType } from '@/utils/ts/types/outcome/outcome-type';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';

const OutcomeContainer = () => {
  const { workspaceID, outcomeID } = useParams();

  const [groupData, setGroupData] = useState<{
    name: string;
    pluralName: string;
  }>({ name: '', pluralName: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [outcomes, setOutcomes] = useState<OutcomeGroupItemType[]>([]);
  const [isOpenCreateUpdateModal, setIsOpenCreateUpdateModal] = useState<boolean>(false);
  const [selectedOutcome, setSelectedOutcome] = useState<MapOutcomeItemType | null>(null);

  const {
    data: outcomeGroup,
    isLoading: isLoadingOutcomeGroup,
    fetchNextPage,
    isFetching: isFetchingOutcomeGroup,
  } = useInfiniteGetOutcomeGroupQuery(
    {
      getOutcomeGroupInput: {
        outcomeGroupId: +outcomeID!,
      },
      getOutcomesInput: {
        workspaceId: +workspaceID!,
        limit: OUTCOMES_LIMIT,
        offset: 0,
        list: OutcomeListEnum.OutcomeGroupLevel,
        sortBy: SortByEnum.CreatedBy,
        orderBy: OrderByEnum.Asc,
      },
    },
    {
      enabled: !!outcomeID,
      onSuccess: responseData => {
        setGroupData({
          name: responseData?.pages[responseData?.pages?.length - 1]?.getOutcomeGroup?.name,
          pluralName:
            responseData?.pages[responseData?.pages?.length - 1]?.getOutcomeGroup?.pluralName,
        });
        setOutcomes(
          responseData?.pages[responseData?.pages?.length - 1]?.getOutcomeGroup
            ?.outcomes as OutcomeGroupItemType[],
        );
      },
    },
  );

  const { isLoading: isLoadingDeleteOutcome, mutate: deleteOutcome } = useDeleteOutcomeMutation<
    DeleteOutcomeMutation,
    Error
  >();

  const onHandleCreateOutcome = (data: OutcomeGroupItemType) => {
    setOutcomes(prev => [...prev, data]);
    setIsOpenCreateUpdateModal(false);
  };

  const onHandleUpdateOutcome = (data: OutcomeGroupItemType) => {
    setOutcomes(prev => {
      return prev?.map(item => {
        if (item?.id === selectedOutcome?.id) {
          return {
            ...item,
            ...data,
          };
        }
        return item;
      });
    });
    setIsOpenCreateUpdateModal(false);
  };

  const onHandleChangePage = useCallback(
    async (page: number) => {
      await fetchNextPage({
        pageParam: {
          getOutcomeGroupInput: {
            outcomeGroupId: +outcomeID!,
          },
          getOutcomesInput: {
            workspaceId: +workspaceID!,
            limit: OUTCOMES_LIMIT,
            offset: (page - 1) * OUTCOMES_LIMIT,
            orderBy: OrderByEnum.Asc,
            sortBy: SortByEnum.CreatedAt,
            list: OutcomeListEnum.OutcomeGroupLevel,
          },
        },
      });
      setCurrentPage(page);
    },
    [fetchNextPage, outcomeID, workspaceID],
  );

  const sortTableByField = async (type: OrderByEnum, fieldName: string) => {
    setOutcomes([]);
    await fetchNextPage({
      pageParam: {
        getOutcomeGroupInput: {
          outcomeGroupId: +outcomeID!,
        },
        getOutcomesInput: {
          workspaceId: +workspaceID!,
          limit: OUTCOMES_LIMIT,
          offset: 0,
          list: OutcomeListEnum.OutcomeGroupLevel,
          sortBy: fieldName,
          orderBy: type,
        },
      },
    });
  };

  const onHandleEditItem = useCallback((outcome: MapOutcomeItemType) => {
    setSelectedOutcome(outcome);
    setIsOpenCreateUpdateModal(true);
  }, []);

  const deleteItem = useCallback(
    (outcome: any) => {
      const { id } = outcome;
      setSelectedOutcome(outcome);
      deleteOutcome(
        { id },
        {
          onSuccess: () => {
            setOutcomes(prev => {
              return prev?.filter(itm => itm?.id !== id);
            });
          },
        },
      );
    },
    [deleteOutcome],
  );

  const toggleOpenModal = useCallback(() => {
    setSelectedOutcome(null);
    setIsOpenCreateUpdateModal(prev => !prev);
  }, []);

  const options = useMemo(() => {
    return OUTCOME_OPTIONS({
      onHandleEdit: onHandleEditItem,
      onHandleDelete: deleteItem,
    });
  }, [deleteItem, onHandleEditItem]);

  const columns = useMemo(() => {
    return OUTCOME_TABLE_COLUMNS;
  }, []);

  useEffect(() => {
    setOutcomes([]);
  }, [outcomeID]);

  if (isLoadingOutcomeGroup) {
    return <CustomLoader />;
  }

  return (
    <div className={'outcome-container'}>
      {isOpenCreateUpdateModal && (
        <AddUpdateOutcomeItemModal
          isOpen={isOpenCreateUpdateModal}
          workspaceId={+workspaceID!}
          outcomeGroupId={+outcomeID!}
          singularName={groupData?.name}
          selectedOutcome={selectedOutcome}
          create={onHandleCreateOutcome}
          update={onHandleUpdateOutcome}
          handleClose={toggleOpenModal}
        />
      )}
      <div className={'outcome-container--header'}>
        <div className={'base-page-header'}>
          <h3 className={'base-title'}>{groupData?.pluralName}</h3>
        </div>
        <div className={'outcome-container--create-section'}>
          <CustomButton startIcon={true} onClick={toggleOpenModal} className={'outcome-add-btn'}>
            Add new {groupData?.name}
          </CustomButton>
        </div>
      </div>

      <div className={'outcome-container--body'}>
        {isFetchingOutcomeGroup ? (
          <div>
            <CustomLoader />
          </div>
        ) : outcomes.length ? (
          <>
            <CustomTable
              sortAscDescByField={sortTableByField}
              dashedStyle={false}
              isTableHead={true}
              rows={outcomes}
              columns={columns}
              options={options}
              processingItemId={isLoadingDeleteOutcome ? selectedOutcome?.id : null}
            />
            {!isLoadingOutcomeGroup &&
              outcomeGroup?.pages[0].getOutcomeGroup?.outcomesCount! > OUTCOMES_LIMIT && (
                <Pagination
                  currentPage={currentPage}
                  perPage={OUTCOMES_LIMIT}
                  allCount={outcomeGroup?.pages[0].getOutcomeGroup?.outcomesCount!}
                  changePage={onHandleChangePage}
                />
              )}
          </>
        ) : (
          <div className={'empty-data-info'}>
            <EmptyDataInfo icon={<Box />} message={'There are no outcome yet'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default OutcomeContainer;
