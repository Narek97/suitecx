'use client';
import PersonaLeftMenu from '@/containers/perona-container/persona-left-menu';
import PersonaRightSections from '@/containers/perona-container/persona-right-sections';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import './style.scss';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import {
  CreateDemographicInfoMutation,
  useCreateDemographicInfoMutation,
} from '@/gql/mutations/generated/createDemographicInfo.generated';
import {
  CreatePersonaSectionMutation,
  useCreatePersonaSectionMutation,
} from '@/gql/mutations/generated/createPersonaSection.generated';
import {
  DeleteDemographicInfoMutation,
  useDeleteDemographicInfoMutation,
} from '@/gql/mutations/generated/deleteDemographicInfo.generated';
import {
  UpdateDemographicInfoMutation,
  useUpdateDemographicInfoMutation,
} from '@/gql/mutations/generated/updateDemographicInfo.generated';
import {
  UpdatePersonaMutation,
  useUpdatePersonaMutation,
} from '@/gql/mutations/generated/updatePersona.generated';
import {
  GetPersonaByIdQuery,
  useGetPersonaByIdQuery,
} from '@/gql/queries/generated/getPersonaById.generated';
import {
  GetPersonaDemographicInfosQuery,
  useGetPersonaDemographicInfosQuery,
} from '@/gql/queries/generated/getPersonaDemographicInfos.generated';
import {
  GetPersonaSectionsQuery,
  useGetPersonaSectionsQuery,
} from '@/gql/queries/generated/getPersonaSections.generated';
import { DemographicInfoTypeEnum } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { PersonaTypeEnum } from '@/utils/ts/enums/global-enums';
import {
  PersonaDemographicInfoType,
  PersonaInfoType,
  PersonSectionType,
} from '@/utils/ts/types/persona/persona-types';
import { useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import PersonaHeader from '@/containers/perona-container/persona-header';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

const PersonaContainer = () => {
  const { personaID } = useParams();
  const queryClient = useQueryClient();
  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  const [demographicInfos, setDemographicInfos] = useState<Array<PersonaDemographicInfoType>>([]);

  const [personaInfoState, setPersonaInfoState] = useState<PersonaInfoType | null>(null);

  const rightSectionRef = useRef<HTMLDivElement | null>(null);
  const demographicInfoRef = useRef<HTMLDivElement | null>(null);

  const { mutate: mutateDemographicInfo } = useUpdateDemographicInfoMutation<
    UpdateDemographicInfoMutation,
    Error
  >();

  const { mutate: mutateCreateDemographicInfo, isLoading: isLoadingCreateDemographicInfo } =
    useCreateDemographicInfoMutation<CreateDemographicInfoMutation, Error>({
      onSuccess: response => {
        setDemographicInfos(prev => [
          ...prev,
          response.createDemographicInfo as PersonaDemographicInfoType,
        ]);

        const objDiv = demographicInfoRef.current;
        objDiv?.scrollTo({
          top: objDiv.scrollHeight + 128,
          behavior: 'smooth',
        });
      },
    });

  const { mutate: mutateDeleteDemographicInfo, isLoading: isLoadingDeleteDemographicInfo } =
    useDeleteDemographicInfoMutation<DeleteDemographicInfoMutation, Error>({
      onSuccess: response => {
        setDemographicInfos(prev => prev.filter(el => el.id !== response.deleteDemographicInfo));
      },
    });

  const {
    isFetching: isFetchingPersona,
    data: dataPersonaInfo,
    error: isErrorPersonaInfo,
  } = useGetPersonaByIdQuery<GetPersonaByIdQuery, Error>(
    {
      getPersonaByIdInput: {
        personaId: +personaID!,
      },
    },
    {
      onSuccess: response => {
        const data = response.getPersonaById;
        setPersonaInfoState({
          id: data.id,
          name: data.name,
          color: data.color || '#B052A7',
          type: data.type || PersonaTypeEnum.Customer,
          attachment: data.attachment,
        });
      },
    },
  );

  const { isFetching: isFetchingDemographicInfos, error: isErrorDemographicInfos } =
    useGetPersonaDemographicInfosQuery<GetPersonaDemographicInfosQuery, Error>(
      {
        getPersonaDemographicInfosInput: {
          personaId: +personaID!,
        },
      },
      {
        onSuccess: response => {
          setDemographicInfos(response.getPersonaDemographicInfos);
        },
      },
    );

  const { mutate: mutatePersona } = useUpdatePersonaMutation<UpdatePersonaMutation, Error>();

  const { data: dataPersonaSections, isLoading: isLoadingPersonaSections } =
    useGetPersonaSectionsQuery<GetPersonaSectionsQuery, Error>({
      getPersonaSectionsInput: {
        personaId: +personaID!,
      },
    });

  const { mutate: mutatePersonaSection, isLoading: isLoadingPersonaSection } =
    useCreatePersonaSectionMutation<CreatePersonaSectionMutation, Error>({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ['GetPersonaSections'],
        });
        const objDiv = rightSectionRef.current;
        objDiv?.scrollTo({
          top: objDiv.scrollHeight + 128,
          behavior: 'smooth',
        });
      },
    });

  const onHandleUpdateInfo = useCallback(
    (key: string, value: string) => {
      personaInfoState && setPersonaInfoState(() => ({ ...personaInfoState, [key]: value }));
      debounced400(() => {
        mutatePersona({
          updatePersonaInput: {
            personaId: +personaID!,
            [key]: value,
          },
        });
      });
    },
    [mutatePersona, personaID, personaInfoState],
  );

  const onHandleChangeDemographicInfo = useCallback(
    (demographicInfoId: number, value: string, key: 'key' | 'value') => {
      setDemographicInfos(prev =>
        prev.map(item => {
          if (item.id === demographicInfoId) {
            item[key] = value;
            debounced400(() => {
              mutateDemographicInfo({
                updateDemographicInfoInput: {
                  id: item.id,
                  value: key === 'value' ? value : item.value,
                  key: key === 'key' ? value : item.key,
                },
              });
            });
          }
          return item;
        }),
      );
    },
    [mutateDemographicInfo],
  );

  const onHandleAddNewDemographicInfo = useCallback(
    (name: string, type: DemographicInfoTypeEnum, value: string) => {
      mutateCreateDemographicInfo({
        createDemographicInfoInput: {
          personaId: +personaID!,
          key: name || 'untitled',
          value,
          type,
        },
      });
    },
    [mutateCreateDemographicInfo, personaID],
  );

  const onHandleDeleteDemographicInfo = useCallback(
    (id: number) => {
      mutateDeleteDemographicInfo({
        id,
      });
    },
    [mutateDeleteDemographicInfo],
  );

  const onHandleAddSection = (layout: PersonSectionType | null) => {
    const newItem = {
      x: layout?.x || 0,
      y: dataPersonaSections?.getPersonaSections.length,
      w: layout?.w || 2,
      h: layout?.h || 1,
      i: uuidv4(),
      color: layout?.color || '#ffffff',
      content: layout?.content || '',
    };
    mutatePersonaSection({
      createPersonaSectionInput: {
        personaId: +personaID!,
        key: layout?.key || `New card ${dataPersonaSections?.getPersonaSections.length}`,
        ...newItem,
      },
    });
  };

  const personaInfo: PersonaInfoType =
    personaInfoState || (dataPersonaInfo?.getPersonaById as PersonaInfoType);

  useEffect(() => {
    if (dataPersonaInfo?.getPersonaById) {
      setBreadcrumb(prev => [
        ...prev,
        {
          name: dataPersonaInfo.getPersonaById.name || 'Persona',
        },
      ]);
    }
  }, [dataPersonaInfo?.getPersonaById, setBreadcrumb]);

  if (isFetchingPersona || isFetchingDemographicInfos) {
    return <CustomLoader />;
  }

  if (isErrorPersonaInfo || isErrorDemographicInfos) {
    return <CustomError error={isErrorPersonaInfo?.message || isErrorDemographicInfos?.message} />;
  }

  return (
    <div className={'persona-container'}>
      <PersonaHeader
        personaInfo={personaInfo}
        journeysCount={dataPersonaInfo?.getPersonaById.journeys || 0}
        isLoadingPersonaSection={isLoadingPersonaSection}
        onHandleUpdateInfo={onHandleUpdateInfo}
        onHandleAddSection={onHandleAddSection}
      />
      <div className={'persona-container--body'}>
        <div className={'persona-container--left-menu'}>
          <PersonaLeftMenu
            personaInfo={personaInfo}
            demographicInfos={demographicInfos}
            onHandleUpdateInfo={onHandleUpdateInfo}
            onHandleChangeDemographicInfo={onHandleChangeDemographicInfo}
            onHandleAddNewDemographicInfo={onHandleAddNewDemographicInfo}
            onHandleDeleteDemographicInfo={onHandleDeleteDemographicInfo}
            isLoadingCreateDemographicInfo={isLoadingCreateDemographicInfo}
            isLoadingDeleteDemographicInfo={isLoadingDeleteDemographicInfo}
            demographicInfoRef={demographicInfoRef}
          />
        </div>
        <div className={'persona-container--right-sections'} ref={rightSectionRef}>
          <PersonaRightSections
            dataPersonaSections={
              (dataPersonaSections?.getPersonaSections as Array<PersonSectionType>) || []
            }
            onHandleAddSection={onHandleAddSection}
            isLoadingPersonaSections={isLoadingPersonaSections}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonaContainer;
