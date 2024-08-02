import { RefObject } from 'react';

import Konva from 'konva';

import { PersonaStateEnum } from '@/gql/types';
import {
  BACKGROUND_LINES_COUNT,
  EMOJI_LINE_STARTS,
  EMOJIS,
  EMOTION_TYPES,
  SENTIMENT_HEIGHT,
  START_Y_EMOJI_LINE,
} from '@/utils/constants/sentiment';

export const drawBackground = ({ sectionWidth }: { sectionWidth: number }) => {
  const backgroundRect = new Konva.Rect({
    id: 'background',
    width: sectionWidth,
    height: SENTIMENT_HEIGHT,
    x: 0,
    y: 0,
    fill: 'rgb(245, 245, 245)',
  });
  const innerRect = new Konva.Rect({
    id: 'backgroundInner',
    width: sectionWidth - 16,
    height: SENTIMENT_HEIGHT - 16,
    cornerRadius: 2,
    x: 8,
    y: 8,
    fill: '#ffffff',
  });
  const linesGroup = new Konva.Group({
    x: 0,
    y: 0,
    id: 'lines_group',
    name: 'linesGroup',
  });
  let startY = START_Y_EMOJI_LINE;
  new Array(BACKGROUND_LINES_COUNT).fill({}).forEach((_, index) => {
    const divider = new Konva.Line({
      id: 'divider_' + index,
      points: [8, startY, sectionWidth - 8, startY],
      stroke: '#e8e8e8',
      strokeWidth: 1,
    });
    startY += 50;
    linesGroup.add(divider);
  });
  return { backgroundRect, innerRect, linesGroup };
};

export const createTooltip = () => {
  const tooltip = new Konva.Label({
    opacity: 1,
    id: 'tooltip',
    visible: false,
    listening: true,
    x: -60,
    y: 0,
  });

  const triangle = new Konva.RegularPolygon({
    x: 16,
    y: -2,
    sides: 3,
    radius: 2,
    stroke: '#555555',
    strokeWidth: 4,
    visible: true,
  });

  const tag = new Konva.Tag({
    fill: '#555555',
    pointerWidth: 90,
    pointerHeight: 50,
    lineJoin: 'round',
    shadowColor: '#555555',
    shadowBlur: 20,
    shadowOffsetX: 10,
    shadowOffsetY: 10,
    shadowOpacity: 0.2,
    x: 0,
    y: 0,
  });

  const text = new Konva.Text({
    x: 500,
    y: 0,
    text: '',
    fontSize: 12,
    padding: 8,
    fill: 'white',
  });
  tooltip.add(tag, triangle, text);
  return tooltip;
};

export const generateEmoji = ({
  emojiId,
  x,
  y,
  parentId,
  color,
  type,
  width,
  data,
  isDraggable = true,
  isDisabled = false,
}: {
  width: number;
  emojiId: string;
  x: number;
  y: number;
  parentId: string;
  color: string;
  type: PersonaStateEnum;
  data?: any;
  isDraggable?: boolean;
  isDisabled?: boolean;
}) => {
  const group = new Konva.Group({
    x,
    y,
    id: String(emojiId),
    width,
    height: SENTIMENT_HEIGHT,
    name: 'group',
    parentId,
    data,
    draggable: isDraggable,
  });
  const circle = new Konva.Circle({
    x: 0,
    y: 0,
    radius: 16,
    fill: 'white',
  });
  const emoji = new Konva.Path({
    id: 'icon',
    x: -16,
    y: -16,
    width: 24,
    height: 24,
    fill: color,
    data: emojiId === 'average' ? EMOJIS[type].outlined : EMOJIS[type].filled,
    opacity: isDisabled ? 0.3 : 1,
  });
  group.add(circle, emoji);
  return group;
};

export const hoverOnEmoji = ({
  stageRef,
  emojiId,
  mode,
}: {
  stageRef: RefObject<Konva.Stage>;
  emojiId: string;
  mode: 'mouseEnter' | 'mouseLeave';
}) => {
  const mainLayer = stageRef?.current?.getChildren()[0] as Konva.Group;

  mainLayer?.children.forEach(itm => {
    if (itm.attrs.type === 'connector') {
      if (itm.attrs.data?.id !== String(emojiId)) {
        itm.setAttr('opacity', mode === 'mouseEnter' ? 0.6 : 1);
      }
    } else if (itm.attrs.type === 'box_section') {
      const box = itm as Konva.Group;
      box.children.forEach(item => {
        const lineGroup = item as Konva.Group;
        lineGroup.children.forEach(e => {
          const emojiItem = e as Konva.Group;
          if (emojiItem?.attrs.id !== emojiId) {
            emojiItem.children[1].setAttr('opacity', mode === 'mouseEnter' ? 0.6 : 1);
          }
        });
      });
    }
  });
};

export const createEmojiLineGroup = ({
  id,
  emojis,
  start,
  emojiType,
  groupId,
  width,
  stageRef,
}: {
  id: string;
  emojis: any[];
  width: number;
  emojiType: PersonaStateEnum;
  start: number;
  groupId: number;
  stageRef: RefObject<Konva.Stage>;
}) => {
  const group = new Konva.Group({
    x: start + 4,
    y: EMOJI_LINE_STARTS[emojiType],
    id,
    width,
    height: SENTIMENT_HEIGHT,
    name: 'group',
    data: {
      groupId,
      type: emojiType,
    },
  });
  emojis.forEach((emoji, index) => {
    const emojiData = generateEmoji({
      width,
      emojiId: emoji.personaId,
      color: emoji.color,
      isDraggable: emoji.isDraggable,
      isDisabled: emoji.isDisabled,
      x: index * 16,
      y: 0,
      type: emojiType,
      parentId: id,
      data: {
        stepId: emoji.stepId,
        personaId: emoji.personaId,
      },
    });
    emojiData.on('dragstart', function () {
      const mainLayer = stageRef?.current?.getChildren()[0];
      const tooltip: Konva.Label = mainLayer?.findOne('#tooltip')!;
      tooltip.visible(false);
    });
    emojiData.on('mouseenter', function () {
      emojiData.children[1].setAttr('opacity', 1);
      const mainLayer = stageRef?.current?.getChildren()[0];
      hoverOnEmoji({
        stageRef,
        emojiId: emojiData.attrs.id,
        mode: 'mouseEnter',
      });
      const tooltip: Konva.Label = mainLayer?.findOne('#tooltip')!;
      if (stageRef.current) {
        tooltip.x(50);
        tooltip.children[1].setAttrs({
          x: 16,
          y: 0,
          rotation: 0,
        });
        tooltip.children[2].setAttrs({
          text: emoji?.text || '',
        });
        const mousePosition = stageRef.current.getPointerPosition();
        let y = group.attrs.y + 30;
        if (SENTIMENT_HEIGHT - mousePosition?.y! < 70) {
          y = 180;
          tooltip.children[1].setAttrs({
            x: 16,
            y: 30,
            rotation: 180,
          });
        }
        tooltip?.visible(true);
        tooltip?.setAttrs({
          x: group.x() + index * 16 - 16,
          y,
        });
        stageRef.current.container().style.cursor = 'move';
      }
    });
    emojiData.on('mouseleave', function () {
      hoverOnEmoji({
        stageRef,
        emojiId: emojiData.attrs.id,
        mode: 'mouseLeave',
      });
      emojiData.children[1].setAttr('opacity', 1);
      const mainLayer = stageRef?.current?.getChildren()[0];
      const tooltip = mainLayer?.findOne('#tooltip');
      if (stageRef.current) {
        stageRef.current.container().style.cursor = 'default';
        tooltip?.visible(false);
      }
    });
    group.add(emojiData);
  });
  return group;
};

export const createConnector = ({
  points,
  id,
  data,
  lineColor,
  dash = [],
  opacity,
}: {
  points: number[];
  id: string;
  data: any;
  lineColor: string;
  dash: number[];
  opacity: number;
}) => {
  return new Konva.Line({
    points: points,
    type: 'connector',
    stroke: lineColor,
    id,
    dash,
    data,
    opacity,
    pointerLength: 1,
    pointerWidth: 1,
    tension: 10,
    strokeWidth: 2,
  });
};

export const createTransferCircles = () => {
  let start = START_Y_EMOJI_LINE;
  const group = new Konva.Group({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    fill: 'red',
    id: 'transfer_circles',
    name: 'group',
  });

  EMOTION_TYPES.forEach((emotionType, index) => {
    //setting index as id for taking and changing data

    if (index % 2 === 0) {
      const circle = new Konva.Circle({
        y: start,
        x: 0,
        radius: 16,
        fill: '#F5F5F5',
        id: `transfer_circle_${index}`,
        type: emotionType,
        data: {
          index,
        },
      });
      group.add(circle);
    }

    start += 50;
  });
  group.visible(false);
  return group;
};

export const haveIntersection = (
  r1: { height: number; width: number; x: number; y: number },
  r2: { height: number; width: number; x: number; y: number },
) => {
  return !(
    r2.x > r1.x + r1.width ||
    r2.x + r2.width < r1.x ||
    r2.y > r1.y + r1.height ||
    r2.y + r2.height < r1.y
  );
};
