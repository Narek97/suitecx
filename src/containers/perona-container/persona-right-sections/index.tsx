import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import './style.scss';
import {
  DeletePersonaSectionMutation,
  useDeletePersonaSectionMutation,
} from '@/gql/mutations/generated/deletePersonaSection.generated';
import {
  UpdatePersonaSectionMutation,
  useUpdatePersonaSectionMutation,
} from '@/gql/mutations/generated/updatePersonSections.generated';
import { debounced400 } from '@/hooks/useDebounce';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { PERSON_SECTION_COLORS } from '@/utils/constants/colors';
import { getTextColorBasedOnBackground } from '@/utils/helpers/get-complementary-color';
import { emitToSocket, socket } from '@/utils/helpers/socket-connection';
import { ActionsEnum, EventsEnum } from '@/utils/ts/enums/global-enums';
import { PersonSectionType } from '@/utils/ts/types/persona/persona-types';
import { ClickAwayListener, Skeleton } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useParams } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import ChangeColorIcon from '@/public/operations/change-color.svg';
import CopyIcon from '@/public/operations/copy.svg';
import DeleteIcon from '@/public/operations/delete.svg';
import DragDropIcon from '@/public/operations/drag-drop.svg';
import PlusIcon from '@/public/operations/plus.svg';
import TickIcon from '@/public/operations/tick.svg';

const ResponsiveReactGridLayout = WidthProvider(Responsive);

const SKELETON_COUNT = 6;
const SIZES = ['lg', 'md', 'sm'];

interface IPersonaSections {
  isLoadingPersonaSections: boolean;
  onHandleAddSection: (layout: PersonSectionType | null) => void;
  dataPersonaSections: Array<PersonSectionType>;
}

const PersonaRightSections: FC<IPersonaSections> = memo(
  ({ isLoadingPersonaSections, onHandleAddSection, dataPersonaSections }) => {
    const queryClient = useQueryClient();
    const { personaID } = useParams();
    const setSnackbar = useSetRecoilState(snackbarState);

    const [layouts, setLayouts] = useState<Array<PersonSectionType>>([]);
    const [layoutSize, setLayoutSize] = useState<string>('');
    const [isDragStart, setIsDragStart] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [isDraggable, setIsDraggable] = useState<boolean>(true);
    const [initialLayouts, setInitialLayouts] = useState<Array<PersonSectionType>>([]);
    const [disabledItemsId, setDisabledItemsId] = useState<number[]>([]);
    const { mutate: mutatePersonSections } = useUpdatePersonaSectionMutation<
      UpdatePersonaSectionMutation,
      Error
    >({});

    const { mutate: mutateDeletePersonSection } = useDeletePersonaSectionMutation<
      DeletePersonaSectionMutation,
      Error
    >({
      onSuccess: async () => {
        setSnackbar(prev => ({
          ...prev,
          message: 'A card has been deleted',
          open: true,
        }));
        await queryClient.invalidateQueries({
          queryKey: ['GetPersonaSections'],
        });
      },
    });

    const onLayoutChange = (newLayout: Array<PersonSectionType>) => {
      const newDataLayout: Array<PersonSectionType> = newLayout.map((el, index = 0) => ({
        w: el.w,
        h: el.h,
        x: el.x,
        y: el.y,
        i: el.i,
        id: initialLayouts[index]?.id,
        key: initialLayouts[index]?.key,
        color: initialLayouts[index]?.color,
        content: initialLayouts[index]?.content,
      }));
      if (SIZES.includes(layoutSize)) {
        setLayouts(initialLayouts);
      } else {
        setLayouts(newDataLayout);
      }
      if (isDragStart) {
        emitToSocket(EventsEnum.PERSONA_SECTION_EVENT, {
          personaId: +personaID!,
          layouts: newDataLayout,
        });
        setInitialLayouts(newDataLayout);
        setIsDragStart(false);
        mutatePersonSections({
          updatePersonaSectionInput: {
            updatePersonaSection: newDataLayout,
          },
        });
      }
    };

    const onHandleTextChange = useCallback(
      (value: string, i: string, key: string) => {
        const newDataLayout = layouts.map(el => {
          if (el.i === i) {
            // @ts-ignore
            el[key] = value;
          }
          return el;
        });
        debounced400(() => {
          mutatePersonSections({
            updatePersonaSectionInput: {
              updatePersonaSection: newDataLayout,
            },
          });
          emitToSocket(EventsEnum.PERSONA_SECTION_EVENT, {
            personaId: +personaID!,
            layouts: newDataLayout,
          });
        });
        setLayouts(newDataLayout);
        setInitialLayouts(newDataLayout);
      },
      [layouts, mutatePersonSections, personaID],
    );

    const onHandleCopyPersonaSection = useCallback(
      (layout: PersonSectionType) => {
        onHandleAddSection(layout);
      },
      [onHandleAddSection],
    );

    const onHandleDeletePersonaSection = useCallback(
      (id: number) => {
        mutateDeletePersonSection({
          id,
        });
      },
      [mutateDeletePersonSection],
    );

    const onToggleIsDraggable = useCallback((isDraggableParam: boolean) => {
      setIsDraggable(isDraggableParam);
    }, []);

    const onMouseDownCapture = (layout: PersonSectionType) => {
      if (!disabledItemsId.includes(layout.id)) {
        emitToSocket(EventsEnum.PERSONA_SECTION_EVENT, {
          type: ActionsEnum.DISABLE,
          id: layout.id,
          personaId: +personaID!,
        });
      }
    };

    const onMouseLeave = (layout: PersonSectionType) => {
      if (!disabledItemsId.includes(layout.id)) {
        emitToSocket(EventsEnum.PERSONA_SECTION_EVENT, {
          type: ActionsEnum.ENABLE,
          id: layout.id,
          personaId: +personaID!,
        });
      }
    };

    useEffect(() => {
      if (dataPersonaSections) {
        const data = dataPersonaSections.map(el => ({
          id: el.id,
          w: el.w,
          h: el.h,
          x: el.x,
          y: el.y,
          i: el.i,
          color: el.color,
          content: el.content,
          key: el.key,
        }));

        setLayouts(data);
        setInitialLayouts(data);
        emitToSocket(EventsEnum.PERSONA_SECTION_EVENT, {
          personaId: +personaID!,
          layouts: data,
        });
      }

      setMounted(true);
    }, [dataPersonaSections, personaID]);

    useEffect(() => {
      emitToSocket(EventsEnum.JOIN_PERSONA_SECTION_EVENT, {
        id: +personaID!,
      });
      socket?.on(EventsEnum.PERSONA_SECTION_EVENT, async (data: any) => {
        if (data.type === ActionsEnum.DISABLE) {
          setDisabledItemsId(prev => [...prev, data.id]);
        } else if (data.type === ActionsEnum.ENABLE) {
          setDisabledItemsId(prev => prev.filter(id => id !== data.id));
        } else {
          setLayouts(data.layouts);
          setInitialLayouts(data.layouts);
        }
      });
    }, [personaID, queryClient]);

    if (isLoadingPersonaSections) {
      return (
        <div className={'persona-sections--skeletons'}>
          {Array(SKELETON_COUNT)
            .fill('')
            .map((_, index) => (
              <Skeleton
                key={index}
                sx={{
                  width: 'auto',
                  height: '128px',
                }}
                animation="wave"
                variant="rectangular"
              />
            ))}
        </div>
      );
    }
    return (
      <div className={'persona-sections'}>
        <ResponsiveReactGridLayout
          layouts={layouts as any}
          rowHeight={128}
          autoSize
          cols={{ lg: 2, md: 2, sm: 2, xs: 1, xxs: 1 }}
          measureBeforeMount={false}
          useCSSTransforms={mounted}
          isDroppable={isDraggable}
          isDraggable={isDraggable}
          isResizable={isDraggable}
          onDragStart={() => {
            setIsDragStart(true);
          }}
          onResizeStart={() => setIsDragStart(true)}
          onBreakpointChange={bp => setLayoutSize(bp)}
          onLayoutChange={onLayoutChange}>
          {layouts.map((layout, index) => {
            const color = getTextColorBasedOnBackground(layout.color || '#545e6b');
            return (
              <div
                // style={{ height: `${layout.h * 128}px` }}
                key={layout.id + index}
                data-grid={layout}
                className={'persona-sections--section'}
                style={{ backgroundColor: layout.color }}
                onMouseDownCapture={() => onMouseDownCapture(layout)}
                onMouseLeave={() => onMouseLeave(layout)}>
                <SectionCard
                  color={color}
                  layout={layout}
                  isDisable={disabledItemsId.includes(layout.id)}
                  onHandleCopyPersonaSection={() => onHandleCopyPersonaSection(layout)}
                  onHandleDeletePersonaSection={onHandleDeletePersonaSection}
                  onHandleTextChange={onHandleTextChange}
                  onToggleIsDraggable={onToggleIsDraggable}
                />
              </div>
            );
          })}
        </ResponsiveReactGridLayout>
      </div>
    );
  },
);

export default PersonaRightSections;

interface ISectionCard {
  color: string;
  layout: PersonSectionType;
  isDisable: boolean;
  onHandleTextChange: (value: string, i: string, key: string) => void;
  onHandleCopyPersonaSection: () => void;
  onHandleDeletePersonaSection: (id: number) => void;
  onToggleIsDraggable: (isDraggableParam: boolean) => void;
}

const SectionCard: FC<ISectionCard> = memo(
  ({
    color,
    layout,
    isDisable,
    onHandleTextChange,
    onHandleCopyPersonaSection,
    onHandleDeletePersonaSection,
    onToggleIsDraggable,
  }) => {
    const [isOpenPopover, setIsOpenPopover] = useState<boolean>(false);

    const onHandleTogglePopup = () => {
      setIsOpenPopover(prev => !prev);
    };

    return (
      <>
        <div
          className={`persona-sections--section-menu ${
            isOpenPopover ? 'persona-sections--open-section-menu' : ''
          }`}
          style={{ color }}>
          <div className={'persona-sections--section-menu--left-actions'}>
            <span
              className={'persona-sections--section-menu--drag-drop-btn'}
              onMouseMove={() => onToggleIsDraggable(true)}
              onMouseLeave={() => onToggleIsDraggable(false)}>
              <DragDropIcon fill={color} />
            </span>
            <p>
              <input
                className={'persona-sections--section-menu--title'}
                value={layout.key}
                disabled={isDisable}
                onChange={e => onHandleTextChange(e.target.value, layout.i, 'key')}
              />
            </p>
          </div>
          <div className={'persona-sections--section-menu--right-actions'}>
            <ClickAwayListener
              onClickAway={() => {
                setIsOpenPopover(false);
              }}>
              <div className={`persona-sections--section-menu--change-color-block`}>
                <ul
                  className={`persona-sections--section-menu--change-color-block--colors  ${
                    isOpenPopover
                      ? 'persona-sections--section-menu--change-color-block--open-colors'
                      : ''
                  }`}
                  onMouseMove={() => onToggleIsDraggable(false)}
                  onMouseLeave={() => onToggleIsDraggable(true)}>
                  {PERSON_SECTION_COLORS.map(colorItem => (
                    <li
                      style={{
                        backgroundColor: colorItem.color,
                        border: `2px solid #00000040`,
                      }}
                      className={'persona-sections--section-menu--change-color-block--color-li'}
                      key={colorItem.id}
                      onClick={() => onHandleTextChange(colorItem.color, layout.i, 'color')}>
                      {layout.color === colorItem.color && (
                        <TickIcon
                          width={12}
                          fill={layout.color === '#545E6B' ? '#ffffff' : '#545E6B'}
                        />
                      )}
                    </li>
                  ))}

                  <label
                    htmlFor={layout.id?.toString()}
                    style={{
                      border: `2px solid #00000040`,
                    }}
                    className={'persona-sections--section-menu--change-color-block--color-li'}>
                    <input
                      id={layout.id?.toString()}
                      type="color"
                      disabled={isDisable}
                      onChange={e => onHandleTextChange(e.target.value, layout.i, 'color')}
                    />
                    {PERSON_SECTION_COLORS.some(el => el.color === layout.color) ? (
                      <PlusIcon fill={'#00000040'} />
                    ) : (
                      <div
                        style={{ background: layout.color }}
                        className={
                          'persona-sections--section-menu--change-color-block--custom-color'
                        }
                      />
                    )}
                  </label>
                </ul>
                <button
                  disabled={isDisable}
                  aria-label={'color'}
                  className={`persona-sections--section-menu--change-color-btn ${
                    isOpenPopover ? 'persona-sections--section-menu--open-change-color-btn' : ''
                  }`}
                  onMouseMove={() => onToggleIsDraggable(false)}
                  onMouseLeave={() => onToggleIsDraggable(true)}
                  onClick={onHandleTogglePopup}>
                  <ChangeColorIcon fill={'#545E6B'} />
                </button>
              </div>
            </ClickAwayListener>

            <button
              disabled={isDisable}
              aria-label={'copy'}
              className={'persona-sections--section-menu--copy-btn'}
              onMouseMove={() => onToggleIsDraggable(false)}
              onMouseLeave={() => onToggleIsDraggable(true)}
              onClick={onHandleCopyPersonaSection}>
              <CopyIcon />
            </button>

            <button
              disabled={isDisable}
              aria-label={'delete'}
              className={'persona-sections--section-menu--delete-btn'}
              onMouseMove={() => onToggleIsDraggable(false)}
              onMouseLeave={() => onToggleIsDraggable(true)}
              onClick={() => onHandleDeletePersonaSection(layout.id)}>
              <DeleteIcon fill={'#545E6B'} />
            </button>
          </div>
        </div>

        <div
          className={'persona-sections--section-input-block'}
          onMouseMove={() => onToggleIsDraggable(false)}
          onMouseLeave={() => onToggleIsDraggable(true)}>
          <textarea
            disabled={isDisable}
            onMouseMove={() => {
              onToggleIsDraggable(false);
            }}
            onMouseLeave={() => onToggleIsDraggable(false)}
            className={`persona-sections--section-input ${
              color === '#545e6b'
                ? 'persona-sections--section-grey-placeholder-input'
                : 'persona-sections--section-white-placeholder-input'
            }`}
            style={{ ['--color' as string]: color || '#1b87e6' }}
            placeholder={'Type here...'}
            value={layout.content}
            onChange={e => onHandleTextChange(e.target.value, layout.i, 'content')}
          />
        </div>
      </>
    );
  },
);
