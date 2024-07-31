import React, { useCallback, useMemo, useRef, useState } from 'react';
import './style.scss';
import { Box, Tooltip } from '@mui/material';
import { useRecoilState } from 'recoil';
import { OutcomeType } from '@/utils/ts/types/outcome/outcome-type';
import { outcomePinBoardsState } from '@/store/atoms/outcomePinBoards.atom';
import { DEFAULT_OUTCOME_ICON } from '@/utils/constants/general';
import {
  DeleteOutcomeGroupMutation,
  useDeleteOutcomeGroupMutation,
} from '@/gql/mutations/generated/deleteOutcomeGroup.generated';
import {
  CreateOrUpdateOutcomeGroupMutation,
  useCreateOrUpdateOutcomeGroupMutation,
} from '@/gql/mutations/generated/createOrUpdateOutcomeGroup.generated';
import {
  GetOutcomeGroupsQuery,
  useGetOutcomeGroupsQuery,
} from '@/gql/queries/generated/getOutcomeGroups.generated';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { OrderByEnum } from '@/gql/types';
import { WORKSPACE_OUTCOMES_COLUMNS } from '@/utils/constants/table';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomPopover from '@/components/atoms/custom-popover/custom-popover';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import { OUTCOME_OPTIONS } from '@/utils/constants/options';
import SearchNounProjectIcon from '@/containers/settings-container/outcomes/search-noun-project-icon';
import CreateUpdateOutcome from '@/containers/settings-container/outcomes/create-update-outcome';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Image from 'next/image';

const Outcomes = () => {
  const [outcomes, setOutcomes] = useState<OutcomeType[]>([]);
  const [selectedOutcomeGroup, setSelectedOutcomeGroup] = useState<{
    id: number;
    name: string;
    pluralName: string;
  } | null>(null);
  const [isOpenCreateUpdateBoard, setIsOpenCreateUpdateBoard] = useState<boolean>(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [outcomePinBoards, setOutcomePinBoards] = useRecoilState(outcomePinBoardsState);

  const [iconUrl, setIconUrl] = useState<string>(DEFAULT_OUTCOME_ICON);

  const { mutate: deleteOutcome, isLoading: isLoadingOutcome } = useDeleteOutcomeGroupMutation<
    DeleteOutcomeGroupMutation,
    Error
  >();

  const { isLoading: isLoadingCrateOrUpdateOutcome, mutate: createOutcome } =
    useCreateOrUpdateOutcomeGroupMutation<CreateOrUpdateOutcomeGroupMutation, Error>();

  const { isLoading: isLoadingOutcomes, isFetching: isFetchingOutcomes } = useGetOutcomeGroupsQuery<
    GetOutcomeGroupsQuery,
    Error
  >(
    {
      getOutcomeGroupsInput: {
        limit: 100,
        offset: 0,
      },
    },
    {
      onSuccess: data => {
        setOutcomes(data?.getOutcomeGroups?.outcomeGroups);
      },
    },
  );

  const onHandleCreateOutcomeGroup = useCallback(
    (data: ObjectKeysType, reset: () => void) => {
      createOutcome(
        {
          createOrUpdateOutcomeGroupInput: {
            ...data,
            icon: iconUrl,
            connectBoardIds: outcomePinBoards.selectedIdList,
            disconnectBoardIds: outcomePinBoards.rejectedIdList,
          },
        },
        {
          onSuccess: response => {
            setIconUrl(DEFAULT_OUTCOME_ICON);
            setTimeout(() => {
              setIsOpenCreateUpdateBoard(false);
              reset();
            }, 500);
            setOutcomes(prevList => {
              return [
                {
                  ...response?.createOrUpdateOutcomeGroup,
                  hasPermission: true,
                },
                ...prevList,
              ];
            });
          },
        },
      );
    },
    [createOutcome, iconUrl, outcomePinBoards.rejectedIdList, outcomePinBoards.selectedIdList],
  );

  const onHandleUpdateOutcome = (data: ObjectKeysType, reset: () => void) => {
    createOutcome(
      {
        createOrUpdateOutcomeGroupInput: {
          id: selectedOutcomeGroup?.id,
          icon: iconUrl,
          connectBoardIds: outcomePinBoards.selectedIdList,
          disconnectBoardIds: outcomePinBoards.rejectedIdList,
          ...data,
        },
      },
      {
        onSuccess: () => {
          setSelectedOutcomeGroup(null);
          setTimeout(() => {
            reset();
            setIsOpenCreateUpdateBoard(false);
          }, 500);
          setOutcomes(prev => {
            return prev?.map(itm => {
              if (itm?.id === selectedOutcomeGroup?.id) {
                return {
                  ...itm,
                  ...data,
                  icon: iconUrl,
                };
              }
              return itm;
            });
          });
          setIconUrl(DEFAULT_OUTCOME_ICON);
        },
      },
    );
  };

  const onToggleCreateUpdateBoard = useCallback(
    (outcome?: OutcomeType) => {
      if (outcome) {
        setSelectedOutcomeGroup({
          id: outcome?.id,
          name: outcome?.name,
          pluralName: outcome?.pluralName,
        });
        setIconUrl(outcome?.icon!);
        setIsOpenCreateUpdateBoard(true);
      } else {
        setSelectedOutcomeGroup(null);
        setOutcomePinBoards({ selectedIdList: [], rejectedIdList: [], defaultSelected: [] });
        setIsOpenCreateUpdateBoard(prev => !prev);
        !isOpenCreateUpdateBoard && nameInputRef.current?.focus();
      }
    },
    [isOpenCreateUpdateBoard, setOutcomePinBoards],
  );

  const onHandleDeleteItem = useCallback(
    (data: OutcomeType) => {
      setSelectedOutcomeGroup(data);
      deleteOutcome(
        { id: data?.id },
        {
          onSuccess: () => {
            setSelectedOutcomeGroup(null);
            setOutcomes(prev => [...prev.filter(itm => itm?.id !== data?.id)]);
          },
        },
      );
    },
    [deleteOutcome],
  );

  const compareByField = (fieldName: 'name' | 'createdAt' | 'user', orderType: OrderByEnum) => {
    return function (a: OutcomeType, b: OutcomeType) {
      const compareResult = a[fieldName] < b[fieldName] ? -1 : a[fieldName] > b[fieldName] ? 1 : 0;
      return orderType === OrderByEnum.Desc ? -compareResult : compareResult;
    };
  };

  const sortTableByField = (type: OrderByEnum, _: string, id: 'name' | 'createdAt' | 'user') => {
    setOutcomes(prev => {
      const sortList = prev.sort(compareByField(id, type));
      return [...sortList];
    });
  };

  const onHandleEditItem = useCallback(
    (data: OutcomeType) => {
      onToggleCreateUpdateBoard(data);
    },
    [onToggleCreateUpdateBoard],
  );

  const handleSelectIcon = useCallback((thumbnailUrl: string) => {
    setIconUrl(thumbnailUrl);
  }, []);

  const options = useMemo(() => {
    return OUTCOME_OPTIONS({
      onHandleEdit: onHandleEditItem,
      onHandleDelete: onHandleDeleteItem,
    });
  }, [onHandleDeleteItem, onHandleEditItem]);

  const columns = useMemo(() => {
    return WORKSPACE_OUTCOMES_COLUMNS;
  }, []);

  if (isLoadingOutcomes || isFetchingOutcomes) {
    return <CustomLoader />;
  }

  return (
    <div className={'outcomes'}>
      <div className={'create-update-top-section'}>
        <div
          className={`create-update-top-section--icon ${
            isOpenCreateUpdateBoard ? `opened-${!iconUrl ? 'default-' : ''}icon-state` : ''
          }`}>
          <CustomPopover
            openedPopoverButtonColor={'rgba(255, 255, 255, 0.5)'}
            popoverButton={
              <div>
                <Tooltip title={'Select an icon'} placement="bottom" arrow>
                  <div className={'selected-icon'}>
                    <Image
                      src={iconUrl}
                      alt="Selected File Preview"
                      width={30}
                      height={30}
                      style={{
                        width: '30px',
                        height: '30px',
                      }}
                    />
                  </div>
                </Tooltip>
              </div>
            }
            sxStyles={{ top: '30px', borderRadius: 0 }}>
            <SearchNounProjectIcon onIconSelect={handleSelectIcon} />
            <div className={'search-icons-placeholder-text'}>Type to see available icons here.</div>
          </CustomPopover>
        </div>
        <CreateUpdateOutcome
          formData={selectedOutcomeGroup}
          isLoading={isLoadingCrateOrUpdateOutcome}
          onToggleCreateUpdateFunction={onToggleCreateUpdateBoard}
          isOpenCreateUpdateItem={isOpenCreateUpdateBoard}
          onHandleCreateFunction={onHandleCreateOutcomeGroup}
          onHandleUpdateFunction={onHandleUpdateOutcome}
        />
      </div>
      {outcomes?.length ? (
        <div className={'outcomes--table-container'}>
          <CustomTable
            sortAscDescByField={sortTableByField}
            dashedStyle={false}
            isTableHead={true}
            rows={outcomes}
            columns={columns}
            options={options}
            // permissionCheckKey={'hasPermission'}
            processingItemId={isLoadingOutcome ? selectedOutcomeGroup?.id : null}
          />
        </div>
      ) : (
        <>
          <EmptyDataInfo icon={<Box />} message={'There are no outcomes yet'} />
        </>
      )}
    </div>
  );
};

export default Outcomes;
