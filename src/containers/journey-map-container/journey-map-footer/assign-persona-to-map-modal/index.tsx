import { FC, UIEvent, useCallback, useRef, useState } from 'react';

import './style.scss';

import { Box, Tooltip } from '@mui/material';
import deepcopy from 'deepcopy';
import { useParams, useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ModalHeader from '@/components/templates/modal-header';
import PersonaImageBox from '@/components/templates/persona-image-box';
import {
  GetPersonasInfiniteQuery,
  useInfiniteGetPersonasInfiniteQuery,
} from '@/gql/infinite-queries/generated/getPersonas.generated';
import {
  ConnectPersonasToMapMutation,
  useConnectPersonasToMapMutation,
} from '@/gql/mutations/generated/assignPersonaToJourneyMap.generated';
import {
  CreatePersonaMutation,
  useCreatePersonaMutation,
} from '@/gql/mutations/generated/createPersona.generated';
import JourneyIcon from '@/public/workspace/journey.svg';
import { mapAssignedPersonasState, selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { PERSONAS_LIMIT } from '@/utils/constants/pagination';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

interface IAssignPersonaToMapModal {
  isOpen: boolean;
  workspaceId: number;
  handleClose: () => void;
}

const AssignPersonaToMapModal: FC<IAssignPersonaToMapModal> = ({
  isOpen,
  handleClose,
  workspaceId,
}) => {
  const router = useRouter();
  const { mapID } = useParams();

  const [selectedPerson, setSelectedPerson] = useRecoilState(selectedJourneyMapPersona);
  const [mapAssignedPersonas, setMapAssignedPersonas] = useRecoilState(mapAssignedPersonasState);

  const [originalList, setOriginalList] = useState<PersonaType[]>([]);
  const [personas, setPersonas] = useState<PersonaType[]>([]);
  const [personaIdList, setPersonaIdList] = useState<number[]>([]);
  const [personaIdUnselectedList, setPersonaIdUnselectedList] = useState<number[]>([]);

  const childRef = useRef<HTMLUListElement>(null);

  const { mutate: mutateCreatePersona, isLoading: isLoadingCreatePersona } =
    useCreatePersonaMutation<CreatePersonaMutation, Error>();

  const {
    data: organizationPersonasData,
    isLoading: organizationPersonasIsLoading,
    isFetching: organizationPersonasIsFetchingNextPage,
    fetchNextPage: organizationPersonasFetchNextPage,
  } = useInfiniteGetPersonasInfiniteQuery<GetPersonasInfiniteQuery, Error>(
    {
      getPersonasInput: {
        workspaceId,
        mapId: +mapID!,
        limit: PERSONAS_LIMIT,
        offset: 0,
      },
    },
    {
      enabled: !!workspaceId,
      onSuccess: responseData => {
        const newPersonas: PersonaType[] = [];
        responseData.pages.forEach(personaData => {
          newPersonas.push(...((personaData?.getPersonas?.personas as PersonaType[]) || []));
        });
        setPersonas(newPersonas);
        setOriginalList(deepcopy(newPersonas));
      },
      keepPreviousData: true,
      cacheTime: 0,
    },
  );
  const {
    mutate: connectOrDisconnectPersonas,
    isLoading: connectPersonasIsLoading,
    error: connectPersonasError,
  } = useConnectPersonasToMapMutation<ConnectPersonasToMapMutation>();

  const handleSelectPersona = (id: number, isSelected: boolean) => {
    const personaIdListCopy = [...personaIdList];
    const personaIdListUnselectedCopy = [...personaIdUnselectedList];
    let personasNewList = [...personas];
    personasNewList.forEach(itm => {
      if (itm?.id === id) {
        if (!isSelected) {
          setPersonaIdList(personaIdListCopy.filter(item => item !== id));
          setPersonaIdUnselectedList(personaIdListUnselectedCopy.filter(item => item !== id));
          const isNewSelected = personaIdListCopy.find(idNumber => idNumber === id);
          if (!isNewSelected) {
            setPersonaIdUnselectedList(prev => [...prev, id]);
          }
        } else {
          setPersonaIdUnselectedList(personaIdListUnselectedCopy.filter(item => item !== id));
          const existsInOriginalList = originalList.find(itmPersona => {
            return itmPersona?.id === id && itmPersona?.isSelected;
          });
          if (existsInOriginalList) {
            setPersonaIdList(prev => prev.filter(itmData => itmData !== id));
          } else {
            setPersonaIdList([...personaIdListCopy, id]);
          }
        }

        itm.isSelected = isSelected;
      }
    });
    setPersonas(personasNewList);
  };

  const onHandleFetch = (e: UIEvent<HTMLElement>, childOffsetHeight: number) => {
    const target = e.currentTarget as HTMLDivElement | null;
    if (
      e.target &&
      childOffsetHeight &&
      target &&
      target.offsetHeight + target.scrollTop + 100 >= childOffsetHeight &&
      !organizationPersonasIsFetchingNextPage &&
      !organizationPersonasIsLoading &&
      personas.length < organizationPersonasData?.pages[0].getPersonas.count!
    ) {
      organizationPersonasFetchNextPage({
        pageParam: {
          getPersonasInput: {
            workspaceId,
            mapId: +mapID!,
            limit: PERSONAS_LIMIT,
            offset: personas.length,
          },
        },
      }).then();
    }
  };

  const updateMapSelectedPersonas = useCallback(
    ({
      disconnectPersonaIds,
      newPersonaList,
    }: {
      disconnectPersonaIds: number[];
      newPersonaList: PersonaType[];
    }) => {
      let newMapAssignedPersonas = [...mapAssignedPersonas];
      newMapAssignedPersonas = newMapAssignedPersonas.filter(
        item => !disconnectPersonaIds.includes(item.id),
      );
      setMapAssignedPersonas([...newMapAssignedPersonas, ...newPersonaList]);
      if (selectedPerson) {
        //checking is single selected persona of journey map
        const isDisconnected = disconnectPersonaIds.includes(selectedPerson.id);
        if (isDisconnected) {
          setSelectedPerson(null);
        }
      }
    },
    [mapAssignedPersonas, selectedPerson, setMapAssignedPersonas, setSelectedPerson],
  );

  const handleConnectPersonas = () => {
    connectOrDisconnectPersonas(
      {
        connectPersonasToMapInput: {
          mapId: +mapID!,
          connectPersonaIds: personaIdList,
          disconnectPersonaIds: personaIdUnselectedList,
        },
      },
      {
        onSuccess: async () => {
          let personasList = deepcopy(personas);
          let filteredArray: PersonaType[] = [];
          if (personaIdList.length) {
            filteredArray = personasList.filter(persona => {
              persona.isDisabledForThisRow = false;
              persona.personaStates = [];
              return personaIdList.includes(persona.id);
            });
          }
          updateMapSelectedPersonas({
            disconnectPersonaIds: personaIdUnselectedList,
            newPersonaList: filteredArray,
          });
          handleClose();
        },
      },
    );
  };

  const handleOpenPersonas = () => {
    mutateCreatePersona(
      {
        createPersonaInput: {
          workspaceId: workspaceId!,
        },
      },
      {
        onSuccess: response => {
          router.push(`/workspace/${workspaceId}/persona/${response.createPersona.id}`);
        },
      },
    );
  };

  if (connectPersonasError) {
    return <CustomError error={'error'} />;
  }

  return (
    <CustomModal
      isOpen={isOpen}
      modalSize={'md'}
      handleClose={handleClose}
      canCloseWithOutsideClick={!organizationPersonasIsLoading}>
      <ModalHeader
        title={
          <div className={'assign-modal-header'}>
            Add personas <span className={'question-sign'}>?</span>
          </div>
        }
      />
      <div className={'assign-persona-to-map'}>
        <div className={'assign-persona-to-map--content'}>
          {organizationPersonasIsLoading && !personas?.length ? (
            <div className={'assign-persona-to-map-loading-section'}>
              <CustomLoader />
            </div>
          ) : (
            <>
              {personas?.length ? (
                <div
                  className={'assign-persona-to-map--content-personas'}
                  onScroll={e => {
                    onHandleFetch(e, childRef.current?.offsetHeight || 0);
                  }}>
                  <ul ref={childRef}>
                    {personas?.map(itm => (
                      <li
                        key={itm?.id}
                        data-testid="persona-item-test-id"
                        className={`assign-persona-to-map--content-personas-item ${
                          itm.isSelected ? 'selected-persona' : ''
                        }`}
                        onClick={() => handleSelectPersona(itm?.id, !itm.isSelected)}>
                        <div className="assign-persona-to-map--content-personas-item--left">
                          <PersonaImageBox
                            title={''}
                            size={ImageSizeEnum.MD}
                            imageItem={{
                              color: itm?.color || '',
                              attachment: {
                                url: itm?.attachment?.url || '',
                                key: itm?.attachment?.key || '',
                              },
                            }}
                          />
                          <div className={'persona-text-info'}>
                            <div className={'persona-text-info'}>
                              <Tooltip title={itm?.name} arrow placement={'bottom'}>
                                <div className={'persona-text-info--title'}>{itm?.name}</div>
                              </Tooltip>
                              <div className={'persona-text-info--position'}>{itm?.type}</div>
                            </div>
                          </div>
                        </div>
                        <div className="assign-persona-to-map--content-personas-item--right">
                          <JourneyIcon />
                          <span className={'journeys-info--text'}>
                            {itm?.journeys || 0} journeys
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyDataInfo icon={<Box />} message={'There are no assigned personas yet'} />
              )}
              <div className={'custom-modal-footer'}>
                <CustomButton
                  onClick={handleOpenPersonas}
                  variant={'text'}
                  data-testid="create-new-persona-btn-test-id"
                  startIcon={false}
                  isLoading={isLoadingCreatePersona}
                  disabled={isLoadingCreatePersona}
                  style={{
                    textTransform: 'inherit',
                    background: isLoadingCreatePersona ? '#EDF6FD' : 'transparent',
                  }}>
                  Create new persona
                </CustomButton>
                <CustomButton
                  type={'button'}
                  data-testid={'add-row-box-element-btn-test-id'}
                  variant={'contained'}
                  startIcon={false}
                  onClick={handleConnectPersonas}
                  isLoading={connectPersonasIsLoading}
                  disabled={!personas.length}>
                  Add persona
                </CustomButton>
              </div>
            </>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default AssignPersonaToMapModal;
