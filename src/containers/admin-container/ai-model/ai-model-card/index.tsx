import React, { FC, useMemo } from 'react';

import './style.scss';
import Image from 'next/image';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import QPLogo from '@/public/base-icons/qp-logo.svg';
import { AI_MODEL_CARD_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { AiModelType } from '@/utils/ts/types/ai-model/ai-model-type';

interface IAiModelCard {
  aiModel: AiModelType;
  onHandleDelete: (aiModel: AiModelType) => void;
  onHandleEdit: (aiModel: AiModelType) => void;
}

const AiModelCard: FC<IAiModelCard> = ({ aiModel, onHandleDelete, onHandleEdit }) => {
  const options = useMemo(() => {
    return AI_MODEL_CARD_OPTIONS({
      onHandleEdit,
      onHandleDelete,
    });
  }, [onHandleDelete, onHandleEdit]);

  return (
    <div className={'ai-model-card'}>
      <div className={'ai-model-card--menu'}>
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
          item={aiModel}
          options={options}
          sxStyles={{
            display: 'inline-block',
            background: 'transparent',
          }}
        />
      </div>

      {aiModel.attachmentUrl ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_AWS_URL}/${aiModel.attachmentUrl}`}
          alt="Img"
          width={500}
          height={500}
          style={{ width: '100%', height: '100px', objectFit: 'contain' }}
        />
      ) : (
        <div className={'ai-model-card--logo-block'}>
          <QPLogo />
        </div>
      )}

      <p className={'ai-model-card--name'} data-testid="ai-model-card-name-test-id">
        {aiModel.name}
      </p>
      <p className={'ai-model-card--prompt'} data-testid="ai-model-card-prompt-test-id">
        {aiModel.prompt}
      </p>
    </div>
  );
};

export default AiModelCard;
