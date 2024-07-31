import React, { FC, useCallback, useState } from 'react';
import './style.scss';
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import SlickCarousel from '@/components/templates/slick-carousel';
import {
  GetMyBoardsQuery,
  useInfiniteGetMyBoardsQuery,
} from '@/gql/infinite-queries/generated/getBoards.generated';
import {
  CreateInterviewMutation,
  useCreateInterviewMutation,
} from '@/gql/mutations/generated/createInterview.generated';
import {
  GetAiJourneyModelsQuery,
  useGetAiJourneyModelsQuery,
} from '@/gql/queries/generated/getAiJourneyModels.generated';
import { CREATE_INTERVIEW_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { BOARDS_LIMIT } from '@/utils/constants/pagination';
import { DropdownSelectItemType } from '@/utils/ts/types/global-types';
import { InterviewFormType, InterviewType } from '@/utils/ts/types/interview/interview-type';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import QPLogo from '@/public/base-icons/qp-logo.svg';

interface ICreateInterviewModal {
  interview: InterviewType | null;
  isOpen: boolean;
  onHandleAddNewInterview: (newInterview: InterviewType) => void;
  handleClose: () => void;
}

const Index: FC<ICreateInterviewModal> = ({
  interview,
  isOpen,
  onHandleAddNewInterview,
  handleClose,
}) => {
  const { workspaceID } = useParams();

  const [boards, setBoards] = useState<Array<DropdownSelectItemType>>([]);
  const [selectedSliderCardId, setSelectedSliderCardId] = useState<number | null>(
    interview?.aiJourneyModelId || null,
  );

  const { mutate: mutateInterview, isLoading: isLoadingCreateInterview } =
    useCreateInterviewMutation<CreateInterviewMutation, Error>({
      onSuccess: response => {
        onHandleAddNewInterview(response.createInterview);
        handleClose();
      },
    });

  const { data: dataAiModels, isLoading: isLoadingAiModels } = useGetAiJourneyModelsQuery<
    GetAiJourneyModelsQuery,
    Error
  >(
    {
      getAiJourneyModelsInput: {
        isAdmin: false,
        offset: 0,
        limit: 9999,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const {
    handleSubmit,
    control,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<InterviewFormType>({
    resolver: yupResolver(CREATE_INTERVIEW_VALIDATION_SCHEMA),
    defaultValues: {
      name: interview?.name || '',
      aiJourneyModelId: interview?.aiJourneyModelId || undefined,
      text: interview?.text || '',
      boardId: interview?.boardId,
    },
  });

  const {
    data: dataBoards,
    isFetching: isFetchingBoards,
    fetchNextPage: fetchNextMapBoards,
  } = useInfiniteGetMyBoardsQuery<GetMyBoardsQuery, Error>(
    {
      getMyBoardsInput: {
        workspaceId: +workspaceID!,
        offset: 0,
        limit: BOARDS_LIMIT,
      },
    },
    {
      onSuccess: response => {
        const boardsArray = response.pages.map(page => page.getMyBoards.boards).flat();
        const dropdownArray = boardsArray.map(board => {
          return {
            id: board.id,
            name: board.name,
            value: board.id,
          };
        });
        setBoards(dropdownArray);
      },
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const onHandleSelectAiModel = useCallback(
    (id: number) => {
      if (!interview) {
        setValue('aiJourneyModelId', id);
        clearErrors('aiJourneyModelId');
        setSelectedSliderCardId(id);
      }
    },
    [clearErrors, interview, setValue],
  );

  const onHandleFetchBoards = useCallback(
    async (e: React.UIEvent<HTMLElement>) => {
      const bottom =
        e.currentTarget.scrollHeight <=
        e.currentTarget.scrollTop + e.currentTarget.clientHeight + 10;

      if (bottom && !isFetchingBoards && boards?.length < dataBoards?.pages[0].getMyBoards.count!) {
        await fetchNextMapBoards({
          pageParam: {
            getMyBoardsInput: {
              workspaceId: +workspaceID!,
              limit: BOARDS_LIMIT,
              offset: boards.length,
            },
          },
        });
      }
    },
    [boards.length, dataBoards?.pages, fetchNextMapBoards, isFetchingBoards, workspaceID],
  );

  const onHandleCreateInterview = (formData: InterviewFormType) => {
    mutateInterview({
      createInterviewInput: {
        ...formData,
      },
    });
  };

  const aiModels = dataAiModels?.getAiJourneyModels.aiJourneyModels || [];

  return (
    <CustomModal
      modalSize={'lg'}
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}>
      <ModalHeader title={<>{interview ? 'View' : 'Create'} interview</>} />

      <div className={'create-interview-modal'}>
        <form
          className={'create-interview-modal--form'}
          onSubmit={handleSubmit(onHandleCreateInterview)}
          id="linkform">
          <div className={'create-interview-modal--content-top'}>
            <div
              className={`create-interview-modal--content-input create-interview-modal--content-top-item`}>
              <label className={'create-interview-modal--content-input--label'} htmlFor="name">
                Name
              </label>
              <Controller
                name={'name'}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    data-testid={'create-interview-name-input-test-id'}
                    inputType={'primary'}
                    placeholder={'Name'}
                    id={'name'}
                    onChange={onChange}
                    disabled={!!interview || isLoadingCreateInterview}
                    value={value || ''}
                  />
                )}
              />
              <span className={'validation-error'} data-testid={'name-error-test-id'}>
                {(errors && errors.name?.message) || ''}
              </span>
            </div>
            <div
              className={
                'create-interview-modal--content-dropdown create-interview-modal--content-top-item'
              }>
              <label className={'create-interview-modal--content-input--label'} htmlFor="name">
                Board
              </label>
              <Controller
                name={'boardId'}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomDropDown
                    name={'board'}
                    menuItems={boards}
                    onChange={onChange}
                    onScroll={onHandleFetchBoards}
                    selectItemValue={value?.toString()}
                    disabled={!!interview || isLoadingCreateInterview}
                    placeholder={'Select board'}
                  />
                )}
              />
              <span className={'validation-error'}>{errors.boardId?.message}</span>
            </div>
          </div>

          <div className={'create-interview-modal--content-dropdown'}>
            <label
              className={'create-interview-modal--content-input--label'}
              htmlFor="aiJourneyModelId">
              Ai Model
            </label>

            {isLoadingAiModels ? (
              <div
                style={{
                  height: '200px',
                }}>
                <Skeleton
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 1,
                  }}
                  animation="wave"
                  variant="rectangular"
                />
              </div>
            ) : (
              <SlickCarousel
                cards={aiModels}
                renderFunction={card => (
                  <SliderCard
                    card={card}
                    selectedSliderCardId={selectedSliderCardId}
                    onHandleSelectAiModel={onHandleSelectAiModel}
                  />
                )}
                restSettings={{
                  slidesToShow: aiModels.length > 5 ? 5 : aiModels.length,
                }}
              />
            )}

            <span className={'validation-error'}>{errors.aiJourneyModelId?.message}</span>
          </div>

          <div className={`create-interview-modal--content-input`} key={'transcript'}>
            <label className={'create-interview-modal--content-input--label'} htmlFor="transcript">
              Transcript
            </label>
            <Controller
              name={'text'}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  data-testid={`create-interview-name-input-test-id`}
                  inputType={'primary'}
                  placeholder={'Transcript'}
                  id={'transcript'}
                  onChange={onChange}
                  disabled={!!interview || isLoadingCreateInterview}
                  value={value || ''}
                  multiline={true}
                  rows={6}
                />
              )}
            />
            <span className={'validation-error'}>{(errors && errors.text?.message) || ''}</span>
          </div>

          <div className={'base-modal-footer'}>
            <button
              className={'base-modal-footer--cancel-btn'}
              onClick={handleClose}
              disabled={isLoadingCreateInterview}>
              Cancel
            </button>
            <CustomButton
              type="submit"
              startIcon={false}
              data-testid={'submit-interview-btn-test-id'}
              sxStyles={{ width: '98px' }}
              disabled={!!interview || isLoadingCreateInterview}
              isLoading={isLoadingCreateInterview}>
              Add
            </CustomButton>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default Index;

interface ISliderCard {
  card: {
    id: number;
    name: string;
    prompt: string;
    aiJourneyModelId: number | null;
    attachmentUrl: string | null;
  };
  selectedSliderCardId: number | null;
  onHandleSelectAiModel: (id: number) => void;
}

const SliderCard: FC<ISliderCard> = ({ card, selectedSliderCardId, onHandleSelectAiModel }) => {
  return (
    <div
      className={`create-interview-modal--slider-card ${
        card.id === selectedSliderCardId ? 'create-interview-modal--slider-selected-card' : ''
      }`}
      key={card.id}
      onClick={() => {
        onHandleSelectAiModel(card.id);
      }}>
      {card.attachmentUrl ? (
        <Image
          src={`${process.env.NEXT_PUBLIC_AWS_URL}/${card.attachmentUrl}`}
          alt="Img"
          width={100}
          height={80}
          style={{
            width: '100%',
            height: '80px',
          }}
        />
      ) : (
        <div className={'create-interview-modal--logo-block'}>
          <QPLogo />
        </div>
      )}

      <p className={'create-interview-modal--slider-card--title'}>{card.name}</p>
      <p className={'create-interview-modal--slider-card--description'}>{card.prompt}</p>
    </div>
  );
};
