import React, { FC, useMemo, useState } from 'react';

import dayjs from 'dayjs';
import { useRecoilValue } from 'recoil';

import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import CommentInput from '@/containers/journey-map-container/journey-map-card-comments-drawer/comment-Input';
import { userState } from '@/store/atoms/user.atom';
import { COMMENT_ITEM_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { CommentType } from '@/utils/ts/types/global-types';

interface ICommentItem {
  isFirstLevel: boolean;
  comment: CommentType;
  index: number;
  setLastMessageRef: (ref: HTMLElement | null) => void;
  addComment?: (text: string, id: number) => void;
  updateComment: ({
    text,
    commentId,
    parentId,
  }: {
    text: string;
    commentId: number;
    parentId?: number;
  }) => void;
  deleteComment: (id: number, parentId?: number | null) => void;
}

const CommentItem: FC<ICommentItem> = ({
  comment,
  setLastMessageRef,
  deleteComment,
  index,
  isFirstLevel,
  addComment,
  updateComment,
}) => {
  const user = useRecoilValue(userState);
  const [isShowReplyInput, setIsShowReplyInput] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const addReply = () => {
    setIsShowReplyInput(true);
  };

  const options = useMemo(() => {
    return COMMENT_ITEM_OPTIONS({
      onHandleDelete: () => deleteComment(comment?.id, null),
      onHandleEdit: () => setIsEditMode(true),
    });
  }, [comment?.id, deleteComment]);

  return (
    <div
      className={'comment-item'}
      data-testid="comment-item-test-id"
      key={comment?.id}
      // @ts-ignore
      ref={ref => (index === 0 ? setLastMessageRef(ref) : null)}>
      <div className={'comment-item--author'}>
        <div
          className={'comment-item--author-logo'}
          style={{ backgroundColor: comment?.owner?.color }}>
          {comment?.owner?.firstName || comment?.owner?.lastName
            ? comment?.owner?.firstName?.slice(0, 1) + comment?.owner?.lastName?.slice(0, 1)
            : comment?.owner?.emailAddress?.slice(0, 2)!}
        </div>
        <div>
          <div>
            {comment?.owner?.firstName}
            {comment?.owner?.lastName}
          </div>
          <div>{dayjs(comment?.updatedAt)?.fromNow()}</div>
        </div>
      </div>
      <div>
        {isEditMode ? (
          <CommentInput
            isUpdateMode={true}
            focus={() => {
              // scrollToBottom();
            }}
            value={comment?.text}
            addComment={text => {
              updateComment && updateComment({ text, commentId: comment?.id });
              setIsEditMode(false);
            }}
          />
        ) : (
          <div contentEditable={false} dangerouslySetInnerHTML={{ __html: comment?.text }} />
        )}
      </div>

      {!!comment?.replies?.length && (
        <div className={'comment-replies'}>
          {comment?.replies?.map(replyComment => (
            <CommentItem
              key={replyComment?.id}
              isFirstLevel={false}
              updateComment={({ text }) => {
                updateComment({
                  text,
                  commentId: replyComment?.id,
                  parentId: comment?.id,
                });
              }}
              deleteComment={() => {
                deleteComment(replyComment?.id, comment?.id);
              }}
              comment={replyComment}
              index={index}
              setLastMessageRef={ref => {
                setLastMessageRef(ref);
              }}
            />
          ))}
        </div>
      )}

      {isShowReplyInput && addComment && (
        <CommentInput isUpdateMode={false} addComment={text => addComment(text, comment?.id)} />
      )}

      {isFirstLevel && (
        <button className={'comment-item--reply'} onClick={addReply}>
          Reply
        </button>
      )}

      {user?.userID === comment?.owner?.userId && (
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
          item={{ id: 1 }}
          options={options}
          sxStyles={{
            display: 'inline-block',
            background: 'transparent',
          }}
        />
      )}
    </div>
  );
};

export default CommentItem;
