import { useParams, useRouter } from 'next/navigation';

import { ChangeEvent, FC, memo, MouseEvent, useCallback, useMemo, useRef, useState } from 'react';

import './style.scss';

import { ClickAwayListener } from '@mui/material';
import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { useSetRecoilState } from 'recoil';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import DragHandle from '@/components/templates/drag-handle';
import PersonaImages from '@/components/templates/persona-images';
import {
  UpdateJourneyMapMutation,
  useUpdateJourneyMapMutation,
} from '@/gql/mutations/generated/updateJourneyMap.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { JOURNEY_OPTIONS } from '@/utils/constants/options';
import {
  JourneyViewTypeEnum,
  menuViewTypeEnum,
  SelectedPersonasViewModeEnum,
} from '@/utils/ts/enums/global-enums';
import { JourneyMapCardType } from '@/utils/ts/types/journey-map/journey-map-types';
import { PersonaType } from '@/utils/ts/types/persona/persona-types';

dayjs.extend(fromNow);

interface IJourneyCard {
  map: JourneyMapCardType;
  viewType: JourneyViewTypeEnum;
  onHandleDelete: (data: JourneyMapCardType) => void;
  onHandleCopy: (data: JourneyMapCardType) => void;
}

const JourneyCard: FC<IJourneyCard> = memo(({ map, viewType, onHandleDelete, onHandleCopy }) => {
  const router = useRouter();
  const { boardID } = useParams();
  const setSnackbar = useSetRecoilState(snackbarState);

  const [isEditName, setIsEditName] = useState<boolean>(false);
  const [cardName, setCardName] = useState(map.title || 'Untitled');

  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: mutateUpdateJourneyMap } = useUpdateJourneyMapMutation<
    UpdateJourneyMapMutation,
    Error
  >();

  const onHandleNavigateJourneyMap = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      e.stopPropagation();
      router.push(`/board/${boardID}/journey-map/${map?.id}`);
    },
    [boardID, map?.id, router],
  );

  const onHandleCopyShareUrl = useCallback(async () => {
    await navigator?.clipboard?.writeText(
      `${process.env.NEXT_PUBLIC_AWS_URL}/board/${boardID}/journey-map/${map?.id}/guest`,
    );
    setSnackbar(prev => ({
      ...prev,
      message: 'The page URL was copied successfully.',
      open: true,
    }));
  }, [boardID, map?.id, setSnackbar]);

  const onHandleEdit = useCallback(() => {
    setIsEditName(prev => !prev);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  }, []);

  const onHandleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCardName(e.target.value);
    debounced400(() => {
      mutateUpdateJourneyMap({
        updateJourneyMapInput: {
          mapId: +map.id!,
          title: e.target.value,
        },
      });
    });
  };

  const options = useMemo(
    () =>
      JOURNEY_OPTIONS({
        onHandleEdit,
        onHandleDelete,
        onHandleCopy,
        onHandleCopyShareUrl,
      }),
    [onHandleCopy, onHandleCopyShareUrl, onHandleDelete, onHandleEdit],
  );

  return (
    <div
      className={`journey-card ${
        viewType === JourneyViewTypeEnum.BOARD ? 'journey-card-board-view' : ''
      }`}
      data-testid={`journey-card-${map?.id}`}
      onClick={onHandleNavigateJourneyMap}>
      {viewType === JourneyViewTypeEnum.STANDARD && (
        <>
          <DragHandle />
          <div className={'journey-card--menu'}>
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
              item={map}
              options={options}
              sxStyles={{
                display: 'inline-block',
                background: 'transparent',
              }}
            />
          </div>
        </>
      )}

      <div className={'journey-card--name-block'}>
        {isEditName ? (
          <ClickAwayListener onClickAway={() => setIsEditName(false)}>
            <div className={'journey-card--name'}>
              <CustomInput
                value={cardName}
                onClick={e => e.stopPropagation()}
                onChange={onHandleNameChange}
                inputRef={inputRef}
                onKeyDown={event => {
                  if (event.keyCode === 13) {
                    event.preventDefault();
                    (event.target as HTMLElement).blur();
                  }
                }}
              />
            </div>
          </ClickAwayListener>
        ) : (
          <p className={'journey-card--name'}>{cardName}</p>
        )}
      </div>
      <div
        className={`journey-card--content ${
          viewType === JourneyViewTypeEnum.BOARD ? 'board-view' : ''
        }`}>
        {viewType === JourneyViewTypeEnum.STANDARD && (
          <div className={'journey-card--content--create-details'}>
            <div>
              {map?.owner?.firstName} {map?.owner?.lastName}
            </div>
            <div> {dayjs(map?.createdAt)?.format('MMM D, YYYY')}</div>
          </div>
        )}
        <div className={'journey-card--content--images-block'}>
          <PersonaImages
            viewMode={SelectedPersonasViewModeEnum.MAP}
            personas={map.selectedPersonas as PersonaType[]}
          />
        </div>
        <div className={'journey-card--content--last-update'}>
          Last updated {dayjs(map?.updatedAt)?.format('MMM D, YYYY')}
        </div>
      </div>
    </div>
  );
});
export default JourneyCard;
