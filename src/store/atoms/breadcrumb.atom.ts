import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

export const breadcrumbState = atom({
  key: uuidv4(),
  default: [
    {
      name: 'Workspaces',
      pathname: '/workspaces',
    },
  ] as Array<{
    name: string;
    pathname?: string;
    search?: string;
  }>,
});
