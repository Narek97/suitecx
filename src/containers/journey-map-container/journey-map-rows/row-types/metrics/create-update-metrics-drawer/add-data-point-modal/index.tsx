import React, { FC, useState } from 'react';

import './style.scss';

import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomDatePicker from '@/components/atoms/custom-date-picker/custom-date-picker';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import { MetricsTypeEnum } from '@/gql/types';
import {
  CES_DATA_POINT_ELEMENTS,
  CSAT_DATA_POINT_ELEMENTS,
  NPS_DATA_POINT_ELEMENTS,
} from '@/utils/constants/form/form-elements';
import { ADD_DATA_POINT_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { NPSDataPointElementType } from '@/utils/ts/types/form/form-elements-type';
import {
  CesType,
  CsatType,
  DataPointType,
  DatapointType,
  NpsType,
} from '@/utils/ts/types/metrics/metrics-type';
import 'react-datepicker/dist/react-datepicker.css';

interface IAddDataPointModal {
  metricsType: MetricsTypeEnum;
  isOpen: boolean;
  onHandleAddDataPont: (data: Array<DatapointType>) => void;
  handleClose: () => void;
}

const AddDataPointModal: FC<IAddDataPointModal> = ({
  metricsType,
  isOpen,
  onHandleAddDataPont,
  handleClose,
}) => {
  const [date, setDate] = useState(new Date());

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DataPointType>({
    resolver: yupResolver(ADD_DATA_POINT_VALIDATION_SCHEMA),
  });

  const onFormSubmit = (formData: DataPointType) => {
    const data = {};

    switch (metricsType) {
      case MetricsTypeEnum.Nps: {
        (data as DatapointType).id = uuidv4();
        (data as NpsType).date = date;
        (data as NpsType).detractor = formData.valueOne;
        (data as NpsType).passive = formData.valueTwo;
        (data as NpsType).promoter = formData.valueThree;
        break;
      }
      case MetricsTypeEnum.Csat: {
        (data as DatapointType).id = uuidv4();
        (data as CsatType).date = date;
        (data as CsatType).satisfied = formData.valueOne;
        (data as CsatType).neutral = formData.valueTwo;
        (data as CsatType).dissatisfied = formData.valueThree;
        break;
      }
      case MetricsTypeEnum.Ces: {
        (data as DatapointType).id = uuidv4();
        (data as CesType).date = date;
        (data as CesType).easy = formData.valueOne;
        (data as CesType).neutral = formData.valueTwo;
        (data as CesType).difficult = formData.valueThree;
        break;
      }
    }
    onHandleAddDataPont([data as DatapointType]);
    handleClose();
  };

  const formElements: { [key: string]: Array<NPSDataPointElementType> } = {
    [MetricsTypeEnum.Nps]: NPS_DATA_POINT_ELEMENTS,
    [MetricsTypeEnum.Csat]: CSAT_DATA_POINT_ELEMENTS,
    [MetricsTypeEnum.Ces]: CES_DATA_POINT_ELEMENTS,
  };

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      modalSize={'custom'}
      canCloseWithOutsideClick={true}>
      <ModalHeader title={'Add data point'} />
      <form onSubmit={handleSubmit(onFormSubmit)} className={'add-data-point-modal'}>
        <div className={'add-data-point-modal--content'}>
          <div className={'add-data-point-modal--left-block'}>
            <p className={'add-data-point-modal--title'}>Set your data</p>

            {formElements[metricsType]?.map((element: NPSDataPointElementType) => (
              <div className={'add-data-point-modal--input-item'} key={element.name}>
                <label className={'add-data-point-modal--label'} htmlFor={element.name}>
                  {element.title}
                </label>
                <Controller
                  name={element.name}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      data-testid={`${element.title.toLowerCase()}-data-point-input-test-id`}
                      className={''}
                      inputType={'primary'}
                      placeholder={element.placeholder}
                      id={element.name}
                      type={element.type}
                      value={value}
                      onChange={onChange}
                      isIconInput={false}
                      min={0}
                    />
                  )}
                />
                <span className={'validation-error'} data-testid={`${element.name}-error-test-id`}>
                  {(errors && errors[element.name]?.message) || ''}
                </span>
              </div>
            ))}
          </div>
          <div className={'add-data-point-modal--right-block'}>
            <p className={'add-data-point-modal--title'}>Select date</p>
            <div className={'add-data-point-modal--date-picker-block'}>
              <CustomDatePicker
                onHandleChangeDate={dateValue => {
                  setDate(dateValue);
                }}
              />
            </div>
          </div>
        </div>
        <div className={'base-modal-footer'}>
          <CustomButton
            onClick={handleClose}
            data-testid="cansel-data-point-test-id"
            variant={'text'}
            startIcon={false}
            style={{
              textTransform: 'inherit',
            }}>
            Cancel
          </CustomButton>
          <CustomButton
            type={'submit'}
            data-testid="submit-data-point-test-id"
            variant={'contained'}
            startIcon={false}
            // isLoading={isLoadingCrateUpdate}
          >
            Add data point
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
};

export default AddDataPointModal;
