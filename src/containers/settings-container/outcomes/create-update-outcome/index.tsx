import { yupResolver } from '@hookform/resolvers/yup';
import React, { FC, useCallback, useEffect } from 'react';
import './style.scss';
import { CreatUpdateFormGeneralType } from '@/utils/ts/types/global-types';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { OUTCOMES_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { OUTCOMES_FORM_ELEMENTS } from '@/utils/constants/form/form-elements';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CloseIcon from '@/public/base-icons/close.svg';
import PinPersona from '@/containers/settings-container/outcomes/pin-persona';

interface ICreateUpdateOutcome {
  formData: any;
  isOpenCreateUpdateItem: boolean;
  isLoading: boolean;
  onHandleCreateFunction: (data: CreatUpdateFormGeneralType, reset: () => void) => void;
  onHandleUpdateFunction: (data: CreatUpdateFormGeneralType, reset: () => void) => void;
  onToggleCreateUpdateFunction: () => void;
}
const defaultValues = { name: '', pluralName: '' };

const CreateUpdateOutcome: FC<ICreateUpdateOutcome> = ({
  onHandleCreateFunction,
  formData,
  onHandleUpdateFunction,
  isOpenCreateUpdateItem,
  isLoading,
  onToggleCreateUpdateFunction,
}) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<{ name: string; pluralName: string }>({
    resolver: yupResolver(OUTCOMES_VALIDATION_SCHEMA),
    defaultValues,
  });

  const onSaveOutcome: SubmitHandler<CreatUpdateFormGeneralType> = useCallback(
    data => {
      if (formData) {
        onHandleUpdateFunction(data, () => reset(defaultValues));
      } else {
        onHandleCreateFunction(data, () => reset(defaultValues));
      }
    },
    [formData, onHandleCreateFunction, onHandleUpdateFunction, reset],
  );

  useEffect(() => {
    if (formData) {
      reset(formData);
    }
  }, [formData, reset]);

  return (
    <div className={'create-edit-form-block'}>
      <form
        data-testid="create-edit-form-block-test-id"
        className={`create-edit-form-block--content ${
          isOpenCreateUpdateItem ? 'create-edit-form-block--open-content' : ''
        }`}
        onSubmit={handleSubmit(onSaveOutcome)}>
        {OUTCOMES_FORM_ELEMENTS.map(outcomeElement => (
          <div className={'create-edit-form-block--content-input'} key={outcomeElement.name}>
            <Controller
              name={outcomeElement.name}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  className={errors[outcomeElement.name]?.message ? 'create-user--error-input' : ''}
                  inputType={'primary'}
                  maxLength={50}
                  placeholder={outcomeElement.placeholder}
                  id={outcomeElement.name}
                  type={outcomeElement.type}
                  onChange={onChange}
                  value={value}
                  isIconInput={false}
                />
              )}
            />
            {isOpenCreateUpdateItem &&
              outcomeElement?.name &&
              errors[outcomeElement.name]?.message && (
                <span className={'validation-error'}>
                  {(errors && errors[outcomeElement.name]?.message) || ''}
                </span>
              )}
          </div>
        ))}
        <PinPersona outcomeGroupId={formData?.id} />
        <div>
          <CustomButton
            data-testid="create-update-block-save-test-id"
            className={`create-edit-form-block--content-save-btn ${
              !isOpenCreateUpdateItem ? 'create-edit-form-block--content--closed-mode' : ''
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
            aria-label={'close-button'}
            className={'close-form--btn'}
            type={'button'}
            onClick={() => onToggleCreateUpdateFunction()}>
            <CloseIcon />
          </button>
        </div>
      )}
      <CustomButton
        data-testid="create-update-item-open-btn-test-id"
        className={`create-edit-form-block--open-btn ${
          isOpenCreateUpdateItem && 'create-edit-form-block--open-btn--closed-mode'
        }`}
        onClick={() => {
          onToggleCreateUpdateFunction();
          reset(defaultValues);
        }}>
        Create outcomes
      </CustomButton>
    </div>
  );
};
export default CreateUpdateOutcome;
