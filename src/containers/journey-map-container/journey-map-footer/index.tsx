import './style.scss';
import React, { FC, memo, useCallback, useState } from 'react';

import { Tooltip } from '@mui/material';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import PersonaImageBox from '@/components/templates/persona-image-box';
import AssignPersonaToMapModal from '@/containers/journey-map-container/journey-map-footer/assign-persona-to-map-modal';
import OverviewIcon from '@/public/base-icons/overview.svg';
import PersonaIcon from '@/public/journey-map/persona.svg';
import {
  isOpenSelectedJourneyMapPersonaInfoState,
  mapAssignedPersonasState,
  selectedJourneyMapPersona,
} from '@/store/atoms/journeyMap.atom';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

interface IJourneyMapFooter {
  workspaceId: number;
  isGuest: boolean;
}

const JourneyMapFooter: FC<IJourneyMapFooter> = memo(({ workspaceId, isGuest }) => {
  const [selectedPerson, setSelectedPerson] = useRecoilState(selectedJourneyMapPersona);
  const setIsOpenSelectedJourneyMapPersonaInfo = useSetRecoilState(
    isOpenSelectedJourneyMapPersonaInfoState,
  );
  const mapAssignedPersonas = useRecoilValue(mapAssignedPersonasState);

  const [isOpenSelectedPersonasModal, setIsOpenSelectedPersonasModal] = useState<boolean>(false);

  const onHandleSelectJourneyMapFooterItem = (item: PersonaType | null) => {
    setSelectedPerson(item);
  };

  const handleToggleAssignPersonaModal = useCallback(
    () => setIsOpenSelectedPersonasModal((prevState: boolean) => !prevState),
    [],
  );

  return (
    <div className={'journey-map-footer'}>
      <button
        data-testid="overview-btn-test-id"
        className={`journey-map-footer--overview ${
          selectedPerson ? '' : 'journey-map-footer--selected-item'
        }`}
        onClick={() => {
          setIsOpenSelectedJourneyMapPersonaInfo(false);
          onHandleSelectJourneyMapFooterItem(null);
        }}>
        <Tooltip placement="top" title={'Overview'} arrow>
          <>
            <OverviewIcon />
          </>
        </Tooltip>
      </button>
      {mapAssignedPersonas?.map(item => (
        <button
          onClick={() => onHandleSelectJourneyMapFooterItem(item)}
          className={`journey-map-footer--persona  ${
            selectedPerson?.id === item?.id ? 'journey-map-footer--selected-item' : ''
          }`}
          key={item?.id}>
          <PersonaImageBox
            title={item.name}
            imageItem={{
              color: '#B052A7',
              isSelected: true,
              attachment: {
                url: item?.attachment?.url || '',
                key: item?.attachment?.key || '',
              },
            }}
            size={ImageSizeEnum.XSM}
          />
        </button>
      ))}
      {!isGuest && (
        <>
          <button
            disabled={false}
            onClick={handleToggleAssignPersonaModal}
            className={'journey-map-footer--add-new-persona-btn'}>
            <PersonaIcon />
          </button>
          {isOpenSelectedPersonasModal && (
            <AssignPersonaToMapModal
              workspaceId={workspaceId}
              isOpen={isOpenSelectedPersonasModal}
              handleClose={handleToggleAssignPersonaModal}
            />
          )}
        </>
      )}
    </div>
  );
});

export default JourneyMapFooter;
