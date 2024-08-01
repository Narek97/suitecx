import React, { FC, memo, useCallback, useMemo } from 'react';

import './style.scss';
import { useParams, useRouter } from 'next/navigation';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import PersonaImageBox from '@/components/templates/persona-image-box';
import JourneyIcon from '@/public/workspace/journey.svg';
import { PERSONA_OPTIONS } from '@/utils/constants/options';
import { ImageSizeEnum, menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

interface IPersonaCard {
  persona: PersonaType;
  onToggleDeletePersonaModal: (persona: PersonaType) => void;
}

const PersonaCard: FC<IPersonaCard> = memo(({ persona, onToggleDeletePersonaModal }) => {
  const router = useRouter();

  const { workspaceID } = useParams();

  const onHandleNavigate = useCallback(() => {
    router.push(`/workspace/${workspaceID}/persona/${persona.id}`);
  }, [persona.id, router, workspaceID]);

  const options = useMemo(() => {
    return PERSONA_OPTIONS({
      onHandleEdit: onHandleNavigate,
      onHandleDelete: onToggleDeletePersonaModal,
    });
  }, [onHandleNavigate, onToggleDeletePersonaModal]);

  return (
    <li
      className={'persona-card'}
      onClick={onHandleNavigate}
      id={persona.id.toString()}
      data-testid={`persona-card-${persona.id}`}>
      <div className={'persona-card--menu'}>
        <CustomLongMenu
          type={menuViewTypeEnum.VERTICAL}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          item={persona}
          options={options}
          sxStyles={{
            display: 'inline-block',
            background: 'transparent',
          }}
        />
      </div>
      <div className={'persona-card--frame-block'}>
        <PersonaImageBox
          title={''}
          imageItem={{
            color: persona?.color || '',
            attachment: {
              url: persona?.attachment?.url || '',
              key: persona?.attachment?.key || '',
            },
          }}
          size={ImageSizeEnum.LG}
        />
      </div>

      <div className={'persona-card--info'}>
        <p className={'persona-card--info--name'}>{persona.name}</p>
        <p className={'persona-card--info--type'}>{persona.type?.toLocaleLowerCase()}</p>
      </div>

      <div className={'persona-card--footer'}>
        <div className={'persona-card--footer--journies'}>
          <JourneyIcon />
          <span>
            {persona.journeys || 0}{' '}
            {persona.journeys && persona.journeys > 1 ? 'Journeys' : 'Journey'}
          </span>
        </div>

        <div className={'persona-card--emotion'}></div>
      </div>
    </li>
  );
});

export default PersonaCard;
