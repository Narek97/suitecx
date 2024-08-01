import JourneyCard from '@/containers/journies-conatiner/sortable-journeys/journey-card';

import React, { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './style.scss';
import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { useRouter } from 'next/navigation';

import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import DragHandle from '@/components/templates/drag-handle';
import WorkspaceAnalytics from '@/components/templates/workspace-analytics';
import { UpdateBoardInput } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import { BOARD_CARD_OPTIONS } from '@/utils/constants/options';
import { JourneyViewTypeEnum, menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { BoardType } from '@/utils/ts/types/board/board-types';

dayjs.extend(fromNow);

interface IBoardCard {
  board: BoardType;
  updateBoardName: (data: UpdateBoardInput) => void;
  onToggleBoardDeleteModal: (board: BoardType) => void;
  onToggleAllPinnedOutcomesModal: (board: BoardType) => void;
}

const BoardCard: FC<IBoardCard> = memo(
  ({ board, onToggleBoardDeleteModal, updateBoardName, onToggleAllPinnedOutcomesModal }) => {
    const router = useRouter();

    const inputRef = useRef<HTMLInputElement>(null);

    const [isTitleEditMode, setIsTitleEditMode] = useState<boolean>(false);
    const [boardName, setBoardName] = useState<string>(board?.name);
    const [maxCardNumber, setIsMaxCardNumber] = useState<number>(0);

    const onNavigateWhiteboardPage = () => {
      router.push(`/board/${board.id}/journies`);
    };

    const options = useMemo(() => {
      return BOARD_CARD_OPTIONS({
        onHandleEdit: () => {
          setIsTitleEditMode(true);
        },
        onHandleDelete: onToggleBoardDeleteModal,
      });
    }, [onToggleBoardDeleteModal]);

    const handleResize = () => {
      const cardNumber =
        window.innerWidth > 0 && window.innerWidth <= 1100
          ? 1
          : window.innerWidth > 1100 && window.innerWidth < 1380
            ? 2
            : window.innerWidth >= 1380 && window.innerWidth <= 1650
              ? 3
              : 4;
      setIsMaxCardNumber(cardNumber);
    };

    const onChangeName = useCallback(
      (title: string) => {
        setBoardName(title);
        debounced400(() => {
          updateBoardName({ name: title, id: board?.id });
        });
      },
      [board?.id, updateBoardName],
    );

    useEffect(() => {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (isTitleEditMode && inputRef.current) {
        inputRef.current.focus();
      }
    }, [isTitleEditMode]);

    return (
      <div
        className={'board-card'}
        data-testid={`board-card-${board?.id}`}
        onClick={onNavigateWhiteboardPage}>
        <DragHandle />

        <div className={'board-card--left'}>
          <div className={'board-card--name-block'}>
            {isTitleEditMode ? (
              <CustomInput
                data-testid="board-name-section-test-id"
                style={{
                  background: 'none',
                }}
                aria-label={boardName}
                className={'board-card--name-block-input'}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                inputRef={inputRef}
                value={boardName}
                onChange={e => {
                  onChangeName(e?.target?.value);
                }}
                onBlur={() => {
                  setIsTitleEditMode(false);
                }}
                onKeyDown={event => {
                  if (event.keyCode === 13) {
                    event.preventDefault();
                    (event.target as HTMLElement).blur();
                  }
                }}
              />
            ) : (
              <div className={'board-card--name'}>
                <p className={'board-card--name-text'}>{boardName}</p>
                <div className={'board-card--menu'}>
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
                    item={board}
                    options={options}
                    sxStyles={{
                      display: 'inline-block',
                      background: 'transparent',
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className={'board-card--analytics'}>
            <WorkspaceAnalytics
              showType={'horizontal-type'}
              fontSize={'small-font-size'}
              data={{
                journeyMapCount: board?.journeyMapCount || 0,
                personasCount: board?.personasCount || 0,
              }}
              pinnedOutcomeGroupCount={board.pinnedOutcomeGroupCount}
              outcomeGroups={board.outcomeGroupWithOutcomeCounts}
              viewAll={() => onToggleAllPinnedOutcomesModal(board)}
            />
          </div>
        </div>
        <ul className={'board-card--right'}>
          {board?.journeyMapCount > 0 ? (
            <>
              <div className={'board-card--right-journies'}>
                {board?.maps
                  ?.slice(0, maxCardNumber)
                  ?.map(mapItem => (
                    <JourneyCard
                      key={mapItem?.id}
                      viewType={JourneyViewTypeEnum.BOARD}
                      map={mapItem}
                      boardID={+board?.id}
                      onHandleDelete={() => {}}
                      onHandleCopy={() => {}}
                    />
                  ))}
              </div>
              {board?.journeyMapCount > maxCardNumber && (
                <li className={'board-card--right-more-block'}>
                  and {board?.journeyMapCount - maxCardNumber} more
                </li>
              )}
            </>
          ) : (
            <div className={'no-maps-info'}>No journey maps yet</div>
          )}
        </ul>
      </div>
    );
  },
);

export default BoardCard;
