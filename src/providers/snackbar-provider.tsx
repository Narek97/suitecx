'use client';
import React, { FC } from 'react';
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import ErrorIcon from '@/public/base-icons/remove.svg';
import SuccessIcon from '@/public/base-icons/success.svg';
import WarningIcon from '@/public/base-icons/info.svg';
import { useRecoilState } from 'recoil';
import { snackbarState } from '@/store/atoms/snackbar.atom';

interface ISnackbarProvider {
  children: React.ReactNode;
}

const SnackbarProvider: FC<ISnackbarProvider> = ({ children }) => {
  const [snackbar, setSnackbar] = useRecoilState(snackbarState);

  const { vertical = 'bottom', horizontal = 'left', open = false, message = '', type } = snackbar;
  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      {children}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        autoHideDuration={3000}
        onClose={handleClose}
        key={vertical + horizontal}>
        <Alert
          severity={type}
          onClose={handleClose}
          elevation={6}
          sx={{
            width: 341,
            height: 52,
            backgroundColor: type === 'success' ? '#DFF2BF' : undefined,
            color: type === 'success' ? '#227700' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            '& .MuiAlert-action': {
              margin: 0,
            },
          }}
          variant="filled"
          data-testid="message"
          icon={
            type === 'success' ? (
              <SuccessIcon fill={'#fff'} />
            ) : type === 'warning' ? (
              <WarningIcon fill={'#fff'} />
            ) : (
              <ErrorIcon fill={'#fff'} />
            )
          }>
          {message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SnackbarProvider;
