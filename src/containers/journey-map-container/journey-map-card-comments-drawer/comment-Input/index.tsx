'use client';
import { FC, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';

import './style.scss';

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';

import SendIcon from '@/public/base-icons/send.svg';

interface ICommentInput {
  addComment: (text: string, commentId?: number) => void;
  isUpdateMode: boolean;
  focus?: () => void;
  value?: string;
}

const CommentInput: FC<ICommentInput> = ({ addComment, focus, value, isUpdateMode }) => {
  // const allUsers = useRecoilValue(orgUsersState);

  const [isEmpty, setIsEmpty] = useState<boolean>(true);

  const editorRef = useRef<any>(null);

  const onHandleChange = useCallback(() => {
    const content = editorRef.current?.editor?.getText().trim();
    if (!content.length) {
      setIsEmpty(true);
    } else {
      setIsEmpty(false);
    }
  }, []);

  // const suggestPeople = useCallback(
  //   (searchTerm: any) => {
  //     return allUsers.filter(person => person.value.includes(searchTerm));
  //   },
  //   [allUsers],
  // );
  // todo
  const modules = {
    toolbar: false,
    // mention: {
    //   allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
    //   mentionDenotationChars: ['@'],
    //   spaceAfterInsert: true,
    //   source: useCallback(
    //     async (searchTerm: any, renderList: any) => {
    //       const matchedPeople = await suggestPeople(searchTerm);
    //       renderList(matchedPeople);
    //     },
    //     [suggestPeople],
    //   ),
    // },
  };

  const handleInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        if (!event.shiftKey && !isEmpty) {
          addComment(editorRef.current.getEditor()?.root?.innerHTML);
        }
        editorRef.current.getEditor().setContents([{ insert: '\n' }]);
      }
    },
    [addComment, isEmpty],
  );

  useEffect(() => {
    if (value) {
      editorRef.current.getEditor().setContents([{ insert: value }]);
      const quill = editorRef.current.getEditor();
      quill.clipboard.dangerouslyPasteHTML(value);
      const newPosition = quill.getLength();
      quill.setSelection(newPosition);
    }
  }, [value]);

  return (
    <>
      <div className={'comment-input'}>
        <button
          disabled={isEmpty}
          className="send-comment"
          data-testid="send-comment-test-id"
          onClick={() => {
            addComment(editorRef.current.getEditor()?.root?.innerHTML);
            if (!isUpdateMode) {
              editorRef.current.getEditor().setContents([{ insert: '' }]);
            }
          }}>
          <SendIcon fill={!isUpdateMode && isEmpty ? '#D8D8D8' : '#1B87E6'} />
        </button>
        <ReactQuill
          className={'comments-editor'}
          ref={editorRef}
          modules={modules}
          onFocus={() => {
            focus && focus();
          }}
          onKeyDown={handleInputKeyDown}
          placeholder={'Type to comment'}
          onChange={onHandleChange}
        />
      </div>
    </>
  );
};

export default CommentInput;
