import { Button, ButtonProps } from '@mui/material';
import React, { FC, memo } from 'react';
import './custom-button.scss';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import PlusIcon from '@/public/button-icons/plus.svg';
import LoaderIcon from '@/public/base-icons/loader.svg';

interface ICustomButton {
  children?: React.ReactNode;
  isLoading?: boolean;
  startIcon?: boolean;
  endIcon?: boolean;
  disableRipple?: boolean;
  disableElevation?: boolean;
  customIcon?: JSX.Element;
  sxStyles?: any;
}

const CustomButton: FC<ICustomButton & ButtonProps> = memo(
  ({
    children,
    variant = 'contained',
    isLoading = false,
    startIcon = true,
    endIcon = false,
    disableRipple = true,
    disableElevation = true,
    sxStyles,
    customIcon,
    ...buttonRestParams
  }) => {
    const style = {
      '.MuiButton-icon': {
        margin: 0,
      },
      textTransform: 'initial !important',
      minHeight: '32px',
      minWidth: '64px',
      padding: '7px 16px',
      lineHeight: '16px',
      borderRadius: '2px',
      boxSizing: 'border-box',
      fontSize: '14px',
      gap: '8px',
      justifyContent: 'center',
      ...sxStyles,
    };
    const customStyle: ObjectKeysType = {
      contained: {
        color: '#FFFFFF',
        backgroundColor: '#1B87E6',
        border: '1px solid #1B87E6',
        '&.Mui-disabled': {
          background: '#60abec',
          borderColor: '#60abec',
          color: '#FFFFFF',
        },
        '&:hover': {
          background: '#54a5ec',
          border: '1px solid #54a5ec',
        },
        ...style,
      },
      outlined: {
        border: '1px solid #1B87E6',
        color: '#1B87E6',
        '&.Mui-disabled': {
          background: '#60abec',
          borderColor: '#60abec',
          color: '#FFFFFF',
        },
        ...style,
      },
      text: {
        textTransform: 'initial',
        '&:hover': {
          background: '#EDF6FD',
        },
        ...style,
      },
    };

    return (
      <Button
        {...buttonRestParams}
        sx={customStyle[variant]}
        variant={variant}
        startIcon={
          customIcon && startIcon ? (
            customIcon
          ) : startIcon && !customIcon ? (
            <PlusIcon fill={variant === 'outlined' ? '#1B87E6' : '#ffffff'} />
          ) : null
        }
        endIcon={customIcon && endIcon ? customIcon : null}
        disableRipple={disableRipple}
        disableElevation={disableElevation}>
        {isLoading && (
          <span className={`custom-button--loading-block ${variant}-loader`}>
            <LoaderIcon width={12} height={12} />
          </span>
        )}
        {children}
      </Button>
    );
  },
);

export default CustomButton;
