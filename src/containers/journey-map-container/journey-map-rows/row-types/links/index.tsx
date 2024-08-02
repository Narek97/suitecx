import React, { FC, useCallback, useState } from 'react';

import { Draggable, Droppable } from 'react-beautiful-dnd';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CardFlip from '@/components/templates/card-flip';
import ErrorBoundary from '@/components/templates/error-boundary';
import MapItemBackCard from '@/components/templates/map-item-back-card';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import AddRowBoxElementBtn from '@/containers/journey-map-container/journey-map-rows/add-row-box-element-btn';
import CreateUpdateLinkModal from '@/containers/journey-map-container/journey-map-rows/row-types/links/create-update-link-modal';
import LinkItem from '@/containers/journey-map-container/journey-map-rows/row-types/links/link-item';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';
import { LinkType } from '@/utils/ts/types/link/link-type';

interface ILinks {
  width: number;
  row: JourneyMapRowType;
  rowIndex: number;
  disabled: boolean;
}

const Links: FC<ILinks> = ({ width, row, rowIndex, disabled }) => {
  const { updateMapByType } = useUpdateMap();

  const [isOpenCreateUpdateLinkModal, setIsOpenCreateUpdateLinkModal] = useState<boolean>(false);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);

  const onHandleToggleCreateUpdateModal = useCallback((stepId?: number, link?: LinkType) => {
    setSelectedStepId(stepId || null);
    setSelectedLink(link || null);
    setIsOpenCreateUpdateLinkModal(prev => !prev);
  }, []);

  const onHandleUpdateMapByType = useCallback(
    (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => {
      updateMapByType(type, action, data);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={'journey-map-links'} data-testid={`links-row-${row.id}-test-id`}>
      {isOpenCreateUpdateLinkModal && (
        <CreateUpdateLinkModal
          selectedRowId={row.id}
          selectedStepId={selectedStepId!}
          link={selectedLink}
          isOpen={isOpenCreateUpdateLinkModal}
          handleClose={onHandleToggleCreateUpdateModal}
        />
      )}
      {row?.boxes?.map((rowItem, boxIndex) => (
        <React.Fragment
          key={`${JourneyMapRowActionEnum.LINKS}*${rowIndex}*${String(row.id)}*${boxIndex}`}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'}>
              <CustomLoader />
            </div>
          ) : (
            <Droppable
              droppableId={`${JourneyMapRowActionEnum.LINKS}*${rowIndex}*${String(
                row.id,
              )}*${boxIndex}*${rowItem.step.id}`}
              key={`${JourneyMapRowActionEnum.LINKS}*${rowIndex}*${String(row.id)}*${boxIndex}`}
              type={JourneyMapRowActionEnum.LINKS}>
              {provided => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={'journey-map-links--column'}
                  data-testid={`links-column-${boxIndex}-test-id`}
                  style={{
                    width: `${width}px`,
                    minWidth: `${width}px`,
                  }}>
                  <div className={'journey-map-links--column--item map-item'}>
                    {rowItem?.links?.map((link, linkIndex: number) => {
                      return (
                        <Draggable
                          key={link?.id + '_' + linkIndex + '_' + JourneyMapRowActionEnum.LINKS}
                          draggableId={String(link?.id) + '_' + JourneyMapRowActionEnum.LINKS}
                          index={linkIndex}>
                          {provided2 => {
                            return (
                              <div
                                {...provided2.draggableProps}
                                className={'journey-map-links--card'}
                                ref={provided2.innerRef}>
                                <CardFlip
                                  frontCard={
                                    <ErrorBoundary>
                                      <LinkItem
                                        link={link}
                                        rowItem={rowItem}
                                        disabled={disabled}
                                        dragHandleProps={provided2.dragHandleProps!}
                                        onHandleToggleCreateUpdateModal={
                                          onHandleToggleCreateUpdateModal
                                        }
                                        onHandleUpdateMapByType={onHandleUpdateMapByType}
                                      />
                                    </ErrorBoundary>
                                  }
                                  backCard={
                                    <MapItemBackCard
                                      className={`journey-map-links--back-card`}
                                      annotationValue={link.flippedText}
                                      rowId={row.id}
                                      stepId={rowItem.step.id}
                                      itemId={link.id}
                                      itemKey={'links'}
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
                      itemsLength={rowItem?.links.length}
                      label={row?.label?.toLowerCase() || ''}
                      boxIndex={boxIndex}
                      handleClick={() => {
                        onHandleToggleCreateUpdateModal(rowItem.step.id);
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

export default Links;
