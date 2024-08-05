import React, { ChangeEvent, useMemo, useState } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useSetRecoilState } from 'recoil';

import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import CopyMapModal from '@/containers/admin-container/copy-map/copy-map-modal';
import { GetOrgsQuery, useGetOrgsQuery } from '@/gql/queries/generated/getOrgs.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { ORGS_TABLE_COLUMNS } from '@/utils/constants/table';
import { CopyMapLevelTemplateEnum, MapCopyLevelEnum } from '@/utils/ts/enums/global-enums';

const CopyMap = () => {
  const queryClient = useQueryClient();
  const [orgId, setOrgId] = useState<number | null>(null);
  const [isOpenOrgsWorkspaces, setIsOpenOrgsWorkspaces] = useState<boolean>(false);
  const [searchedText, setSearchedText] = useState('');

  const setCopyMapDetailsData = useSetRecoilState(copyMapState);
  const { isLoading: isLoadingOrgs, error: errorOrgs } = useGetOrgsQuery<GetOrgsQuery, Error>(
    {
      getOrgsInput: {
        search: searchedText,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const orgsList: GetOrgsQuery | undefined = queryClient.getQueryData(
    useGetOrgsQuery.getKey({ getOrgsInput: { search: searchedText } }),
  );

  const rows = useMemo(() => {
    return orgsList?.getOrgs?.map(itm => ({ ...itm, id: itm.orgId }));
  }, [orgsList?.getOrgs]);

  const columns = useMemo(() => {
    return ORGS_TABLE_COLUMNS(searchedText);
  }, [searchedText]);

  const onHandleSearchOrgs = (e: ChangeEvent<HTMLInputElement>) => {
    debounced400(() => {
      setSearchedText(e.target.value);
    });
  };

  if (errorOrgs) {
    return <CustomError error={errorOrgs?.message} />;
  }

  return (
    <div className={'map-copy'}>
      <div className="map-copy--search">
        <div className="map-copy--search-input">
          <CustomInput placeholder={'Search for an organization'} onChange={onHandleSearchOrgs} />
        </div>
      </div>
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
      {isLoadingOrgs && <CustomLoader />}
      <CustomTable
        isTableHead={true}
        rows={rows || []}
        columns={columns}
        onClickRow={data => {
          setOrgId(data?.orgId);
          setIsOpenOrgsWorkspaces(prev => !prev);
        }}
      />
      {!isLoadingOrgs && !rows?.length && (
        <EmptyDataInfo icon={<Box />} message={'There are no organizations'} />
      )}
    </div>
  );
};

export default CopyMap;
