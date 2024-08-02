import React, { FC, useCallback, useState } from 'react';

import './style.scss';

import { yupResolver } from '@hookform/resolvers/yup';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import {
  GetLinkMapsByBoardQuery,
  useInfiniteGetLinkMapsByBoardQuery,
} from '@/gql/infinite-queries/generated/getLinkMapsByBoard.generated';
import {
  CreateMapLinkMutation,
  useCreateMapLinkMutation,
} from '@/gql/mutations/generated/createLink.generated';
import {
  UpdateMapLinkMutation,
  useUpdateMapLinkMutation,
} from '@/gql/mutations/generated/updateLink.generated';
import { AddLinkInput, EditLinkInput, LinkTypeEnum } from '@/gql/types';
import { selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { CREATE_LINK_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { JOURNEY_MAP_LINKS_MAPS_LIMIT } from '@/utils/constants/pagination';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { DropdownSelectItemType } from '@/utils/ts/types/global-types';
import { LinkFormType, LinkType } from '@/utils/ts/types/link/link-type';

interface ICreateUpdateLinkModal {
  selectedRowId: number;
  selectedStepId: number;
  link: LinkType | null;
  isOpen: boolean;
  handleClose: () => void;
}

const CreateUpdateLinkModal: FC<ICreateUpdateLinkModal> = ({
  selectedRowId,
  selectedStepId,
  link,
  isOpen,
  handleClose,
}) => {
  const { boardID } = useParams();
  const { updateMapByType } = useUpdateMap();

  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);
  const setUndoActions = useSetRecoilState(undoActionsState);
  const setRedoActions = useSetRecoilState(redoActionsState);
  const [collapsed, setCollapsed] = useState<boolean>(link?.type === LinkTypeEnum.External);
  const [boardMaps, setBoardMaps] = useState<Array<DropdownSelectItemType>>([]);

  const {
    data: dataMaps,
    isFetching: isFetchingMaps,
    fetchNextPage: fetchNextMapMaps,
  } = useInfiniteGetLinkMapsByBoardQuery<GetLinkMapsByBoardQuery, Error>(
    {
      getMapsInput: {
        boardId: +boardID!,
        offset: 0,
        limit: JOURNEY_MAP_LINKS_MAPS_LIMIT,
      },
    },
    {
      onSuccess: response => {
        const mapsArray = response.pages.map(page => page.getLinkMapsByBoard.maps).flat();

        const transformedArray = mapsArray.map(map => {
          return {
            id: map.mapId,
            name: map.title,
            value: map.mapId,
          };
        });

        setBoardMaps(transformedArray);
      },
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const { mutate: mutateCreateLink, isLoading: isLoadingCreateLink } = useCreateMapLinkMutation<
    CreateMapLinkMutation,
    Error
  >({
    onSuccess: response => {
      const data = {
        stepId: selectedStepId,
        ...response.addLink,
      };

      updateMapByType(JourneyMapRowActionEnum.LINKS, ActionsEnum.CREATE, data);
      setRedoActions([]);
      setUndoActions(undoPrev => [
        ...undoPrev,
        {
          id: uuidv4(),
          type: JourneyMapRowActionEnum.LINKS,
          action: ActionsEnum.DELETE,
          data,
        },
      ]);
      handleClose();
    },
  });

  const { mutate: mutateUpdateLink, isLoading: isLoadingUpdateLink } = useUpdateMapLinkMutation<
    UpdateMapLinkMutation,
    Error
  >({
    onSuccess: response => {
      const data = {
        stepId: selectedStepId,
        ...response.editLink,
      };

      updateMapByType(JourneyMapRowActionEnum.LINKS, ActionsEnum.UPDATE, data);
      setRedoActions([]);
      setUndoActions(undoPrev => [
        ...undoPrev,
        {
          id: uuidv4(),
          type: JourneyMapRowActionEnum.LINKS,
          action: ActionsEnum.UPDATE,
          data: {
            ...data,
            previousTitle: link?.title,
            previousType: link?.type,
            previousMapPersonaImages: link?.mapPersonaImages,
            previousLinkedJourneyMapId: link?.linkedJourneyMapId,
            previousIcon: link?.icon,
            previousUrl: link?.url,
          },
        },
      ]);
      handleClose();
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LinkFormType>({
    resolver: yupResolver(CREATE_LINK_VALIDATION_SCHEMA),
    defaultValues: {
      type: link?.type || LinkTypeEnum.Journey,
      linkedMapId: link?.linkedJourneyMapId,
      title: link?.title || '',
      url: link?.url || '',
    },
  });

  const toggleCollapsed = useCallback(() => {
    setCollapsed(previouslyCollapsed => !previouslyCollapsed);
  }, []);

  const onHandleFetchMaps = useCallback(
    async (e: React.UIEvent<HTMLElement>) => {
      const bottom =
        e.currentTarget.scrollHeight <=
        e.currentTarget.scrollTop + e.currentTarget.clientHeight + 10;

      if (
        bottom &&
        !isFetchingMaps &&
        boardMaps?.length < dataMaps?.pages[0].getLinkMapsByBoard.count!
      ) {
        await fetchNextMapMaps({
          pageParam: {
            getMapsInput: {
              boardId: +boardID!,
              limit: JOURNEY_MAP_LINKS_MAPS_LIMIT,
              offset: boardMaps.length,
            },
          },
        });
      }
    },
    [boardID, boardMaps.length, dataMaps?.pages, fetchNextMapMaps, isFetchingMaps],
  );

  const onHandleSaveLink = (formData: LinkFormType) => {
    if (link) {
      const linkInout: EditLinkInput = {
        id: link.id,
        type: formData.type as LinkTypeEnum,
      };

      if (formData.type === LinkTypeEnum.External) {
        linkInout.title = formData.title;
        linkInout.url = formData.url;
      } else {
        linkInout.linkedMapId = formData.linkedMapId;
      }

      mutateUpdateLink({
        editLinkInput: linkInout,
      });
    } else {
      const linkInput: AddLinkInput = {
        personaId: selectedPerson?.id || null,
        stepId: selectedStepId,
        rowId: selectedRowId,
        type: formData.type as LinkTypeEnum,
      };

      if (formData.type === LinkTypeEnum.External) {
        linkInput.title = formData.title;
        linkInput.url = formData.url;
      } else {
        linkInput.linkedMapId = formData.linkedMapId;
      }

      mutateCreateLink({
        addLinkInput: linkInput,
      });
    }
  };

  return (
    <CustomModal
      modalSize={'md'}
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}>
      <ModalHeader
        title={
          <div className={'add-update-outcome-modal-header'}>{link ? 'Update' : 'Create'}</div>
        }
      />

      <div className={'create-update-link-modal'}>
        <form
          className={'create-update-link-modal--form'}
          onSubmit={handleSubmit(onHandleSaveLink)}
          id="linkform">
          <div className={'create-update-link-modal--row'}>
            <label className={'create-update-link-modal--row--title'}>Type</label>
            <div className={'create-update-link-modal--row--item'}>
              <Controller
                name="type"
                control={control}
                render={({ field: { onChange } }) => (
                  <Stack
                    width={'fit-content'}
                    direction="row"
                    component="label"
                    alignItems="center"
                    justifyContent="center">
                    <span data-testid={'journey-link-switch-test-id'}>Link a journey</span>
                    <Switch
                      disabled={isLoadingCreateLink || isLoadingUpdateLink}
                      checked={collapsed}
                      onChange={() => {
                        onChange(collapsed ? LinkTypeEnum.Journey : LinkTypeEnum.External);
                        toggleCollapsed();
                      }}
                    />
                    <span data-testid={'external-link-switch-test-id'}>External link</span>
                  </Stack>
                )}
              />
            </div>
          </div>

          {collapsed ? (
            <>
              <div className={'create-update-link-modal--row'}>
                <label
                  className={'create-update-link-modal--row--title'}
                  data-testid={'create-update-link-label-label-test-id'}>
                  Label
                </label>
                <div className={'create-update-link-modal--row--item'}>
                  <Controller
                    name={'title'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        inputType={'primary'}
                        data-testid="create-update-link-label-input-test-id"
                        placeholder={'Add label'}
                        onChange={onChange}
                        disabled={isLoadingCreateLink || isLoadingUpdateLink}
                        value={value}
                      />
                    )}
                  />
                </div>
              </div>
              <div className={'create-update-link-modal--row'}>
                <label
                  className={'create-update-link-modal--row--title'}
                  data-testid={'create-update-link-url-label-test-id'}>
                  URL
                </label>
                <div className={'create-update-link-modal--row--item'}>
                  <Controller
                    name={'url'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        inputType={'primary'}
                        data-testid="create-update-link-url-input-test-id"
                        placeholder={'Add url'}
                        onChange={onChange}
                        disabled={isLoadingCreateLink || isLoadingUpdateLink}
                        value={value}
                      />
                    )}
                  />
                  {errors?.url?.message && (
                    <span className={'validation-error'} data-testid={'url-error-test-id'}>
                      {errors?.url?.message}
                    </span>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className={'create-update-link-modal--row'}>
              <label
                className={'create-update-link-modal--row--title'}
                data-testid={'create-update-link-journey-label-test-id'}>
                Journey
              </label>
              <div className={'create-update-link-modal--row--item'}>
                <Controller
                  name={'linkedMapId'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomDropDown
                      name={'maps'}
                      placeholder={'Select'}
                      onScroll={onHandleFetchMaps}
                      menuItems={boardMaps}
                      onChange={onChange}
                      disabled={isLoadingCreateLink || isLoadingUpdateLink || isFetchingMaps}
                      selectItemValue={value?.toString() || ''}
                    />
                  )}
                />
                {errors?.linkedMapId?.message && (
                  <span className={'validation-error'} data-testid={'map-error-test-id'}>
                    {errors?.linkedMapId?.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </form>

        <div className={'base-modal-footer'}>
          <button
            className={'base-modal-footer--cancel-btn'}
            onClick={handleClose}
            disabled={isLoadingCreateLink || isLoadingUpdateLink}>
            Cancel
          </button>
          <CustomButton
            startIcon={false}
            data-testid={'create-update-link-btn-test-id'}
            sxStyles={{ width: '98px' }}
            type={'submit'}
            form="linkform"
            disabled={isLoadingCreateLink || isLoadingUpdateLink}
            isLoading={isLoadingCreateLink || isLoadingUpdateLink}>
            Save
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

export default CreateUpdateLinkModal;
