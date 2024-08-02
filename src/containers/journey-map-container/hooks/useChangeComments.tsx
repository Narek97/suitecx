import { useSetRecoilState } from 'recoil';

import { CommentAndNoteModelsEnum } from '@/gql/types';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { BoxItemType, CommentItemType } from '@/utils/ts/types/journey-map/journey-map-types';

export const useChangeCommentsCount = () => {
  const setJourneyMap = useSetRecoilState(journeyMapState);
  const changeCommentsCount = ({
    actionType,
    rowId,
    columnId,
    rowFunction,
    itemId,
    type,
  }: {
    actionType: 'increment' | 'decrement';
    rowId: number;
    columnId: number;
    itemId: number;
    rowFunction: CommentItemType | null;
    type: CommentAndNoteModelsEnum;
  }) => {
    setJourneyMap(prev => {
      const rows = prev.rows.map(r => {
        if (r.id === rowId) {
          return {
            ...r,
            boxes: r?.boxes?.map(block => {
              if (block.columnId === columnId) {
                return {
                  ...block,
                  ...changeMapItemCommentsCountByType(type, actionType, rowFunction, itemId, block),
                };
              }
              return block;
            }),
          };
        }
        return r;
      });
      return { ...prev, rows };
    });
  };

  return { changeCommentsCount };
};

const changeMapItemCommentsCountByType = (
  type: CommentAndNoteModelsEnum,
  actionType: 'increment' | 'decrement',
  rowFunction: CommentItemType | null,
  itemId: number,
  block: BoxItemType,
) => {
  switch (type) {
    case CommentAndNoteModelsEnum.Touchpoint:
      return {
        touchPoints: block.touchPoints.map(touchpointItem => {
          if (touchpointItem.id === itemId) {
            switch (actionType) {
              case 'increment':
                return {
                  ...touchpointItem,
                  commentsCount: touchpointItem.commentsCount + 1,
                };
              case 'decrement':
                return {
                  ...touchpointItem,
                  commentsCount: touchpointItem.commentsCount - 1,
                };
              default:
                break;
            }
          }
          return touchpointItem;
        }),
      };

    case CommentAndNoteModelsEnum.Outcome:
      return {
        outcomes: block.outcomes.map(outcomeItem => {
          if (outcomeItem.id === itemId) {
            switch (actionType) {
              case 'increment':
                return {
                  ...outcomeItem,
                  commentsCount: outcomeItem.commentsCount + 1,
                };
              case 'decrement':
                return {
                  ...outcomeItem,
                  commentsCount: outcomeItem.commentsCount - 1,
                };
              default:
                break;
            }
          }
          return outcomeItem;
        }),
      };

    case CommentAndNoteModelsEnum.Metrics:
      return {
        metrics: block.metrics.map(metricsItem => {
          if (metricsItem.id === itemId) {
            switch (actionType) {
              case 'increment':
                return {
                  ...metricsItem,
                  commentsCount: metricsItem.commentsCount + 1,
                };
              case 'decrement':
                return {
                  ...metricsItem,
                  commentsCount: metricsItem.commentsCount - 1,
                };
              default:
                break;
            }
          }
          return metricsItem;
        }),
      };
    case CommentAndNoteModelsEnum.Links:
      return {
        links: block.links.map(linkItem => {
          if (linkItem.id === itemId) {
            switch (actionType) {
              case 'increment':
                return {
                  ...linkItem,
                  commentsCount: linkItem.commentsCount + 1,
                };
              case 'decrement':
                return {
                  ...linkItem,
                  commentsCount: linkItem.commentsCount - 1,
                };
              default:
                break;
            }
          }
          return linkItem;
        }),
      };

    case CommentAndNoteModelsEnum.BoxElement:
      return {
        boxElements: block.boxElements.map(boxElementItem => {
          if (boxElementItem.id === itemId) {
            switch (actionType) {
              case 'increment':
                return {
                  ...boxElementItem,
                  commentsCount: (boxElementItem.commentsCount || 0) + 1,
                };
              case 'decrement':
                return {
                  ...boxElementItem,
                  commentsCount: (boxElementItem.commentsCount || 0) - 1,
                };
              default:
                break;
            }
          }
          return boxElementItem;
        }),
      };
  }
};
