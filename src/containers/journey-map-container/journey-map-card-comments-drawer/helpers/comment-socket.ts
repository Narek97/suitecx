import { ActionEnum } from '@/gql/types';
import { CommentType } from '@/utils/ts/types/global-types';

export const commentSocket = (socketData: any, commentsData: CommentType[]) => {
  switch (socketData?.action) {
    case ActionEnum.Add:
      if (socketData?.commentId) {
        commentsData?.forEach(comment => {
          if (comment?.id === socketData?.commentId) {
            comment.replies = [...(comment?.replies || []), socketData?.comment];
          }
        });
      } else {
        commentsData = [...commentsData, socketData?.comment];
      }
      break;
    case ActionEnum.Delete:
      if (socketData.parentId) {
        commentsData?.forEach(comment => {
          if (comment?.id === socketData?.parentId) {
            comment.replies = comment?.replies?.filter(itm => itm?.id !== socketData?.comment?.id);
          }
        });
      } else {
        commentsData = commentsData?.filter(comment => comment?.id !== socketData?.comment?.id);
      }
      break;
    case ActionEnum.Update:
      if (socketData?.parentId) {
        commentsData?.forEach(comment => {
          if (comment?.id === socketData?.parentId) {
            comment?.replies?.forEach(itm => {
              if (itm?.id === socketData?.comment?.id) {
                itm.text = socketData?.comment?.text;
              }
            });
          }
        });
      } else {
        commentsData?.forEach(comment => {
          if (comment?.id === socketData?.comment?.id) {
            comment.text = socketData?.comment?.text;
          }
        });
      }
      break;
  }
  return commentsData;
};
