import React, { FC } from 'react';

import './style.scss';

import DraggableCards from '@/containers/journey-map-container/journey-map-rows/row-types/row-text-fields/draggable-cards';
import NoneDraggableCards from '@/containers/journey-map-container/journey-map-rows/row-types/row-text-fields/none-draggable-cards';
import { getPageContentByKey } from '@/utils/helpers/get-page-content-by-key';
import {
  JourneyMapDraggableTextFields,
  JourneyMapRowType,
  JourneyMapTextAreaRowsType,
} from '@/utils/ts/types/journey-map/journey-map-types';

interface IRowTextFields {
  type: JourneyMapDraggableTextFields | JourneyMapTextAreaRowsType;
  row: JourneyMapRowType;
  width: number;
  rowIndex: number;
  headerColor: string;
  bodyColor: string;
  disabled: boolean;
  isDraggable: boolean;
}

const RowTextFields: FC<IRowTextFields> = ({
  width,
  row,
  type,
  rowIndex,
  headerColor,
  bodyColor,
  disabled,
  isDraggable,
}) => {
  return (
    <div data-testid={`row-text-field-${row.id}-test-id`} className={'row-text-fields'}>
      {getPageContentByKey({
        content: {
          'none-draggable': (
            <NoneDraggableCards
              row={row}
              type={type as JourneyMapDraggableTextFields}
              width={width}
              headerColor={headerColor}
              bodyColor={bodyColor}
              disabled={disabled}
            />
          ),
          draggable: (
            <DraggableCards
              row={row}
              rowIndex={rowIndex}
              type={type as JourneyMapDraggableTextFields}
              width={width}
              headerColor={headerColor}
              bodyColor={bodyColor}
              disabled={disabled}
            />
          ),
        },
        key: isDraggable ? 'draggable' : 'none-draggable',
        defaultPage: <div />,
      })}
    </div>
  );
};

export default RowTextFields;
