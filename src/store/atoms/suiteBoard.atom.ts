import { atom } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ArrowEndingShapesEnum, ShapesEnum } from '@/utils/ts/enums/global-enums';

export const selectedShapeTypeState = atom({
  key: uuidv4(),
  default: null as null | ShapesEnum,
});

export const selectedIconState = atom({
  key: uuidv4(),
  default: null as null | string,
});

export const selectedArrowState = atom({
  key: uuidv4(),
  default: {
    iconName: ArrowEndingShapesEnum.LINE,
    color: '#000000',
  },
});
