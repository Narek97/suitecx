import React, { FC, memo, useRef } from 'react';

import './style.scss';

import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';

import DraggableItem from '@/containers/journey-map-container/journey-map-columns/draggable-item';
import PlusSignIcon from '@/public/operations/plus.svg';
import { scrollNeighbours } from '@/utils/helpers/general';
import { JourneyMapColumnType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IJourneyMapColumns {
  onColumnDragEnd: any;
  columns: JourneyMapColumnType[];
  updateColumnByFieldName: (data: {
    fieldName: string;
    value: string | number;
    columnId: number;
  }) => void;
  isGuest: boolean;
}

const JourneyMapColumns: FC<IJourneyMapColumns> = memo(
  ({ onColumnDragEnd, columns, updateColumnByFieldName, isGuest }) => {
    const childRef = useRef<any>(null);
    const onHandleScroll = () => {
      const stages = document.getElementById('stages');
      const steps = document.getElementById('steps');
      const rows = document.getElementById('rows');
      scrollNeighbours(stages?.scrollLeft || 0, [steps!, rows!]);
    };

    return (
      <div
        id={'stages'}
        className={'journey-map-column'}
        style={{ overflow: 'auto' }}
        onScroll={onHandleScroll}>
        <div className={'journey-map-column--start-column'}>
          <p className={'journey-map-column--start-column--title'}>Columns</p>
          <div className={'journey-map-column--new-column-button-block'}>
            <button
              aria-label={'plus'}
              className={'journey-map-column--new-column-button-block--button'}
              data-testid="add-column-btn-test-id"
              onClick={() => childRef.current?.createNewColumn()}>
              <PlusSignIcon />
            </button>
          </div>
        </div>
        <DragDropContext onDragEnd={result => onColumnDragEnd(result)}>
          <Droppable droppableId={'stage'} key={'stage'} direction="horizontal">
            {provided => {
              return (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={'journey-map-column--columns'}
                  data-testid="journey-map-columns-test-id">
                  {columns?.map((column, index) => (
                    <Draggable
                      key={String(column?.id)}
                      draggableId={String(column?.id)}
                      index={index}
                      isDragDisabled={isGuest}>
                      {provided2 => {
                        return (
                          <div
                            ref={provided2.innerRef}
                            {...provided2.draggableProps}
                            key={column?.id}>
                            <div
                              style={{
                                width: `${column.size * 280 + column.size * 2 - 2}px`,
                              }}
                              className={'journey-map-column--columns--item'}>
                              <DraggableItem
                                ref={index === 0 ? childRef : null}
                                key={column?.id}
                                index={index + 1}
                                column={column}
                                updateColumnByFieldName={updateColumnByFieldName}
                                dragHandleProps={provided2.dragHandleProps}
                                isDraggable={true}
                                inputColor={'#D9DFF2'}
                                disabled={isGuest}
                                length={columns.length}
                                parentType={'columns'}
                              />
                            </div>
                          </div>
                        );
                      }}
                    </Draggable>
                  ))}
                </div>
              );
            }}
          </Droppable>
        </DragDropContext>
      </div>
    );
  },
);

export default JourneyMapColumns;
