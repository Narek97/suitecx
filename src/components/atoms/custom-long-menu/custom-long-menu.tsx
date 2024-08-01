import React, { FC, ReactNode, useCallback, useState } from 'react';

import { Menu, MenuItem, Tooltip } from '@mui/material';
import Zoom from '@mui/material/Zoom';

import './custom-long-menu.scss';
import MoreVertIcon from '@/public/base-icons/dots.svg';
import { menuItemIconPositionEnum, menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { MenuOptionsType, ObjectKeysType } from '@/utils/ts/types/global-types';

const HORIZONTAL_MENU_SX = {
  display: 'flex',
  overflowX: 'auto',
  maxWidth: '60vw',
};

const VERTICAL_MENU_SX = {
  display: 'flex',
  flexDirection: 'column',
  overflowX: 'auto',
};

const VERTICAL_MENU_ROOT_SX = {
  borderRadius: 0,
  width: 'auto',
  border: '1px solid #1b87e6',
};

const HORIZONTAL_MENU_ROOT_SX = {
  boxShadow: 'none !important',
};

interface ICustomLongMenu {
  anchorOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  transformOrigin?: {
    vertical: 'top' | 'center' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
  item?: any;
  options: Array<MenuOptionsType>;
  subOptions?: Array<MenuOptionsType>;
  sxMenuStyles?: ObjectKeysType;
  rootStyles?: ObjectKeysType;
  sxStyles?: ObjectKeysType;
  type?: menuViewTypeEnum;
  customButton?: ReactNode;
  onCloseFunction?: () => void;
  onOpenFunction?: () => void;
  menuItemIconPosition?: menuItemIconPositionEnum;
  disabled?: boolean;
  buttonId?: string;
}

const CustomLongMenu: FC<ICustomLongMenu> = ({
  anchorOrigin = { vertical: 'top', horizontal: 'left' },
  transformOrigin = { vertical: 'top', horizontal: 'right' },
  options = [],
  subOptions = [],
  item,
  menuItemIconPosition = menuItemIconPositionEnum.START,
  customButton,
  rootStyles,
  sxMenuStyles,
  onCloseFunction,
  onOpenFunction,
  sxStyles,
  type = menuViewTypeEnum.HORIZONTAL,
  disabled = false,
  buttonId = 'menu-button',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
      onOpenFunction && onOpenFunction();
    },
    [onOpenFunction],
  );

  const handleClose = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setAnchorEl(null);
    onCloseFunction && onCloseFunction();
  };
  const handleClick = (option: MenuOptionsType) => {
    if (option.onClick) {
      option.onClick(item);
    }
    if (!option.isFileUpload && !option.isColorPicker) {
      setAnchorEl(null);
    }

    onCloseFunction && onCloseFunction();
  };

  const primaryClassName = `custom-${type.toLowerCase()}-menu`;
  return (
    <div className={`${primaryClassName} ${open ? `${primaryClassName}-open` : ''}`}>
      <button
        data-testid="long-menu-button-test-id"
        onClick={handleOpen}
        aria-label="more"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        className={`${primaryClassName}--btn`}
        disabled={disabled}
        id={buttonId}>
        {customButton ? customButton : <MoreVertIcon width={16} height={16} />}
      </button>
      <Menu
        autoFocus={false}
        onClick={e => e.stopPropagation()}
        id="long-menu"
        MenuListProps={{
          id: 'long-menu-ul',
          'aria-labelledby': 'long-button',
        }}
        sx={{
          '& .MuiPaper-root': {
            marginTop: '8px',
            marginLeft: '8px',
            ...(type === menuViewTypeEnum?.VERTICAL
              ? VERTICAL_MENU_ROOT_SX
              : HORIZONTAL_MENU_ROOT_SX),
            ...rootStyles,
          },
          ul: {
            ...(type === menuViewTypeEnum?.VERTICAL ? VERTICAL_MENU_SX : HORIZONTAL_MENU_SX),
            ...sxMenuStyles,
          },
        }}
        transformOrigin={transformOrigin}
        anchorOrigin={anchorOrigin}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}>
        {options.map((option, index) => (
          <MenuItem
            disableRipple
            disabled={option?.disabled}
            key={option.name + index}
            id={`${option.name?.toLowerCase()}-${index}`}
            data-testid={`long-menu-${option.name?.toLowerCase()}-button-test-id`}
            onClick={e => {
              e.stopPropagation();
              !option.isSubOption && handleClick(option);
            }}
            sx={{
              ...sxStyles,
              lineHeight: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
            }}
            className={`${primaryClassName}--menu-item`}>
            <div
              className={`${primaryClassName}--menu-item-content ${
                option?.icon
                  ? menuItemIconPosition === menuItemIconPositionEnum.START
                    ? 'icon-position-start'
                    : 'icon-position-end'
                  : ''
              }`}>
              {option.label
                ? option?.icon
                : option?.icon && (
                    <span className={`${primaryClassName}--menu-item-content-icon`}>
                      {option?.icon}
                    </span>
                  )}

              {option.label ? (
                option.label
              ) : (
                <span className={`${primaryClassName}--menu-item-content--text`}>
                  {option?.name}
                </span>
              )}
            </div>
            {option.isSubOption && (
              <div className={`${primaryClassName}--sub-options`}>
                {subOptions?.map((subOption, subIndex) => (
                  <Tooltip
                    key={subOption.name + subIndex}
                    title={subOption?.name}
                    placement="right"
                    TransitionComponent={Zoom}
                    arrow>
                    <div
                      className={`${primaryClassName}--item ${primaryClassName}--sub-item`}
                      onClick={e => {
                        e.stopPropagation();
                        if (option.onClick) {
                          option.onClick(subOption);
                          setAnchorEl(null);
                          onCloseFunction && onCloseFunction();
                        }
                      }}>
                      <span className={`${primaryClassName}--sub-item--name`}>
                        {subOption?.name}
                      </span>
                      <span className={`${primaryClassName}--sub-item--icon`}>
                        {subOption?.icon}
                      </span>
                    </div>
                  </Tooltip>
                ))}
              </div>
            )}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default CustomLongMenu;
