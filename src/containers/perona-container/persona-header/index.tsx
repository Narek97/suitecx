import React, { FC } from 'react';
import './style.scss';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import { PersonaInfoType, PersonSectionType } from '@/utils/ts/types/persona/persona-types';
import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/public/base-icons/arrow-left.svg';
import PlusIcon from '@/public/operations/plus.svg';
import JourneyIcon from '@/public/workspace/journey.svg';
import { useSetRecoilState } from 'recoil';

interface IPersonaHeader {
  personaInfo: PersonaInfoType;
  journeysCount: number;
  isLoadingPersonaSection: boolean;
  onHandleUpdateInfo: (key: string, value: string) => void;
  onHandleAddSection: (layout: PersonSectionType | null) => void;
}

const PersonaHeader: FC<IPersonaHeader> = ({
  personaInfo,
  journeysCount,
  isLoadingPersonaSection,
  onHandleUpdateInfo,
  onHandleAddSection,
}) => {
  const { workspaceID } = useParams();

  const setBreadcrumb = useSetRecoilState(breadcrumbState);

  const router = useRouter();

  const onHandleGoBack = () => {
    router.push(`/workspace/${workspaceID}/personas`);
  };

  return (
    <div className={'persona-header'}>
      <div className={'persona-header--left-block'}>
        <button
          aria-label={'Back'}
          className={'persona-header--go-back-btn'}
          onClick={onHandleGoBack}>
          <BackIcon stroke={'#1B87E6'} />
        </button>
        <CustomInput
          data-testid={'persona-name-test-id'}
          type="text"
          autoFocus={true}
          placeholder={'name...'}
          value={personaInfo.name}
          onChange={e => {
            onHandleUpdateInfo('name', e.target.value);
            setBreadcrumb(prev => [...prev.slice(0, prev.length - 1), { name: e.target.value }]);
          }}
          onKeyDown={event => {
            if (event.keyCode === 13) {
              event.preventDefault();
              (event.target as HTMLElement).blur();
            }
          }}
        />
      </div>
      <div className={'persona-header--right-block'}>
        <JourneyIcon fill={'#1B87E6'} />
        <span>{journeysCount > 1 ? 'Journeys' : 'Journey'}</span>
        <button
          data-testid={'add-section-test-id'}
          aria-label={'add section'}
          className={'persona-header--add-section-btn'}
          onClick={() => onHandleAddSection(null)}
          disabled={isLoadingPersonaSection}>
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

export default PersonaHeader;
