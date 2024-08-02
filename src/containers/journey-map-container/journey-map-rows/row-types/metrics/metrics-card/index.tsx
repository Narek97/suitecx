import React, { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import { Skeleton, Tooltip } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CardHeader from '@/containers/journey-map-container/journey-map-rows/card-header';
import { useDeleteMetricsMutation } from '@/gql/mutations/generated/deleteMetrics.generated';
import {
  CommentAndNoteModelsEnum,
  MetricsDateRangeEnum,
  MetricsSourceEnum,
  MetricsTypeEnum,
} from '@/gql/types';
import BottomArrowIcon from '@/public/base-icons/bottom-arrow.svg';
import CalendarIcon from '@/public/base-icons/calendar.svg';
import InfoIcon from '@/public/base-icons/info.svg';
import GoalIcon from '@/public/journey-map/goal.svg';
import MetricsIcon from '@/public/journey-map/metrics.svg';
import ScoreIcon from '@/public/journey-map/score.svg';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { userState } from '@/store/atoms/user.atom';
import { JOURNEY_MAP_METRICS_OPTIONS } from '@/utils/constants/options';
import { getCurrentAndPreviousWeekDates } from '@/utils/helpers/get-current-and-previous-week-dates';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { BoxItemType, MetricsType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IMetricsCard {
  metrics: MetricsType;
  disabled: boolean;
  rowItem: BoxItemType;
  dragHandleProps: ObjectKeysType;
  onHandleToggleCreateMetricsDrawer: (
    columnId?: number,
    stepId?: number,
    metrics?: MetricsType,
  ) => void;
  onHandleUpdateMapByType: (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => void;
}

const MetricsCard: FC<IMetricsCard> = memo(
  ({
    metrics,
    disabled,
    rowItem,
    dragHandleProps,
    onHandleToggleCreateMetricsDrawer,
    onHandleUpdateMapByType,
  }) => {
    const user = useRecoilValue(userState);
    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);

    const [isOpenNote, setIsOpenNote] = useState<boolean>(false);
    const [answers, setAnswers] = useState<
      Array<{ count: number; percentage: number; title: string }>
    >([]);
    const [pastAnswers, setPastAnswers] = useState<
      Array<{ count: number; percentage: number; title: string }>
    >([]);
    const [isAnswersLoading, setIsAnswersLoading] = useState<boolean>(false);
    const [isPastAnswersLoading, setIsPastAnswersLoading] = useState<boolean>(false);

    const getMetricsValue = () => {
      switch (metrics.type) {
        case MetricsTypeEnum.Nps: {
          return metrics?.nps || answers[0]?.percentage - answers[2]?.percentage || 0;
        }
        case MetricsTypeEnum.Csat: {
          return metrics?.csat || answers[0]?.percentage || 0;
        }
        case MetricsTypeEnum.Ces: {
          return metrics?.ces || 0;
        }
        default: {
          return 0;
        }
      }
    };

    const getPastMetricsValue = () => {
      switch (metrics.type) {
        case MetricsTypeEnum.Nps: {
          return pastAnswers[0]?.percentage - pastAnswers[2]?.percentage || 0;
        }
        case MetricsTypeEnum.Csat: {
          return pastAnswers[0]?.percentage || 0;
        }
        default: {
          return 0;
        }
      }
    };

    const metricsValue = getMetricsValue();
    const pastMetricsValue = getPastMetricsValue();

    const metricsAverage =
      metrics.source === MetricsSourceEnum.Survey
        ? metricsValue - pastMetricsValue
        : metrics.overall;

    const { mutate: removeBoxMetrics, isLoading: isLoadingCreateMetrics } =
      useDeleteMetricsMutation({
        onSuccess: () => {
          const data = {
            ...metrics,
            stepId: rowItem.step.id,
          };

          onHandleUpdateMapByType(JourneyMapRowActionEnum.METRICS, ActionsEnum.DELETE, data);
          setRedoActions([]);
          setUndoActions(undoPrev => [
            ...undoPrev,
            {
              id: uuidv4(),
              type: JourneyMapRowActionEnum.METRICS,
              action: ActionsEnum.CREATE,
              data,
            },
          ]);
        },
      });

    const getMetricsAnalytics = useCallback(
      async (startDate: string | null = null, endDate: string | null = null) => {
        setIsAnswersLoading(true);
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_QP_API}/surveys/${metrics.surveyId}/questions/${metrics.questionId}/analytics`,
          {
            startDate,
            endDate,
          },
          {
            headers: {
              'api-key': user.primaryUserAPIKey,
            },
          },
        );
        return res.data.response;
      },
      [metrics.questionId, metrics.surveyId, user.primaryUserAPIKey],
    );

    const calcMetricsStartAndEndDate = useCallback(
      (type: MetricsDateRangeEnum) => {
        const { current, previous } = getCurrentAndPreviousWeekDates();
        switch (type) {
          case MetricsDateRangeEnum.Daily: {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            return {
              startDate: dayjs(today)?.format('YYYY-MM-DD'),
              endDate: dayjs(today)?.format('YYYY-MM-DD'),
              prevStartDate: dayjs(yesterday)?.format('YYYY-MM-DD'),
              prevEndDate: dayjs(yesterday)?.format('YYYY-MM-DD'),
            };
          }
          case MetricsDateRangeEnum.Weekly: {
            return {
              startDate: dayjs(current.start)?.format('YYYY-MM-DD'),
              endDate: dayjs(current.end)?.format('YYYY-MM-DD'),
              prevStartDate: dayjs(previous.start)?.format('YYYY-MM-DD'),
              prevEndDate: dayjs(previous.end)?.format('YYYY-MM-DD'),
            };
          }
          case MetricsDateRangeEnum.Monthly: {
            return {
              startDate: dayjs(current.startMonth)?.format('YYYY-MM-DD'),
              endDate: dayjs(current.endMonth)?.format('YYYY-MM-DD'),
              prevStartDate: dayjs(previous.startMonth)?.format('YYYY-MM-DD'),
              prevEndDate: dayjs(previous.endMonth)?.format('YYYY-MM-DD'),
            };
          }
          case MetricsDateRangeEnum.Yearly: {
            return {
              startDate: dayjs(current.startYear)?.format('YYYY-MM-DD'),
              endDate: dayjs(current.endYear)?.format('YYYY-MM-DD'),
              prevStartDate: dayjs(previous.startYear)?.format('YYYY-MM-DD'),
              prevEndDate: dayjs(previous.endYear)?.format('YYYY-MM-DD'),
            };
          }
          case MetricsDateRangeEnum.Custom: {
            return {
              startDate: metrics.startDate ? dayjs(metrics.startDate)?.format('YYYY-MM-DD') : null,
              endDate: metrics.endDate ? dayjs(metrics.endDate)?.format('YYYY-MM-DD') : null,
              prevStartDate: metrics.startDate
                ? dayjs(metrics.startDate)?.format('YYYY-MM-DD')
                : null,
              prevEndDate: metrics.endDate ? dayjs(metrics.endDate)?.format('YYYY-MM-DD') : null,
            };
          }
          default: {
            return {
              startDate: null,
              endDate: null,
              prevStartDate: null,
              prevEndDate: null,
            };
          }
        }
      },
      [metrics.endDate, metrics.startDate],
    );

    const getMetricsChartWidth = (index: number) => {
      if (metrics.source === MetricsSourceEnum.Manual) {
        if (index === 2) {
          return metrics.x + '%';
        }
        if (index === 1) {
          return metrics.y + '%';
        }
        if (index === 0) {
          return metrics.z + '%';
        }
      } else {
        return answers[index]?.percentage + '%';
      }
    };

    const getGoalPosition = (index: number) => {
      let subKey = 0;
      let left = 0;
      switch (true) {
        case metrics.goal <= 60: {
          subKey = 2;
          left = (metrics.goal * 100) / 60;
          break;
        }
        case metrics.goal <= 80: {
          subKey = 0;
          left = (metrics.goal * 100) / 80;
          break;
        }
        case metrics.goal <= 100: {
          subKey = 1;
          left = (metrics.goal * 100) / 100;
          break;
        }
      }

      if (index !== subKey) {
        return null;
      }

      return (
        <div
          className={'metrics-item--goal-icon'}
          style={{
            left: `calc(${left}% - 4px)`,
          }}>
          <GoalIcon />
        </div>
      );
    };

    const getScorePosition = (index: number) => {
      let subKey = 0;
      let left = 0;

      switch (true) {
        case metricsValue < 60: {
          subKey = 2;
          left = 50 + metricsValue / 2;
          break;
        }
        case metricsValue >= 60 && metricsValue <= 80: {
          subKey = 0;
          left = ((metricsValue - 60) * 100) / 20;
          break;
        }
        case metricsValue <= 100: {
          subKey = 1;
          left = ((metricsValue - 80) * 100) / 20;
          break;
        }
      }

      if (index !== subKey) {
        return null;
      }

      return (
        <div
          className={'metrics-item--score-icon'}
          style={{
            left: `calc(${left}% - 4px)`,
          }}>
          <ScoreIcon />
        </div>
      );
    };

    const getCurrentDateRange = (range: MetricsDateRangeEnum | null) => {
      switch (range) {
        case MetricsDateRangeEnum.Daily: {
          const today = new Date();
          const yesterday = new Date(today);
          return dayjs(yesterday.setDate(today.getDate() - 1)).format('MMM D');
        }
        case MetricsDateRangeEnum.Weekly: {
          const now: Date = new Date();
          const startOfYear: Date = new Date(now.getFullYear(), 0, 0);
          const diff: number = now.getTime() - startOfYear.getTime();
          const oneWeek: number = 1000 * 60 * 60 * 24 * 7;
          return `Week ${Math.floor(diff / oneWeek)}`;
        }
        case MetricsDateRangeEnum.Monthly: {
          return dayjs().subtract(1, 'month').format('MMM');
        }
        case MetricsDateRangeEnum.Yearly: {
          return dayjs().subtract(1, 'year').year();
        }
      }
    };

    const onHandleEditMetricsItem = useCallback(() => {
      onHandleToggleCreateMetricsDrawer(rowItem.columnId, rowItem.step.id, metrics);
    }, [metrics, onHandleToggleCreateMetricsDrawer, rowItem.columnId, rowItem.step.id]);

    const onHandleDeleteMetricsItem = useCallback(() => {
      removeBoxMetrics({
        id: metrics.id,
      });
    }, [metrics, removeBoxMetrics]);

    const onHandleToggleNote = useCallback(() => {
      setIsOpenNote(prev => !prev);
    }, []);

    const options = useMemo(() => {
      return JOURNEY_MAP_METRICS_OPTIONS({
        onHandleEdit: onHandleEditMetricsItem,
        onHandleDelete: onHandleDeleteMetricsItem,
      });
    }, [onHandleDeleteMetricsItem, onHandleEditMetricsItem]);

    const commentRelatedData = {
      title: rowItem?.boxTextElement?.text || '',
      itemId: metrics.id,
      rowId: metrics.rowId,
      columnId: rowItem.columnId!,
      stepId: rowItem.step.id,
      type: CommentAndNoteModelsEnum.Metrics,
    };

    useEffect(() => {
      if (metrics.source === MetricsSourceEnum.Survey) {
        const { startDate, endDate, prevStartDate, prevEndDate } = calcMetricsStartAndEndDate(
          metrics.dateRange || MetricsDateRangeEnum.Daily,
        );

        getMetricsAnalytics(startDate, endDate)
          .then(response => {
            setAnswers(response.questions?.at(0).answers || []);
          })
          .finally(() => {
            setIsAnswersLoading(false);
          });
        getMetricsAnalytics(prevStartDate, prevEndDate)
          .then(response => {
            setPastAnswers(response.questions?.at(0).answers || []);
          })
          .finally(() => {
            setIsPastAnswersLoading(false);
          });
      }
    }, [calcMetricsStartAndEndDate, getMetricsAnalytics, metrics.dateRange, metrics.source]);

    return (
      <div className={'metrics-item'} data-testid={'metrics-card-test-id'}>
        <div className={`${isLoadingCreateMetrics ? 'metrics-item--loading' : ''}`} />

        <CardHeader
          icon={<MetricsIcon />}
          isShowPerson={!!metrics.persona}
          persona={{
            name: metrics.persona?.name || '',
            url: metrics.persona?.attachment?.url || '',
            key: metrics.persona?.attachment?.key || '',
          }}
          isShowNote={isOpenNote}
          note={{
            id: metrics.id,
            type: CommentAndNoteModelsEnum.Metrics,
            rowId: metrics.rowId,
            stepId: rowItem?.step.id,
            onHandleOpenNote: onHandleToggleNote,
            onClickAway: onHandleToggleNote,
          }}
          comment={{
            count: metrics?.commentsCount,
            item: commentRelatedData,
          }}
          menu={{
            item: commentRelatedData,
            options,
            disabled,
          }}
          dragHandleProps={dragHandleProps}
        />

        <div className={'metrics-item--content'}>
          <div className={'metrics-item--title-description-block'}>
            <p className={'metrics-item--title'}>
              <span>{metrics.name}</span>
            </p>

            {metrics.description && metrics.descriptionEnabled && (
              <Tooltip title={metrics.description} placement="right" arrow>
                <div className={'metrics-item--description'}>
                  <InfoIcon />
                </div>
              </Tooltip>
            )}
          </div>

          <div className={'metrics-item--goal-score-block'}>
            <div className={'metrics-item--score'}>
              <ScoreIcon />
              <p>{metrics.type}:</p>
              <span>{metricsValue ? metricsValue.toFixed(2) : metricsValue}</span>
            </div>

            <div className={'metrics-item--goal'}>
              <GoalIcon />
              <p>Goal:</p> <span>{metrics.goal}</span>
            </div>
          </div>

          <>
            {isAnswersLoading ? (
              <Skeleton />
            ) : (
              <>
                <div className={'metrics-item--score-block'}>
                  <div
                    className={'metrics-item--score-item'}
                    style={{
                      minWidth: getMetricsChartWidth(2),
                    }}>
                    {metricsValue && metrics.goal ? getGoalPosition(2) : null}
                    {metricsValue ? getScorePosition(2) : null}
                  </div>
                  <div
                    className={'metrics-item--score-item'}
                    style={{
                      minWidth: getMetricsChartWidth(1),
                    }}>
                    {metricsValue && metrics.goal ? getGoalPosition(1) : null}
                    {metricsValue ? getScorePosition(1) : null}
                  </div>
                  <div
                    className={'metrics-item--score-item'}
                    style={{
                      minWidth: getMetricsChartWidth(0),
                    }}>
                    {metricsValue && metrics.goal ? getGoalPosition(0) : null}
                    {metricsValue ? getScorePosition(0) : null}
                  </div>
                </div>
                <div className={'metrics-item--score-interval-block'}>
                  <span>0</span>
                  <span>100</span>
                </div>
              </>
            )}
          </>

          <>
            <div className={'metrics-item--average-block'}>
              {isAnswersLoading && isPastAnswersLoading ? (
                <Skeleton width={40} />
              ) : (
                <>
                  <CalendarIcon />

                  <span className={'metrics-item--nps-date-range'}>
                    {getCurrentDateRange(metrics.dateRange)}:
                  </span>
                  <span
                    className={`${
                      metricsAverage >= 0
                        ? 'metrics-item--nps-positive'
                        : 'metrics-item--nps-negative'
                    }`}>
                    <BottomArrowIcon />
                  </span>
                  <span
                    className={`${
                      metricsAverage >= 0
                        ? 'metrics-item--nps-positive-value'
                        : 'metrics-item--nps-negative-value'
                    }`}>
                    {Math.abs(metricsAverage)}%
                  </span>
                </>
              )}
            </div>
          </>
        </div>
      </div>
    );
  },
);

export default MetricsCard;
