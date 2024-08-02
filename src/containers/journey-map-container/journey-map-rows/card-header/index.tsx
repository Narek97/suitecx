import React, { FC, ReactNode } from 'react';
import './style.scss';

import { Tooltip } from '@mui/material';
import { useRecoilValue } from 'recoil';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import PersonaImageBox from '@/components/templates/persona-image-box';
import CommentBtn from '@/containers/journey-map-container/journey-map-card-comments-drawer/comment-btn';
import JourneyMapCardNote from '@/containers/journey-map-container/journey-map-card-note';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import DragIcon from '@/public/base-icons/drag-icon.svg';
import NoteIcon from '@/public/journey-map/note.svg';
import { isElementDraggingState } from '@/store/atoms/isElementDragging.atom';
import { ImageSizeEnum, menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { CommentButtonItemType, MenuOptionsType } from '@/utils/ts/types/global-types';

interface ICardHeader {
  icon: ReactNode;
  isShowPerson: boolean;
  persona: {
    name: string;
    url: string;
    key: string;
  };
  isShowNote: boolean;
  note: {
    id: number;
    type: CommentAndNoteModelsEnum;
    rowId: number;
    stepId: number;
    onHandleOpenNote: () => void;
    onClickAway: () => void;
  };
  comment: {
    count: number;
    item: CommentButtonItemType;
  };
  menu: {
    item: any;
    options: Array<MenuOptionsType>;
    disabled?: boolean;
    onCloseFunction?: () => void;
  };
  dragHandleProps: any;
  headerColor?: string;
}

const CardHeader: FC<ICardHeader> = ({
  icon,
  headerColor,
  isShowPerson,
  persona,
  isShowNote,
  note,
  comment,
  menu,
  dragHandleProps,
}) => {
  const isElementDragging = useRecoilValue(isElementDraggingState);

  return (
    <div className={'card-header'} style={{ backgroundColor: headerColor || ' #e9ebf2' }}>
      <div className={'card-header--left-block'}>
        <div>
          <span
            className={`${
              isElementDragging ? 'card-header--hide-icon' : 'card-header--base-icon'
            }`}>
            {icon}
          </span>
          <span
            className={`card-header--drag-icon ${
              isElementDragging ? 'card-header--show-icon' : ''
            }`}
            {...dragHandleProps}>
            <DragIcon fill={'#545E6B'} width={16} height={16} />
          </span>
        </div>

        {isShowPerson && (
          <PersonaImageBox
            title={persona.name}
            imageItem={{
              color: '#B052A7',
              isSelected: true,
              attachment: {
                url: persona.url,
                key: persona.key,
              },
            }}
            size={ImageSizeEnum.XSM}
          />
        )}
      </div>
      <div className={'card-header--right-block'}>
        {isShowNote && (
          <JourneyMapCardNote
            type={note.type}
            itemId={note.id}
            rowId={note.rowId}
            stepId={note.stepId}
            onClickAway={note.onClickAway}
          />
        )}
        <div className={'card-header--comment'}>
          <CommentBtn commentsCount={comment.count} item={comment.item} />
        </div>
        <div className={'card-header--note'}>
          <Tooltip title={'Note'}>
            <button
              aria-label={'Note'}
              onClick={note.onHandleOpenNote}
              data-testid="note-button-test-id">
              <NoteIcon />
            </button>
          </Tooltip>
        </div>

        <div className={'card-header--menu'}>
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
            item={menu.item}
            options={menu.options}
            disabled={menu.disabled}
            sxStyles={{
              display: 'inline-block',
              background: 'transparent',
            }}
            onCloseFunction={menu.onCloseFunction}
          />
        </div>
      </div>
    </div>
  );
};

export default CardHeader;
