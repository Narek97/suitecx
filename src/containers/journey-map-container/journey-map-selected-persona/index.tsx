import React, { FC, memo, useCallback, useState } from 'react';

import './style.scss';

import { useParams } from 'next/navigation';
import { useRecoilState, useRecoilValue } from 'recoil';

import PersonaImageBox from '@/components/templates/persona-image-box';
import PinPersonaInfoSectionModal from '@/containers/journey-map-container/journey-map-selected-persona/pin-persona-info-section-modal';
import {
  GetPinnedPersonaItemsQuery,
  useGetPinnedPersonaItemsQuery,
} from '@/gql/queries/generated/getPinnedPersonaItems.generated';
import CloseIcon from '@/public/base-icons/close.svg';
import CollapseIcon from '@/public/base-icons/right-secondary-arrow.svg';
import PersonaSettingsIcon from '@/public/journey-map/settings.svg';
import {
  isOpenSelectedJourneyMapPersonaInfoState,
  selectedJourneyMapPersona,
} from '@/store/atoms/journeyMap.atom';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';

const JourneyMapSelectedPersona = memo(() => {
  const { mapID } = useParams();

  const [isOpenSelectedJourneyMapPersonaInfo, setIsOpenSelectedJourneyMapPersonaInfo] =
    useRecoilState(isOpenSelectedJourneyMapPersonaInfoState);
  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);

  const [isCollapseDemographics, setIsCollapseDemographics] = useState<boolean>(false);
  const [isOpenPersonaDetailsModal, setIsOpenPersonaDetailsModal] = useState<boolean>(false);
  const [pinnedPersonaItems, setPinnedPersonaItems] = useState<
    Array<{ id: number; key: string; value?: string | null | undefined }>
  >([]);
  const [pinnedSections, setPinnedSections] = useState<
    Array<{
      id: number;
      section: {
        id: number;
        key: string;
        color: string;
        content?: string | null;
      };
    }>
  >([]);

  useGetPinnedPersonaItemsQuery<GetPinnedPersonaItemsQuery, Error>(
    {
      pinnedPersonaItemsInput: {
        id: selectedPerson?.id!,
        mapId: +mapID!,
      },
    },
    {
      enabled: !!selectedPerson,
      onSuccess: response => {
        setPinnedSections(response.getPinnedPersonaItems.pinnedSections || []);
        setPinnedPersonaItems(response.getPinnedPersonaItems.demographicInfos || []);
      },
    },
  );

  const onHandleAddPersonaInfoItem = useCallback(
    (newItem: { id: number; key: string; value?: string | null | undefined }) => {
      setPinnedPersonaItems(prev => [...prev, newItem]);
    },
    [],
  );

  const onHandleRemovePersonaInfoItem = useCallback((id: number) => {
    setPinnedPersonaItems(prev => prev.filter(itm => itm.id !== id));
  }, []);

  const onHandleAddPersonaSectionItem = useCallback(
    (newItem: {
      id: number;
      section: {
        id: number;
        key: string;
        color: string;
        content?: string | null;
      };
    }) => {
      setPinnedSections(prev => [...prev, newItem]);
    },
    [],
  );

  const onHandleRemovePersonaSectionItem = useCallback((id: number) => {
    setPinnedSections(prev => prev.filter(itm => itm.id !== id));
  }, []);

  const togglePersonaDetailsModal = () => {
    setIsOpenPersonaDetailsModal(prev => !prev);
  };

  return (
    <div
      className={`${
        isOpenSelectedJourneyMapPersonaInfo
          ? 'journey-map-selected-persona'
          : 'journey-map-selected-persona-close'
      }`}>
      {isOpenPersonaDetailsModal && (
        <PinPersonaInfoSectionModal
          isOpen={isOpenPersonaDetailsModal}
          handleClose={togglePersonaDetailsModal}
          onHandleAddPersonaInfoItem={onHandleAddPersonaInfoItem}
          onHandleRemovePersonaInfoItem={onHandleRemovePersonaInfoItem}
          onHandleAddPersonaSectionItem={onHandleAddPersonaSectionItem}
          onHandleRemovePersonaSectionItem={onHandleRemovePersonaSectionItem}
        />
      )}
      <div className={'journey-map-selected-persona--info-block'}>
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

        <div className={'journey-map-selected-persona--info-block--name-type'}>
          <p className={'journey-map-selected-persona--info-block--name'}>{selectedPerson?.name}</p>
          <p className={'journey-map-selected-persona--info-block--type'}>
            {selectedPerson?.type?.toLowerCase()}
          </p>
        </div>

        <button
          aria-label={'Close'}
          className={'journey-map-selected-persona--info-block--close'}
          onClick={() => setIsOpenSelectedJourneyMapPersonaInfo(false)}>
          <CloseIcon />
        </button>
        <button
          aria-label={'Settings'}
          className={'journey-map-selected-persona--info-block--settings'}
          onClick={togglePersonaDetailsModal}>
          <PersonaSettingsIcon />
        </button>
      </div>
      <div className={'journey-map-selected-persona--items-block'}>
        <div className={'journey-map-selected-persona--demographic-infos'}>
          <div className={'journey-map-selected-persona--demographic-infos--header'}>
            <p className={'journey-map-selected-persona--demographic-infos--header--title'}>
              Demographics
            </p>
            <button
              aria-label={'Collapse'}
              className={`journey-map-selected-persona--card--collapse-btn ${
                isCollapseDemographics
                  ? 'journey-map-selected-persona--card--collapse-close-btn'
                  : 'journey-map-selected-persona--card--collapse-open-btn'
              }`}
              onClick={() => setIsCollapseDemographics(prev => !prev)}>
              <CollapseIcon />
            </button>
          </div>
          <ul className={'journey-map-selected-persona--demographic-infos--list'}>
            {pinnedPersonaItems.length ? (
              pinnedPersonaItems.map(info => (
                <li
                  className={'journey-map-selected-persona--demographic-infos--list-item'}
                  key={info.id}>
                  <span>{info.key}: </span>
                  <span>{info.value}</span>
                </li>
              ))
            ) : (
              <div>No data</div>
            )}
          </ul>
        </div>
        <ul className={'journey-map-selected-persona--pinned-sections'}>
          {pinnedSections.map(section => (
            <PersonaPinnedSectionCard key={section.id} section={section.section} />
          ))}
        </ul>
      </div>
    </div>
  );
});

export default JourneyMapSelectedPersona;

interface IPersonaPinnedSectionCard {
  section: {
    id: number;
    key: string;
    color: string;
    content?: string | null;
  };
}

const PersonaPinnedSectionCard: FC<IPersonaPinnedSectionCard> = ({ section }) => {
  const [isCollapse, setIsCollapse] = useState<boolean>(false);

  return (
    <>
      <div
        className={'journey-map-selected-persona--pinned-section'}
        style={{
          backgroundColor: section.color,
        }}>
        <div className={'journey-map-selected-persona--pinned-section--header'}>
          <p className={'journey-map-selected-persona--pinned-section--header--title'}>
            {section.key}
          </p>
          <button
            aria-label={'Collapse'}
            className={`journey-map-selected-persona--card--collapse-btn ${
              isCollapse
                ? 'journey-map-selected-persona--card--collapse-close-btn'
                : 'journey-map-selected-persona--card--collapse-open-btn'
            }`}
            onClick={() => setIsCollapse(prev => !prev)}>
            <CollapseIcon />
          </button>
        </div>
        <div
          className={`${
            isCollapse
              ? 'journey-map-selected-persona--close-content'
              : 'journey-map-selected-persona--open-content'
          }`}>
          <p className={'journey-map-selected-persona--pinned-section--content'}>
            {section.content}
          </p>
        </div>
      </div>
    </>
  );
};
