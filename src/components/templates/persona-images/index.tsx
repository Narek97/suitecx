import React, { FC, ReactNode, useMemo, useState } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import PersonaImageBox from '@/components/templates/persona-image-box';
import DeleteAssignedPersona from '@/components/templates/persona-images/delete-assigned-persona';
import DeleteIcon from '@/public/operations/delete.svg';
import {
  ImageSizeEnum,
  menuItemIconPositionEnum,
  menuViewTypeEnum,
  SelectedPersonasViewModeEnum,
} from '@/utils/ts/enums/global-enums';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

interface IPersonaImages {
  personas: PersonaType[];
  handleSelectPersonaItem?: ((id: number) => void) | null;
  disabled?: boolean;
  sliceCount?: number;
  showFullItems?: boolean;
  addNewPersonaButton?: ReactNode;
  viewMode: SelectedPersonasViewModeEnum;
}
const PersonaImages: FC<IPersonaImages> = ({
  personas,
  handleSelectPersonaItem,
  disabled,
  showFullItems,
  addNewPersonaButton,
  sliceCount = 3,
}) => {
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<boolean>(false);
  const [currentDisconnectedId, setCurrentDisconnectedId] = useState<number>();
  const [isMenuActive, setIsMenuActive] = useState<boolean>(false);

  const onMenuItemClick = (id: number) => {
    setCurrentDisconnectedId(id);
    setIsOpenConfirmationModal(true);
  };

  const options = useMemo(() => {
    return personas?.map(itm => {
      return {
        name: itm?.name,
        id: itm.id,
        icon: (
          <button onClick={() => onMenuItemClick(itm.id)}>
            <DeleteIcon fill={'#545E6B'} />
          </button>
        ),
      };
    });
  }, [personas]);

  return (
    <div className={'persona-images'}>
      <DeleteAssignedPersona
        disconnectedId={currentDisconnectedId!}
        isOpen={isOpenConfirmationModal}
        handleClose={() => {
          setIsOpenConfirmationModal(false);
        }}
      />
      {!disabled && addNewPersonaButton}
      {personas?.slice(0, showFullItems ? personas.length : sliceCount)?.map((imageItem, index) => (
        <Tooltip
          key={index}
          title={disabled ? '' : imageItem?.name + ', ' + (imageItem?.type?.toLowerCase() || '')}
          placement="bottom"
          arrow>
          <div
            className={'persona-images--card'}
            style={{
              border: `1px solid ${imageItem.isDisabledForThisRow ? '#1b87e6' : 'transparent'} `,
              opacity: imageItem.isDisabledForThisRow ? 0.3 : 1,
            }}>
            <PersonaImageBox
              title={''}
              imageItem={{
                color: '#B052A7',
                isSelected: true,
                attachment: {
                  url: imageItem?.attachment?.url || '',
                  key: imageItem?.attachment?.key || '',
                },
              }}
              size={ImageSizeEnum.XSM}
              onPersonaClick={() => {
                handleSelectPersonaItem && handleSelectPersonaItem(imageItem.id);
              }}
            />
          </div>
        </Tooltip>
      ))}
      {!showFullItems && personas?.length > sliceCount && (
        <>
          <CustomLongMenu
            type={menuViewTypeEnum.VERTICAL}
            menuItemIconPosition={menuItemIconPositionEnum.END}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            onCloseFunction={() => {
              setIsMenuActive(false);
            }}
            rootStyles={{
              width: '180px',
              height: '160px',
              marginLeft: '0',
              marginTop: '0',
            }}
            sxStyles={{ minWidth: '48px', minHeight: '48px' }}
            customButton={
              <div
                className={`more-items  ${isMenuActive ? 'active-menu-button' : ''}`}
                onClick={() => {
                  setIsMenuActive(true);
                }}>
                +{personas.length - sliceCount}
              </div>
            }
            options={options}
            disabled={disabled}
          />
        </>
      )}
    </div>
  );
};
export default PersonaImages;
