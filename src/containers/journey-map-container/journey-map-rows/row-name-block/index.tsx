import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import RowActionsDrawer from '@/containers/journey-map-container/journey-map-rows/row-name-block/row-actions-drawer';
import {
  DeleteMapRowMutation,
  useDeleteMapRowMutation,
} from '@/gql/mutations/generated/deleteMapRow.generated';
import {
  UpdateJourneyMapRowMutation,
  useUpdateJourneyMapRowMutation,
} from '@/gql/mutations/generated/updateJourneyMapRow.generated';
import { MapRowTypeEnum } from '@/gql/types';
import DragIcon from '@/public/base-icons/drag-icon.svg';
import LockIcon from '@/public/base-icons/lock.svg';
import BottomArrowIcon from '@/public/base-icons/right-secondary-arrow.svg';
import { journeyMapRowsCountState, journeyMapState } from '@/store/atoms/journeyMap.atom';
import { mapOutcomesState } from '@/store/atoms/outcomeGroups.atom';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { JOURNEY_MAP_COLUM_ROW_OPTIONS } from '@/utils/constants/options';
import {
  ActionsEnum,
  JourneyMapRowActionEnum,
  menuViewTypeEnum,
} from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';
import { OutcomeGroupType } from '@/utils/ts/types/outcome/outcome-type';

interface IRowNameBlock {
  updateLabel: (data: { rowId: number; previousLabel: string; label: string }) => void;
  rowItem: JourneyMapRowType;
  index: number;
  rowsLength: number;
  disabled: boolean;
  dragHandleProps: any;
}

const RowNameBlock: FC<IRowNameBlock> = memo(
  ({ updateLabel, rowItem, index, rowsLength, disabled, dragHandleProps }) => {
    const { updateMapByType } = useUpdateMap();

    const setJourneyMap = useSetRecoilState(journeyMapState);
    const setJourneyMapRowsCount = useSetRecoilState(journeyMapRowsCountState);
    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);
    const setMapOutcomes = useSetRecoilState(mapOutcomesState);

    const [labelValue, setLabelValue] = useState<string>(rowItem?.label || '');

    const { mutate: mutateUpdateRow } = useUpdateJourneyMapRowMutation<
      UpdateJourneyMapRowMutation,
      Error
    >();

    const { mutate: mutateDeleteRow } = useDeleteMapRowMutation<DeleteMapRowMutation, Error>({
      onSuccess: () => {
        setJourneyMapRowsCount(prev => prev - 1);
        setJourneyMap(prev => ({
          ...prev,
          rows: prev.rows.filter(row => row.id !== rowItem.id),
        }));
      },
    });

    const onHandleDelete = useCallback(() => {
      if (rowItem.rowFunction === MapRowTypeEnum.Outcomes) {
        setMapOutcomes(prev => [...prev, rowItem.outcomeGroup as OutcomeGroupType]);
      }
      mutateDeleteRow({
        id: rowItem.id,
      });
    }, [mutateDeleteRow, rowItem.id, rowItem.outcomeGroup, rowItem.rowFunction, setMapOutcomes]);

    const onHandleLock = useCallback(() => {
      const data = {
        rowId: rowItem.id,
        isLocked: !rowItem.isLocked,
      };
      updateMapByType(JourneyMapRowActionEnum.ROW_DISABLE, ActionsEnum.UPDATE, data);
      setRedoActions([]);
      setUndoActions(prev => [
        ...prev,
        {
          id: uuidv4(),
          type: JourneyMapRowActionEnum.ROW_DISABLE,
          action: ActionsEnum.UPDATE,
          data,
        },
      ]);
      mutateUpdateRow({
        updateRowInput: data,
      });
    }, [
      mutateUpdateRow,
      rowItem.id,
      rowItem.isLocked,
      setRedoActions,
      setUndoActions,
      updateMapByType,
    ]);

    const onHandleCollapse = useCallback(() => {
      const data = {
        rowId: rowItem.id,
        isCollapsed: !rowItem.isCollapsed,
      };
      updateMapByType(JourneyMapRowActionEnum.ROW_COLLAPSE, ActionsEnum.UPDATE, data);
      setRedoActions([]);
      setUndoActions(prev => [
        ...prev,
        {
          id: uuidv4(),
          type: JourneyMapRowActionEnum.ROW_COLLAPSE,
          action: ActionsEnum.UPDATE,
          data,
        },
      ]);
      mutateUpdateRow({
        updateRowInput: data,
      });
    }, [
      mutateUpdateRow,
      rowItem.id,
      rowItem.isCollapsed,
      setRedoActions,
      setUndoActions,
      updateMapByType,
    ]);

    const rowOptions = useMemo(() => {
      return JOURNEY_MAP_COLUM_ROW_OPTIONS({
        isDisabled: rowItem.isLocked,
        onHandleDelete,
        onHandleLock,
      });
    }, [onHandleDelete, onHandleLock, rowItem.isLocked]);

    useEffect(() => {
      setLabelValue(rowItem?.label || '');
    }, [rowItem]);

    return (
      <>
        {rowItem.isLoading ? (
          <div className={'journey-map-row-name--loading'} data-testid="row-item-loading-test-id">
            <CustomLoader />
          </div>
        ) : (
          <>
            <div className={`journey-map-row-name--header`}>
              <button {...dragHandleProps} className={'journey-map-row-name--drag-area'}>
                {!rowItem.isLocked && (
                  <DragIcon
                    fill={'#545E6B'}
                    width={16}
                    height={16}
                    className={'journey-map-row-name--drag-area--icon'}
                  />
                )}
              </button>

              <>
                <CustomInput
                  sxStyles={{
                    width: '87px',
                    background: 'transparent',
                    '& .MuiInput-input': {
                      padding: '0',
                    },
                    '& .Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }}
                  id={(rowItem.rowFunction?.toLowerCase() || 'row-input') + '-input'}
                  inputType={'secondary'}
                  placeholder="search..."
                  value={labelValue}
                  disabled={disabled || rowItem?.isDisabled}
                  onBlur={() => {}}
                  onFocus={() => {}}
                  onChange={e => {
                    setLabelValue(e.target.value);
                    updateLabel({
                      rowId: rowItem?.id,
                      previousLabel: rowItem.label || '',
                      label: e.target.value,
                    });
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      (event.target as HTMLElement).blur();
                    }
                  }}
                />
                {rowItem.isLocked ? (
                  <div className={'journey-map-row-name--lock'}>
                    <LockIcon fill={'#545e6b'} />
                  </div>
                ) : (
                  <>
                    {rowItem.rowFunction === MapRowTypeEnum.Divider ? null : (
                      <Tooltip
                        placement="top"
                        title={rowItem.isCollapsed ? 'Uncollapse' : 'Collapse'}
                        arrow>
                        <button
                          aria-label={'arrow'}
                          className={`journey-map-row-name--collapse-btn ${
                            rowItem.isCollapsed
                              ? 'journey-map-row-name--collapse-open-btn'
                              : 'journey-map-row-name--collapse-close-btn'
                          }`}
                          onClick={onHandleCollapse}>
                          <BottomArrowIcon />
                        </button>
                      </Tooltip>
                    )}
                  </>
                )}
              </>

              <div className={'journey-map-row-name--menu'}>
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
                  item={rowItem}
                  options={rowOptions}
                  disabled={disabled}
                  sxStyles={{
                    display: 'inline-block',
                    background: 'transparent',
                  }}
                />
              </div>
            </div>
            {index === 1 && (
              <div className={'first-long-menu'}>
                <RowActionsDrawer index={index} />
              </div>
            )}
            {index > 1 && <RowActionsDrawer index={index} />}
            {index === rowsLength && (
              <div className={'last-long-menu'}>
                <RowActionsDrawer index={index + 1} />
              </div>
            )}
          </>
        )}
      </>
    );
  },
);

export default RowNameBlock;
