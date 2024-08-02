import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';
import deepcopy from 'deepcopy';
import { useParams } from 'next/navigation';
import { useRecoilState } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import { useCreateJourneyMapColumnMutation } from '@/gql/mutations/generated/createJourneyMapColumn.generated';
import {
  DeleteMapColumnMutation,
  useDeleteMapColumnMutation,
} from '@/gql/mutations/generated/deleteMapColumn.generated';
import DragIcon from '@/public/base-icons/drag-icon.svg';
import PlusSignIcon from '@/public/operations/plus.svg';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { JOURNEY_MAP_LOADING_ROW } from '@/utils/constants/general';
import { JOURNEY_MAP_COLUM_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapColumnType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ChildRef {
  createNewColumn: () => void;
}

interface IDraggableItem {
  index: number;
  column: JourneyMapColumnType;
  updateColumnByFieldName: (data: {
    fieldName: string;
    value: string | number;
    columnId: number;
  }) => void;
  dragHandleProps?: any;
  isDraggable: boolean;
  inputColor: string;
  disabled: boolean;
  length?: number;
  parentType?: 'columns' | 'steps';
}

const DraggableItem = forwardRef<ChildRef, IDraggableItem>((props, ref) => {
  const {
    index,
    column,
    updateColumnByFieldName,
    dragHandleProps,
    isDraggable,
    inputColor,
    disabled,
    length,
    parentType,
  } = props;

  const queryClient = useQueryClient();
  const { mapID } = useParams();

  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);

  const [labelValue, setLabelValue] = useState<string>(column.label || '');

  const sectionRef = useRef<HTMLDivElement>(null);

  const { mutate: createColumn, isLoading: isLoadingCreateColumn } =
    useCreateJourneyMapColumnMutation({
      onSuccess: async () => {
        await updateJourneyMap();
      },
      onError: async () => {
        await updateJourneyMap();
      },
    });

  const { mutate: mutateDeleteMapColum } = useDeleteMapColumnMutation<
    DeleteMapColumnMutation,
    Error
  >({
    onSuccess: () => {
      setJourneyMap(prev => ({
        ...prev,
        rows: prev.rows.map(el => ({
          ...el,
          boxes: el.boxes?.filter(box => box.columnId !== column.id),
        })),
        columns: prev.columns.filter(el => el.id !== column.id),
      }));
    },
  });

  const updateJourneyMap = async () => {
    await Promise.all([
      queryClient.invalidateQueries(['GetJourneyMap']),
      queryClient.invalidateQueries(['GetJourneyMapRows.infinite']),
    ]);
  };

  const onHandleDelete = useCallback(() => {
    mutateDeleteMapColum({
      id: column.id,
    });
  }, [column.id, mutateDeleteMapColum]);

  const options = useMemo(() => {
    return JOURNEY_MAP_COLUM_OPTIONS({
      onHandleDelete,
    });
  }, [onHandleDelete]);

  const onHandleCreateJourneyMapColumn = (position?: number) => {
    const columnPosition = typeof position === 'number' ? position : index;
    const columns = deepcopy(journeyMap).columns;
    const rows = deepcopy(journeyMap).rows;
    let columnIndex = 0;

    journeyMap.columns.forEach((c, i) => {
      if (i < columnPosition) {
        columnIndex += c.size;
      }
    });

    rows.map(row => ({
      ...row,
      boxes: row.boxes?.splice(columnIndex, 0, JOURNEY_MAP_LOADING_ROW),
    }));
    columns.splice(columnPosition, 0, {
      id: 99999,
      label: '',
      size: 1,
      isLoading: true,
    });

    setJourneyMap(prev => ({
      ...prev,
      rows,
      columns,
    }));

    createColumn({
      createColumnInput: {
        index: columnPosition + 1,
        size: 1,
        mapId: +mapID!,
        label: 'Untitled',
        headerColor: 'white',
      },
    });
  };

  useImperativeHandle(ref, () => ({
    createNewColumn() {
      onHandleCreateJourneyMapColumn(0);
    },
  }));

  useEffect(() => {
    if (column?.label) {
      setLabelValue(column?.label);
    }
  }, [column?.label]);

  return (
    <>
      {column.isLoading ? (
        <div className={'column-draggable-item--loading'}>
          <div {...dragHandleProps} />
          <CustomLoader />
        </div>
      ) : (
        <div
          className={'column-draggable-item'}
          data-testid={`column-draggable-item-${column.id}-test-id`}>
          {isDraggable && (
            <div
              className={'column-draggable-item--drag-area'}
              {...dragHandleProps}
              onMouseDown={e => e.currentTarget.focus()}>
              <DragIcon />
            </div>
          )}

          {parentType === 'columns' && length && length <= 3 ? null : (
            <div className={'column-draggable-item--menu'}>
              <CustomLongMenu
                type={menuViewTypeEnum.VERTICAL}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                item={column}
                options={options}
                disabled={disabled}
                sxStyles={{
                  display: 'inline-block',
                  background: 'transparent',
                }}
              />
            </div>
          )}

          <div className="column-draggable-item--input-block" ref={sectionRef}>
            <div>
              <CustomInput
                id={String(column.id)}
                sxStyles={{
                  background: inputColor,
                  textAlign: 'center',
                  '& .Mui-focused': {
                    backgroundColor: 'white',
                  },
                  '& .MuiInputBase-input': {
                    padding: '0 40px 0 10px',
                    height: '32px',
                    fontWeight: '500',
                    color: '#1B3380',
                  },
                }}
                inputType={'secondary'}
                placeholder="text..."
                value={labelValue}
                disabled={disabled || column?.isDisabled}
                onBlur={() => {}}
                onFocus={() => {}}
                onChange={e => {
                  setLabelValue(e.target.value);
                  updateColumnByFieldName({
                    columnId: column.id,
                    fieldName: 'label',
                    value: e.target.value,
                  });
                }}
                onKeyDown={event => {
                  if (event.keyCode === 13) {
                    event.preventDefault();
                    (event.target as HTMLElement).blur();
                  }
                }}
              />
            </div>
            <div className="resize" />
          </div>
          <div className={'journey-map-column--new-column-button-block'}>
            <button
              aria-label={'plus'}
              className={'journey-map-column--new-column-button-block--button'}
              data-testid="add-column-btn-test-id"
              disabled={disabled || isLoadingCreateColumn}
              onClick={() => onHandleCreateJourneyMapColumn()}>
              <PlusSignIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

export default DraggableItem;
