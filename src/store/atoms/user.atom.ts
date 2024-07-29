import { atom } from 'recoil';
import { Usertype } from '@/utils/ts/types/global-types';
import { v4 as uuidv4 } from 'uuid';

export const userState = atom({
  key: uuidv4(),
  default: {} as Usertype,
});
