import React, { FC, useMemo, useState } from 'react';

import { Box } from '@mui/material';
import Image from 'next/image';
import { useRecoilState, useRecoilValue } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import CreateTouchpointModal from '@/containers/journey-map-container/journey-map-rows/row-types/touchpoints/create-touchpoint-modal';
import PlusIcon from '@/public/operations/plus.svg';
import {
  selectedCustomTouchpointsState,
  selectedTouchpointsState,
} from '@/store/atoms/selectedTouchpoints.atom';
import { touchPointCustomIconsState } from '@/store/atoms/touchPointCustomIcons.atom';
import {
  COMMUNICATION,
  FINANCE,
  HEALTHCARE,
  HUMAN_RESOURCES,
  RETAIL,
  SALES_MARKETING,
  SOCIAL_MEDIA,
} from '@/utils/constants/touchpoints';
import { TouchpointIconsEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { JourneyMapTouchpointIconsType } from '@/utils/ts/types/journey-map/journey-map-types';
import { PersonaGalleryType } from '@/utils/ts/types/persona/persona-types';

import './style.scss';

interface ITouchpointIcons {
  type: TouchpointIconsEnum;
}

const TouchpointIcons: FC<ITouchpointIcons> = ({ type }) => {
  const [isOpenCreateTouchpointModal, setIsOpenCreateTouchpointModal] = useState<boolean>(false);
  const [search, setSearch] = useState('');

  const [selectedTouchpoint, setSelectedTouchpoints] = useRecoilState(selectedTouchpointsState);
  const [selectedCustomTouchpoints, setSelectedCustomTouchpoints] = useRecoilState(
    selectedCustomTouchpointsState,
  );
  const touchPointCustomIcons = useRecoilValue(touchPointCustomIconsState);

  const iconsByType: ObjectKeysType = useMemo(
    () => ({
      [TouchpointIconsEnum.ALL]: [...COMMUNICATION, ...FINANCE],
      [TouchpointIconsEnum.COMMUNICATION]: COMMUNICATION,
      [TouchpointIconsEnum.SOCIAL_MEDIA]: SOCIAL_MEDIA,
      [TouchpointIconsEnum.SALES_MARKETING]: SALES_MARKETING,
      [TouchpointIconsEnum.FINANCE]: FINANCE,
      [TouchpointIconsEnum.RETAIL]: RETAIL,
      [TouchpointIconsEnum.HEALTHCARE]: HEALTHCARE,
      [TouchpointIconsEnum.HUMAN_RESOURCES]: HUMAN_RESOURCES,
    }),
    [],
  );
  const icons = useMemo(() => iconsByType[type] || [], [iconsByType, type]);

  const newIcons = useMemo(() => {
    if (search) {
      return icons.filter((item: JourneyMapTouchpointIconsType) =>
        item?.name?.toLowerCase()?.includes(search.toLowerCase()),
      );
    }
    return icons;
  }, [icons, search]);

  const newTouchPointIcons = useMemo(() => {
    if (search) {
      return touchPointCustomIcons.filter(item =>
        item.name?.toLowerCase()?.includes(search.toLowerCase()),
      );
    }
    return touchPointCustomIcons;
  }, [search, touchPointCustomIcons]);

  const onHandleSelectTouchpoint = (
    icon: JourneyMapTouchpointIconsType,
    selectedId: string | number | null,
  ) => {
    if (selectedId) {
      setSelectedTouchpoints(prev => prev.filter(el => el.id !== selectedId));
    } else {
      setSelectedTouchpoints(prev => [...prev, icon]);
    }
  };

  const onHandleSelectCustomTouchpoint = (
    icon: PersonaGalleryType,
    selectedId: string | number | null,
  ) => {
    if (selectedId) {
      setSelectedCustomTouchpoints(prev => prev.filter(el => el.id !== selectedId));
    } else {
      setSelectedCustomTouchpoints(prev => [...prev, icon]);
    }
  };

  const onHandleToggleCreateTouchpointModal = () => {
    setIsOpenCreateTouchpointModal(prev => !prev);
  };

  return (
    <div className={'touchpoint-icons'}>
      {isOpenCreateTouchpointModal && (
        <CreateTouchpointModal
          isOpen={isOpenCreateTouchpointModal}
          onHandleCloseModal={onHandleToggleCreateTouchpointModal}
        />
      )}
      <div className={'touchpoint-icons--header'}>
        <CustomInput
          isIconInput={true}
          inputType={'primary'}
          placeholder={`Search touchpoint`}
          type={'text'}
          sxStyles={{
            width: '200px',
          }}
          onChange={e => setSearch(e.target.value)}
        />
        {type === TouchpointIconsEnum.CUSTOM && (
          <button
            className={'touchpoint-icons--add-touchpoint-btn'}
            onClick={onHandleToggleCreateTouchpointModal}>
            <PlusIcon /> Add Touchpoint
          </button>
        )}
      </div>

      <ul className={'touchpoint-icons--content'}>
        {type === TouchpointIconsEnum.CUSTOM ? (
          <>
            {newTouchPointIcons.length ? (
              newTouchPointIcons?.map(icon => {
                const isSelected =
                  selectedCustomTouchpoints.some(el => el.id === icon.id) ||
                  selectedTouchpoint.some(el => el.id === icon.id);
                return (
                  <li
                    key={icon.id}
                    data-testid={'touchpoint-item-test-id'}
                    className={`touchpoint-icons--icon-block ${
                      isSelected ? 'touchpoint-icons--selected-icon-block' : ''
                    }`}
                    onClick={() => {
                      icon.type === 'TOUCHPOINT_ICON'
                        ? onHandleSelectCustomTouchpoint(
                            icon as PersonaGalleryType,
                            isSelected ? icon.id : null,
                          )
                        : onHandleSelectTouchpoint(
                            icon as PersonaGalleryType,
                            isSelected ? icon.id : null,
                          );
                    }}>
                    <Image
                      src={
                        icon.type === 'TOUCHPOINT_ICON'
                          ? `${process.env.NEXT_PUBLIC_AWS_URL}/${icon?.url}/large${icon?.key}`
                          : icon.url || ''
                      }
                      alt={icon.name || 'img'}
                      width={200}
                      height={200}
                      style={{
                        width: '25px',
                        height: '25px',
                      }}
                    />
                    <p className={'touchpoint-icons--icon-title'}>{icon.name}</p>
                  </li>
                );
              })
            ) : (
              <EmptyDataInfo icon={<Box />} message={'No result'} />
            )}
          </>
        ) : (
          <>
            {newIcons.length ? (
              newIcons.map((icon: JourneyMapTouchpointIconsType) => {
                const isSelected = selectedTouchpoint.some(el => el.id === icon.id);
                return (
                  <li
                    key={icon.id}
                    className={`touchpoint-icons--icon-block ${
                      isSelected ? 'touchpoint-icons--selected-icon-block' : ''
                    }`}
                    onClick={() => onHandleSelectTouchpoint(icon, isSelected ? icon.id : null)}>
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SVG_URL}custom-touchpoints/${icon.key}`}
                      alt={icon.name}
                      width={200}
                      height={200}
                      style={{
                        width: '20px',
                        height: '20px',
                      }}
                    />
                    <p className={'touchpoint-icons--icon-title'}>{icon.name}</p>
                  </li>
                );
              })
            ) : (
              <EmptyDataInfo icon={<Box width={80} height={80} />} message={'No result'} />
            )}
          </>
        )}
      </ul>
    </div>
  );
};
export default TouchpointIcons;
