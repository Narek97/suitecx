interface ICommentInput {
  addComment: (text: string, commentId?: number) => void;
  isUpdateMode: boolean;
  focus?: () => void;
  value?: string;
}

import React, { FC, useEffect, useRef, useState } from 'react';
import './style.scss';

import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';
import { Mention, MentionBlot } from 'quill-mention';
import { useRecoilValue } from 'recoil';

import SendIcon from '@/public/base-icons/send.svg';
Quill.register({ 'blots/mention': MentionBlot, 'modules/mention': Mention });
import { orgUsersState } from '@/store/atoms/orgUsers.atom';

const CommentInput: FC<ICommentInput> = ({ addComment, value }) => {
  const allUsers = useRecoilValue(orgUsersState);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [quillInstance, setQuillInstance] = useState<Quill | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');

  const onHandleAddComment = () => {
    if (quillInstance) {
      // const editorContent = quillInstance.getContents(); // Get the Delta object
      // const plainText = quillInstance.getText(); // Get plain text
      const htmlContent = quillInstance.root.innerHTML; // Get HTML content
      addComment(htmlContent);
      quillInstance?.clipboard.dangerouslyPasteHTML('');
      setEditorContent('');
    }
    return null;
  };

  useEffect(() => {
    if (editorRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Type to comment',
        modules: {
          toolbar: false,
          mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ['@', '#'],
            source: function (
              searchTerm: string,
              renderList: (matches: any, searchTerm: string) => void,
            ) {
              if (searchTerm.length === 0) {
                renderList(allUsers, searchTerm);
              } else {
                const matches = allUsers.filter(
                  user =>
                    user.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()),
                );
                renderList(matches, searchTerm);
              }
            },
          },
        },
      });

      setQuillInstance(quill);
    }
  }, [allUsers]);

  useEffect(() => {
    if (value) {
      quillInstance?.clipboard.dangerouslyPasteHTML(value);
      quillInstance?.focus();
      quillInstance?.setSelection(quillInstance.getText().length, quillInstance.getText().length);
    }
  }, [quillInstance, value]);

  quillInstance?.on('text-change', () => {
    setEditorContent(quillInstance.getText() || '');
  });

  return (
    <div className={'comment-input'}>
      <div ref={editorRef} />

      <button
        disabled={editorContent.length < 1}
        className="send-comment"
        data-testid="send-comment-test-id"
        onClick={onHandleAddComment}>
        <SendIcon fill={editorContent.length > 1 ? '#1B87E6' : '#D8D8D8'} />
      </button>
    </div>
  );
};

export default CommentInput;
