import React, { FC, useCallback, useMemo } from 'react';

import './style.scss';
import { useRouter } from 'next/navigation';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import { INTERVIEW_CARD_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { InterviewType } from '@/utils/ts/types/interview/interview-type';

interface IInterviewCard {
  interview: InterviewType;
  onHandleView: (interview: InterviewType) => void;
  onHandleDelete: (interview: InterviewType) => void;
}

const InterviewCard: FC<IInterviewCard> = ({ interview, onHandleView, onHandleDelete }) => {
  const router = useRouter();

  const onHandleNavigateToMap = useCallback(() => {
    router.push(`/board/${interview.boardId}/journey-map/${interview.mapId}`);
  }, [interview.boardId, interview.mapId, router]);

  const options = useMemo(() => {
    return INTERVIEW_CARD_OPTIONS({
      onHandleNavigateToMap,
      onHandleView,
      onHandleDelete,
    });
  }, [onHandleDelete, onHandleNavigateToMap, onHandleView]);

  return (
    <li className={'interview-card'} data-testid="interview-card-test-id">
      <div className={'interview-card--menu'}>
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
          item={interview}
          options={options}
          sxStyles={{
            display: 'inline-block',
            background: 'transparent',
          }}
        />
      </div>

      <p className={'interview-card--name'} data-testid="interview-card-name-test-id">
        {interview.name}
      </p>
      <p className={'interview-card--text'} data-testid="interview-card-text-test-id">
        {interview.text}
      </p>
    </li>
  );
};

export default InterviewCard;
