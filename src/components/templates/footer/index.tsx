'use client';
import React, { useCallback, useState } from 'react';

import './style.scss';

import { useIsFetching, useIsMutating } from '@tanstack/react-query';

import LastLogQueryModal from '@/components/templates/footer/last-log-query-modal';
import LoaderIcon from '@/public/base-icons/loader.svg';

const Footer = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const [isOpenLastQueryModal, setIsOpenLastQueryModal] = useState<boolean>(false);

  const onHandleToggleLastQueryModal = useCallback(() => {
    setIsOpenLastQueryModal(prev => !prev);
  }, []);

  return (
    <div className={'footer'}>
      {isOpenLastQueryModal && (
        <LastLogQueryModal
          isOpen={isOpenLastQueryModal}
          handleClose={onHandleToggleLastQueryModal}
        />
      )}
      <p>CX Edition ©2024 QuestionPro </p>
      <div className={'footer--right-block'}>
        {isFetching || isMutating ? (
          <div className={'footer--right-block--loading'}>
            <LoaderIcon width={16} height={16} />
            <span>Working...</span>
          </div>
        ) : null}

        <button
          data-testid="footer-version-btn-test-id"
          className={'footer--version-btn'}
          onClick={onHandleToggleLastQueryModal}>
          #SuiteCX V-2.0
        </button>
      </div>
    </div>
  );
};

export default Footer;
