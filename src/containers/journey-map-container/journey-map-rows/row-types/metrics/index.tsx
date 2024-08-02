import React, { FC, useCallback, useState } from 'react';

import './style.scss';

import Drawer from '@mui/material/Drawer';
import { Draggable, Droppable } from 'react-beautiful-dnd';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CardFlip from '@/components/templates/card-flip';
import ErrorBoundary from '@/components/templates/error-boundary';
import MapItemBackCard from '@/components/templates/map-item-back-card';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import AddRowBoxElementBtn from '@/containers/journey-map-container/journey-map-rows/add-row-box-element-btn';
import CreateUpdateMetricsDrawer from '@/containers/journey-map-container/journey-map-rows/row-types/metrics/create-update-metrics-drawer';
import MetricsCard from '@/containers/journey-map-container/journey-map-rows/row-types/metrics/metrics-card';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType, MetricsType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IMetrics {
  width: number;
  row: JourneyMapRowType;
  rowIndex: number;
  disabled: boolean;
}

const Metrics: FC<IMetrics> = ({ width, row, rowIndex, disabled }) => {
  const { updateMapByType } = useUpdateMap();

  const [isOpenCreateMetricsDrawer, setIsOpenCreateMetricsDrawer] = useState<boolean>(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [selectedMetrics, setSelectedMetrics] = useState<MetricsType | null>(null);

  const onHandleToggleCreateMetricsDrawer = useCallback(
    (columnId?: number, stepId?: number, metrics?: MetricsType) => {
      setSelectedColumnId(columnId || null);
      setSelectedMetrics(metrics || null);
      setSelectedStepId(stepId || null);
      setIsOpenCreateMetricsDrawer(prev => !prev);
    },
    [],
  );

  const onHandleUpdateMapByType = useCallback(
    (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => {
      updateMapByType(type, action, data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={'journey-map-metrics'} data-testid={`metrics-row-${row.id}-test-id`}>
      <Drawer
        anchor={'left'}
        open={isOpenCreateMetricsDrawer}
        onClose={() => onHandleToggleCreateMetricsDrawer()}>
        <CreateUpdateMetricsDrawer
          rowItemID={row.id}
          selectedColumnId={selectedColumnId!}
          selectedStepId={selectedStepId!}
          selectedMetrics={selectedMetrics}
          onHandleCloseDrawer={onHandleToggleCreateMetricsDrawer}
        />
      </Drawer>

      {row?.boxes?.map((rowItem, boxIndex) => (
        <React.Fragment
          key={`${JourneyMapRowActionEnum.METRICS}*${rowIndex}*${String(row.id)}*${boxIndex}`}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'}>
              <CustomLoader />
            </div>
          ) : (
            <Droppable
              droppableId={`${JourneyMapRowActionEnum.METRICS}*${rowIndex}*${String(
                row.id,
              )}*${boxIndex}*${rowItem.step.id}`}
              key={`${JourneyMapRowActionEnum.METRICS}*${rowIndex}*${String(row.id)}*${boxIndex}`}
              type={JourneyMapRowActionEnum.METRICS}>
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={'journey-map-metrics--column'}
                  data-testid={`metrics-column-${boxIndex}-test-id`}
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                  }}>
                  <div className={'journey-map-metrics--column--item map-item'}>
                    {rowItem?.metrics?.map((metrics, metricsIndex: number) => {
                      return (
                        <Draggable
                          key={
                            metrics?.id + '_' + metricsIndex + '_' + JourneyMapRowActionEnum.METRICS
                          }
                          draggableId={String(metrics?.id) + '_' + JourneyMapRowActionEnum.METRICS}
                          index={metricsIndex}
                          isDragDisabled={disabled}>
                          {provided2 => {
                            return (
                              <div
                                {...provided2.draggableProps}
                                className={'journey-map-metrics--card'}
                                ref={provided2.innerRef}>
                                <CardFlip
                                  frontCard={
                                    <ErrorBoundary>
                                      <MetricsCard
                                        metrics={metrics}
                                        rowItem={rowItem}
                                        disabled={disabled}
                                        dragHandleProps={provided2.dragHandleProps!}
                                        onHandleToggleCreateMetricsDrawer={
                                          onHandleToggleCreateMetricsDrawer
                                        }
                                        onHandleUpdateMapByType={onHandleUpdateMapByType}
                                      />
                                    </ErrorBoundary>
                                  }
                                  backCard={
                                    <MapItemBackCard
                                      className={`journey-map-metrics--back-card`}
                                      annotationValue={metrics.flippedText}
                                      rowId={row.id}
                                      stepId={rowItem.step.id}
                                      itemId={metrics.id}
                                      itemKey={'metrics'}
                                    />
                                  }
                                />
                              </div>
                            );
                          }}
                        </Draggable>
                      );
                    })}

                    <AddRowBoxElementBtn
                      itemsLength={rowItem?.metrics.length}
                      label={row?.label?.toLowerCase() || ''}
                      boxIndex={boxIndex}
                      handleClick={() => {
                        onHandleToggleCreateMetricsDrawer(rowItem.columnId, rowItem.step.id);
                      }}
                    />
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Metrics;
