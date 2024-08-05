import { ChangeEvent, FC, useCallback, useState } from 'react';

import './style.scss';

import { Box } from '@mui/material';
import { useSetRecoilState } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import OrgItem from '@/containers/admin-container/copy-map/orgs/org-item';
import { GetOrgsQuery, useGetOrgsQuery } from '@/gql/queries/generated/getOrgs.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { copyMapState } from '@/store/atoms/copyMap.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { CopyMapLevelTemplateEnum } from '@/utils/ts/enums/global-enums';

const Orgs: FC = () => {
  const [searchedText, setSearchedText] = useState('');

  const setCopyMapDetailsData = useSetRecoilState(copyMapState);
  const {
    isLoading: isLoadingOrgs,
    error: errorOrgs,
    data: dataOrgs,
  } = useGetOrgsQuery<GetOrgsQuery, Error>(
    { getOrgsInput: { search: searchedText } },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const onHandleSearchOrgs = (e: ChangeEvent<HTMLInputElement>) => {
    debounced400(() => {
      setSearchedText(e.target.value);
    });
  };

  const orgItemCLick = useCallback(
    (orgId: number) => {
      setCopyMapDetailsData(prev => ({
        ...prev,
        template: CopyMapLevelTemplateEnum.WORKSPACES,
        orgId,
      }));
    },
    [setCopyMapDetailsData],
  );

  const orgs = dataOrgs?.getOrgs || [];

  return (
    <>
      <div className="org-users--search">
        <div className="org-users--search-input">
          <CustomInput placeholder={'Search for an organization'} onChange={onHandleSearchOrgs} />
        </div>
      </div>
      {errorOrgs ? (
        <div className={'orgs-error'}>
          <div className={'orgs-error--text'}>{errorOrgs?.message}</div>
        </div>
      ) : (
        <>
          <div className={'orgs-list'}>
            <div className={'orgs-list--content'}>
              {isLoadingOrgs && !orgs?.length ? (
                <div className={'orgs-list-loading-section'}>
                  <CustomLoader />
                </div>
              ) : (
                <>
                  {orgs?.length ? (
                    <ul className={'orgs-list--content-orgs'}>
                      {orgs?.map(itm => (
                        <OrgItem
                          key={itm?.orgId}
                          search={searchedText}
                          org={{ orgId: itm.orgId, name: itm.name || '' }}
                          handleClick={() => orgItemCLick(itm.orgId)}
                        />
                      ))}
                    </ul>
                  ) : (
                    <EmptyDataInfo icon={<Box />} message={'There are no organizations yet'} />
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Orgs;
