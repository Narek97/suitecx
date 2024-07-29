import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

interface ISnackbar {
  vertical?: 'top' | 'bottom';
  horizontal?: 'right' | 'left' | 'center';
  open: boolean;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export const snackbarState = atom({
  key: uuidv4(),
  default: {
    vertical: 'bottom',
    horizontal: 'right',
    open: false,
    message: '',
    type: 'success',
  } as ISnackbar,
});
