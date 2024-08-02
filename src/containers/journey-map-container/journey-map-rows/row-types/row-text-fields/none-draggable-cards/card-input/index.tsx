import React, { FC, memo, ReactNode, useEffect, useState } from 'react';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import { BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ICardInput {
  icon: ReactNode;
  headerColor: string;
  bodyColor: string;
  disabled: boolean;
  rowItem: BoxItemType;
  onHandleUpdateBoxElement: ({
    value,
    columnId,
    stepId,
  }: {
    value: string;
    columnId: number;
    stepId: number;
  }) => void;
}

const CardInput: FC<ICardInput> = memo(
  ({ icon, headerColor, bodyColor, disabled, rowItem, onHandleUpdateBoxElement }) => {
    const [labelValue, setLabelValue] = useState<string>('');

    useEffect(() => {
      setLabelValue(rowItem.boxTextElement?.text || '');
    }, [rowItem.boxTextElement?.text]);

    return (
      <div className={'map-item'}>
        <div className={'text-insights--header'} style={{ backgroundColor: headerColor }}>
          {icon}
        </div>
        <div>
          <CustomInput
            multiline={true}
            disabled={disabled}
            minRows={5}
            inputType={'secondary'}
            placeholder="Type here..."
            sxStyles={{
              minWidth: '100%',
              background: `${bodyColor}`,
              '& .MuiInputBase-input': {
                fontSize: '14px',
              },
            }}
            value={labelValue}
            onChange={e => {
              setLabelValue(e.target.value);
              onHandleUpdateBoxElement({
                value: e.target.value,
                columnId: rowItem.columnId!,
                stepId: rowItem.step.id,
              });
            }}
          />
        </div>
      </div>
    );
  },
);

export default CardInput;
