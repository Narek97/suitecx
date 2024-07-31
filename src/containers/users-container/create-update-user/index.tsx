import React, { FC, useCallback, useEffect } from 'react';
import './style.scss';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import { CreatUpdateFormGeneralType } from '@/utils/ts/types/global-types';
import { yupResolver } from '@hookform/resolvers/yup';
import CloseIcon from '@/public/base-icons/close.svg';

interface ICreateUpdateUser {
  createButtonText: string;
  formData: any;
  defaultValues: CreatUpdateFormGeneralType;
  isOpenCreateUpdateItem: boolean;
  isLoading: boolean;
  inputPlaceholder: string;
  isDisabledButton: boolean;
  isDisabledInput: boolean;
  onHandleCreateFunction: (data: CreatUpdateFormGeneralType, reset: () => void) => void;
  onHandleUpdateFunction: (data: CreatUpdateFormGeneralType, reset: () => void) => void;
  onToggleCreateUpdateFunction: () => void;
  formElements: any[];
  validationSchema: any;
}

const CreateUpdateUser: FC<ICreateUpdateUser> = ({
  createButtonText,
  onHandleCreateFunction,
  formData,
  onHandleUpdateFunction,
  defaultValues,
  isOpenCreateUpdateItem,
  isLoading,
  onToggleCreateUpdateFunction,
  validationSchema,
  formElements,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreatUpdateFormGeneralType>({
    resolver: yupResolver(validationSchema),
    defaultValues,
  });

  const onSaveForm: SubmitHandler<CreatUpdateFormGeneralType> = useCallback(
    data => {
      if (formData) {
        onHandleUpdateFunction(data, () => reset(defaultValues));
      } else {
        onHandleCreateFunction(data, () => reset(defaultValues));
      }
    },
    [defaultValues, formData, onHandleCreateFunction, onHandleUpdateFunction, reset],
  );

  useEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData, reset]);

  return (
    <div className={'create-update-user-form-block'}>
      <form
        data-testid="create-update-user-form-block-test-id"
        className={`create-update-user-form-block--content ${
          isOpenCreateUpdateItem ? 'create-update-user-form-block--open-content' : ''
        }`}
        onSubmit={handleSubmit(onSaveForm)}>
        {formElements.map(element => (
          <div className={'create-update-user-form-block--content-input'} key={element.name}>
            <Controller
              name={element.name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  className={errors[element.name]?.message ? 'create-user--error-input' : ''}
                  inputType={'primary'}
                  maxLength={50}
                  placeholder={element.placeholder}
                  id={element.name}
                  type={element.type}
                  onChange={onChange}
                  value={value}
                  isIconInput={false}
                />
              )}
            />
            {isOpenCreateUpdateItem && element?.name && errors[element.name]?.message && (
              <span className={'validation-error'}>
                {(errors && errors[element.name]?.message) || ''}
              </span>
            )}
          </div>
        ))}
        <div>
          <CustomButton
            data-testid="create-update-block-save-test-id"
            className={`create-update-user-form-block--content-save-btn ${
              !isOpenCreateUpdateItem ? 'create-update-user-form-block--content--closed-mode' : ''
            }`}
            type={'submit'}
            startIcon={false}
            isLoading={isLoading}>
            Save
          </CustomButton>
        </div>
      </form>
      {isOpenCreateUpdateItem && (
        <div className={'close-form'}>
          <button
            className={'close-form--btn'}
            type={'button'}
            onClick={() => onToggleCreateUpdateFunction()}>
            <CloseIcon />
          </button>
        </div>
      )}
      <CustomButton
        data-testid="create-update-item-open-btn-test-id"
        className={`create-update-user-form-block--open-btn ${
          isOpenCreateUpdateItem && 'create-update-user-form-block--open-btn--closed-mode'
        }`}
        onClick={() => {
          onToggleCreateUpdateFunction();
          reset(defaultValues);
        }}>
        {createButtonText}
      </CustomButton>
    </div>
  );
};

export default CreateUpdateUser;
