import React, { FC, memo, Ref } from 'react';

import { InputAdornment, TextField, TextFieldProps } from '@mui/material';

import './custom-Input.scss';
import SearchIcon from '@/public/base-icons/search.svg';
import { ObjectKeysType } from '@/utils/ts/types/global-types';

interface ICustomInput {
  inputType?: 'primary' | 'secondary';
  isIconInput?: boolean;
  maxLength?: number;
  minLength?: number;
  iconInput?: React.ReactNode;
  sxStyles?: any;
  min?: number;
  max?: number;
  step?: number;
  inputRef?: Ref<HTMLInputElement>;
}

const CustomInput: FC<ICustomInput & TextFieldProps> = memo(
  ({
    inputType = 'primary',
    isIconInput = false,
    rows = 0,
    sxStyles,
    iconInput,
    maxLength,
    minLength,
    min,
    max,
    className,
    step,
    inputRef,
    ...inputRestParams
  }) => {
    const style = {
      width: '100%',
      backgroundColor: '#FFFFFF',
      borderBottom: 'none',
      ...sxStyles,
    };

    const customStyle: ObjectKeysType = {
      primary: {
        ...style,
        backgroundColor: '#F5F5F5',
      },
      secondary: {
        ...style,
      },
    };

    const endAdornment = () => {
      return isIconInput ? (
        <InputAdornment position={'start'}>
          {iconInput || <SearchIcon className={'custom-input--svg'} />}
        </InputAdornment>
      ) : (
        <></>
      );
    };

    return (
      <TextField
        {...inputRestParams}
        autoComplete="off"
        sx={customStyle[inputType]}
        variant="standard"
        className={`custom-input ${className || ''}`}
        rows={rows}
        inputProps={{ maxLength, minLength, min, max, step }}
        inputRef={inputRef}
        InputProps={{
          endAdornment: endAdornment(),
        }}
      />
    );
  },
);

export default CustomInput;
