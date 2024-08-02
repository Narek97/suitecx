import { FC, useCallback } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import { useSetRecoilState } from 'recoil';

import CommentIcon from '@/public/base-icons/comments.svg';
import { notesAndCommentsDrawerState } from '@/store/atoms/notesAndCommentsDrawer.atom';
import { CommentButtonItemType } from '@/utils/ts/types/global-types';

interface ICommentBtn {
  item: CommentButtonItemType;
  commentsCount: number;
}

const CommentBtn: FC<ICommentBtn> = ({ item, commentsCount }) => {
  const setIsCommentsAndNotesDrawerOpen = useSetRecoilState(notesAndCommentsDrawerState);

  const onButtonClick = useCallback(() => {
    setIsCommentsAndNotesDrawerOpen(prev => ({
      ...prev,
      ...item,
      isOpen: !prev?.isOpen,
    }));
  }, [item, setIsCommentsAndNotesDrawerOpen]);

  return (
    <Tooltip title={'Comment'}>
      <button
        data-testid="comment-button-test-id"
        className={'comments-btn'}
        onClick={() => {
          onButtonClick();
        }}>
        <CommentIcon fill={commentsCount > 0 ? '#545E6B' : 'transparent'} />
        {commentsCount > 0 && (
          <span className={'comments-count'}>{commentsCount > 9 ? '9+' : commentsCount}</span>
        )}
      </button>
    </Tooltip>
  );
};

export default CommentBtn;
