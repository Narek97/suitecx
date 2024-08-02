import React, { FC, memo, useEffect, useState } from 'react';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';

interface IStepInput {
  updateStepColumn: (data: { value: string; id: number }) => void;
  label: string;
  rowId: number | null;
  id: number;
  disabled: boolean;
  columnId: number;
  index: number;
}

const StepInput: FC<IStepInput> = memo(({ updateStepColumn, label, id, disabled }) => {
  const [labelValue, setLabelValue] = useState<string>(label || '');

  useEffect(() => {
    // NEED TO TEST AND CATCH CASE
    label && setLabelValue(label);
  }, [label]);

  return (
    <CustomInput
      id={String(id)}
      data-testid={`step-input-${id}-test-id`}
      sxStyles={{
        background: '#F0F2FA',
        textAlign: 'center',
        '& .Mui-focused': {
          backgroundColor: 'white',
        },
        '& .MuiInputBase-input': {
          padding: '0 40px 0 10px',
          height: '32px',
          color: '#1B3380',
        },
      }}
      onFocus={() => {}}
      onBlur={() => {}}
      inputType={'secondary'}
      placeholder="title..."
      value={labelValue}
      disabled={disabled}
      onChange={e => {
        setLabelValue(e.target.value);
        updateStepColumn({
          value: e?.target?.value,
          id,
        });
      }}
      onKeyDown={event => {
        if (event.keyCode === 13) {
          event.preventDefault();
          (event.target as HTMLElement).blur();
        }
      }}
    />
  );
});

export default StepInput;
