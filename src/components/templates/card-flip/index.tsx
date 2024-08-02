import React, { FC, MouseEvent, useState } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import ReactCardFlip from 'react-card-flip';

import FlipIcon from '@/public/operations/flip.svg';

interface ICardFlip {
  frontCard: React.ReactNode;
  backCard: React.ReactNode;
  flipDirection?: 'horizontal' | 'vertical';
}
const CardFlip: FC<ICardFlip> = ({ frontCard, backCard, flipDirection = 'horizontal' }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const onHandleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsFlipped(prev => !prev);
  };

  return (
    <ReactCardFlip isFlipped={isFlipped} flipDirection={flipDirection}>
      <>
        {frontCard}
        <Tooltip title={'Flip'}>
          <button
            onClick={onHandleClick}
            className={'react-card-flip--btn react-card-flip--front-btn'}
            aria-label={'flip'}>
            <FlipIcon />
          </button>
        </Tooltip>
      </>

      <>
        {backCard}
        <Tooltip title={'Flip'}>
          <button
            onClick={onHandleClick}
            className={'react-card-flip--btn react-card-flip--back-btn'}
            aria-label={'flip'}>
            <FlipIcon />
          </button>
        </Tooltip>
      </>
    </ReactCardFlip>
  );
};

export default CardFlip;
