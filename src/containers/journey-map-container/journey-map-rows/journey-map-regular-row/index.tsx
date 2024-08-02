import React, { FC, memo } from 'react';

import './style.scss';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import ErrorBoundary from '@/components/templates/error-boundary';
import RowNameBlock from '@/containers/journey-map-container/journey-map-rows/row-name-block';
import Divider from '@/containers/journey-map-container/journey-map-rows/row-types/divider';
import Links from '@/containers/journey-map-container/journey-map-rows/row-types/links';
import Metrics from '@/containers/journey-map-container/journey-map-rows/row-types/metrics';
import Outcomes from '@/containers/journey-map-container/journey-map-rows/row-types/outcomes';
import RowImages from '@/containers/journey-map-container/journey-map-rows/row-types/row-images';
import RowTextFields from '@/containers/journey-map-container/journey-map-rows/row-types/row-text-fields';
import Touchpoints from '@/containers/journey-map-container/journey-map-rows/row-types/touchpoints';
import { MapRowTypeEnum } from '@/gql/types';
import { getPageContentByKey } from '@/utils/helpers/get-page-content-by-key';
import { JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IJourneyMapRow {
  updateLabel: (data: { rowId: number; previousLabel: string; label: string }) => void;
  dragHandleProps: any;
  rowItem: JourneyMapRowType;
  index: number;
  rowsLength: number;
  disabled: boolean;
}

const JourneyMapRegularRow: FC<IJourneyMapRow> = memo(
  ({ dragHandleProps, updateLabel, rowItem, index, rowsLength, disabled }) => {
    return (
      <div
        className={`journey-map-row ${rowItem.isCollapsed ? 'journey-map-row-collapsed' : ''} ${
          rowItem.isLocked ? 'journey-map-row-locked' : ''
        }`}>
        <div
          onMouseDown={e => e.currentTarget.focus()}
          className={'journey-map-row--name-block'}
          data-testid="journey-map-row-test-id"
          style={{
            maxHeight: `${rowItem.rowFunction === MapRowTypeEnum.Divider ? '32px' : 'auto'}`,
          }}>
          <RowNameBlock
            rowItem={rowItem}
            index={index}
            updateLabel={updateLabel}
            rowsLength={rowsLength}
            disabled={disabled}
            dragHandleProps={dragHandleProps}
          />
        </div>

        {rowItem.isLoading ? (
          <div className={'journey-map-row--loading-block'} data-testid="row-loading-test-id">
            {rowItem?.boxes?.map((_, i) => (
              <div className={'journey-map-row--loading'} key={i}>
                <CustomLoader />
              </div>
            ))}
          </div>
        ) : (
          getPageContentByKey({
            content: {
              [JourneyMapRowActionEnum.IMAGE]: (
                <ErrorBoundary>{<RowImages row={rowItem} disabled={disabled} />}</ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.DIVIDER]: (
                <ErrorBoundary>
                  <Divider row={rowItem} />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.PROS]: (
                <ErrorBoundary>
                  <RowTextFields
                    isDraggable={true}
                    type={JourneyMapRowActionEnum.PROS}
                    width={280}
                    rowIndex={index}
                    row={rowItem}
                    headerColor={'#a1cdb7'}
                    bodyColor={'#b3e4ca'}
                    disabled={disabled}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.CONS]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.CONS}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e5c1c4'}
                    bodyColor={'#fed7da'}
                    disabled={disabled}
                    isDraggable={true}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.INTERACTIONS]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.INTERACTIONS}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e9ebf2'}
                    bodyColor={'#f5f7ff'}
                    disabled={disabled}
                    isDraggable={true}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.LIST_ITEM]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.LIST_ITEM}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e9ebf2'}
                    bodyColor={'#f5f7ff'}
                    disabled={disabled}
                    isDraggable={true}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.INSIGHTS]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.INSIGHTS}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e9ebf2'}
                    bodyColor={'#f5f7ff'}
                    disabled={disabled}
                    isDraggable={false}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.OPPORTUNITIES]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.OPPORTUNITIES}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e9ebf2'}
                    bodyColor={'#f5f7ff'}
                    disabled={disabled}
                    isDraggable={false}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.TEXT]: (
                <ErrorBoundary>
                  <RowTextFields
                    type={JourneyMapRowActionEnum.TEXT}
                    row={rowItem}
                    width={280}
                    rowIndex={index}
                    headerColor={'#e9ebf2'}
                    bodyColor={'#f5f7ff'}
                    disabled={disabled}
                    isDraggable={false}
                  />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.TOUCHPOINTS]: (
                <ErrorBoundary>
                  <Touchpoints width={280} row={rowItem} rowIndex={index} disabled={disabled} />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.METRICS]: (
                <ErrorBoundary>
                  <Metrics width={280} row={rowItem} rowIndex={index} disabled={disabled} />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.OUTCOMES]: (
                <ErrorBoundary>
                  <Outcomes width={280} row={rowItem} rowIndex={index} disabled={disabled} />
                </ErrorBoundary>
              ),
              [JourneyMapRowActionEnum.LINKS]: (
                <ErrorBoundary>
                  <Links width={280} row={rowItem} rowIndex={index} disabled={disabled} />
                </ErrorBoundary>
              ),
            },
            key: rowItem?.rowFunction!,
            defaultPage: <></>,
          })
        )}
      </div>
    );
  },
);

export default JourneyMapRegularRow;
