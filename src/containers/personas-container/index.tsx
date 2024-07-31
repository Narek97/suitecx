'use client';
import React, { useCallback, useEffect, useState } from 'react';
import './style.scss';
import PersonaDeleteModal from '@/containers/personas-container/persona-delete-modal';
import CustomError from '@/components/atoms/custom-error/custome-error';
import ErrorBoundary from '@/components/templates/error-boundary';
import PersonaCard from '@/containers/personas-container/persona-card';
import { useCreatePersonaMutation } from '@/gql/mutations/generated/createPersona.generated';
import {
  GetPersonasQuery,
  useGetPersonasQuery,
} from '@/gql/queries/generated/getPersonas.generated';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { workspaceState } from '@/store/atoms/workspace.atom';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { BOARDS_LIMIT, PERSONAS_LIMIT } from '@/utils/constants/pagination';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Pagination from '@/components/templates/pagination';
import { Box } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';

const PersonasContainer = () => {
  const { workspaceID } = useParams();

  const router = useRouter();

  const workspace = useRecoilValue(workspaceState);
  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  const [personas, setPersonas] = useState<Array<PersonaType>>([]);
  const [personasCount, setPersonasCount] = useState<number>(0);
  const [selectedPersona, setSelectedPersona] = useState<PersonaType | null>(null);
  const [isOpenPersonaDeleteModal, setIsOpenPersonaDeleteModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    isLoading: isLoadingGetPersonas,
    error: errorGetPersonas,
    data: dataGetPersonas,
  } = useGetPersonasQuery<GetPersonasQuery, Error>(
    {
      getPersonasInput: {
        workspaceId: +workspaceID!,
        offset: PERSONAS_LIMIT * 3 * offset,
        limit: PERSONAS_LIMIT * 3,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
      onSuccess: response => {
        if (response) {
          setPersonas(prev => [...prev, ...(response?.getPersonas?.personas as any)]);
          setPersonasCount(response?.getPersonas.count || 0);
          if (isLoading) {
            setIsLoading(false);
          }
        }
      },
    },
  );

  const { mutate: mutateCreatePersona, isLoading: isLoadingCreatePersona } =
    useCreatePersonaMutation({
      onSuccess: response => {
        router.push(`/workspace/${workspaceID}/persona/${response.createPersona.id}`);
      },
    });

  const personasData: Array<PersonaType> = personas.length
    ? personas
    : (dataGetPersonas?.getPersonas.personas as Array<PersonaType>) || [];

  const personasDataCount: number = personasCount
    ? personasCount
    : dataGetPersonas?.getPersonas.count || 0;

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (
        dataGetPersonas?.getPersonas &&
        personasData.length < personasDataCount &&
        newPage % 2 === 0
      ) {
        setOffset(prev => prev + 1);
      }
      if (
        personasData.length >= newPage * BOARDS_LIMIT ||
        personasData.length + BOARDS_LIMIT > personasDataCount
      ) {
        setCurrentPage(newPage);
      } else {
        setIsLoading(true);
      }
    },
    [dataGetPersonas?.getPersonas, personasData.length, personasDataCount],
  );

  const onToggleDeletePersonaModal = useCallback((persona?: PersonaType) => {
    setSelectedPersona(persona || null);
    setIsOpenPersonaDeleteModal(prev => !prev);
  }, []);

  const onHandleFilterPersona = (id: number) => {
    setPersonas(prev => prev.filter(persona => persona.id !== id));
    setPersonasCount(prev => prev - 1);
    if (
      currentPage !== 1 &&
      currentPage === Math.ceil(personasCount / PERSONAS_LIMIT) &&
      personasData.slice((currentPage - 1) * PERSONAS_LIMIT, currentPage * PERSONAS_LIMIT)
        .length === 1
    ) {
      setCurrentPage(prev => prev - 1);
    }
    if ((personas.length - 1) % PERSONAS_LIMIT === 0) {
      setOffset(prev => prev + 1);
    }
  };

  const onHandleCreatePersona = () => {
    mutateCreatePersona({
      createPersonaInput: {
        workspaceId: +workspaceID!,
      },
    });
  };

  useEffect(() => {
    setBreadcrumb([
      {
        name: 'Workspaces',
        pathname: '/workspaces',
      },
      {
        name: workspace.name || 'Workspaces',
        pathname: `/workspace/${workspace.id}/boards`,
      },
    ]);
  }, [setBreadcrumb, workspace.id, workspace.name]);

  if (errorGetPersonas) {
    return <CustomError error={errorGetPersonas?.message} />;
  }

  if (isLoadingGetPersonas && !personasData.length) {
    return <CustomLoader />;
  }
  return (
    <div className={'personas-container'}>
      {isOpenPersonaDeleteModal && (
        <PersonaDeleteModal
          isOpen={isOpenPersonaDeleteModal}
          personaId={selectedPersona?.id!}
          handleClose={onToggleDeletePersonaModal}
          onHandleFilterPersona={onHandleFilterPersona}
        />
      )}

      <div className={'personas-container--header'}>
        <div className={'base-page-header'}>
          <h3 className={'base-title'}>Personas</h3>
        </div>
        <div className={'personas-container--create-section'}>
          <CustomButton
            startIcon={true}
            onClick={onHandleCreatePersona}
            disabled={isLoadingCreatePersona}
            isLoading={isLoadingCreatePersona}
            data-testid={'create-persona-btn-test-id'}>
            New persona
          </CustomButton>
        </div>
      </div>

      <ul className={'personas-container--body'}>
        {personasData.length ? (
          <>
            {personasData
              .slice((currentPage - 1) * PERSONAS_LIMIT, currentPage * PERSONAS_LIMIT)
              ?.map(persona => (
                <ErrorBoundary key={persona.id}>
                  <PersonaCard
                    key={persona.id}
                    persona={persona}
                    onToggleDeletePersonaModal={onToggleDeletePersonaModal}
                  />
                </ErrorBoundary>
              ))}
          </>
        ) : (
          <EmptyDataInfo icon={<Box />} message={'There are no personas yet'} />
        )}
      </ul>
      {personasDataCount > PERSONAS_LIMIT && (
        <Pagination
          perPage={PERSONAS_LIMIT}
          currentPage={currentPage}
          allCount={personasDataCount}
          changePage={onHandleChangePage}
        />
      )}
    </div>
  );
};

export default PersonasContainer;
