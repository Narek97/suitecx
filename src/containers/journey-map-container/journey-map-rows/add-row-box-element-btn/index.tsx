import React, { FC } from 'react';

import './style.scss';

import { useRecoilValue } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import { isElementDraggingState } from '@/store/atoms/isElementDragging.atom';

interface IAddRowBoxElementBtn {
  itemsLength: number;
  label: string;
  boxIndex: number;
  handleClick: () => void;
}

const AddRowBoxElementBtn: FC<IAddRowBoxElementBtn> = ({
  itemsLength,
  label,
  boxIndex,
  handleClick,
}) => {
  const isElementDragging = useRecoilValue(isElementDraggingState);

  return (
    <div
      className={`${
        itemsLength ? 'add-row-box-element-button' : 'add-row-box-element-first-button'
      } ${isElementDragging ? 'journey-map--hidden-button' : ''}`}>
      <CustomButton
        sxStyles={{
          justifyContent: 'center',
        }}
        data-testid={`add-new-box-item-btn-test-id`}
        startIcon={true}
        sx={{ width: '100%' }}
        variant={'outlined'}
        id={(label || 'btn') + '-btn-' + boxIndex}
        onClick={handleClick}
      />
    </div>
  );
};

export default AddRowBoxElementBtn;
