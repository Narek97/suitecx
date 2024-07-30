"use client"
import React, { useCallback, useMemo, useState } from 'react';
import "./style.scss"
import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import Pagination from '@/components/templates/pagination';
import AiModelCard from '@/containers/admin-container/ai-model/ai-model-card';
import AiModelDeleteModal from '@/containers/admin-container/ai-model/ai-model-delete-modal';
import CreateUpdateAiModelModal from '@/containers/admin-container/ai-model/create-update-ai-model-modal';
import {
  GetAiJourneyModelsQuery,
  useGetAiJourneyModelsQuery,
} from '@/gql/queries/generated/getAiJourneyModels.generated';
import { queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { AI_MODEL_LIMIT } from '@/utils/constants/pagination';
import { AiModelType } from '@/utils/ts/types/ai-model/ai-model-type';
import { Box } from '@mui/material';

const AiModel = () => {
  const [isOpenCreateUpdateModal, setIsOpenCreateUpdateModal] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [selectedAiModel, setSelectedAiModel] = useState<AiModelType | null>(null);
  const [aiModels, setAiModels] = useState<Array<AiModelType>>([]);
  const [aiModelsCount, setAiModelsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    data: dataAiModels,
    isLoading: isLoadingAiModels,
    error: errorAiModels,
  } = useGetAiJourneyModelsQuery<GetAiJourneyModelsQuery, Error>(
    {
      getAiJourneyModelsInput: {
        isAdmin: true,
        offset: AI_MODEL_LIMIT * 3 * offset,
        limit: AI_MODEL_LIMIT * 3,
      },
    },
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
      onSuccess: response => {
        if (response) {
          setAiModels(prev => [...prev, ...(response?.getAiJourneyModels?.aiJourneyModels as any)]);
          setAiModelsCount(response?.getAiJourneyModels.count || 0);
          if (isLoading) {
            setIsLoading(false);
          }
        }
      },
    },
  );

  const aiModelsData: Array<AiModelType> = useMemo(
    () =>
      aiModels.length
        ? aiModels
        : (dataAiModels?.getAiJourneyModels.aiJourneyModels as Array<AiModelType>) || [],
    [aiModels, dataAiModels?.getAiJourneyModels.aiJourneyModels],
  );

  const aiModelsDataCount: number = aiModelsCount
    ? aiModelsCount
    : dataAiModels?.getAiJourneyModels.count || 0;

  const onToggleCreateUpdateModal = useCallback((aiModel: AiModelType | null) => {
    setSelectedAiModel(aiModel);
    setIsOpenCreateUpdateModal(prev => !prev);
  }, []);

  const onToggleDeleteModal = useCallback((aiModel: AiModelType | null) => {
    setSelectedAiModel(aiModel);
    setIsOpenDeleteModal(prev => !prev);
  }, []);

  const onHandleAddNewAiModel = useCallback(
    (aiModel: AiModelType) => {
      setCurrentPage(1);
      setAiModels(() => [aiModel, ...aiModels]);
      setAiModelsCount(prev => prev + 1);
    },
    [aiModels],
  );

  const onHandleUpdateAiModel = useCallback((aiModel: AiModelType) => {
    setAiModels(prev =>
      prev.map(prevAiModel => {
        if (prevAiModel.id === aiModel.id) {
          prevAiModel = aiModel;
        }
        return prevAiModel;
      }),
    );
  }, []);

  const onHandleFilterAiModel = useCallback(
    (id: number) => {
      setAiModels(prev => prev.filter(aiModel => aiModel.id !== id));
      setAiModelsCount(prev => prev - 1);
      if (
        currentPage !== 1 &&
        currentPage === Math.ceil(aiModelsCount / AI_MODEL_LIMIT) &&
        aiModelsData.slice((currentPage - 1) * AI_MODEL_LIMIT, currentPage * AI_MODEL_LIMIT)
          .length === 1
      ) {
        setCurrentPage(prev => prev - 1);
      }
      if ((aiModels.length - 1) % AI_MODEL_LIMIT === 0) {
        setOffset(prev => prev + 1);
      }
    },
    [aiModels.length, aiModelsCount, aiModelsData, currentPage],
  );

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (
        dataAiModels?.getAiJourneyModels &&
        aiModels.length < aiModelsDataCount &&
        newPage % 2 === 0
      ) {
        setOffset(prev => prev + 1);
      }
      if (
        aiModelsData.length >= newPage * AI_MODEL_LIMIT ||
        aiModelsData.length + AI_MODEL_LIMIT > aiModelsDataCount
      ) {
        setCurrentPage(newPage);
      } else {
        setIsLoading(true);
      }
    },
    [aiModels.length, aiModelsData.length, aiModelsDataCount, dataAiModels?.getAiJourneyModels],
  );

  if (errorAiModels) {
    return <CustomError error={errorAiModels?.message} />;
  }



  return (
    <div className={'ai-model'}>
      {isOpenCreateUpdateModal && (
        <CreateUpdateAiModelModal
          isOpen={isOpenCreateUpdateModal}
          handleClose={() => onToggleCreateUpdateModal(null)}
          aiModel={selectedAiModel}
          onHandleAddNewAiModel={onHandleAddNewAiModel}
          onHandleUpdateAiModel={onHandleUpdateAiModel}
        />
      )}

      {isOpenDeleteModal ? (
        <AiModelDeleteModal
          isOpen={isOpenDeleteModal}
          aiModel={selectedAiModel}
          onHandleFilterAiModel={onHandleFilterAiModel}
          handleClose={onToggleDeleteModal}
        />
      ) : null}
      <CustomButton
        startIcon={true}
        data-testid={'create-ai-model-btn-test-id'}
        onClick={() => onToggleCreateUpdateModal(null)}>
        New Ai model
      </CustomButton>

      {isLoadingAiModels && !aiModelsData.length ? (
        <CustomLoader />
      ) : (
        <>
          {aiModelsData.length ? (
            <div className={'ai-model--list'}>
              {(
                aiModelsData.slice(
                  (currentPage - 1) * AI_MODEL_LIMIT,
                  currentPage * AI_MODEL_LIMIT,
                ) || []
              ).map(aiModel => (
                <AiModelCard
                  key={aiModel.id}
                  aiModel={aiModel}
                  onHandleDelete={onToggleDeleteModal}
                  onHandleEdit={onToggleCreateUpdateModal}
                />
              ))}
            </div>
          ) : (
            <EmptyDataInfo icon={<Box />} message={'There are no AI models yet'} />
          )}
          {aiModelsCount > AI_MODEL_LIMIT && (
            <Pagination
              perPage={AI_MODEL_LIMIT}
              currentPage={currentPage}
              allCount={aiModelsCount}
              changePage={onHandleChangePage}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AiModel;