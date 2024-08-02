import React, { useState } from 'react';

import './style.scss';

import PinPersonaModal from '@/containers/settings-container/outcomes/pin-persona/pin-persona-modal';
import AttachIcon from '@/public/base-icons/attach.svg';

const PinPersona = ({ outcomeGroupId }: { outcomeGroupId: number | null }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <div className={'pin-persona'}>
      <button
        className={'pin-persona-btn'}
        type={'button'}
        onClick={() => {
          setIsOpen(true);
        }}>
        <AttachIcon />
      </button>
      {isOpen && (
        <PinPersonaModal
          handleClose={() => {
            setIsOpen(false);
          }}
          isOpen={isOpen}
          outcomeGroupId={outcomeGroupId}
        />
      )}
    </div>
  );
};

export default PinPersona;
