import React, { FC } from 'react';
import './style.scss';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import {
  GetBoardOutcomesStatQuery,
  useGetBoardOutcomesStatQuery,
} from '@/gql/queries/generated/getBoardOutcomesStat.generated';
import Image from 'next/image';

interface IBoardPinnedOutcomesModal {
  isOpen: boolean;
  boardId: number;
  handleClose: () => void;
}

const BoardPinnedOutcomesModal: FC<IBoardPinnedOutcomesModal> = ({
  boardId,
  isOpen,
  handleClose,
}) => {
  const { isLoading: isLoadingPinnedOutcomes, data: pinnedOutcomes } = useGetBoardOutcomesStatQuery<
    GetBoardOutcomesStatQuery,
    Error
  >(
    {
      boardId,
    },
    {
      enabled: !!boardId,
    },
  );

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={!isLoadingPinnedOutcomes}>
      <ModalHeader title={'Pinned outcomes'} />
      <div className={'outcomes-section'}>
        <div className={'outcomes-section--content'}>
          {isLoadingPinnedOutcomes ? (
            <>
              <CustomLoader />
            </>
          ) : (
            <div className={'outcomes-section--content-outcomes'}>
              <ul>
                {[
                  ...pinnedOutcomes?.getBoardOutcomesStat?.outcomeStats,
                  ...pinnedOutcomes?.getBoardOutcomesStat?.outcomeStats,
                ]?.map(outcomeGroupItem => (
                  <li
                    key={outcomeGroupItem?.id}
                    data-testid="outcome-item-test-id"
                    className={`outcomes-section--content-outcomes-item`}>
                    <Image
                      className={`outcomes-section--content-outcomes-item--icon`}
                      src={outcomeGroupItem?.icon}
                      alt={'outcome_image'}
                      width={16}
                      height={16}
                      style={{
                        width: '16px',
                        height: '16px',
                      }}
                    />
                    <div className={'outcomes-section--content-outcomes-item--name'}>
                      {outcomeGroupItem?.name}
                    </div>
                    <div>{outcomeGroupItem?.count}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default BoardPinnedOutcomesModal;
