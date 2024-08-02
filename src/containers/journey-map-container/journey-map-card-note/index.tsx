import { FC } from 'react';

import './style.scss';

import { ClickAwayListener } from '@mui/material';
import { useRecoilState } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import { useCreateOrUpdateNoteMutation } from '@/gql/mutations/generated/createUpdateNote.generated';
import {
  GetItemNoteQuery,
  useGetItemNoteQuery,
} from '@/gql/queries/generated/getItemNote.generated';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import NoteIcon from '@/public/journey-map/note.svg';
import { noteState } from '@/store/atoms/note.atom';

interface IJourneyMapCardNote {
  itemId: number;
  stepId: number;
  rowId: number;
  type: CommentAndNoteModelsEnum;
  onClickAway: () => void;
}

const JourneyMapCardNote: FC<IJourneyMapCardNote> = ({
  itemId,
  stepId,
  rowId,
  type,
  onClickAway,
}) => {
  const [note, setNote] = useRecoilState(noteState);

  const { isLoading: isLoadingNote } = useGetItemNoteQuery<GetItemNoteQuery, Error>(
    {
      getItemNoteInput: {
        itemId,
        rowId,
        stepId,
        itemType: type,
      },
    },
    {
      cacheTime: 0,
      enabled: !!itemId,
      onSuccess: noteItemData => {
        setNote(noteItemData?.getItemNote);
      },
    },
  );
  const { mutate: createOrUpdate } = useCreateOrUpdateNoteMutation({
    onSuccess: async () => {},
  });

  const createOrUpdateNote = (text: string) => {
    if (note) {
      setNote({ ...note, text });
    }
    debounced400(() => {
      createOrUpdate({
        createOrUpdateNoteInput: {
          rowId,
          stepId,
          itemType: type,
          itemId,
          text,
        },
      });
    });
  };

  return (
    <ClickAwayListener onClickAway={onClickAway}>
      <div className={'note-section'} data-testid={`note-${itemId}-test-id`}>
        {isLoadingNote ? (
          <CustomLoader />
        ) : (
          <>
            <div className="note-section--content">
              <div className="note-section--content--icon">
                <NoteIcon />
              </div>
              <CustomInput
                multiline={true}
                maxRows={3}
                // onBlur={() => setIsEditMode(false)}
                data-testid="note-test-id"
                placeholder={'Note'}
                sxStyles={{
                  background: 'transparent',
                  '& .Mui-focused': {
                    backgroundColor: '#FFF3C2',
                  },
                  '& .MuiInputBase-formControl,textarea': {
                    padding: '0',
                  },
                }}
                value={note?.text}
                onChange={e => createOrUpdateNote(e?.target?.value)}
                // onKeyDown={event => {
                //   if (event.keyCode === 13) {
                //     event.preventDefault();
                //     (event.target as HTMLElement).blur();
                //   }
                // }}
              />
            </div>
          </>
        )}
      </div>
    </ClickAwayListener>
  );
};

export default JourneyMapCardNote;
