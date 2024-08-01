'use client';
import React, { useCallback, useMemo, useState } from 'react';

import './style.scss';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomError from '@/components/atoms/custom-error/custome-error';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import EmptyDataInfo from '@/components/templates/empty-data-Info';
import ErrorBoundary from '@/components/templates/error-boundary';
import Pagination from '@/components/templates/pagination';
import CreateInterviewModal from '@/containers/interviews-container/create-interview-modal';
import InterviewCard from '@/containers/interviews-container/interview-card';
import InterviewDeleteModal from '@/containers/interviews-container/interview-delete-modal';
import {
  GetInterviewsByWorkspaceIdQuery,
  useGetInterviewsByWorkspaceIdQuery,
} from '@/gql/queries/generated/getInterviewsByWorkspaceIdQuery.generated';
import { INTERVIEWS_LIMIT } from '@/utils/constants/pagination';
import { InterviewType } from '@/utils/ts/types/interview/interview-type';

const InterviewsContainer = () => {
  const { workspaceID } = useParams();

  const [interviews, setInterviews] = useState<Array<InterviewType>>([]);
  const [selectedInterview, setSelectedInterview] = useState<InterviewType | null>(null);
  const [isOpenCreateModal, setIsOpenCreateModal] = useState<boolean>(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState<boolean>(false);
  const [interviewsCount, setInterviewsCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    isLoading: isLoadingGetInterviews,
    error: errorGetInterviews,
    data: dataInterviews,
  } = useGetInterviewsByWorkspaceIdQuery<GetInterviewsByWorkspaceIdQuery, Error>(
    {
      getInterviewsInput: {
        workspaceId: +workspaceID!,
        offset: INTERVIEWS_LIMIT * 3 * offset,
        limit: INTERVIEWS_LIMIT * 3,
      },
    },
    {
      cacheTime: 0,
      staleTime: 0,
      onSuccess: response => {
        if (response) {
          setInterviews(prev => [
            ...prev,
            ...(response?.getInterviewsByWorkspaceId?.interviews as any),
          ]);
          setInterviewsCount(response?.getInterviewsByWorkspaceId.count || 0);
          if (isLoading) {
            setIsLoading(false);
          }
        }
      },
    },
  );

  const interviewsData: Array<InterviewType> = useMemo(
    () =>
      interviews.length ? interviews : dataInterviews?.getInterviewsByWorkspaceId.interviews || [],
    [dataInterviews?.getInterviewsByWorkspaceId.interviews, interviews],
  );

  const interviewsDataCount: number = interviewsCount
    ? interviewsCount
    : dataInterviews?.getInterviewsByWorkspaceId.count || 0;

  const onToggleCreateModal = useCallback(() => {
    setIsOpenCreateModal(prev => !prev);
    setSelectedInterview(null);
  }, []);

  const onHandleView = useCallback((interview: InterviewType) => {
    setSelectedInterview(interview);
    setIsOpenCreateModal(true);
  }, []);

  const onToggleDeleteModal = useCallback((interview: InterviewType | null) => {
    setSelectedInterview(interview);
    setIsOpenDeleteModal(prev => !prev);
  }, []);

  const onHandleFilterInterview = useCallback(
    (id: number) => {
      setInterviews(prev => prev.filter(board => board.id !== id));
      setInterviewsCount(prev => prev - 1);
      if (
        currentPage !== 1 &&
        currentPage === Math.ceil(interviewsCount / INTERVIEWS_LIMIT) &&
        interviewsData.slice((currentPage - 1) * INTERVIEWS_LIMIT, currentPage * INTERVIEWS_LIMIT)
          .length === 1
      ) {
        setCurrentPage(prev => prev - 1);
      }
      if ((interviews.length - 1) % INTERVIEWS_LIMIT === 0) {
        setOffset(prev => prev + 1);
      }
    },
    [currentPage, interviews.length, interviewsCount, interviewsData],
  );

  const onHandleAddNewInterview = useCallback(
    (newInterview: InterviewType) => {
      setCurrentPage(1);
      setInterviews(() => [newInterview, ...interviews]);
      setInterviewsCount(prev => prev + 1);
    },
    [interviews],
  );

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (
        dataInterviews?.getInterviewsByWorkspaceId &&
        interviewsData.length < interviewsDataCount &&
        newPage % 2 === 0
      ) {
        setOffset(prev => prev + 1);
      }
      if (
        interviewsData.length >= newPage * INTERVIEWS_LIMIT ||
        interviewsData.length + INTERVIEWS_LIMIT > interviewsDataCount
      ) {
        setCurrentPage(newPage);
      } else {
        setIsLoading(true);
      }
    },
    [dataInterviews?.getInterviewsByWorkspaceId, interviewsData.length, interviewsDataCount],
  );

  if (errorGetInterviews) {
    return <CustomError error={errorGetInterviews.message} />;
  }

  return (
    <div className={'interviews-container'}>
      {isOpenCreateModal ? (
        <CreateInterviewModal
          isOpen={isOpenCreateModal}
          interview={selectedInterview}
          onHandleAddNewInterview={onHandleAddNewInterview}
          handleClose={onToggleCreateModal}
        />
      ) : null}
      {isOpenDeleteModal ? (
        <InterviewDeleteModal
          isOpen={isOpenDeleteModal}
          interview={selectedInterview}
          onHandleFilterInterview={onHandleFilterInterview}
          handleClose={onToggleDeleteModal}
        />
      ) : null}
      <div className={'interviews-container--header'}>
        <div className={'base-page-header'}>
          <h3 className={'base-title'}>Interviews</h3>
        </div>
        <div className={'interviews-container--create-section'}>
          <CustomButton
            startIcon={true}
            data-testid={'create-interview-btn-test-id'}
            onClick={onToggleCreateModal}>
            New interview
          </CustomButton>
        </div>
      </div>

      <div className={'interviews-container--body'}>
        {isLoadingGetInterviews && !interviewsData.length ? (
          <CustomLoader />
        ) : (
          <>
            {interviewsData.length ? (
              <ul className={'interviews-container--body--list'}>
                {interviewsData
                  .slice((currentPage - 1) * INTERVIEWS_LIMIT, currentPage * INTERVIEWS_LIMIT)
                  .map((interview: InterviewType) => (
                    <ErrorBoundary key={interview.id}>
                      <InterviewCard
                        key={interview.id}
                        interview={interview}
                        onHandleView={onHandleView}
                        onHandleDelete={onToggleDeleteModal}
                      />
                    </ErrorBoundary>
                  ))}
              </ul>
            ) : (
              <EmptyDataInfo icon={<Box />} message={'There are no interviews yet'} />
            )}
            {interviewsDataCount > INTERVIEWS_LIMIT && (
              <Pagination
                perPage={INTERVIEWS_LIMIT}
                currentPage={currentPage}
                allCount={interviewsDataCount}
                changePage={onHandleChangePage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InterviewsContainer;
