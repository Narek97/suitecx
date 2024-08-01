import React from 'react';

import './style.scss';
import { SortableHandle } from 'react-sortable-hoc';

import DragIcon from '@/public//base-icons/drag-icon.svg';

const DragHandle = SortableHandle(() => (
  <div className={'drag-handle-area dragging'} aria-label={'drag'}>
    <DragIcon className={'drag-handle-area--icon'} />
  </div>
));

export default DragHandle;
