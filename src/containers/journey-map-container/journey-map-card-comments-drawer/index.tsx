'use client';
import { FC, useCallback, useEffect, useState } from 'react';

import './style.scss';

import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import deepcopy from 'deepcopy';
import { useRecoilValue } from 'recoil';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import ErrorBoundary from '@/components/templates/error-boundary';
import ModalHeader from '@/components/templates/modal-header';
import { useChangeCommentsCount } from '@/containers/journey-map-container/hooks/useChangeComments';
import CommentInput from '@/containers/journey-map-container/journey-map-card-comments-drawer/comment-Input';
import CommentItem from '@/containers/journey-map-container/journey-map-card-comments-drawer/comment-item';
import { commentSocket } from '@/containers/journey-map-container/journey-map-card-comments-drawer/helpers/comment-socket';
import useKeepScrollPosition from '@/containers/journey-map-container/journey-map-card-comments-drawer/hooks/useKeepScrollPosition';
import useOnScreen from '@/containers/journey-map-container/journey-map-card-comments-drawer/hooks/useOnScreen';
import {
  GetItemCommentsQuery,
  useInfiniteGetItemCommentsQuery,
} from '@/gql/infinite-queries/generated/getComments.generated';
import { useAddCommentMutation } from '@/gql/mutations/generated/addComment.generated';
import {
  DeleteCommentMutation,
  useDeleteCommentMutation,
} from '@/gql/mutations/generated/deleteComment.generated';
import {
  UpdateCommentMutation,
  useUpdateCommentMutation,
} from '@/gql/mutations/generated/updateComment.generated';
import { ActionEnum, AddCommentInput } from '@/gql/types';
import CloseIcon from '@/public/base-icons/close.svg';
import EmptyStateIcon from '@/public/base-icons/empty-comments.svg';
import { userState } from '@/store/atoms/user.atom';
import { COMMENTS_LIMIT } from '@/utils/constants/pagination';
import { emitToSocketMap, socketMap } from '@/utils/helpers/socket-connection';
import { CommentEventsEnum } from '@/utils/ts/enums/global-enums';
import { CommentType, NotesAndCommentsDrawerType } from '@/utils/ts/types/global-types';

interface ICommentsDrawer {
  commentsDrawer: NotesAndCommentsDrawerType;
  onClose: () => void;
}
dayjs.extend(fromNow);

const CommentsDrawer: FC<ICommentsDrawer> = ({ commentsDrawer, onClose }) => {
  const { changeCommentsCount } = useChangeCommentsCount();

  const user = useRecoilValue(userState);

  const [lastMessageRef, setLastMessageRef] = useState<HTMLElement | null>(null);
  const [comments, setComments] = useState<Array<CommentType>>([]);

  const isIntersecting = useOnScreen({ current: lastMessageRef });
  const { containerRef } = useKeepScrollPosition([comments]);

  const { mutate: addComment } = useAddCommentMutation();
  const { mutate: deleteCommentItem } = useDeleteCommentMutation<DeleteCommentMutation, Error>();
  const { mutate: updateCommentItem } = useUpdateCommentMutation<UpdateCommentMutation, Error>();
  const {
    data: dataQuery,
    isLoading: commentsIsLoading,
    isFetching,
    fetchNextPage: organizationPersonasFetchNextPage,
  } = useInfiniteGetItemCommentsQuery<GetItemCommentsQuery>(
    {
      getItemCommentsInput: {
        limit: COMMENTS_LIMIT,
        offset: 0,
        itemType: commentsDrawer.type!,
        itemId: commentsDrawer.itemId!,
        rowId: commentsDrawer?.rowId,
        stepId: commentsDrawer?.stepId,
      },
    },
    {
      keepPreviousData: false,
      cacheTime: 0,
      enabled: !!commentsDrawer?.itemId,
      onSuccess: response => {
        let data =
          response?.pages[response?.pages?.length - 1]?.getItemComments?.comments ||
          ([] as CommentType[]);
        setComments(prev => {
          return [...data, ...prev];
        });
      },
    },
  );

  const updateStateAfterDelete = (id: number, parentId?: number | null) => {
    setComments(prev => {
      if (parentId) {
        let copyCommentsList = deepcopy(prev);
        copyCommentsList?.forEach(comment => {
          if (comment?.id === parentId) {
            comment.replies = comment?.replies?.filter(itm => itm?.id !== id);
          }
        });
        return copyCommentsList;
      } else {
        return prev?.filter(comment => comment?.id !== id);
      }
    });
  };
  const deleteComment = (id: number, parentId?: number | null) => {
    deleteCommentItem(
      { id },
      {
        onSuccess: () => {
          emitToSocketMap(CommentEventsEnum.ITEM_COMMENT_EVENT, {
            action: ActionEnum.Delete,
            itemId: commentsDrawer?.itemId,
            rowId: commentsDrawer?.rowId,
            columnId: commentsDrawer?.columnId,
            type: commentsDrawer.type,
            rowFunction: commentsDrawer?.rowFunction,
            parentId,
            comment: { id },
          });
          changeCommentsCount({
            type: commentsDrawer.type!,
            rowFunction: commentsDrawer?.rowFunction,
            actionType: 'decrement',
            itemId: commentsDrawer?.itemId!,
            rowId: commentsDrawer.rowId!,
            columnId: commentsDrawer.columnId!,
          });
          updateStateAfterDelete(id, parentId);
        },
      },
    );
  };

  const scrollToBottom = () => {
    const sectionContainer: HTMLElement = containerRef?.current!;
    if (sectionContainer) {
      sectionContainer.scrollTo({
        top: sectionContainer?.scrollHeight,
      });
    }
  };

  const updateComment = ({
    text,
    commentId,
    parentId,
  }: {
    text: string;
    commentId: number;
    parentId?: number;
  }) => {
    const regex = /(<([^>]+)>)/gi;
    const hasText = !!text.replace(regex, '').length;
    updateCommentItem(
      {
        updateCommentInput: {
          id: commentId,
          text: hasText ? text : '',
        },
      },
      {
        onSuccess: () => {
          emitToSocketMap(CommentEventsEnum.ITEM_COMMENT_EVENT, {
            action: ActionEnum.Update,
            itemId: commentsDrawer?.itemId,
            type: commentsDrawer.type!,
            rowFunction: commentsDrawer?.rowFunction,
            parentId,
            comment: { id: commentId, text },
          });
          if (hasText) {
            setComments(prev => {
              let copyCommentsList = deepcopy(prev);
              if (hasText) {
                if (parentId) {
                  copyCommentsList?.forEach(comment => {
                    if (comment?.id === parentId) {
                      comment?.replies?.forEach(itm => {
                        if (itm?.id === commentId) {
                          itm.text = text;
                        }
                      });
                    }
                  });
                  return copyCommentsList;
                } else {
                  copyCommentsList?.forEach(comment => {
                    if (comment?.id === commentId) {
                      comment.text = text;
                    }
                  });
                }
              }

              return copyCommentsList;
            });
          } else {
            updateStateAfterDelete(commentId, parentId);
          }
        },
      },
    );
  };

  const addCommentItem = (text: string, commentId?: number) => {
    let requestData: AddCommentInput = {
      rowId: commentsDrawer.rowId,
      stepId: commentsDrawer.stepId,
      itemId: commentsDrawer.itemId,
      itemType: commentsDrawer.type!,
      text,
    };
    if (commentId) {
      requestData = {
        ...requestData,
        commentId,
      };
    }
    addComment(
      {
        addCommentInput: requestData,
      },
      {
        onSuccess: data => {
          changeCommentsCount({
            type: commentsDrawer.type!,
            rowFunction: commentsDrawer?.rowFunction,
            actionType: 'increment',
            itemId: commentsDrawer?.itemId!,
            rowId: commentsDrawer.rowId!,
            columnId: commentsDrawer.columnId!,
          });
          const newComment = {
            itemId: commentsDrawer.itemId!,
            id: data?.addComment.id,
            type: commentsDrawer.type!,
            owner: {
              userId: user.userID,
              color: data?.addComment.owner.color,
              emailAddress: data?.addComment.owner.emailAddress,
              firstName: data?.addComment.owner.firstName,
              lastName: data?.addComment.owner.lastName,
            },
            updatedAt: data?.addComment.updatedAt,
            text,
            replies: data?.addComment.replies || [],
          };

          emitToSocketMap(CommentEventsEnum.ITEM_COMMENT_EVENT, {
            action: ActionEnum.Add,
            commentId: commentId,
            comment: newComment,
            itemId: commentsDrawer?.itemId,
            type: commentsDrawer.type!,
          });

          setComments(prev => {
            if (commentId) {
              prev = prev?.map(comment => {
                if (comment?.id === commentId) {
                  return {
                    ...comment,
                    replies: [...(comment?.replies || []), newComment],
                  };
                }
                return comment;
              });
              return prev;
            } else {
              return [...prev, newComment];
            }
          });
        },
      },
    );
  };

  useEffect(() => {
    return () => {
      setComments([]);
    };
  }, [commentsDrawer.isOpen, setComments]);

  useEffect(() => {
    emitToSocketMap(CommentEventsEnum.JOIN_ITEM_COMMENT_EVENT, {
      itemId: commentsDrawer?.itemId,
      type: commentsDrawer.type!,
    });
    return () => {
      emitToSocketMap(CommentEventsEnum.LEAVE_ITEM_COMMENT_EVENT, {
        itemId: commentsDrawer?.itemId,
        type: commentsDrawer.type!,
      });
    };
  }, [commentsDrawer?.itemId, commentsDrawer.type]);

  const changeCommentsData = useCallback(
    (socketData: unknown) => {
      setComments(prev => {
        const commentsCopy: CommentType[] = deepcopy(prev);
        return commentSocket(socketData, commentsCopy);
      });
    },
    [setComments],
  );

  useEffect(() => {
    socketMap?.on(CommentEventsEnum.ITEM_COMMENT_EVENT, (socketData: unknown) => {
      changeCommentsData(socketData);
    });
  }, [changeCommentsData]);

  const getTotalCommentsLength = (data: GetItemCommentsQuery[]) => {
    return data.reduce((totalLength, entry) => {
      if (entry.getItemComments && entry.getItemComments.comments) {
        return totalLength + entry.getItemComments.comments.length;
      }
      return totalLength;
    }, 0);
  };

  const handleCloseDrawer = () => {
    onClose();
  };

  useEffect(() => {
    const count = getTotalCommentsLength(dataQuery?.pages || []);
    if (
      isIntersecting &&
      !isFetching &&
      !commentsIsLoading &&
      dataQuery?.pages[0] &&
      dataQuery?.pages[0]?.getItemComments?.count &&
      count < dataQuery?.pages[0]?.getItemComments?.count
    ) {
      organizationPersonasFetchNextPage({
        pageParam: {
          getItemCommentsInput: {
            limit: COMMENTS_LIMIT,
            offset: comments.length,
            itemType: commentsDrawer.type,
            itemId: commentsDrawer.itemId!,
          },
        },
      }).then();
    }
  }, [
    comments.length,
    commentsDrawer.itemId,
    commentsDrawer.type,
    commentsIsLoading,
    dataQuery?.pages,
    isFetching,
    isIntersecting,
    organizationPersonasFetchNextPage,
  ]);

  return (
    <div className={'comments-drawer'} data-testid="comments-drawer">
      <ModalHeader title={commentsDrawer?.title || 'Untitled'} />
      <button onClick={handleCloseDrawer} aria-label={'close drawer'} className={'close-drawer'}>
        <CloseIcon fill={'#545E6B'} />
      </button>
      <div className={'comments-drawer--content'}>
        <div className={'comments-drawer--title'}>Comments</div>
        <div className="comments-drawer--comments-block" ref={containerRef}>
          {commentsIsLoading ? (
            <div>
              <CustomLoader />
            </div>
          ) : comments?.length ? (
            comments?.map((commentItem, index) => (
              <ErrorBoundary key={commentItem?.id}>
                <CommentItem
                  key={commentItem?.id}
                  isFirstLevel={true}
                  comment={commentItem}
                  index={index}
                  deleteComment={deleteComment}
                  updateComment={updateComment}
                  setLastMessageRef={ref => {
                    setLastMessageRef(ref);
                  }}
                  addComment={addCommentItem}
                />
              </ErrorBoundary>
            ))
          ) : (
            <div className={'comments-drawer--empty-state'}>
              <EmptyStateIcon />
              <div className={'comments-drawer--empty-state--title'}>
                There are no comments yet.
              </div>
              <div>
                Start a new conversation by entering your comments and let others comment them.
              </div>
            </div>
          )}
        </div>
        <div className={'comments-drawer--input-block'}>
          <CommentInput
            isUpdateMode={false}
            focus={() => {
              scrollToBottom();
            }}
            addComment={addCommentItem}
          />
        </div>
      </div>
    </div>
  );
};

export default CommentsDrawer;
