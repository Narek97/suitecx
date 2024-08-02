import React, { FC, memo, useCallback, useMemo, useState } from 'react';

import './style.scss';

import { CardHeader } from '@mui/material';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import PersonaImageBox from '@/components/templates/persona-image-box';
import {
  DeleteMapLinkMutation,
  useDeleteMapLinkMutation,
} from '@/gql/mutations/generated/deleteLink.generated';
import { CommentAndNoteModelsEnum } from '@/gql/types';
import JourneyIcon from '@/public/journey-map/journey.svg';
import LinkIcon from '@/public/journey-map/link.svg';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { TOKEN_NAME } from '@/utils/constants/general';
import { LINK_ITEM_OPTIONS } from '@/utils/constants/options';
import { getCookies } from '@/utils/helpers/cookies';
import { ActionsEnum, ImageSizeEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';
import { LinkType } from '@/utils/ts/types/link/link-type';

interface ILinkItem {
  link: LinkType;
  disabled: boolean;
  rowItem: BoxItemType;
  dragHandleProps: ObjectKeysType;
  onHandleToggleCreateUpdateModal: (stepId?: number, link?: LinkType) => void;
  onHandleUpdateMapByType: (type: JourneyMapRowActionEnum, action: ActionsEnum, data: any) => void;
}

const LinkItem: FC<ILinkItem> = memo(
  ({
    link,
    disabled,
    rowItem,
    dragHandleProps,
    onHandleToggleCreateUpdateModal,
    onHandleUpdateMapByType,
  }) => {
    const { boardID } = useParams();
    const token = getCookies(TOKEN_NAME);
    const setUndoActions = useSetRecoilState(undoActionsState);
    const setRedoActions = useSetRecoilState(redoActionsState);

    const [isOpenNote, setIsOpenNote] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { mutate: mutateDeleteLink } = useDeleteMapLinkMutation<DeleteMapLinkMutation, Error>({
      onSuccess: () => {
        const data = {
          ...link,
          stepId: rowItem.step.id,
        };

        onHandleUpdateMapByType(JourneyMapRowActionEnum.LINKS, ActionsEnum.DELETE, data);
        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.LINKS,
            action: ActionsEnum.CREATE,
            data,
          },
        ]);
      },
    });

    const getLinkHref = () => {
      let url = `${process.env.NEXT_PUBLIC_APP}/board/${boardID}/journey-map/${link.linkedJourneyMapId}`;
      if (!token) {
        url += '/guest';
      }
      return url;
    };

    const onHandleEdit = useCallback(() => {
      onHandleToggleCreateUpdateModal(rowItem.step.id, link);
    }, [link, onHandleToggleCreateUpdateModal, rowItem.step.id]);

    const onHandleDelete = useCallback(async () => {
      setIsLoading(true);
      mutateDeleteLink({
        id: link.id,
      });
    }, [link.id, mutateDeleteLink]);

    const onHandleToggleNote = useCallback(() => {
      setIsOpenNote(prev => !prev);
    }, []);

    const options = useMemo(() => {
      return LINK_ITEM_OPTIONS({
        onHandleEdit,
        onHandleDelete,
      });
    }, [onHandleDelete, onHandleEdit]);

    const commentRelatedData = {
      title: link.title,
      itemId: link.id,
      rowId: link.rowId,
      columnId: rowItem.columnId!,
      stepId: rowItem.step.id,
      type: CommentAndNoteModelsEnum.Links,
    };

    return (
      <div className={'link-item'} data-testid={'link-item-test-id'}>
        <div className={`${isLoading ? 'link-item--loading' : ''}`} />
        <CardHeader
          icon={<LinkIcon />}
          isShowPerson={!!link.personaImage}
          persona={{
            name: '',
            url: link.personaImage?.url || '',
            key: link.personaImage?.key || '',
          }}
          isShowNote={isOpenNote}
          note={{
            id: link.id,
            type: CommentAndNoteModelsEnum.Links,
            rowId: link.rowId,
            stepId: rowItem?.step.id,
            onHandleOpenNote: onHandleToggleNote,
            onClickAway: onHandleToggleNote,
          }}
          comment={{
            count: link?.commentsCount,
            item: commentRelatedData,
          }}
          menu={{
            item: commentRelatedData,
            options,
            disabled,
          }}
          dragHandleProps={dragHandleProps}
        />
        <div className={'link-item--content'}>
          <div data-testid={`link-item-${link.id}-logo-title-test-id`}>
            {link.type === 'JOURNEY' ? (
              <span className={'link-item--content--logo-title'}>
                <JourneyIcon fill={'#1B3380'} />
                <a href={getLinkHref()} target={'_blank'} rel="noreferrer">
                  {link.title}
                </a>
              </span>
            ) : (
              <span className={'link-item--content--logo-title'}>
                <Image
                  width={200}
                  height={200}
                  style={{
                    width: '20px',
                    height: '20px',
                  }}
                  src={link.icon || ''}
                  alt="Logo"
                />
                <a href={link.url} target={'_blank'} rel="noreferrer">
                  {link.title}
                </a>
              </span>
            )}
          </div>
          <ul className={'link-item--content--personas'}>
            {link.mapPersonaImages.slice(0, 3).map((persona, index) => (
              <li key={index}>
                <PersonaImageBox
                  title={''}
                  imageItem={{
                    color: persona?.color || '#B052A7',
                    isSelected: true,
                    attachment: {
                      url: persona.url || '',
                      key: persona.key || '',
                    },
                  }}
                  size={ImageSizeEnum.XSM}
                />
              </li>
            ))}
            {link.mapPersonaImages.length > 4 && (
              <li className={'link-item--content--personas--person-counts'}>
                <span> +{link.mapPersonaImages.length - 4}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    );
  },
);

export default LinkItem;
