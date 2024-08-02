import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import './style.scss';

import deepcopy from 'deepcopy';
import Konva from 'konva';
import { Layer, Stage } from 'react-konva';
import { useRecoilState } from 'recoil';

import {
  createConnector,
  createEmojiLineGroup,
  createTooltip,
  createTransferCircles,
  drawBackground,
  haveIntersection,
} from '@/containers/journey-map-container/journey-map-rows/row-types/sentiment/helpers/helper';
import { useUpdatePersonaStateMutation } from '@/gql/mutations/generated/updatePersonaState.generated';
import { PersonaStateEnum } from '@/gql/types';
import { journeyMapState } from '@/store/atoms/journeyMap.atom';
import { EMOJI_WIDTH, EMOJIS, EMOTION_TYPES, SENTIMENT_HEIGHT } from '@/utils/constants/sentiment';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { SentimentBoxType } from '@/utils/ts/types/journey-map/journey-map-types';

import KonvaEventObject = Konva.KonvaEventObject;

interface ISentiment {
  sentimentData: SentimentBoxType[];
  width: number;
  personasCount: number;
  columnsCount: number;
  rowId: number;
  isAverageActive: boolean;
  disabled: boolean;
  rowIndex: number;
  isCollapsed: boolean;
}

const Sentiment: FC<ISentiment> = ({
  sentimentData,
  width,
  personasCount,
  columnsCount,
  isAverageActive,
  rowId,
  disabled,
  isCollapsed,
}) => {
  const stageRef = useRef<any>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const [detectedTransferLineType, setDetectedTransferLineType] = useState<{
    index: number;
    emotionType: string;
  } | null>(null);
  const [currentEmojiData, setCurrentEmojiData] = useState<any>({});

  const [journeyMap, setJourneyMap] = useRecoilState(journeyMapState);

  const sectionWidth = columnsCount * width + (columnsCount - 1) * 2;

  const { mutate: updatePersonaState } = useUpdatePersonaStateMutation();

  const creatConnectorsBetweenEmojis = useCallback(() => {
    let emojisData: ObjectKeysType = {};
    layerRef?.current?.children.forEach((node: any) => {
      if (node.attrs.type === 'box_section') {
        node.children.forEach((itm: Konva.Group) => {
          itm.children.forEach((emoji: Konva.Group | Konva.Shape) => {
            emojisData[emoji.attrs.id] = [...(emojisData[emoji?.attrs?.id] || []), emoji];
          });
        });
      }
    });
    let connectors = [];
    for (let key in emojisData) {
      const personaEmotions = emojisData[key];
      for (let i = 0; i < personaEmotions.length - 1; i++) {
        const currentEmoji = personaEmotions[i];
        const nexItem = personaEmotions[i + 1];
        const lineColor = currentEmoji.children[1].attrs.fill;
        const connector = createConnector({
          points: [
            currentEmoji.parent.getX() + currentEmoji.parent.children.length * 16,
            currentEmoji.parent.getY(),
            nexItem.parent.getX(),
            nexItem.parent.getY(),
          ],
          id:
            'connector_' +
            currentEmoji.attrs.id +
            '*' +
            currentEmoji.parent.attrs.id +
            '*' +
            nexItem.parent.attrs.id,
          dash: currentEmoji?.id() === 'average' ? [10, 5] : [],
          opacity: currentEmoji?.getChildren()[1].opacity(),
          data: {
            id: String(currentEmoji.attrs.id),
            start: currentEmoji.parent.attrs.id,
            end: nexItem.parent.attrs.id,
          },
          lineColor,
        });
        connectors.push(connector);
      }
    }
    const children = layerRef.current?.children;
    children?.splice(3, 0, ...connectors);
  }, []);

  const handleShowTransferCircles = ({ isShow, x }: { isShow: boolean; x?: number }) => {
    const layer = layerRef.current?.findOne('#transfer_circles');
    layer?.visible(isShow);
    x && layer?.setAttr('x', x);
  };

  const drawTransferCircles = useCallback(() => {
    const circlesGroup = createTransferCircles();
    const children = layerRef.current?.children;
    children?.splice(3, 0, circlesGroup);
  }, []);

  const addTooltipToLayer = useCallback(() => {
    const tooltip = createTooltip();
    layerRef.current?.add(tooltip);
  }, []);

  const drawBackgroundObjects = useCallback(() => {
    const { backgroundRect, innerRect, linesGroup } = drawBackground({
      sectionWidth,
    });
    layerRef.current?.add(backgroundRect, innerRect, linesGroup);
  }, [sectionWidth]);

  const convertDataToSection = useCallback(() => {
    const emotionsByAsc = [...EMOTION_TYPES].reverse();
    sentimentData.forEach((boxItem: any, index: number) => {
      // need to create box - area emojis and transfer it in Group
      const groupId = boxItem.id;
      const boxSection = new Konva.Group({
        x: 0,
        y: 0,
        id: String(groupId),
        uuid: index,
        width,
        height: SENTIMENT_HEIGHT,
        name: 'group',
        type: 'box_section',
      });

      let currentAverageData: ObjectKeysType = {};
      if (isAverageActive) {
        let totalAverage: number = 0;
        for (const key in boxItem.averageDetails) {
          totalAverage += boxItem.averageDetails[key] - 1;
        }

        const emotionIndex: number = personasCount ? Math.floor(totalAverage / personasCount) : 2;
        currentAverageData = {
          emotion: emotionsByAsc[emotionIndex],
          average: {
            color: '#1B3380',
            stepId: boxItem?.stepId,
            personaId: 'average',
            rowId,
            state: emotionsByAsc[emotionIndex - 1],
            text: 'Average',
            isDraggable: false,
          },
        };
      }

      EMOTION_TYPES.forEach(emotionType => {
        // point += boxItem[emotionType].length * i;
        const widthOfEmojis =
          (boxItem[emotionType].length - 1) * (EMOJI_WIDTH / 2) +
          (boxItem[emotionType].length ? EMOJI_WIDTH / 2 : EMOJI_WIDTH);
        let start = (width - widthOfEmojis) / 2 + (index * width + 4);

        let emojisList = boxItem[emotionType];
        if (isAverageActive && currentAverageData.emotion === emotionType) {
          emojisList = [...emojisList, currentAverageData.average];
          if (emojisList.length > 1) {
            start -= 8;
          }
        }
        const emojiLineGroup = createEmojiLineGroup({
          start,
          emojis: emojisList,
          id: `${groupId}_${emotionType}`,
          emojiType: emotionType,
          groupId,
          width,
          stageRef,
        });
        boxSection.add(emojiLineGroup);
      });
      layerRef.current?.add(boxSection);
    });
    creatConnectorsBetweenEmojis();
  }, [sentimentData, creatConnectorsBetweenEmojis, width, isAverageActive, personasCount, rowId]);

  const updateConnectors = ({
    x,
    y,
    emojiParentId,
    id,
    mode,
  }: {
    x: number;
    y: number;
    emojiParentId: string;
    id: string;
    mode: 'drag' | 'dragEnd';
  }) => {
    layerRef.current?.getChildren().forEach(itm => {
      if (itm.attrs.type === 'connector') {
        if (itm.attrs.data?.id === id) {
          const line: Konva.Line = itm as Konva.Line;
          if (line.attrs.data.start === emojiParentId) {
            const previousPoints = line.attrs.points;
            line.points([x, y, ...previousPoints.slice(2)]);
          }
          if (line.attrs.data.end === emojiParentId) {
            const previousPoints = line.attrs.points;
            line.points([...previousPoints.slice(0, 2), x, y]);
          }
        } else if (mode === 'drag') {
          itm.visible(false);
        }
      }
    });
  };

  const updateLineConnectors = ({ id, previousParentId, newParentId }: any) => {
    const box: any = layerRef.current?.findOne((node: Konva.Group) => {
      return (
        node.getType() === 'Group' &&
        node.getAttr('attrs').type === 'box_section' &&
        node.getAttr('attrs').id === currentEmojiData.stepId
      );
    });

    const newEmotionLine =
      detectedTransferLineType && box?.children[detectedTransferLineType.index!];
    const previousEmotionLine = box?.findOne('#' + previousParentId);
    layerRef.current?.getChildren().forEach(itm => {
      if (itm.attrs.type === 'connector') {
        const line: Konva.Line = itm as Konva.Line;
        // source line emojis connectors other than the portable
        if (
          (itm.attrs.data.start === previousParentId || itm.attrs.data.end === previousParentId) &&
          itm.attrs.data.id !== id
        ) {
          if (itm.attrs.data.start === previousParentId) {
            const previousPoints = line.attrs.points;

            line.points([
              previousEmotionLine.attrs.x + previousEmotionLine.children.length * 16,
              ...previousPoints.slice(1, 4),
            ]);
          }
          if (itm.attrs.data.end === previousParentId) {
            const previousPoints = line.attrs.points;
            line.points([
              ...previousPoints.slice(0, 2),
              previousEmotionLine.attrs.x - 8,
              previousPoints[3],
            ]);
          }
        }
        if (itm.attrs.data.start === newParentId || itm.attrs.data.end === newParentId) {
          if (itm.attrs.data.start === newParentId) {
            const previousPoints = line.attrs.points;
            line.points([
              newEmotionLine.attrs.x + newEmotionLine.children.length * 16,
              newEmotionLine.attrs.y,
              ...previousPoints.slice(2),
            ]);
          }
          if (itm.attrs.data.end === newParentId) {
            const previousPoints = line.attrs.points;
            line.points([
              ...previousPoints.slice(0, 2),
              newEmotionLine.attrs.x - 8,
              newEmotionLine.attrs.y,
            ]);
          }
        }
        if (itm.attrs.data.id === id) {
          let updatedData = {
            ...itm.attrs.data,
          };
          if (itm.attrs.data.start === previousParentId) {
            updatedData.start = newParentId;
          } else if (itm.attrs.data.end === previousParentId) {
            updatedData.end = newParentId;
          }
          itm.setAttr('id', itm.attrs.id.replace(previousParentId, newParentId));
          if (itm.attrs.data.start === previousParentId) {
            const previousPoints = line.attrs.points;
            line.points([
              newEmotionLine.attrs.x + newEmotionLine.children.length * 16,
              newEmotionLine.attrs.y,
              ...previousPoints.slice(2),
            ]);
          }
          if (itm.attrs.data.end === previousParentId) {
            const previousPoints = line.attrs.points;
            line.points([
              ...previousPoints.slice(0, 2),
              newEmotionLine.attrs.x - 8,
              newEmotionLine.attrs.y,
            ]);
          }
          itm.setAttr('data', updatedData);
        }
      }
    });
  };

  const detectTransferCircles = (targetRect: any) => {
    const transferCircles: any = layerRef.current?.findOne('#transfer_circles');
    // finding detected Circle
    const data = transferCircles?.getChildren().some((transferCircle: Konva.Circle) => {
      const transferCircleParent = transferCircle?.parent as any;
      const isHaveInteraction = haveIntersection(
        {
          x: transferCircle.attrs.x + transferCircleParent?.getX() - 120,
          y: transferCircle.attrs.y + transferCircleParent?.getY(),
          width: 400,
          height: 10,
        },
        targetRect,
      );
      if (isHaveInteraction) {
        setDetectedTransferLineType({
          emotionType: transferCircle.attrs.type,
          index: transferCircle.attrs.data.index,
        });
        transferCircle.setAttr('fill', '#E8E8E8');
      } else {
        transferCircle.setAttr('fill', '#F5F5F5');
      }
      return isHaveInteraction;
    });
    // if there isn't any detected circle
    if (!data) {
      setDetectedTransferLineType(null);
    }
  };

  const onDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    const emojiParentId = e?.target?.parent?.attrs?.id;
    const group = e.target as any;
    const targetRect = group.getClientRect();
    updateConnectors({
      x: group?.getX() + group.parent.getX(),
      y: group.getY() + group.parent.getY(),
      emojiParentId,
      id: e.target.attrs.id,
      mode: 'drag',
    });
    detectTransferCircles(targetRect);
  };

  const updateJourneyMap = ({
    emojiId,
    parentId,
    state,
  }: {
    emojiId: string;
    parentId: string;
    state: PersonaStateEnum;
  }) => {
    const journeyMapRows = deepcopy(journeyMap.rows);
    journeyMapRows.forEach(rowItem => {
      if (rowItem?.id === rowId) {
        const persona = rowItem?.rowWithPersonas.find(personaItem => personaItem.id === +emojiId);
        if (persona) {
          persona.personaStates =
            persona?.personaStates?.map((stateItem: any) => {
              if (stateItem.stepId === +parentId) {
                return {
                  ...stateItem,
                  state,
                };
              }
              return stateItem;
            }) || [];
        }
      }
      return rowItem;
    });
    setJourneyMap(prev => ({ ...prev, rows: journeyMapRows }));
  };

  const updateSentimentBoardItems = ({
    id,
    parentId,
    groupId,
  }: {
    parentId: string;
    groupId: number;
    id: string;
  }) => {
    layerRef.current?.children.forEach((shape: any) => {
      if (+shape.attrs.id === groupId) {
        // iteration box emoji line groups
        shape.children.forEach((emojiLineGroup: Konva.Group) => {
          new Konva.Tween({
            node: emojiLineGroup,
            duration: 40,
            scaleX: 1.3,
            scaleY: 1.3,
            rotation: 360,
            easing: Konva.Easings.BackEaseOut,
          });
          // hide/show all emoji-line groups of the box
          if (emojiLineGroup.attrs.id === parentId) {
            emojiLineGroup.children.forEach(item => {
              const emoji = item as Konva.Group;
              // hiding/showing line all emojis ... only taking the current dragged
              if (emoji.attrs.id === id) {
                // reset to the initial position
                if (!detectedTransferLineType) {
                  emoji.setAttrs({
                    x: currentEmojiData.x,
                    y: currentEmojiData.y,
                  });
                  updateConnectors({
                    x: emoji.parent?.attrs.x + emoji?.attrs.x,
                    y: emoji.parent?.attrs.y + emoji?.attrs.y,
                    emojiParentId: emoji.parent?.attrs.id,
                    id: emoji.attrs.id,
                    mode: 'dragEnd',
                  });
                } else {
                  const type: any = detectedTransferLineType?.emotionType!;
                  const previousId = emoji.attrs.parentId;
                  let start = 0;
                  // arranging side by side / fixings empty spaces after remove
                  emoji.parent?.children.forEach(itm => {
                    if (itm?.attrs.id !== emoji.attrs.id) {
                      itm.setAttr('x', start * 16);
                      start += 1;
                    }
                  });
                  const box: any = layerRef.current?.findOne((node: Konva.Group) => {
                    return (
                      node.getType() === 'Group' &&
                      node.getAttr('attrs').type === 'box_section' &&
                      node.getAttr('attrs').id === currentEmojiData.stepId
                    );
                  });
                  const newEmotionLine = box?.children[detectedTransferLineType?.index];
                  newEmotionLine.setAttr('x', newEmotionLine.attrs.x - 8);
                  emoji.parent?.setAttr('x', emoji.parent.x() + 8);
                  emoji.children[1].setAttr('data', EMOJIS[type].path);

                  updateJourneyMap({
                    emojiId: emoji.attrs.id,
                    state: type,
                    parentId: emoji.attrs.parentId.split('_')[0],
                  });
                  emoji.setAttrs({
                    x: newEmotionLine.children.length * 16,
                    y: 0,
                    parentId: newEmotionLine.attrs.id,
                  });
                  newEmotionLine.add(emoji);

                  updateLineConnectors({
                    emotion: detectedTransferLineType.emotionType,
                    previousParentId: previousId,
                    newParentId: newEmotionLine.attrs.id,
                    id: emoji.attrs.id,
                    mode: 'dragEnd',
                  });
                  updatePersonaState({
                    updatePersonaStateInput: {
                      stepId: emoji?.attrs?.data?.stepId,
                      personaId: emoji?.attrs?.data?.personaId,
                      state: type,
                      rowId,
                    },
                  });
                }
              }
            });
          }
        });
      }
    });
  };

  const handleToggleShowBoxAllEmojis = ({
    id,
    parentId,
    groupId,
    isShow,
  }: {
    isShow: boolean;
    parentId: string;
    groupId: number;
    id: string;
  }) => {
    layerRef.current?.children.forEach((shape: any) => {
      if (shape.attrs.type === 'connector') {
        shape.visible(true);
      }
      if (+shape.attrs.id === groupId) {
        // iteration box emoji line groups
        shape.children.forEach((emojiLineGroup: Konva.Group) => {
          // hide/show all emoji-line groups of the box
          if (emojiLineGroup.attrs.id !== parentId) {
            emojiLineGroup.visible(isShow);
          } else {
            emojiLineGroup.children.forEach(emoji => {
              // hiding/showing line all emojis ... only taking the current dragged
              if (emoji.attrs.id !== id) {
                emoji.visible(isShow);
              }
            });
          }
        });
      }
    });
  };

  const onDragEnd = (event: KonvaEventObject<DragEvent>) => {
    handleShowTransferCircles({ isShow: false });
    const parentIdConversion = event.target.attrs.parentId.split('_');
    const groupId = +parentIdConversion[0];
    const { id, parentId } = event.target.attrs;
    handleToggleShowBoxAllEmojis({
      id,
      parentId,
      groupId,
      isShow: true,
    });
    updateSentimentBoardItems({
      id,
      parentId,
      groupId,
    });
  };

  const onDragStart = (event: KonvaEventObject<DragEvent>) => {
    const group = event.target as any;
    const targetData = group.getClientRect();
    setDetectedTransferLineType(null);
    setCurrentEmojiData({
      x: group.attrs.x,
      y: group.attrs.y,
      stepId: group.attrs.parentId.split('_')[0],
    });
    handleShowTransferCircles({ isShow: true, x: targetData.x + 16 });
    const parentIdConversion = event.target.attrs.parentId.split('_');
    const groupId = +parentIdConversion[0];
    const { id, parentId } = event.target.attrs;
    handleToggleShowBoxAllEmojis({
      id,
      parentId,
      groupId,
      isShow: false,
    });
  };

  useEffect(() => {
    if (layerRef?.current?.children) {
      layerRef.current.children = [];
    }
    drawBackgroundObjects();
    convertDataToSection();
    addTooltipToLayer();
    drawTransferCircles();
  }, [addTooltipToLayer, convertDataToSection, drawBackgroundObjects, drawTransferCircles]);

  useEffect(() => {
    if (layerRef?.current) {
      layerRef?.current.listening(!disabled);
    }
  }, [disabled]);

  return (
    <>
      {isCollapsed ? (
        <div style={{ width: sectionWidth }} className={'sentiment-collapsed'} />
      ) : (
        <Stage
          ref={stageRef}
          onDragMove={onDragMove}
          className={'sentiment'}
          onDragEnd={onDragEnd}
          onDragStart={onDragStart}
          width={sectionWidth}
          height={SENTIMENT_HEIGHT}
          id={'stage'}
          draggable={false}>
          <Layer draggable={false} ref={layerRef} />
        </Stage>
      )}
    </>
  );
};

export default Sentiment;
