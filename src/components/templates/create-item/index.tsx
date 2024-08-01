import React, { FC, KeyboardEvent, useRef, useState } from 'react';

import './style.scss';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CloseIcon from '@/public/base-icons/close.svg';
import { ObjectKeysType } from '@/utils/ts/types/global-types';

interface ICreateItem {
  createButtonText: string;
  value: string;
  isOpenCreateUpdateItem: boolean;
  isLoading: boolean;
  inputPlaceholder: string;
  isDisabledButton: boolean;
  isDisabledInput: boolean;
  selectedItem: ObjectKeysType | null;
  onHandleCreateFunction: () => void;
  onChange: (value: string) => void;
  onHandleUpdateFunction: () => void;
  onToggleCreateUpdateFunction: () => void;
}

const CreateItem: FC<ICreateItem> = ({
  createButtonText,
  onHandleCreateFunction,
  onChange,
  value,
  onHandleUpdateFunction,
  isOpenCreateUpdateItem,
  selectedItem,
  isDisabledButton,
  isDisabledInput,
  isLoading,
  onToggleCreateUpdateFunction,
  inputPlaceholder,
}) => {
  useState<boolean>(false);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (selectedItem) {
        onHandleUpdateFunction();
      } else {
        onHandleCreateFunction();
      }
    }
  };

  return (
    <div className={'create-edit-block'}>
      <div
        className={`create-edit-block--content ${
          isOpenCreateUpdateItem ? 'create-edit-block--open-content' : ''
        }`}>
        <CustomInput
          onKeyDown={handleInputKeyDown}
          inputRef={nameInputRef}
          value={value}
          onChange={e => onChange(e?.target?.value)}
          disabled={isDisabledInput}
          placeholder={inputPlaceholder}
          name={'board-name'}
        />
        <CustomButton
          startIcon={false}
          isLoading={isLoading}
          disabled={isDisabledButton}
          className={isDisabledButton ? 'disabled-btn' : ''}
          name={'save'}
          aria-label={'save'}
          data-testid={'save-item-test-id'}
          onClick={selectedItem ? onHandleUpdateFunction : onHandleCreateFunction}>
          Save
        </CustomButton>
        <button onClick={() => onToggleCreateUpdateFunction()} aria-label={'close'}>
          <CloseIcon />
        </button>
      </div>
      {!isOpenCreateUpdateItem ? (
        <CustomButton
          onClick={() => onToggleCreateUpdateFunction()}
          data-testid={'create-item-test-id'}
          id={'create-item-id'}
          aria-label={'create'}>
          {createButtonText}
        </CustomButton>
      ) : null}
    </div>
  );
};
export default CreateItem;
