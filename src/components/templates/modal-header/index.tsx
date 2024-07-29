import React, { FC, ReactNode } from 'react';
import './style.scss';
import QuestionMark from '@/public/base-icons/question-mark.svg';

interface IModalHeader {
  title: string | ReactNode;
  infoLink?: string;
}
const ModalHeader: FC<IModalHeader> = ({ title, infoLink }) => {
  return (
    <div className={'modal-header'}>
      <div className={'modal-header--title'} data-testid="modal-header-title-test-id">
        {title}
      </div>
      {infoLink && (
        <button
          data-testid="question-mark-test-id"
          className={'modal-header--question-mark'}
          onClick={() => {
            window.open(infoLink, '', 'width=600,height=400');
          }}>
          <QuestionMark />
        </button>
      )}
    </div>
  );
};

export default ModalHeader;
