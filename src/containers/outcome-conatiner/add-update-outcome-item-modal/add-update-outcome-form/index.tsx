import React, { ChangeEvent, FC, memo, useCallback, useEffect, useState } from 'react';

import './style.scss';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import {
  GetMapColumnsForOutcomeQuery,
  useInfiniteGetMapColumnsForOutcomeQuery,
} from '@/gql/infinite-queries/generated/getMapColumnsForOutcome.generated';
import {
  GetMapPersonasForOutcomeQuery,
  useInfiniteGetMapPersonasForOutcomeQuery,
} from '@/gql/infinite-queries/generated/getMapPersonasForOutcome.generated';
import {
  GetWorkspaceMapsQuery,
  useInfiniteGetWorkspaceMapsQuery,
} from '@/gql/infinite-queries/generated/getWorkspaceMaps.generated';
import {
  CreateUpdateOutcomeMutation,
  useCreateUpdateOutcomeMutation,
} from '@/gql/mutations/generated/createUpdateOutcome.generated';
import {
  GetColumnStepsQuery,
  useGetColumnStepsQuery,
} from '@/gql/queries/generated/getColumnSteps.generated';
import { OutcomeStatusEnum } from '@/gql/types';
import { selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { outcomeItemValidationSchema } from '@/utils/constants/form/yup-validation';
import { WORKSPACE_MAPS_LIMIT } from '@/utils/constants/pagination';
import { OutcomeLevelEnum } from '@/utils/ts/enums/global-enums';
import { DropdownSelectItemType, ObjectKeysType } from '@/utils/ts/types/global-types';
import {
  MapOutcomeItemType,
  OutcomeFormType,
  OutcomeGroupItemType,
} from '@/utils/ts/types/outcome/outcome-type';

interface IAddUpdateOutcomeFormType {
  workspaceId: number;
  outcomeGroupId: number;
  defaultMapId: number | null;
  level: OutcomeLevelEnum;
  selectedOutcome: MapOutcomeItemType | null;
  selectedColumnStepId?: {
    columnId: number;
    stepId: number;
  } | null;
  create: (data: OutcomeGroupItemType) => void;
  update: (data: OutcomeGroupItemType) => void;
  handleClose: () => void;
}

const AddUpdateOutcomeForm: FC<IAddUpdateOutcomeFormType> = memo(
  ({
    workspaceId,
    outcomeGroupId,
    defaultMapId,
    level,
    selectedOutcome,
    selectedColumnStepId,
    create,
    update,
    handleClose,
  }) => {
    const selectedPerson = useRecoilValue(selectedJourneyMapPersona);

    const [currentColumnId, setCurrentColumnId] = useState<number | null>(
      selectedOutcome?.columnId! || selectedColumnStepId?.columnId || null,
    );
    const [selectedMapId, setSelectedMapId] = useState<number | null>(defaultMapId);
    const [maps, setMaps] = useState<DropdownSelectItemType[]>([]);
    const [stages, setStages] = useState<DropdownSelectItemType[]>([]);
    const [steps, setSteps] = useState<DropdownSelectItemType[]>([]);
    const [personas, setPersonas] = useState<DropdownSelectItemType[]>([]);

    const {
      handleSubmit,
      setValue,
      control,
      formState: { errors },
    } = useForm<OutcomeFormType>({
      resolver: yupResolver(outcomeItemValidationSchema),
      defaultValues: {
        name: selectedOutcome?.title || '',
        description: selectedOutcome?.description || '',
        map: defaultMapId,
        stage: selectedOutcome?.columnId || selectedColumnStepId?.columnId,
        step: selectedOutcome?.stepId || selectedColumnStepId?.stepId,
        persona: selectedOutcome?.personaId || selectedPerson?.id,
      },
    });

    const {
      data: dataMaps,
      isLoading: isLoadingMaps,
      isFetchingNextPage: isFetchingNextPageMaps,
      fetchNextPage: fetchNextPageGetMaps,
    } = useInfiniteGetWorkspaceMapsQuery<GetWorkspaceMapsQuery, Error>(
      {
        getWorkspaceMapsInput: {
          workspaceId,
          outcomeId: selectedOutcome?.id || null,
          limit: WORKSPACE_MAPS_LIMIT,
          offset: 0,
        },
      },
      {
        cacheTime: 0,
        staleTime: 0,
        enabled: !!workspaceId,
        onSuccess: response => {
          const mapsData = response.pages[response.pages?.length - 1]?.getWorkspaceMaps?.maps.map(
            itm => ({
              id: itm?.id,
              name: itm?.title,
              label: '',
              value: String(itm?.id),
            }),
          );
          setMaps(prev => [...prev, ...mapsData]);
        },
      },
    );

    const { isLoading: isLoadingCrateUpdate, mutate: creatUpdateOutcome } =
      useCreateUpdateOutcomeMutation<CreateUpdateOutcomeMutation, Error>({
        onSuccess: () => {},
      });

    const {
      data: dataStages,
      isLoading: isLoadingStages,
      isFetchingNextPage: isFetchingNextPageStages,
      fetchNextPage: fetchNextStages,
    } = useInfiniteGetMapColumnsForOutcomeQuery<GetMapColumnsForOutcomeQuery, Error>(
      {
        getMapColumnsForOutcomeInput: {
          mapId: selectedMapId!,
          limit: WORKSPACE_MAPS_LIMIT,
          outcomeId: selectedOutcome?.id || null,
          offset: 0,
        },
      },
      {
        enabled: !!selectedMapId,
        cacheTime: 0,
        staleTime: 0,
        onSuccess: (responseData: any) => {
          const newData = responseData?.pages[
            responseData.pages?.length - 1
          ]?.getMapColumnsForOutcome?.columns?.map(
            (itm: any) =>
              ({
                id: itm?.id,
                name: itm?.label,
                value: String(itm?.id),
              }) || [],
          );

          setStages(prev => [...prev, ...newData]);
        },
      },
    );

    const {
      data: dataMapPersonas,
      isLoading: isLoadingMapPersonas,
      isFetchingNextPage: isFetchingNextPageMapPersonas,
      fetchNextPage: fetchNextMapPersonas,
    } = useInfiniteGetMapPersonasForOutcomeQuery<GetMapPersonasForOutcomeQuery, Error>(
      {
        getMapPersonasInput: {
          mapId: selectedMapId!,
          limit: WORKSPACE_MAPS_LIMIT,
          offset: 0,
        },
      },
      {
        enabled: !!selectedMapId,
        cacheTime: 0,
        staleTime: 0,
        onSuccess: response => {
          const newData = response?.pages[
            response.pages?.length - 1
          ]?.getMapPersonasForOutcome?.personas?.map(
            (itm: any) =>
              ({
                id: itm?.id,
                name: itm?.name,
                value: String(itm?.id),
              }) || [],
          );

          setPersonas(prev => [
            { id: 0, name: 'Overview', value: 'Overview' },
            ...prev,
            ...newData,
          ]);
        },
      },
    );

    useGetColumnStepsQuery<GetColumnStepsQuery, Error>(
      {
        columnId: currentColumnId!,
      },
      {
        enabled: !!currentColumnId,
        cacheTime: 0,
        staleTime: 0,
        onSuccess: responseData => {
          setSteps(
            responseData?.getColumnSteps?.map(itm => ({
              id: itm?.id,
              name: itm?.name,
              value: itm?.id,
            })) || [],
          );
        },
      },
    );

    const onHandleFetchStages = useCallback(
      (e: React.UIEvent<HTMLElement>) => {
        const bottom =
          e.currentTarget.scrollHeight <=
          e.currentTarget.scrollTop + e.currentTarget.clientHeight + 1;
        if (
          bottom &&
          !isFetchingNextPageStages &&
          !isLoadingStages &&
          stages?.length! < dataStages?.pages[0]?.getMapColumnsForOutcome?.count!
        ) {
          fetchNextStages({
            pageParam: {
              getMapColumnsForOutcomeInput: {
                mapId: selectedMapId!,
                limit: 11,
                offset: stages?.length,
              },
            },
          }).then();
        }
      },
      [
        dataStages?.pages,
        fetchNextStages,
        isFetchingNextPageStages,
        isLoadingStages,
        selectedMapId,
        stages?.length,
      ],
    );

    const onHandleFetch = async (e: React.UIEvent<HTMLElement>) => {
      const bottom =
        e.currentTarget.scrollHeight <=
        e.currentTarget.scrollTop + e.currentTarget.clientHeight + 1;

      if (
        bottom &&
        !isFetchingNextPageMaps &&
        !isLoadingMaps &&
        maps?.length < dataMaps?.pages[0].getWorkspaceMaps.count!
      ) {
        await fetchNextPageGetMaps({
          pageParam: {
            getWorkspaceMapsInput: {
              workspaceId,
              limit: WORKSPACE_MAPS_LIMIT,
              offset: maps.length,
            },
          },
        });
      }
    };

    const onHandleFetchPersonas = async (e: React.UIEvent<HTMLElement>) => {
      const bottom =
        e.currentTarget.scrollHeight <=
        e.currentTarget.scrollTop + e.currentTarget.clientHeight + 1;

      if (
        bottom &&
        !isFetchingNextPageMapPersonas &&
        !isLoadingMapPersonas &&
        personas?.length < dataMapPersonas?.pages[0].getMapPersonasForOutcome.count!
      ) {
        await fetchNextMapPersonas({
          pageParam: {
            getMapColumnsForOutcomeInput: {
              selectedMapId,
              limit: WORKSPACE_MAPS_LIMIT,
              offset: personas.length,
            },
          },
        });
      }
    };

    const onHandleSaveOutcome: SubmitHandler<OutcomeFormType> = useCallback(
      formNewData => {
        const { stage: stageId, map: mapId, step: stepId, persona: personaId } = formNewData;

        let requestData: ObjectKeysType = {
          title: formNewData.name,
          personaId: personaId ? +personaId : null,
          description: formNewData.description || '',
        };

        //  UPDATE MODE
        if (selectedOutcome) {
          requestData.id = selectedOutcome?.id;
          if (mapId) {
            requestData.positionInput = {} as {
              mapId?: number;
              index?: number;
            };
            const columnOrStepChange: {
              columnId?: number;
              stepId?: number;
            } = {};

            if (+mapId !== defaultMapId) {
              requestData.positionInput.mapId = +mapId!;
              columnOrStepChange.columnId = +stageId!;
              columnOrStepChange.stepId = +stepId!;
            } else if (stageId && +stageId !== +selectedOutcome?.columnId!) {
              columnOrStepChange.columnId = +stageId!;
              columnOrStepChange.stepId = +stepId!;
            } else if (stepId && +stepId !== +selectedOutcome?.stepId!) {
              columnOrStepChange.stepId = +stepId!;
            }
            if (Object.keys(columnOrStepChange).length) {
              requestData.positionInput.positionChange = columnOrStepChange;
            }
          }
        } else {
          // CREATE MODE
          if (mapId) {
            requestData.positionInput = {
              mapId: +mapId!,
              columnId: +stageId!,
              stepId: +stepId!,
            };
          }

          requestData = {
            ...requestData,
            outcomeGroupId,
            workspaceId,
            personaId: personaId ? +personaId : selectedPerson?.id || null,
          };
        }

        creatUpdateOutcome(
          {
            createUpdateOutcomeInput: {
              [selectedOutcome ? 'updateOutcomeInput' : 'createOutcomeInput']: requestData,
            },
          },
          {
            onSuccess: response => {
              if (selectedOutcome) {
                update(response?.createUpdateOutcome);
              } else {
                create(response?.createUpdateOutcome);
              }
              setSelectedMapId(null);
            },
          },
        );
      },
      [
        creatUpdateOutcome,
        create,
        defaultMapId,
        outcomeGroupId,
        selectedOutcome,
        selectedPerson?.id,
        update,
        workspaceId,
      ],
    );

    useEffect(() => {
      if (selectedMapId) {
        setValue('map', selectedMapId);
      }
    }, [selectedMapId, setValue]);

    return (
      <form
        data-testid="add-update-outcome-modal-test-id"
        onSubmit={handleSubmit(onHandleSaveOutcome)}
        className={'add-update-outcome-form'}>
        <div className={'add-update-outcome-form--content'}>
          <div className={'outcome-field'}>
            <div className={'outcome-field--content'}>
              <label className={'element-label'}>Name</label>
              <div className={'element-input'} data-testid="outcome-name-test-id">
                <Controller
                  name={'name'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomInput
                      inputType={'primary'}
                      id={'outcome-name'}
                      placeholder={'Text here'}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </div>
            </div>
            <span className={'validation-error'}>{errors?.name?.message}</span>
          </div>
          <div className={'outcome-description'} data-testid="outcome-description-test-id">
            <label className={'element-label'}>Description</label>
            <Controller
              name={'description'}
              control={control}
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  multiline={true}
                  minRows={4}
                  inputType={'primary'}
                  id={'outcome-description'}
                  placeholder={'Text here'}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          </div>
          <div className={'outcome-field'}>
            <div className={'outcome-field--content'}>
              <label className={'element-label'}>Status</label>
              <div className={'read-only-field'}>
                {selectedOutcome?.status || OutcomeStatusEnum.Backlog}
              </div>
            </div>
          </div>
          {level === OutcomeLevelEnum.WORKSPACE && (
            <div className={'outcome-field'}>
              <div className={'outcome-field--content'}>
                <label className={'element-label'}>Maps</label>
                <div className={'element-input'}>
                  <Controller
                    name={'map'}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <CustomDropDown
                        name={'maps'}
                        placeholder={'Select'}
                        onScroll={onHandleFetch}
                        menuItems={maps}
                        onSelect={item => {
                          if (item?.id !== selectedMapId) {
                            setStages([]);
                            setSteps([]);
                            setPersonas([]);
                            setSelectedMapId(item?.id!);
                            setValue('stage', null);
                          }
                        }}
                        onChange={onChange}
                        selectItemValue={value?.toString() || ''}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          )}
          <div className={'outcome-field'}>
            <div className={'outcome-field--content'}>
              <label className={'element-label'}>Stage</label>
              <div className={'element-input'}>
                <Controller
                  name={'stage'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomDropDown
                      name={'stages'}
                      placeholder={'Select'}
                      onScroll={onHandleFetchStages}
                      menuItems={stages}
                      onSelect={item => {
                        if (item.id !== currentColumnId) {
                          setValue('step', null);
                          setSteps([]);
                          setCurrentColumnId(item?.id!);
                        }
                      }}
                      onChange={onChange}
                      selectItemValue={value?.toString() || ''}
                    />
                  )}
                />
              </div>
            </div>
            {errors?.stage?.message && (
              <span className={'validation-error'}>{errors?.stage?.message}</span>
            )}
          </div>
          <div className={'outcome-field'}>
            <div className={'outcome-field--content'}>
              <label className={'element-label'}>Steps</label>
              <div className={'element-input'}>
                <Controller
                  name={'step'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomDropDown
                      name={'steps'}
                      placeholder={'Select'}
                      onScroll={onHandleFetch}
                      menuItems={steps}
                      onChange={onChange}
                      selectItemValue={value?.toString()}
                    />
                  )}
                />
              </div>
            </div>
            {errors?.step?.message && (
              <span className={'validation-error'}>{errors?.step?.message}</span>
            )}
          </div>

          <div className={'outcome-field'}>
            <div className={'outcome-field--content'}>
              <label className={'element-label'}>Personas</label>

              <div className={'element-input'}>
                <Controller
                  name={'persona'}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <CustomDropDown
                      placeholder={'Select'}
                      onScroll={onHandleFetchPersonas}
                      menuItems={personas}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                        if (e.target.value === 'Overview') {
                          onChange(null);
                        } else {
                          onChange(e.target.value);
                        }
                      }}
                      selectItemValue={value?.toString() || ''}
                    />
                  )}
                />
              </div>
            </div>
            {errors?.step?.message && (
              <span className={'validation-error'}>{errors?.persona?.message}</span>
            )}
          </div>
        </div>
        <div className={'base-modal-footer'}>
          <CustomButton
            onClick={handleClose}
            variant={'text'}
            startIcon={false}
            style={{
              textTransform: 'inherit',
            }}>
            Cancel
          </CustomButton>
          <CustomButton
            type={'submit'}
            data-testid="save-outcome-test-id"
            variant={'contained'}
            startIcon={false}
            isLoading={isLoadingCrateUpdate}>
            Save
          </CustomButton>
        </div>
      </form>
    );
  },
);
export default AddUpdateOutcomeForm;
