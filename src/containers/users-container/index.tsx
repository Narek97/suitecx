'use client';
import React, { useCallback, useMemo, useState } from 'react';

import './style.scss';
import { Box } from '@mui/material';
import dayjs from 'dayjs';

import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Pagination from '@/components/templates/pagination';
import CreateUpdateUser from '@/containers/users-container/create-update-user';
import {
  CreateUserMutation,
  useCreateUserMutation,
} from '@/gql/mutations/generated/createUser.generated';
import {
  GetOrganizationUsersQuery,
  useGetOrganizationUsersQuery,
} from '@/gql/queries/generated/getOrganizationUsers.generated';
import { CreateUserInput } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import { CREATE_USER_FORM_ELEMENTS } from '@/utils/constants/form/form-elements';
import { CREATE_USER_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { USERS_LIMIT } from '@/utils/constants/pagination';
import { USER_TABLE_COLUMNS } from '@/utils/constants/table';
import { ObjectKeysType, OrganizationUserType } from '@/utils/ts/types/global-types';

const UserContainer = () => {
  const [allUsers, setAllUsers] = useState<OrganizationUserType[]>([]);
  const [searchedUsers, setSearchedUsers] = useState<OrganizationUserType[]>([]);
  const [users, setUsers] = useState<OrganizationUserType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersTotalCount, setUsersTotalCount] = useState<number>(0);
  const [searchUserText, setSearchUserText] = useState<string>('');
  const [isCreateUser, setIsCreateUser] = useState<boolean>(false);
  const [isOpenCreateUser, setIsOpenCreateUser] = useState<boolean>(false);

  const { mutate: mutateCreateUser, isLoading: isLoadingCreateUser } = useCreateUserMutation<
    Error,
    CreateUserMutation
  >({
    onSuccess: () => {
      onToggleCreateUser();
    },
  });

  const { isLoading, isError, error } = useGetOrganizationUsersQuery<
    GetOrganizationUsersQuery,
    Error
  >(
    {
      paginationInput: {
        page: 1,
        perPage: 100,
      },
    },
    {
      onSuccess: response => {
        setUsersTotalCount(response.getOrganizationUsers?.count);
        const usersList = response.getOrganizationUsers?.users?.map(user => {
          return {
            ...user,
            name: `${user?.firstName} ${user?.lastName}`,
            lastSeen:
              user?.updatedAt !== user?.createdAt
                ? dayjs(user?.updatedAt)?.format('DD/MM/YYYY')
                : 'Never logged in',
          };
        });

        setAllUsers(usersList);
        setUsers(usersList.slice(0, USERS_LIMIT));
      },
      cacheTime: 0,
      keepPreviousData: false,
    },
  );

  const onToggleCreateUser = useCallback(() => {
    setIsCreateUser(prev => !prev);
  }, []);

  const onHandleChangePage = useCallback(
    (page: number) => {
      const usersList = searchUserText ? searchedUsers : allUsers;
      setCurrentPage(page);
      setUsers(usersList.slice((page - 1) * USERS_LIMIT, (page - 1) * USERS_LIMIT + USERS_LIMIT));
    },
    [allUsers, searchUserText, searchedUsers],
  );

  const onUserSearch = useCallback(
    (value: string) => {
      setSearchUserText(value);
      debounced400(() => {
        const usersList = allUsers.filter(user => user.firstName.includes(value));
        setUsersTotalCount(usersList.length);
        setSearchedUsers(usersList);
        setUsers(usersList.slice(0, USERS_LIMIT));
        setCurrentPage(1);
      });
    },
    [allUsers],
  );

  const onHandleCreateUser = useCallback(
    (data: ObjectKeysType, reset: () => void) => {
      mutateCreateUser(
        {
          createUserInput: data as CreateUserInput,
        },
        {
          onSuccess: response => {
            const { firstName, lastName, emailAddress } = data;
            const newUserData = {
              firstName,
              lastName,
              emailAddress,
              ...response?.createUser,
            };
            setUsersTotalCount(prev => prev + 1);
            setUsers(prev => [...prev, newUserData]);
            setAllUsers(prev => [...prev, newUserData]);
            setTimeout(() => {
              setIsOpenCreateUser(false);
              reset();
            }, 5000);
          },
        },
      );
    },
    [mutateCreateUser],
  );

  const onToggleCreateUpdate = useCallback(() => {
    onUserSearch('');
    onToggleCreateUser();
    setIsOpenCreateUser(prev => !prev);
  }, [onToggleCreateUser, onUserSearch]);

  const rows = useMemo(() => {
    return users;
  }, [users]);

  const columns = useMemo(() => {
    return USER_TABLE_COLUMNS;
  }, []);

  if (isError) {
    return <CustomError error={error?.message} />;
  }

  return (
    <>
      <div className={'users-container'}>
        <div className={`users-container--search-block `}>
          <div
            className={`users-container--search-block-input ${
              isCreateUser ? 'org-users-container--disable-search-block' : ''
            } `}>
            <CustomInput
              isIconInput={true}
              inputType={'secondary'}
              data-testid="user-search-field-test-id"
              placeholder={`search user...`}
              type={'text'}
              value={searchUserText}
              onChange={e => onUserSearch(e.target.value)}
              onKeyDown={event => {
                if (event.keyCode === 13) {
                  event.preventDefault();
                  (event.target as HTMLElement).blur();
                }
              }}
            />
          </div>
          <CreateUpdateUser
            formData={null}
            formElements={CREATE_USER_FORM_ELEMENTS}
            validationSchema={CREATE_USER_VALIDATION_SCHEMA}
            defaultValues={{ firstName: '', lastName: '', emailAddress: '' }}
            createButtonText={'New user'}
            inputPlaceholder={''}
            isDisabledInput={isLoadingCreateUser}
            isDisabledButton={isLoadingCreateUser}
            isLoading={isLoadingCreateUser}
            onToggleCreateUpdateFunction={onToggleCreateUpdate}
            isOpenCreateUpdateItem={isOpenCreateUser}
            onHandleCreateFunction={onHandleCreateUser}
            onHandleUpdateFunction={() => {}}
          />
        </div>
      </div>
      {isLoading ? (
        <CustomLoader />
      ) : (
        <div className={'users-container--table-block'}>
          {users.length ? (
            <CustomTable isTableHead={true} rows={rows} columns={columns} />
          ) : (
            <EmptyDataInfo icon={<Box />} message={'No org-users Yet'} />
          )}
          {usersTotalCount - 1 > USERS_LIMIT && (
            <Pagination
              currentPage={currentPage}
              perPage={USERS_LIMIT}
              allCount={usersTotalCount - 1}
              changePage={onHandleChangePage}
            />
          )}
        </div>
      )}
    </>
  );
};

export default UserContainer;
