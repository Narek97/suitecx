import { DropdownMultiSelectItemType } from '@/utils/ts/types/global-types';
import { Chip, FormControl, InputLabel, MenuItem, SelectProps } from '@mui/material';
import Select from '@mui/material/Select';
import React, { FC, memo, useRef, useState } from 'react';
import './custom-multi-select-drop-down.scss';
import DeleteIcon from '@/public/base-icons/close.svg';

interface ICustomMultiSelectDropDown
  extends Pick<SelectProps, 'open' | 'onOpen' | 'onClose' | 'disabled'> {
  id?: string;
  name?: string;
  placeholder?: string;
  menuItems: Array<DropdownMultiSelectItemType>;
  sxStyles?: any;
  menuSx?: any;
  defaultSelectedItems?: Array<DropdownMultiSelectItemType>;
  formSx?: any;
  onScroll?: any;
  onSelect: (items: Array<number | string>) => void;
  onDelete: (id: number, index: number) => void;
}

const CustomMultiSelectDropDown: FC<ICustomMultiSelectDropDown> = memo(
  ({
    id,
    name = 'custom',
    placeholder,
    menuItems,
    sxStyles,
    menuSx,
    defaultSelectedItems,
    formSx,
    onScroll = () => {},
    onSelect,
    onDelete,
    ...selectRestParams
  }) => {
    const [selectedMenuItems, setSelectedMenuItems] = useState<Array<DropdownMultiSelectItemType>>(
      defaultSelectedItems || [],
    );
    const childRef = useRef<HTMLUListElement>(null);

    const onHandleSelect = (menuItem: DropdownMultiSelectItemType) => {
      const selectedItems = [...selectedMenuItems, menuItem];
      setSelectedMenuItems(selectedItems);
      onSelect(selectedItems.map(itm => itm.value));
    };

    const onHandleDelete = (menuItem: DropdownMultiSelectItemType, index: number) => {
      const selectedItems = selectedMenuItems.filter(
        selectedMenuItem => menuItem.id !== selectedMenuItem.id,
      );
      setSelectedMenuItems(selectedItems);
      onDelete(menuItem.value as number, index);
    };

    return (
      <FormControl
        className={'custom-multi-select-dropdown'}
        variant="standard"
        id={`${id ? '-' : ''}dropdown-menu`}
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',
          fontSize: '14px',
          borderBottom: '1px solid #D8D8D8',
          ...formSx,
        }}>
        {selectedMenuItems.length ? null : (
          <InputLabel
            sx={{
              top: '-11px',
            }}>
            <div className={'select-placeholder'}>{placeholder}</div>
          </InputLabel>
        )}

        <Select
          {...selectRestParams}
          ref={childRef}
          data-testid={`${name}-dropdown-test-id`}
          labelId={`${id || 'demo-simple-select-standard'}-label`}
          id={`${id || 'demo-simple-select-standard'}`}
          multiple
          value={selectedMenuItems}
          // onChange={e => setSelectedMenuItems(e.target.value)}
          sx={{
            '&:after': { borderBottom: '0' },
            '& .MuiSelect-select:focus': {
              backgroundColor: 'transparent',
            },
            fontWeight: 300,
            marginTop: '0 !important',
            ...sxStyles,
          }}
          MenuProps={{
            PaperProps: {
              onScroll,
              sx: {
                borderRadius: 0,
                maxHeight: '160px',
                maxWidth: '100px',
                ...menuSx,
              },
            },
          }}
          renderValue={selected => (
            <div>
              {selected.map((menuItem, index) => (
                <Chip
                  className={'custom-multi-select-dropdown--delete-btn'}
                  key={menuItem.value}
                  label={menuItem.name}
                  sx={{
                    minWidth: '50px',
                    fontSize: '12px',
                    borderRadius: '2px',
                    marginRight: '8px',
                  }}
                  onDelete={() => onHandleDelete(menuItem, index)}
                  deleteIcon={
                    <span
                      onMouseDown={event => event.stopPropagation()}
                      style={{
                        margin: '0 5px',
                      }}>
                      <DeleteIcon />
                    </span>
                  }
                />
              ))}
            </div>
          )}>
          {menuItems.map((menuItem, index) => {
            const isSelected = selectedMenuItems.some(item => item.value === menuItem.value);

            return (
              <MenuItem
                value={menuItem.value}
                key={menuItem.id}
                className={`custom-multi-select-dropdown--menu-item ${
                  isSelected ? 'custom-multi-select-dropdown--selected-menu-item' : ''
                }`}
                sx={{
                  color: '#545e6b',
                  fontSize: '12px',
                  padding: '8px',
                  fontWeight: 300,
                  '&:hover': {
                    backgroundColor: '#deebf7',
                  },
                }}
                data-testid={`${menuItem.name}-item-test-id`}
                onClick={() => {
                  isSelected ? onHandleDelete(menuItem, index) : onHandleSelect(menuItem);
                }}>
                <span>{menuItem.name}</span>
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    );
  },
);

export default CustomMultiSelectDropDown;
