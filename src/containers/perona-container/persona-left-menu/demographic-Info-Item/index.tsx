import React, { FC, useEffect, useRef } from 'react';

import './style.scss';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import { personaGenderMenuItems } from '@/utils/constants/dropdown';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { MenuOptionsType } from '@/utils/ts/types/global-types';
import { PersonaDemographicInfoType } from '@/utils/ts/types/persona/persona-types';

interface IDemographicInfoItem {
  demographicInfo: PersonaDemographicInfoType;
  index: number;
  selectedDemographicInfoId: number | null;
  onHandleChangeDemographicInfo: (
    demographicInfoId: number,
    value: string,
    key: 'key' | 'value',
  ) => void;
  onHandleRemoveSelectedDemographicInfoId: () => void;
  options: Array<MenuOptionsType>;
}

const DemographicInfoItem: FC<IDemographicInfoItem> = ({
  demographicInfo,
  index,
  selectedDemographicInfoId,
  onHandleChangeDemographicInfo,
  onHandleRemoveSelectedDemographicInfoId,
  options,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedDemographicInfoId === demographicInfo.id) {
      ref.current?.focus();
    }
  }, [demographicInfo.id, selectedDemographicInfoId]);

  return (
    <div className={'demographic-info-item'} data-testid={`demographic-info-item-${index}-test-id`}>
      {index < 3 ? (
        <p className={'demographic-info-item--key'}>{demographicInfo.key}</p>
      ) : (
        <div className={'demographic-info-item--options-block'}>
          <CustomInput
            disabled={selectedDemographicInfoId !== demographicInfo.id}
            inputRef={ref}
            placeholder={'label'}
            inputType={'secondary'}
            value={demographicInfo.key}
            onBlur={onHandleRemoveSelectedDemographicInfoId}
            onChange={e => onHandleChangeDemographicInfo(demographicInfo.id, e.target.value, 'key')}
          />
          <CustomLongMenu
            type={menuViewTypeEnum.VERTICAL}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            item={demographicInfo}
            options={options}
          />
        </div>
      )}

      <div className={'demographic-info-item--input'}>
        {demographicInfo.key === 'Gender' ? (
          <CustomDropDown
            id={'gender-dropdown'}
            menuItems={personaGenderMenuItems}
            onSelect={item => {
              onHandleChangeDemographicInfo(demographicInfo.id, item.value as string, 'value');
            }}
            selectItemValue={demographicInfo.value || ''}
            placeholder={'Select'}
          />
        ) : (
          <CustomInput
            type={demographicInfo.type === 'TEXT' ? 'text' : 'number'}
            placeholder={'type here...'}
            min={0}
            inputRef={inputRef}
            value={demographicInfo.value}
            data-testid={`${demographicInfo.id}-test-id`}
            onChange={e => {
              onHandleChangeDemographicInfo(demographicInfo.id, e.target.value, 'value');
            }}
            onKeyDown={event => {
              if (event.keyCode === 13) {
                event.preventDefault();
                (event.target as HTMLElement).blur();
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default DemographicInfoItem;
