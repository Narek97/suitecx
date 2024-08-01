import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import './color-picker.scss';
import { ClickAwayListener } from '@mui/material';
import { HexColorPicker as Colorful } from 'react-colorful';

interface IColorPicker {
  defaultColor: string;
  onSelect?: (color: string) => void;
  onChange?: (color: string) => void;
  className?: string;
  isOpen?: boolean;
}

interface ColorPickerRef {
  openColorPicker: () => void;
}

const ColorPicker = memo(
  forwardRef<ColorPickerRef, IColorPicker>(
    ({ defaultColor, onSelect, onChange, className = '', isOpen = false }, ref) => {
      const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
      const [showColorsWheel, setShowColorsWheel] = useState<boolean>(isOpen);

      useImperativeHandle(ref, () => ({
        openColorPicker,
      }));
      const openColorPicker = () => {
        setShowColorsWheel(true);
      };

      const changeColor = (color: string) => {
        setSelectedColor(color);
        onChange && onChange(color);
      };

      const closeColorPicker = useCallback(() => {
        onSelect && onSelect(selectedColor);
        setShowColorsWheel(false);
      }, [onSelect, selectedColor]);

      const onHandleKeydown = useCallback(
        (e: KeyboardEvent) => {
          if (e.code === 'Escape' || e.keyCode === 27) {
            closeColorPicker();
          }
        },
        [closeColorPicker],
      );

      useEffect(() => {
        document.addEventListener('keydown', onHandleKeydown);
        return () => {
          document.removeEventListener('keydown', onHandleKeydown);
        };
      }, [onHandleKeydown]);

      useEffect(() => {
        setSelectedColor(defaultColor);
      }, [defaultColor]);

      return (
        <div className={`color-picker ${className}`} data-testid="color-picker-test-id">
          <div
            style={{ backgroundColor: selectedColor }}
            className={'color-picker-circle'}
            data-testid="color-picker-color-test-id"
            onClick={openColorPicker}
          />
          {showColorsWheel && (
            <ClickAwayListener onClickAway={closeColorPicker}>
              <div className={'wheel-color-picker'} data-testid="wheel-color-picker-test-id">
                <Colorful
                  color={selectedColor}
                  onChange={color => {
                    changeColor(color);
                  }}
                />
              </div>
            </ClickAwayListener>
          )}
        </div>
      );
    },
  ),
);

export default ColorPicker;
