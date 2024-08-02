import React, { ChangeEvent, FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import './style.scss';

import { Tooltip } from '@mui/material';
import { useParams } from 'next/navigation';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import PersonaImageBox from '@/components/templates/persona-image-box';
import { useUndoRedo } from '@/containers/journey-map-container/hooks/useUndoRedo';
import {
  UpdateJourneyMapMutation,
  useUpdateJourneyMapMutation,
} from '@/gql/mutations/generated/updateJourneyMap.generated';
import { debounced400 } from '@/hooks/useDebounce';
import RedoIcon from '@/public/journey-map/redo.svg';
import UndoIcon from '@/public/journey-map/undo.svg';
import ShareIcon from '@/public/operations/share.svg';
import { breadcrumbState } from '@/store/atoms/breadcrumb.atom';
import {
  isOpenSelectedJourneyMapPersonaInfoState,
  selectedJourneyMapPersona,
} from '@/store/atoms/journeyMap.atom';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { ImageSizeEnum } from '@/utils/ts/enums/global-enums';

interface IJourneyMapHeader {
  title: string;
  isGuest: boolean;
}

const JourneyMapHeader: FC<IJourneyMapHeader> = memo(({ title, isGuest }) => {
  const { mapID, boardID } = useParams();
  const { handleUndo, handleRedo } = useUndoRedo();

  const headerRef = useRef<HTMLDivElement>(null);

  const setIsOpenSelectedJourneyMapPersonaInfo = useSetRecoilState(
    isOpenSelectedJourneyMapPersonaInfoState,
  );
  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);
  const setBreadcrumb = useSetRecoilState(breadcrumbState);
  const setSnackbar = useSetRecoilState(snackbarState);

  const [titleValue, setTitleValue] = useState<string>(title);

  const { mutate: mutateUpdateJourneyMap } = useUpdateJourneyMapMutation<
    UpdateJourneyMapMutation,
    Error
  >();

  const onHandleUpdateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value);
    const newTitle = e.target.value;
    setBreadcrumb(prev => [...prev.slice(0, prev.length - 1), { name: newTitle }]);
    debounced400(() => {
      mutateUpdateJourneyMap({
        updateJourneyMapInput: {
          mapId: +mapID!,
          title: newTitle,
        },
      });
      setTitleValue(newTitle);
    });
  };

  const onHandleCopyPageUrl = useCallback(async () => {
    setSnackbar(prev => ({
      ...prev,
      message: 'The page URL was copied successfully.',
      open: true,
    }));
    await navigator.clipboard?.writeText(
      `${process.env.NEXT_PUBLIC_APP}/board/${boardID}/journey-map/${mapID}/guest`,
    );
  }, [boardID, mapID, setSnackbar]);

  useEffect(() => {
    setTitleValue(title);
  }, [title]);

  return (
    <div className={'journey-map-header'} id={'journey-map-header'} ref={headerRef}>
      <div className={'journey-map-header--top-block'}>
        <div className={'journey-map-header--left-block'}>
          {selectedPerson && (
            <button
              onClick={() => setIsOpenSelectedJourneyMapPersonaInfo(prev => !prev)}
              aria-label={'Persona'}>
              <PersonaImageBox
                title={''}
                size={ImageSizeEnum.SM}
                imageItem={{
                  color: selectedPerson.color || '',
                  attachment: {
                    url: selectedPerson.attachment?.url || '',
                    key: selectedPerson.attachment?.key || '',
                  },
                }}
              />
            </button>
          )}

          <div className="journey-map-header--title">
            <CustomInput
              value={titleValue}
              data-testid="journey-map-test-id"
              // autoFocus={true}
              id={'map-title'}
              sxStyles={{
                background: 'transparent',
                '& .MuiInput-input': {
                  fontSize: '24px',
                  background: '#f5f5f5',
                },
                '& .Mui-focused': {
                  backgroundColor: 'white',
                },
              }}
              onChange={onHandleUpdateTitle}
              onFocus={() => {}}
              onBlur={() => {}}
              onKeyDown={event => {
                if (event.keyCode === 13) {
                  event.preventDefault();
                  (event.target as HTMLElement).blur();
                }
              }}
              disabled={isGuest}
            />
          </div>
        </div>

        <div className="journey-map-header--right-block">
          <div className="journey-map-header--right-block--operations">
            <Tooltip title={'Undo'} data-testid={'undo-map-btn'}>
              <button aria-label={'Undo'} onClick={handleUndo}>
                <UndoIcon />
              </button>
            </Tooltip>

            <Tooltip title={'Redo'} data-testid={'redo-map-btn'}>
              <button aria-label={'Redo'} onClick={handleRedo}>
                <RedoIcon />
              </button>
            </Tooltip>

            <Tooltip title={'Share'}>
              <button
                aria-label={'Share'}
                data-testid={'share-map-btn'}
                onClick={onHandleCopyPageUrl}>
                <ShareIcon fill="#545E6B" />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
});

export default JourneyMapHeader;
