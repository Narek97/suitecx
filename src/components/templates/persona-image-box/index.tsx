import React, { FC } from 'react';
import './style.scss';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';
import { PersonaImageBoxType } from '@/utils/ts/types/persona/persona-types';
import { Tooltip } from '@mui/material';
import Image from 'next/image';
import DefaultImage from '@/public/base-icons/user.svg';

interface IPersonaImageBox {
  title: string;
  imageItem: PersonaImageBoxType;
  size: ImageSizeEnum;
  onPersonaClick?: () => void;
}
const PersonaImageBox: FC<IPersonaImageBox> = ({ title, imageItem, size, onPersonaClick }) => {
  const imageSize = size.toLowerCase();

  const handleClick = () => {
    if (onPersonaClick) {
      onPersonaClick();
    }
  };

  return (
    <div
      data-testid="persona-image-box-test-id"
      style={{ borderColor: imageItem?.color || '#545E6B ' }}
      onClick={handleClick}
      className={`persona-image-box ${imageSize}-img-size`}>
      <Tooltip title={title}>
        {imageItem?.attachment.key ? (
          <Image
            data-testid={'image-box-item-test-id'}
            src={`${process.env.NEXT_PUBLIC_AWS_URL}/${imageItem?.attachment.url}/large${imageItem?.attachment.key}`}
            alt={`img`}
            width={200}
            height={200}
          />
        ) : (
          <div className={'default-image'} data-testid={'default-image-test-id'}>
            <DefaultImage />
          </div>
        )}
      </Tooltip>
    </div>
  );
};
export default PersonaImageBox;
