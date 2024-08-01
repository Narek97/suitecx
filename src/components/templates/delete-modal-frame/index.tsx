import './style.scss';
import { FC } from 'react';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import ModalHeader from '@/components/templates/modal-header';

interface IDeleteModalFrame {
  item: { type: string; name: string };
  handleClose: () => void;
  handleDelete: () => void;
  isLoading: boolean;
  text?: string;
}

const DeleteModalFrame: FC<IDeleteModalFrame> = ({
  item,
  handleClose,
  handleDelete,
  isLoading,
  text,
}) => {
  return (
    <div className={'delete-modal-frame'}>
      <ModalHeader title={`Delete ${item.name}`} />
      <div className={'custom-modal-content'}>
        <div className={'delete-modal-frame--content'}>
          <p className={'delete-modal-frame--title'}>
            {text || `Are you sure you want to delete selected  ${item.type} ?`}
          </p>
        </div>
        <div className={'base-modal-footer'}>
          <CustomButton
            data-testid="delete-modal-frame-test-id"
            onClick={handleClose}
            variant={'text'}
            startIcon={false}
            disabled={isLoading}
            id={'cancel-delete-btn'}>
            Cancel
          </CustomButton>
          <CustomButton
            data-testid={'delete-modal-delete-btn-test-id'}
            onClick={handleDelete}
            variant={'contained'}
            startIcon={false}
            isLoading={isLoading}
            disabled={isLoading}
            id={'confirm-delete-btn'}>
            Delete
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default DeleteModalFrame;
