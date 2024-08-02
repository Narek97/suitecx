import React, { FC, useState } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import deepcopy from 'deepcopy';
import { useParams } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import PersonaImageBox from '@/components/templates/persona-image-box';
import {
  PinDemographicInfoMutation,
  usePinDemographicInfoMutation,
} from '@/gql/mutations/generated/pinDemographicInfo.generated';
import {
  PinPersonaSectionMutation,
  usePinPersonaSectionMutation,
} from '@/gql/mutations/generated/pinPersonaSection.generated';
import {
  GetPersonaDemographicInfosQuery,
  useGetPinPersonaDemographicInfosQuery,
} from '@/gql/queries/generated/getPersonaDemographicInfos.generated';
import {
  GetPersonaSectionsQuery,
  useGetPinPersonaSectionsQuery,
} from '@/gql/queries/generated/getPersonaSections.generated';
import ClosedEyeIcon from '@/public/button-icons/closed_eye.svg';
import EyeIcon from '@/public/button-icons/eye.svg';
import { pinnedPersonaItemsState, selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { getTextColorBasedOnBackground } from '@/utils/helpers/get-complementary-color';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';
import {
  PersonaDemographicInfoType,
  PersonSectionType,
} from '@/utils/ts/types/persona/persona-types';

interface IPinPersonaInfoSectionModal {
  isOpen: boolean;
  handleClose: () => void;
  onHandleAddPersonaInfoItem: (newItem: {
    id: number;
    key: string;
    value?: string | null | undefined;
  }) => void;
  onHandleRemovePersonaInfoItem: (id: number) => void;
  onHandleAddPersonaSectionItem: (newItem: {
    id: number;
    section: {
      id: number;
      key: string;
      color: string;
      content?: string | null;
    };
  }) => void;
  onHandleRemovePersonaSectionItem: (id: number) => void;
}

const Index: FC<IPinPersonaInfoSectionModal> = ({
  isOpen,
  handleClose,
  onHandleAddPersonaInfoItem,
  onHandleRemovePersonaInfoItem,
  onHandleAddPersonaSectionItem,
  onHandleRemovePersonaSectionItem,
}) => {
  const { mapID } = useParams();

  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);
  const setPinnedPersonaItemsState = useSetRecoilState(pinnedPersonaItemsState);

  const [demographicInfos, setDemographicInfos] = useState<Array<PersonaDemographicInfoType>>([]);
  const [personaSections, setPersonaSections] = useState<Array<PersonSectionType>>([]);

  const { isFetching: isFetchingDemographicInfos } = useGetPinPersonaDemographicInfosQuery<
    GetPersonaDemographicInfosQuery,
    Error
  >(
    {
      getPersonaDemographicInfosInput: {
        personaId: +selectedPerson?.id!,
        mapId: +mapID!,
      },
    },
    {
      onSuccess: response => {
        setDemographicInfos(response.getPersonaDemographicInfos);
      },
    },
  );

  const { isFetching: isFetchingPersonaSections } = useGetPinPersonaSectionsQuery<
    GetPersonaSectionsQuery,
    Error
  >(
    {
      getPersonaSectionsInput: {
        personaId: +selectedPerson?.id!,
        mapId: +mapID!,
      },
    },
    {
      onSuccess: response => {
        setPersonaSections(response.getPersonaSections as Array<PersonSectionType>);
      },
    },
  );

  const { mutate: mutatePinDemographicInfo } = usePinDemographicInfoMutation<
    PinDemographicInfoMutation,
    Error
  >();

  const { mutate: mutatePinPersonaSection } = usePinPersonaSectionMutation<
    PinPersonaSectionMutation,
    Error
  >();

  const onHandleInfoSelect = (info: PersonaDemographicInfoType) => {
    mutatePinDemographicInfo({
      pinDemographicInfoInput: {
        id: info.id,
        mapId: +mapID!,
      },
    });
    if (info.isPinned) {
      onHandleRemovePersonaInfoItem(info.id);
      setPinnedPersonaItemsState(prev => ({
        ...prev,
        demographicInfos: prev.demographicInfos.filter(prevInfo => prevInfo.id !== info.id),
      }));
    } else {
      onHandleAddPersonaInfoItem(info);
      setPinnedPersonaItemsState(prev => ({
        ...prev,
        demographicInfos: [info, ...prev.demographicInfos],
      }));
    }

    setDemographicInfos(prev =>
      deepcopy(prev).map(prevInfo => {
        if (prevInfo.id === info.id) {
          prevInfo.isPinned = !prevInfo.isPinned;
        }
        return prevInfo;
      }),
    );
  };

  const onHandleSectionSelect = (section: PersonSectionType) => {
    mutatePinPersonaSection({
      pinSectionInput: {
        id: section.id,
        mapId: +mapID!,
      },
    });

    if (section.isPinned) {
      setPinnedPersonaItemsState(prev => ({
        ...prev,
        pinnedSections: prev.pinnedSections.filter(prevInfo => prevInfo.section.id !== section.id),
      }));
    } else {
      setPinnedPersonaItemsState(prev => ({
        ...prev,
        pinnedSections: [
          {
            ...section,
            isPinned: true,
            section: {
              id: section.id,
              key: section.key,
              color: section.color,
              content: section.content,
            },
          },
          ...prev.pinnedSections,
        ],
      }));
    }

    setPersonaSections(prev =>
      prev.map(prevSection => {
        if (prevSection.id === section.id) {
          if (prevSection.isPinned) {
            onHandleRemovePersonaSectionItem(section.id);
          } else {
            onHandleAddPersonaSectionItem({
              id: section.id,
              section: {
                id: section.id,
                key: section.key,
                color: section.color,
                content: section.content,
              },
            });
          }
          prevSection.isPinned = !prevSection.isPinned;
        }
        return prevSection;
      }),
    );
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}
      modalSize={'custom'}>
      <ModalHeader title={'Show/hide persona details'} />
      <div className={'pin-persona-info-section'}>
        {isFetchingDemographicInfos || isFetchingPersonaSections ? (
          <CustomLoader />
        ) : (
          <div
            className={'pin-persona-info-section--content'}
            data-testid={'pin-persona-info-section-test-id'}>
            <div className={'pin-persona-info-section--info-block'}>
              <div className={'pin-persona-info-section--info-block--img-block'}>
                <PersonaImageBox
                  title={''}
                  size={ImageSizeEnum.MDS}
                  imageItem={{
                    color: selectedPerson?.color || '',
                    attachment: {
                      url: selectedPerson?.attachment?.url || '',
                      key: selectedPerson?.attachment?.key || '',
                    },
                  }}
                />
                <div className={'pin-persona-info-section--info-block--type-journeys-block'}>
                  <Tooltip title={selectedPerson?.name} arrow placement={'bottom'}>
                    <p className={'pin-persona-info-section--persona-name'}>
                      {selectedPerson?.name}
                    </p>
                  </Tooltip>
                  <p className={'pin-persona-info-section--info-block--persona-type'}>
                    {selectedPerson?.type}
                  </p>
                  <p className={'pin-persona-info-section--info-block--persona-journeys'}>
                    {selectedPerson?.journeys} Journey
                    {selectedPerson?.journeys || 0 > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className={'pin-persona-info-section--divider'} />
              <div className={'pin-persona-info-section--info-block--demographic-info-block'}>
                <p
                  className={'pin-persona-info-section--info-block--demographic-info-block--title'}>
                  Demographic
                </p>
                <ul className={'pin-persona-info-section--info-block--demographic-infos'}>
                  {demographicInfos.map((info, index) => (
                    <li
                      key={info.id}
                      className={`pin-persona-info-section--info-block--demographic-info ${
                        info.value
                          ? ''
                          : 'pin-persona-info-section--info-block--demographic-info-disabled'
                      }`}
                      data-testid="pin-persona-info-test-id"
                      onClick={() => info.value && onHandleInfoSelect(info)}>
                      <Tooltip title={info.value} key={info.id} placement="right" arrow>
                        <span>
                          {info.key}: {info.value || 'N/A'}
                        </span>
                      </Tooltip>

                      <span>
                        {info.isPinned ? (
                          <EyeIcon data-testid={`pin-persona-info-${index}-eye-test-id`} />
                        ) : (
                          <ClosedEyeIcon
                            data-testid={`pin-persona-info-${index}-close-eye-test-id`}
                          />
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <ul className={'pin-persona-info-section--section-block'}>
              {personaSections.map((section, index) => (
                <li
                  key={section.id}
                  style={{
                    opacity: section.isPinned ? 1 : 0.5,
                    backgroundColor: section.color,
                    color: getTextColorBasedOnBackground(section.color || '#000000'),
                  }}
                  data-testid="pin-persona-section-test-id"
                  onClick={() => onHandleSectionSelect(section)}
                  className={'pin-persona-info-section--section-block--section'}>
                  <span className={'pin-persona-info-section--section-block--section--pinned-btn'}>
                    {section.isPinned ? (
                      <EyeIcon data-testid={`pin-persona-section-${index}-eye-test-id`} />
                    ) : (
                      <ClosedEyeIcon
                        data-testid={`pin-persona-section-${index}-close-eye-test-id`}
                      />
                    )}
                  </span>

                  <p className={'pin-persona-info-section--section-block--section--title'}>
                    {section.key}
                  </p>
                  <p className={'pin-persona-info-section--section-block--section--content'}>
                    {section.content}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default Index;
