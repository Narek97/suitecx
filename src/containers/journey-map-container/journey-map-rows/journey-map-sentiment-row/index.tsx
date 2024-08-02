import React, { FC, useCallback, useMemo, useState } from 'react';

import './style.scss';

import deepcopy from 'deepcopy';
import { useRecoilState, useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import JourneyMapSelectedPersonas from '@/containers/journey-map-container/journey-map-rows/journey-map-selected-personas';
import RowNameBlock from '@/containers/journey-map-container/journey-map-rows/row-name-block';
import Sentiment from '@/containers/journey-map-container/journey-map-rows/row-types/sentiment';
import { useDisablePersonaForRowMutation } from '@/gql/mutations/generated/disablePersonaForRow.generated';
import OverviewIcon from '@/public/base-icons/overview.svg';
import { isElementDraggingState } from '@/store/atoms/isElementDragging.atom';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { EMOTION_TYPES, EMOTION_VALUES } from '@/utils/constants/sentiment';
import { SelectedPersonasViewModeEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import {
  JourneyMapRowType,
  SentimentBoxType,
} from '@/utils/ts/types/journey-map/journey-map-types';

interface IJourneyMapSentimentRow {
  dragHandleProps: any;
  rowItem: JourneyMapRowType;
  index: number;
  rowsLength: number;
  disabled: boolean;
  updateLabel: (data: { rowId: number; previousLabel: string; label: string }) => void;
}

const JourneyMapSentimentRow: FC<IJourneyMapSentimentRow> = ({
  dragHandleProps,
  updateLabel,
  rowItem,
  index,
  rowsLength,
  disabled,
}) => {
  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);
  const isElementDragging = useRecoilValue(isElementDraggingState);

  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const { mutate: toggleDisablePersona } = useDisablePersonaForRowMutation();

  const toggleSelectAverage = () => {
    const isDisabled = !rowItem.isPersonaAverageDisabled;
    toggleDisablePersona({
      disablePersonaInput: {
        rowId: rowItem.id,
        disableAverage: isDisabled,
      },
    });
    const journeyMapCopy = deepcopy(journeyMap);
    let currentRow = journeyMapCopy.rows.find(row => row?.id === rowItem?.id);
    if (currentRow) {
      currentRow.isPersonaAverageDisabled = isDisabled;
      setJourneyMap(journeyMapCopy);
    }
  };

  const handleSelectJourneyMapFooter = useCallback(
    (id: number) => {
      const journeyMapCopy = deepcopy(journeyMap);
      const currentRow = journeyMapCopy.rows.find(row => row?.id === rowItem?.id);

      currentRow?.rowWithPersonas.forEach(itm => {
        if (itm?.id === id) {
          let isDisabled = !!itm?.isDisabledForThisRow;
          itm.isDisabledForThisRow = !isDisabled;
          toggleDisablePersona({
            disablePersonaInput: {
              rowId: rowItem.id,
              disablePersonaForRowInput: {
                id,
                disable: !isDisabled,
              },
            },
          });
        }
      });
      setJourneyMap(journeyMapCopy);
    },
    [journeyMap, rowItem.id, setJourneyMap, toggleDisablePersona],
  );

  const sentimentData = useMemo(() => {
    setLoadingIndex(null);
    let newData: SentimentBoxType[] = [];
    rowItem?.boxes?.forEach((box, boxIndex) => {
      let averageDetails: ObjectKeysType = {};
      if (box.isLoading) {
        setLoadingIndex(boxIndex);
      }
      let currentItem: any = {};
      EMOTION_TYPES.forEach(emotion => {
        currentItem[emotion] = [];
      });
      rowItem?.rowWithPersonas?.forEach(personaItem => {
        const emotion =
          (personaItem?.personaStates && personaItem?.personaStates[boxIndex]?.state) || 'NEUTRAL'; // HAPPY // VERY HAPPY // SAD
        averageDetails[personaItem.id] = !personaItem.isDisabledForThisRow
          ? EMOTION_VALUES[emotion]
          : 1;
        if (!personaItem?.isDisabledForThisRow) {
          currentItem[emotion] = [
            ...(currentItem[emotion] || {}),
            {
              ...(personaItem.personaStates ? personaItem.personaStates[boxIndex] : {}),
              stepId: box?.step?.id,
              personaId: personaItem?.id,
              isDraggable: !personaItem?.isDisabledForSocket,
              isDisabled: personaItem?.isDisabledForSocket,
              color: personaItem.color,
              text: personaItem?.name + ', ' + personaItem?.type?.toLowerCase(),
            },
          ];
        }
      });
      currentItem.id = box?.step?.id;
      currentItem.average = box.average;
      currentItem.averageDetails = averageDetails;
      newData.push(currentItem);
    });
    return newData;
  }, [rowItem]);

  return (
    <div
      className={`journey-map-sentiment ${
        rowItem.isCollapsed ? 'journey-map-sentiment-collapsed' : ''
      } ${rowItem.isLocked ? 'journey-map-sentiment-locked' : ''}`}>
      <div
        onMouseDown={e => e.currentTarget.focus()}
        className={'journey-map-sentiment--item'}
        data-testid="journey-map-sentiment-test-id">
        <RowNameBlock
          rowItem={rowItem}
          index={index}
          updateLabel={updateLabel}
          rowsLength={rowsLength}
          disabled={disabled}
          dragHandleProps={dragHandleProps}
        />

        {!isElementDragging && !rowItem.isCollapsed && (
          <div className={'journey-map-sentiment--personas-block map-item'}>
            <button
              disabled={disabled}
              className={`journey-map-sentiment--personas-block--glob ${
                rowItem?.isPersonaAverageDisabled ? 'disabled-mode' : ''
              }`}
              onClick={toggleSelectAverage}
              aria-label={'Overview'}>
              <OverviewIcon />
            </button>

            <JourneyMapSelectedPersonas
              viewMode={SelectedPersonasViewModeEnum.SENTIMENT}
              showFullItems={true}
              disabled={disabled}
              updatePersonas={handleSelectJourneyMapFooter}
              personas={rowItem?.rowWithPersonas}
              showActives={true}
            />
          </div>
        )}

        <div
          {...dragHandleProps}
          className={'journey-map--drag-area journey-map--sentiment-drag-area'}
        />
      </div>

      {rowItem.isLoading ? (
        <div className={'journey-map-row--loading-block'}>
          {rowItem?.boxes?.map((_, skeletonIndex) => (
            <div className={'journey-map-row--loading'} key={'skeleton_' + skeletonIndex}>
              <CustomLoader />
            </div>
          ))}
        </div>
      ) : (
        <div className={'journey-map-sentiment--konva-block map-item'}>
          {loadingIndex !== null && (
            <div className={'journey-map-sentiment--loading'} style={{ left: loadingIndex * 280 }}>
              <div className={'journey-map-row--loading'}>
                <CustomLoader />
              </div>
            </div>
          )}
          <Sentiment
            sentimentData={sentimentData}
            width={280}
            personasCount={rowItem.rowWithPersonas.filter(itm => !itm.isDisabledForThisRow).length}
            columnsCount={rowItem?.boxes?.length!}
            rowId={rowItem?.id}
            isAverageActive={!rowItem.isPersonaAverageDisabled}
            disabled={disabled}
            rowIndex={index}
            isCollapsed={rowItem.isCollapsed}
          />
        </div>
      )}
    </div>
  );
};

export default JourneyMapSentimentRow;
