import { FC } from 'react';
import './style.scss';

import Image from 'next/image';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';

interface IImageViewModal {
  url: string;
  isOpen: boolean;
  handleClose: () => void;
}

const ImageViewModal: FC<IImageViewModal> = ({ isOpen, url, handleClose }) => {
  return (
    <CustomModal
      modalSize={'md'}
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}>
      <div className={'image-view'}>
        <Image
          src={`${process.env.NEXT_PUBLIC_AWS_URL}/${url}`}
          alt="view_image"
          width={400}
          height={400}
        />
      </div>
    </CustomModal>
  );
};

export default ImageViewModal;
