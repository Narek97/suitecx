import React, { FC } from 'react';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import {
  GetUserLastPerformanceLogQuery,
  useGetUserLastPerformanceLogQuery,
} from '@/gql/queries/generated/getUserLastPerformanceLog.generated';

import './style.scss';

interface ILastLogQueryModal {
  isOpen: boolean;
  handleClose: () => void;
}
const LastLogQueryModal: FC<ILastLogQueryModal> = ({ handleClose, isOpen }) => {
  const { data: dataQuery, isLoading: isLoadingQuery } = useGetUserLastPerformanceLogQuery<
    GetUserLastPerformanceLogQuery,
    Error
  >();

  const query = dataQuery?.getUserLastPerformanceLog;
  const getResponsePayloadSizeColor = (payloadSize: number) => {
    if (payloadSize <= 1) {
      return '#51ff51';
    } else if (payloadSize <= 10) {
      return '#ffff73';
    } else {
      return '#ff9f9f';
    }
  };

  const getResponseTimeColor = (time: number) => {
    if (time < 300) {
      return '#51ff51';
    } else if (time < 3000) {
      return '#ffff73';
    } else {
      return '#ff9f9f';
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}
      modalSize={'md'}>
      <ModalHeader title={'User last Query'} />

      <div className={'last-user-query-modal'} data-testid="last-user-query-modal-test-id">
        {isLoadingQuery ? (
          <CustomLoader />
        ) : (
          <>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Path: </p>
              <p className={'last-user-query-modal--key'}>{query?.path}</p>
            </div>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Payload Time: </p>
              <p
                data-testid={'last-user-query-modal--key-test-id'}
                className={'last-user-query-modal--key last-user-query-modal--time-key'}
                style={{
                  background: getResponseTimeColor(query?.responseTime || 0),
                }}>
                {query?.responseTime}
              </p>
            </div>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Payload Size: </p>
              <p
                className={'last-user-query-modal--key last-user-query-modal--size-key'}
                data-testid="query-payload-size-test-id"
                style={{
                  background: getResponsePayloadSizeColor(query?.payloadSize || 0),
                }}>
                {query?.payloadSize}
              </p>
            </div>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Query Count: </p>
              <p>{query?.queryCount}</p>
            </div>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Query Method: </p>
              <p className={'last-user-query-modal--key'}>{query?.method}</p>
            </div>
            <div className={'last-user-query-modal--query-item'}>
              <p className={'last-user-query-modal--title'}>Query SQL: </p>
              <ul className={'last-user-query-modal--sql-key'}>
                {query?.sqlRowQueries?.map((el, index) => (
                  <li key={index}>
                    <span>{index + 1}: </span>
                    <span>{el}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  );
};

export default LastLogQueryModal;
