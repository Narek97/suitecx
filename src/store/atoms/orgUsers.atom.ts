import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationUserType } from '@/utils/ts/types/global-types';

export const orgUsersState = atom({
  key: uuidv4(),
  default: [] as (OrganizationUserType & { value: string })[],
});
