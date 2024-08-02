import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import { yupResolver } from '@hookform/resolvers/yup';
import { Switch } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { useParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomDatePicker from '@/components/atoms/custom-date-picker/custom-date-picker';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import CustomPopover from '@/components/atoms/custom-popover/custom-popover';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import ModalHeader from '@/components/templates/modal-header';
import { useUpdateMap } from '@/containers/journey-map-container/hooks/useUpdateMap';
import AddDataPointModal from '@/containers/journey-map-container/journey-map-rows/row-types/metrics/create-update-metrics-drawer/add-data-point-modal';
import ImportDataPointModal from '@/containers/journey-map-container/journey-map-rows/row-types/metrics/create-update-metrics-drawer/import-data-point-modal';
import ImportDataPointTableModal from '@/containers/journey-map-container/journey-map-rows/row-types/metrics/create-update-metrics-drawer/import-data-point-table-modal';
import { useCreateMetricsMutation } from '@/gql/mutations/generated/createMetrics.generated';
import { useUpdateMetricsMutation } from '@/gql/mutations/generated/updateMetrics.generated';
import { useGetDataPointsQuery } from '@/gql/queries/generated/getDataPoints.generated';
import { MetricsDateRangeEnum, MetricsSourceEnum, MetricsTypeEnum } from '@/gql/types';
import CalendarIcon from '@/public/base-icons/calendar.svg';
import { selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { redoActionsState, undoActionsState } from '@/store/atoms/undoRedo.atom';
import { userState } from '@/store/atoms/user.atom';
import { workspaceState } from '@/store/atoms/workspace.atom';
import {
  metricsSourceItems,
  metricsTrackItems,
  metricsTypeItems,
} from '@/utils/constants/dropdown';
import { CREATE_METRICS_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { METRICS_DEFAULT_DATA } from '@/utils/constants/metrics';
import { METRICS_DATA_POINT_EXEL_OPTIONS } from '@/utils/constants/options';
import {
  METRIC_CES_DATA_POINT_TABLE_COLUMNS,
  METRIC_CSAT_DATA_POINT_TABLE_COLUMNS,
  METRIC_NPS_DATA_POINT_TABLE_COLUMNS,
} from '@/utils/constants/table';
import { ActionsEnum, JourneyMapRowActionEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType, TableColumnType } from '@/utils/ts/types/global-types';
import { MetricsType } from '@/utils/ts/types/journey-map/journey-map-types';
import {
  CesType,
  CsatType,
  DatapointType,
  MetricsFormType,
  MetricsSurveyItemType,
  MetricsSurveyQuestionItemType,
  NpsType,
} from '@/utils/ts/types/metrics/metrics-type';

dayjs.extend(fromNow);

interface ICreateMetricsDrawer {
  rowItemID: number;
  selectedStepId: number;
  selectedColumnId: number;
  selectedMetrics: MetricsType | null;
  onHandleCloseDrawer: () => void;
}
const initialEndDate = new Date(new Date().setMonth(new Date().getMonth() + 1));

const CreateUpdateMetricsDrawer: FC<ICreateMetricsDrawer> = ({
  rowItemID,
  selectedStepId,
  selectedColumnId,
  selectedMetrics,
  onHandleCloseDrawer,
}) => {
  const { mapID } = useParams();
  const { updateMapByType } = useUpdateMap();

  const user = useRecoilValue(userState);
  const workspace = useRecoilValue(workspaceState);
  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);
  const setUndoActions = useSetRecoilState(undoActionsState);
  const setRedoActions = useSetRecoilState(redoActionsState);
  const setSnackbar = useSetRecoilState(snackbarState);

  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [surveys, setSurveys] = useState<Array<MetricsSurveyItemType>>([]);
  const [questions, setQuestions] = useState<Array<MetricsSurveyQuestionItemType>>([]);
  const [datapointFile, setDatapointFile] = useState<ObjectKeysType[]>([]);
  const [dataPoints, setDataPoints] = useState<Array<DatapointType>>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [isOpenAddDataPointModal, setIsOpenAddDataPointModal] = useState<boolean>(false);
  const [isOpenImportDataPointModal, setIsOpenImportDataPointModal] = useState<boolean>(false);
  const [isOpenImportDataPointTableModal, setIsOpenImportDataPointTableModal] =
    useState<boolean>(false);
  const [deletedDataPointsIds, setDeletedDataPointsIds] = useState<Array<number>>([]);

  const { data: dataDataPoints, isLoading: isLoadingDataPoint } = useGetDataPointsQuery(
    {
      getDataPointsInput: {
        metricsId: selectedMetrics?.id!,
        type: selectedMetrics?.type!,
        offset: 0,
        limit: 100,
      },
    },
    {
      enabled: selectedMetrics?.source === MetricsSourceEnum.Manual,
    },
  );

  const { mutate: mutateCreateMetrics, isLoading: isLoadingCreateMetrics } =
    useCreateMetricsMutation({
      onSuccess: response => {
        const data = {
          stepId: selectedStepId,
          ...response.createMetrics,
        };

        updateMapByType(JourneyMapRowActionEnum.METRICS, ActionsEnum.CREATE, data);
        setRedoActions([]);
        setUndoActions(undoPrev => [
          ...undoPrev,
          {
            id: uuidv4(),
            type: JourneyMapRowActionEnum.METRICS,
            action: ActionsEnum.DELETE,
            data,
          },
        ]);
        onHandleCloseDrawer();
      },
    });

  const { mutate: mutateUpdateMetrics, isLoading: isLoadingUpdateMetrics } =
    useUpdateMetricsMutation();

  const getSurveys = useCallback(async () => {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_QP_API}/cx/feedbacks/${workspace.feedbackId}/surveys`,
      {
        headers: {
          'api-key': user.primaryUserAPIKey,
        },
      },
    );
    setSurveys(res.data?.response || []);
  }, [user.primaryUserAPIKey, workspace.feedbackId]);

  const getQuestions = useCallback(
    async (id: number) => {
      setIsLoadingQuestions(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_QP_API}/surveys/${id}/questions`, {
        headers: {
          'api-key': user.primaryUserAPIKey,
        },
      });
      setQuestions(res.data.response);
      setIsLoadingQuestions(false);
    },
    [user.primaryUserAPIKey],
  );

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<MetricsFormType>({
    resolver: yupResolver(CREATE_METRICS_VALIDATION_SCHEMA),
    defaultValues: METRICS_DEFAULT_DATA,
  });

  const type = watch('type');
  const descriptionEnabled = watch('descriptionEnabled');
  const source = watch('source');
  const survey = watch('survey');
  const dateRange = watch('dateRange');

  const filterType: ObjectKeysType = {
    NPS: 'net_promoter_score',
    CSAT: 'customer_satisfaction_numeric',
  };

  const setInitialManualStates = () => {
    setDataPoints([]);
  };

  const setInitialSurveyStates = () => {
    reset({
      ...METRICS_DEFAULT_DATA,
      name: watch('name'),
      description: watch('description'),
      descriptionEnabled: watch('descriptionEnabled'),
      source: MetricsSourceEnum.Manual,
    });
    setStartDate(new Date());
    setEndDate(initialEndDate);
  };

  const onHandleAddDataPont = useCallback((data: Array<DatapointType>) => {
    setDataPoints(prev => [...prev, ...data]);
  }, []);

  const onHandleDeleteDataPont = useCallback((item: { id: string | number }) => {
    if (typeof item?.id === 'number') {
      setDeletedDataPointsIds(prev => [...prev, item.id as number]);
    }
    setDataPoints(prev => prev.filter(r => r.id !== item.id));
  }, []);

  const onHandleSetUploadFile = useCallback((dataFile: ObjectKeysType[]) => {
    setDatapointFile(dataFile);
  }, []);

  const onToggleAddDataPointModal = useCallback(() => {
    setIsOpenAddDataPointModal(prev => !prev);
  }, []);

  const onToggleImportDataPointModal = useCallback(() => {
    setIsOpenImportDataPointModal(prev => !prev);
  }, []);

  const onToggleImportDataPointTableModal = useCallback(() => {
    setIsOpenImportDataPointModal(false);
    setIsOpenImportDataPointTableModal(prev => !prev);
  }, []);

  const onFormSubmit = (formData: MetricsFormType) => {
    let isError = null;

    dataPoints.forEach(dp => {
      if (dp.repeat) {
        setSnackbar(prev => ({
          ...prev,
          message: 'Dates cannot be repeated',
          open: true,
        }));
        isError = true;
        return;
      }
    });

    if (isError) {
      return;
    }

    const reqBody = {
      name: formData.name,
      descriptionEnabled: formData.descriptionEnabled,
      description: formData.description,
      source: formData.source,
      type: formData.type,
      goal: formData.goal,
      startDate,
      endDate,
    };

    const dataPointsInput: ObjectKeysType = {};

    if (selectedMetrics) {
      const updateMetricsInput = {
        id: selectedMetrics.id,
        surveyId: formData.survey,
        questionId: formData.question,
        dateRange: formData.dateRange || MetricsDateRangeEnum.Custom,
        ...reqBody,
      };

      if (formData.source === 'survey') {
        mutateUpdateMetrics(
          {
            updateMetricsInput,
          },
          {
            onSuccess: response => {
              const data = {
                stepId: selectedStepId,
                ...response.updateMetrics,
              };

              updateMapByType(JourneyMapRowActionEnum.METRICS, ActionsEnum.UPDATE, data);
              setRedoActions([]);
              setUndoActions(undoPrev => [
                ...undoPrev,
                {
                  id: uuidv4(),
                  type: JourneyMapRowActionEnum.METRICS,
                  action: ActionsEnum.UPDATE,
                  data: {
                    stepId: selectedStepId,
                    ...selectedMetrics,
                  },
                },
              ]);

              onHandleCloseDrawer();
            },
          },
        );
      } else {
        switch (formData.type) {
          case MetricsTypeEnum.Nps: {
            dataPointsInput.npsPointsInput = dataPoints
              .filter(dp => typeof dp.id === 'string')
              .map(dp => {
                const nps = dp as NpsType;
                return {
                  date: nps.date,
                  detractor: nps.detractor,
                  passive: nps.passive,
                  promoter: nps.promoter,
                };
              });
            break;
          }
          case MetricsTypeEnum.Csat: {
            dataPointsInput.csatPointsInput = dataPoints
              .filter(dp => typeof dp.id === 'string')
              .map(dp => {
                const nps = dp as CsatType;
                return {
                  date: nps.date,
                  dissatisfied: nps.dissatisfied,
                  satisfied: nps.satisfied,
                  neutral: nps.neutral,
                };
              });
            break;
          }
          case MetricsTypeEnum.Ces: {
            dataPointsInput.cesPointsInput = dataPoints
              .filter(dp => typeof dp.id === 'string')
              .map(dp => {
                const nps = dp as CesType;
                return {
                  date: nps.date,
                  easy: nps.easy,
                  difficult: nps.difficult,
                  neutral: nps.neutral,
                };
              });
            break;
          }
        }

        const updateDataPointsInput = {
          deleteInput: deletedDataPointsIds,
          ...dataPointsInput,
        };

        mutateUpdateMetrics(
          {
            updateMetricsInput,
            updateDataPointsInput,
          },
          {
            onSuccess: response => {
              const data = {
                stepId: selectedStepId,
                ...response.updateMetrics,
              };

              updateMapByType(JourneyMapRowActionEnum.METRICS, ActionsEnum.UPDATE, data);
              setRedoActions([]);
              setUndoActions(undoPrev => [
                ...undoPrev,
                {
                  id: uuidv4(),
                  type: JourneyMapRowActionEnum.METRICS,
                  action: ActionsEnum.UPDATE,
                  data: {
                    stepId: selectedStepId,
                    ...selectedMetrics,
                  },
                },
              ]);

              onHandleCloseDrawer();
            },
          },
        );
      }
    } else {
      if (formData.source === 'survey') {
        mutateCreateMetrics({
          createMetricsInput: {
            ...reqBody,
            surveyId: formData.survey,
            questionId: formData.question,
            dateRange: formData.dateRange || MetricsDateRangeEnum.Custom,
            columnId: selectedColumnId,
            rowId: rowItemID,
            mapId: +mapID!,
            stepId: selectedStepId,
            personaId: selectedPerson?.id || null,
          },
        });
      } else {
        switch (formData.type) {
          case MetricsTypeEnum.Nps: {
            dataPointsInput.npsPointsInput = dataPoints.map(dp => {
              const nps = dp as NpsType;
              return {
                date: nps.date,
                detractor: nps.detractor,
                passive: nps.passive,
                promoter: nps.promoter,
              };
            });
            break;
          }
          case MetricsTypeEnum.Csat: {
            dataPointsInput.csatPointsInput = dataPoints.map(dp => {
              const nps = dp as CsatType;
              return {
                date: nps.date,
                dissatisfied: nps.dissatisfied,
                satisfied: nps.satisfied,
                neutral: nps.neutral,
              };
            });
            break;
          }
          case MetricsTypeEnum.Ces: {
            dataPointsInput.cesPointsInput = dataPoints.map(dp => {
              const nps = dp as CesType;
              return {
                date: nps.date,
                easy: nps.easy,
                difficult: nps.difficult,
                neutral: nps.neutral,
              };
            });
            break;
          }
        }

        mutateCreateMetrics({
          createDataPointsInput: {
            ...dataPointsInput,
          },
          createMetricsInput: {
            ...reqBody,
            columnId: selectedColumnId,
            rowId: rowItemID,
            mapId: +mapID!,
            stepId: selectedStepId,
            personaId: selectedPerson?.id || null,
          },
        });
      }
    }
  };

  const options = useMemo(() => {
    return METRICS_DATA_POINT_EXEL_OPTIONS({
      onHandleDelete: onHandleDeleteDataPont,
    });
  }, [onHandleDeleteDataPont]);

  const columns: { [key: string]: Array<TableColumnType> } = useMemo(() => {
    return {
      [MetricsTypeEnum.Nps]: METRIC_NPS_DATA_POINT_TABLE_COLUMNS(),
      [MetricsTypeEnum.Csat]: METRIC_CSAT_DATA_POINT_TABLE_COLUMNS(),
      [MetricsTypeEnum.Ces]: METRIC_CES_DATA_POINT_TABLE_COLUMNS(),
    };
  }, []);

  const rows = useMemo(() => {
    dataPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const dateCount: { [key: string]: number } = {};

    dataPoints.forEach(item => {
      const date = dayjs(item.date).format('MM-DD-YYYY');
      if (dateCount[date]) {
        dateCount[date]++;
      } else {
        dateCount[date] = 1;
      }
    });

    dataPoints.forEach(item => {
      const date = dayjs(item.date).format('MM-DD-YYYY');
      if (dateCount[date] > 1) {
        item.repeat = true;
      } else {
        item.repeat = null;
      }
    });

    return dataPoints;
  }, [dataPoints]);

  useEffect(() => {
    getSurveys().then();
    if (selectedMetrics) {
      setStartDate(selectedMetrics.startDate || new Date());
      setEndDate(selectedMetrics.endDate || initialEndDate);
      reset({
        name: selectedMetrics.name,
        descriptionEnabled: selectedMetrics.descriptionEnabled,
        description: selectedMetrics.description,
        source: selectedMetrics.source,
        type: selectedMetrics.type,
        survey: selectedMetrics.surveyId,
        question: selectedMetrics.questionId,
        goal: selectedMetrics.goal,
        dateRange: selectedMetrics.dateRange || MetricsDateRangeEnum.Daily,
      });
      if (selectedMetrics.source === MetricsSourceEnum.Survey) {
        getQuestions(selectedMetrics.surveyId!).then();
      }
    }
  }, [getQuestions, getSurveys, reset, selectedMetrics]);

  useEffect(() => {
    if (dataDataPoints) {
      setDataPoints((dataDataPoints.getDataPoints?.dataPoints as Array<DatapointType>) || []);
    }
  }, [dataDataPoints]);

  return (
    <>
      {isOpenAddDataPointModal && (
        <AddDataPointModal
          metricsType={type}
          isOpen={isOpenAddDataPointModal}
          onHandleAddDataPont={onHandleAddDataPont}
          handleClose={onToggleAddDataPointModal}
        />
      )}

      {isOpenImportDataPointModal && (
        <ImportDataPointModal
          metricsType={type}
          isOpen={isOpenImportDataPointModal}
          onHandleSetUploadFile={onHandleSetUploadFile}
          onToggleImportDataPointTableModal={onToggleImportDataPointTableModal}
          handleClose={onToggleImportDataPointModal}
        />
      )}

      {isOpenImportDataPointTableModal && (
        <ImportDataPointTableModal
          metricsType={type}
          isOpen={isOpenImportDataPointTableModal}
          datapointFile={datapointFile}
          onHandleAddDataPont={onHandleAddDataPont}
          handleClose={onToggleImportDataPointTableModal}
        />
      )}

      <div
        className={'create-update-metrics-drawer'}
        data-testid={'create-update-metrics-drawer-test-id'}>
        <ModalHeader title={`${selectedMetrics ? 'Update' : 'Create new'} metric`} />
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className={'create-update-metrics-drawer--form'}>
          <div className={'create-update-metrics-drawer--content'}>
            <div className={'create-update-metrics-drawer--general-block'}>
              <p className={'create-update-metrics-drawer--title'}>General</p>
              <div className={'create-update-metrics-drawer--general-block--item'}>
                <label className={'create-update-metrics-drawer--label'} htmlFor="name">
                  Name
                </label>
                <div className={'create-update-metrics-drawer--general-block--validation-block'}>
                  <Controller
                    name={'name'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        id={'name'}
                        value={value}
                        data-testid={'create-update-metrics-name-test-id'}
                        placeholder={`Metric name`}
                        onChange={onChange}
                      />
                    )}
                  />
                  <span
                    className={'validation-error'}
                    data-testid={'create-update-metrics-name-validation-test-id'}>
                    {errors.name?.message}
                  </span>
                </div>
              </div>
              <div className={'create-update-metrics-drawer--general-block--item'}>
                <label className={'create-update-metrics-drawer--label'} htmlFor="description">
                  Description
                </label>
                <div className={'create-update-metrics-drawer--general-block--switch-validation'}>
                  <Controller
                    name={'descriptionEnabled'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        id={'description'}
                        color="primary"
                        disableRipple={true}
                        data-testid={'create-update-metrics-switch-test-id'}
                        checked={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </div>
              </div>
              {
                <div
                  className={`create-update-metrics-drawer--general-block--description-validation ${
                    descriptionEnabled
                      ? 'create-update-metrics-drawer--general-block--description-validation-open'
                      : 'create-update-metrics-drawer--general-block--description-validation-close'
                  }`}>
                  <Controller
                    name={'description'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        placeholder={'Description of your metric'}
                        data-testid={'create-update-metrics-description-test-id'}
                        autoFocus={true}
                        multiline={true}
                        rows={3}
                        value={value}
                        onChange={onChange}
                      />
                    )}
                  />
                  <span className={'validation-error'}>{errors.description?.message}</span>
                </div>
              }
            </div>

            <div className={'create-update-metrics-drawer--data-settings-block'}>
              <p className={'create-update-metrics-drawer--title'}>Import data settings</p>

              <div className={'create-update-metrics-drawer--data-settings-block--item'}>
                <label className={'create-update-metrics-drawer--label'} htmlFor="source">
                  Source
                </label>
                <div
                  className={'create-update-metrics-drawer--data-settings-block--validation-block'}>
                  <Controller
                    name={'source'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomDropDown
                        name={'source'}
                        id={'source-dropdown'}
                        menuItems={metricsSourceItems}
                        onChange={onChange}
                        onSelect={item => {
                          if (item.value === MetricsSourceEnum.Survey) {
                            setInitialManualStates();
                          }
                          if (item.value === MetricsSourceEnum.Manual) {
                            setInitialSurveyStates();
                          }
                        }}
                        selectItemValue={value}
                        placeholder={'Select source'}
                      />
                    )}
                  />
                  <span className={'validation-error'}>{errors.source?.message}</span>
                </div>
              </div>

              {source ? (
                <div className={'create-update-metrics-drawer--data-settings-block--item'}>
                  <label className={'create-update-metrics-drawer--label'} htmlFor="type">
                    Type
                  </label>
                  <div
                    className={
                      'create-update-metrics-drawer--data-settings-block--validation-block'
                    }>
                    <Controller
                      name={'type'}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <CustomDropDown
                          name={'type'}
                          id={'type-dropdown'}
                          menuItems={
                            source === MetricsSourceEnum.Manual
                              ? metricsTypeItems
                              : metricsTypeItems.slice(0, 2)
                          }
                          onChange={onChange}
                          selectItemValue={value}
                        />
                      )}
                    />
                    <span className={'validation-error'}>{errors.type?.message}</span>
                  </div>
                </div>
              ) : null}

              {source === MetricsSourceEnum.Survey ? (
                <>
                  <div className={'create-update-metrics-drawer--data-settings-block--item'}>
                    <label className={'create-update-metrics-drawer--label'} htmlFor="survey">
                      Select Survey
                    </label>
                    <div
                      className={
                        'create-update-metrics-drawer--data-settings-block--validation-block'
                      }>
                      <Controller
                        name={'survey'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CustomDropDown
                            name={'survey'}
                            id={'survey-dropdown'}
                            menuItems={surveys.map(s => ({
                              id: s.surveyID,
                              name: s.name,
                              value: s.surveyID,
                            }))}
                            onChange={onChange}
                            onSelect={item => {
                              if (item.id !== survey) {
                                getQuestions(item.id!).then();
                              }
                            }}
                            selectItemValue={value?.toString()}
                            placeholder={'Select'}
                          />
                        )}
                      />
                      <span className={'validation-error'}>{errors.survey?.message}</span>
                    </div>
                  </div>

                  <div className={'create-update-metrics-drawer--data-settings-block--item'}>
                    <label className={'create-update-metrics-drawer--label'} htmlFor="question">
                      Select Question
                    </label>
                    <div
                      className={
                        'create-update-metrics-drawer--data-settings-block--validation-block'
                      }>
                      <Controller
                        name={'question'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CustomDropDown
                            name={'question'}
                            id={'question-dropdown'}
                            menuItems={questions
                              .filter(q => q.type === filterType[type])
                              .map(q => ({
                                id: q.questionID,
                                name: q.text,
                                value: q.questionID,
                              }))}
                            disabled={!survey || isLoadingQuestions}
                            onChange={onChange}
                            selectItemValue={value?.toString()}
                            placeholder={'Select'}
                          />
                        )}
                      />
                      <span className={'validation-error'}>{errors.question?.message}</span>
                    </div>
                  </div>
                  <div className={'create-update-metrics-drawer--data-settings-block--item'}>
                    <label
                      className={'create-update-metrics-drawer--label'}
                      htmlFor="range-date-picker">
                      Track changes
                    </label>
                    <div
                      className={
                        'create-update-metrics-drawer--data-settings-block--validation-block'
                      }>
                      <Controller
                        name={'dateRange'}
                        control={control}
                        render={({ field: { onChange, value } }) => (
                          <CustomDropDown
                            name={'date'}
                            id={'date-dropdown'}
                            menuItems={metricsTrackItems}
                            onChange={onChange}
                            selectItemValue={value}
                            placeholder={'Select'}
                          />
                        )}
                      />
                      <span className={'validation-error'}>{errors.dateRange?.message}</span>
                    </div>
                  </div>

                  {dateRange === MetricsDateRangeEnum.Custom ? (
                    <div
                      className={
                        'create-update-metrics-drawer--data-settings-block--item create-update-metrics-drawer--data-settings-block--date-picker-item'
                      }>
                      <label
                        className={'create-update-metrics-drawer--label'}
                        htmlFor="range-date-picker">
                        Date range
                      </label>
                      <div
                        className={
                          'create-update-metrics-drawer--data-settings-block--date-picker'
                        }>
                        <CustomPopover
                          popoverButton={
                            <div
                              className={
                                'create-update-metrics-drawer--data-settings-block--date-picker'
                              }>
                              <div>
                                <span>{dayjs(startDate).format('MM/DD/YYYY')}</span>
                                <span> - </span>
                                <span>{dayjs(endDate).format('MM/DD/YYYY')}</span>
                              </div>
                              <CalendarIcon />
                            </div>
                          }>
                          <div
                            className={
                              'create-update-metrics-drawer--data-settings-block--date-picker-block'
                            }>
                            <CustomDatePicker
                              defaultDate={startDate}
                              onHandleChangeDate={date => {
                                setStartDate(date);
                              }}
                            />
                            <CustomDatePicker
                              defaultDate={endDate}
                              onHandleChangeDate={date => {
                                setEndDate(date);
                              }}
                            />
                          </div>
                        </CustomPopover>
                      </div>
                    </div>
                  ) : null}
                </>
              ) : null}

              <div
                className={
                  'create-update-metrics-drawer--data-settings-block--item create-update-metrics-drawer--data-settings-block--goal-item'
                }>
                <label className={'create-update-metrics-drawer--label'} htmlFor="goal">
                  Goal
                </label>
                <div
                  className={'create-update-metrics-drawer--data-settings-block--validation-block'}>
                  <Controller
                    name={'goal'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomInput
                        id={'goal'}
                        placeholder={'Type NPS Goal here'}
                        data-testid={'create-update-metrics-goal-test-id'}
                        type={'number'}
                        min={0}
                        sxStyles={{
                          width: '200px',
                        }}
                        value={(+value).toString()}
                        onChange={onChange}
                      />
                    )}
                  />
                  <span className={'validation-error'}>{errors.goal?.message}</span>
                </div>
              </div>

              {source === MetricsSourceEnum.Manual ? (
                <>
                  <div className={'create-update-metrics-drawer--data-settings-block--item '}>
                    <label
                      className={'create-update-metrics-drawer--label'}
                      htmlFor="range-date-picker">
                      Date range
                    </label>

                    <CustomPopover
                      popoverButton={
                        <div
                          className={
                            'create-update-metrics-drawer--data-settings-block--date-picker'
                          }>
                          <div>
                            <span>{dayjs(startDate).format('MM/DD/YYYY')}</span>
                            <span> - </span>
                            <span>{dayjs(endDate).format('MM/DD/YYYY')}</span>
                          </div>
                          <CalendarIcon />
                        </div>
                      }>
                      <div
                        className={
                          'create-update-metrics-drawer--data-settings-block--date-picker-block'
                        }>
                        <CustomDatePicker
                          defaultDate={startDate}
                          onHandleChangeDate={date => {
                            setStartDate(date);
                          }}
                        />
                        <CustomDatePicker
                          defaultDate={endDate}
                          defaultMinDate={startDate}
                          onHandleChangeDate={date => {
                            setEndDate(date);
                          }}
                        />
                      </div>
                    </CustomPopover>
                  </div>
                  <div className={'create-update-metrics-drawer--data-points-block'}>
                    <div className={'create-update-metrics-drawer--data-points-block--header'}>
                      <p className={'create-update-metrics-drawer--title'}>Data Points</p>
                      <div
                        className={'create-update-metrics-drawer--data-points-block--btns-block'}>
                        <CustomButton
                          data-testid={'add-data-point-btn-test-id'}
                          startIcon={false}
                          variant={'outlined'}
                          onClick={onToggleAddDataPointModal}>
                          Add data point
                        </CustomButton>

                        <CustomButton
                          data-testid={'import-data-point-btn-test-id'}
                          startIcon={false}
                          onClick={onToggleImportDataPointModal}>
                          Import in bulk
                        </CustomButton>
                      </div>
                    </div>

                    <div className={'create-update-metrics-drawer--data-points-block--table-block'}>
                      {selectedMetrics && isLoadingDataPoint ? (
                        <CustomLoader />
                      ) : (
                        <>
                          {rows.length ? (
                            <CustomTable columns={columns[type]} rows={rows} options={options} />
                          ) : (
                            <p
                              className={
                                'create-update-metrics-drawer--data-points-block--empty-table-title'
                              }>
                              There are no data yet
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </div>

          <div className={'create-update-metrics-drawer--footer'}>
            <div className={'base-modal-footer'}>
              <button
                type={'button'}
                className={'base-modal-footer--cancel-btn'}
                onClick={onHandleCloseDrawer}
                disabled={isLoadingCreateMetrics || isLoadingUpdateMetrics}>
                Cancel
              </button>
              <CustomButton
                type={'submit'}
                data-testid={'create-update-metrics-submit-btn-test-id'}
                startIcon={false}
                sxStyles={{ width: '98px' }}
                disabled={isLoadingCreateMetrics || isLoadingUpdateMetrics}
                isLoading={isLoadingCreateMetrics || isLoadingUpdateMetrics}>
                {selectedMetrics ? 'Update' : 'Create'}
              </CustomButton>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateUpdateMetricsDrawer;
