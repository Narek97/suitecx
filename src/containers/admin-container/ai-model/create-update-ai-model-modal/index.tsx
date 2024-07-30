import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomFileUploader from '@/components/atoms/custom-file-uploader/custom-file-uploader';
import CustomFileUploader2 from '@/components/atoms/custom-file-uploader/custom-file-uploader2';
import CustomMultiSelectDropDown from '@/components/atoms/custom-multi-select-drop-down/custom-multi-select-drop-down';
import Image from 'next/image';
import React, { FC, useMemo, useState } from 'react';
import './style.scss';
import { useRecoilValue } from 'recoil';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  CreateAiJourneyModelMutation,
  useCreateAiJourneyModelMutation,
} from '@/gql/mutations/generated/createAiJourneyModel.generated';
import {
  UpdateAiJourneyModelMutation,
  useUpdateAiJourneyModelMutation,
} from '@/gql/mutations/generated/updateAiJourneyModel.generated';
import { GetOrgsQuery, useGetOrgsQuery } from '@/gql/queries/generated/getOrgs.generated';
import { AttachmentsEnum } from '@/gql/types';
import { userState } from '@/store/atoms/user.atom';
import { AI_MODEL_FORM_ELEMENTS } from '@/utils/constants/form/form-elements';
import { CREATE_AI_MODEL_VALIDATION_SCHEMA } from '@/utils/constants/form/yup-validation';
import { PERSONA_FILE_TYPES, queryCacheTime, querySlateTime } from '@/utils/constants/general';
import { resizeFile } from '@/utils/helpers/resize-file';
import { UploadFile } from '@/utils/helpers/uploader';
import { AiModelFormType, AiModelType } from '@/utils/ts/types/ai-model/ai-model-type';
import { yupResolver } from '@hookform/resolvers/yup';
import { Skeleton, Switch } from '@mui/material';
import { FileUploader } from 'react-drag-drop-files';
import DeleteIcon from '@/public/operations/delete.svg';

interface ICreateUpdateAiModelModal {
  aiModel: AiModelType | null;
  isOpen: boolean;
  onHandleAddNewAiModel: (newInterview: AiModelType) => void;
  onHandleUpdateAiModel: (newInterview: AiModelType) => void;
  handleClose: () => void;
}

const CreateUpdateAiModelModal: FC<ICreateUpdateAiModelModal> = ({
  aiModel,
  isOpen,
  onHandleAddNewAiModel,
  onHandleUpdateAiModel,
  handleClose,
}) => {
  const [deletedOrgIds, setDeletedOrgIds] = useState<Array<number>>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(aiModel?.attachmentUrl || null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const user = useRecoilValue(userState);

  const { data: orgsData, isLoading: isLoadingOrgsData } = useGetOrgsQuery<GetOrgsQuery, Error>(
    {},
    {
      cacheTime: queryCacheTime,
      staleTime: querySlateTime,
    },
  );

  const { mutate: creteAiJourneyModel, isLoading: isLoadingCreateAiJourneyModel } =
    useCreateAiJourneyModelMutation<CreateAiJourneyModelMutation, Error>({
      onSuccess: response => {
        onHandleAddNewAiModel(response.createAiJourneyModel);
        handleClose();
      },
    });

  const { mutate: updateAiJourneyModel, isLoading: isLoadingUpdateAiJourneyModel } =
    useUpdateAiJourneyModelMutation<UpdateAiJourneyModelMutation, Error>({
      onSuccess: response => {
        onHandleUpdateAiModel(response.updateAiJourneyModel);
        handleClose();
      },
    });

  const onHandleCreateOrUpdateAiModel = (
    formData: AiModelFormType,
    attachmentId?: number | null,
  ) => {
    if (aiModel) {
      const input = {
        name: formData.name,
        universal: formData.universal,
        aiModelId: aiModel.id,
        attachmentId,
        deleteOrgIds: [...new Set(deletedOrgIds)],
        createOrgIds: [...new Set(formData.orgIds)],
        prompt: formData.prompt.replace(/\[Interview transcript]/g, '').trim(),
        transcriptPlace: formData.prompt.split('[Interview transcript]')[0].length,
      };
      updateAiJourneyModel({
        updateAiJourneyInput: input,
      });
    } else {
      creteAiJourneyModel({
        createAiJourneyInput: {
          ...formData,
          attachmentId,
          orgIds: [...new Set(formData.orgIds)],
          transcriptPlace: formData.prompt.split('[Interview transcript]')[0].length,
          prompt: formData.prompt.replace(/\[Interview transcript]/g, '').trim(),
        },
      });
    }
  };

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<AiModelFormType>({
    resolver: yupResolver(CREATE_AI_MODEL_VALIDATION_SCHEMA),
    defaultValues: {
      name: aiModel?.name || '',
      prompt:
        (aiModel?.prompt || '').slice(0, aiModel?.transcriptPlace) +
          '[Interview transcript]' +
          (aiModel?.prompt || '').slice(aiModel?.transcriptPlace) || '[Interview transcript]',
      universal: aiModel?.universal || false,
      orgIds: aiModel?.selectedOrgIds || [],
    },
  });

  const universal = watch('universal');

  const { append, remove } = useFieldArray({
    // @ts-ignore
    name: 'orgIds',
    control,
  });

  const onHandleDelete = () => {
    setAttachmentUrl(null);
    setFile(null);
    setSelectedImage(null);
  };

  const onHandleUploadFile = async (formData: AiModelFormType) => {
    if (file) {
      let percentage: number | undefined = undefined;
      let indexLastsSlash = file.type.lastIndexOf('/');
      let fType = file.type.substring(indexLastsSlash + 1);
      const compressFile = await resizeFile(file);
      const videoUploaderOptions = {
        fileType: fType,
        file: compressFile.file,
        relatedId: user.orgID,
        type: AttachmentsEnum.AiModel,
      };
      setUploadProgress(1);
      const uploadFile = new UploadFile(videoUploaderOptions);

      uploadFile
        .onProgress(({ percentage: newPercentage }: any) => {
          // to avoid the same percentage to be logged twice
          if (newPercentage !== percentage) {
            percentage = newPercentage;
            setUploadProgress(newPercentage);
          }
        })
        .onFinish((uploadFilesData: any) => {
          setAttachmentUrl(uploadFilesData.key);
          setUploadProgress(0);
          onHandleCreateOrUpdateAiModel(formData, uploadFilesData.id);
        })
        .onError(() => {
          setUploadProgress(0);
          onHandleCreateOrUpdateAiModel(formData);
        });

      uploadFile.start();
    }
  };

  const onHandleSelectFiles = async (newFile: File | null) => {
    if (newFile) {
      setSelectedImage(URL.createObjectURL(newFile));
      setFile(newFile);
    }
  };

  const onHandleSaveLink = async (formData: AiModelFormType) => {
    if (file) {
      await onHandleUploadFile(formData);
    } else {
      if (attachmentUrl) {
        onHandleCreateOrUpdateAiModel(formData);
      } else {
        onHandleCreateOrUpdateAiModel(formData, null);
      }
    }
  };

  const menuItems = useMemo(
    () =>
      orgsData?.getOrgs.map(org => ({
        id: org.id,
        name: org.name || 'Untitled',
        value: org.orgId,
      })) || [],
    [orgsData?.getOrgs],
  );

  const defaultSelectedItems = useMemo(
    () => menuItems.filter(item => (aiModel?.selectedOrgIds || []).includes(+item.value)),
    [aiModel?.selectedOrgIds, menuItems],
  );

  return (
    <CustomModal
      modalSize={'lg'}
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}>
      <ModalHeader title={<>{aiModel ? 'Edit' : 'Create'} AI model</>} />
      <div className={'create-update-ai-model-modal'}>
        <form
          className={'create-update-ai-model-modal--form'}
          onSubmit={handleSubmit(onHandleSaveLink)}
          id="interviewform">
          {AI_MODEL_FORM_ELEMENTS.map(element => (
            <div
              className={`create-update-ai-model-modal--content-input ${element.name}`}
              key={element.name}>
              <label
                className={'create-update-ai-model-modal--content-input--label'}
                htmlFor="name">
                {element.title}
              </label>
              <div className={'create-update-ai-model-modal--prompt-info'}>
                {element.name === 'prompt' &&
                  '* please add prompt text before or after the [interview transcript] and never delete it so that the model works as expected.'}
              </div>
              <Controller
                name={element.name}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <CustomInput
                    data-testid={`create-ai-model-${element.name}-input-test-id`}
                    inputType={'primary'}
                    placeholder={element.placeholder}
                    id={element.name}
                    type={element.type}
                    onChange={onChange}
                    // disabled={!!interview || isLoadingCreateInterview}
                    value={value || ''}
                    rows={4}
                    multiline={element.isMultiline}
                  />
                )}
              />
              <span className={'validation-error'}>
                {(errors && errors[element.name]?.message) || ''}
              </span>
            </div>
          ))}

          <div className={'create-update-ai-model-modal--file-upload'}>
            {attachmentUrl && (
              <button
                className={'create-update-ai-model-modal--delete-file-icon'}
                aria-label={'Delete'}
                onClick={onHandleDelete}>
                <DeleteIcon width={14} height={14} />
              </button>
            )}
            <FileUploader
              id={'touchpoint-name'}
              classes={`attachments--file-uploader`}
              children={
                <CustomFileUploader
                  uploadProgress={uploadProgress}
                  content={
                    selectedImage ? (
                      <div className={'create-update-ai-model-modal--file-container'}>
                        <Image
                          src={selectedImage}
                          alt="Img"
                          width={180}
                          height={90}
                          style={{
                            width: '180px',
                            height: '90px',
                          }}
                        />
                      </div>
                    ) : attachmentUrl ? (
                      <div className={'create-update-ai-model-modal--file-container'}>
                        <Image
                          src={`${process.env.NEXT_PUBLIC_AWS_URL}/${attachmentUrl}`}
                          alt="Img"
                          width={180}
                          height={90}
                          style={{
                            width: '180px',
                            height: '90px',
                          }}
                        />
                      </div>
                    ) : (
                      <CustomFileUploader2 title={'Choose image'} />
                    )
                  }
                />
              }
              multiple={false}
              handleChange={onHandleSelectFiles}
              name="file"
              types={PERSONA_FILE_TYPES}
            />
          </div>

          <label
            className={'create-update-ai-model-modal--content-input--label'}
            htmlFor="universal">
            Universal
          </label>
          <Controller
            name={'universal'}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Switch
                id={'universal'}
                color="primary"
                disableRipple={true}
                data-testid={'create-update-ai-model-modal-switch-test-id'}
                checked={value}
                onChange={onChange}
              />
            )}
          />
          {universal ? null : (
            <>
              {isLoadingOrgsData ? (
                <Skeleton height={50} />
              ) : (
                <>
                  <CustomMultiSelectDropDown
                    menuItems={menuItems}
                    defaultSelectedItems={defaultSelectedItems}
                    onSelect={items => append(items)}
                    onDelete={(id, index) => {
                      remove(index);
                      setDeletedOrgIds(prev => [...prev, id]);
                    }}
                    placeholder={'Select org'}
                  />
                  <span className={'validation-error'}>
                    {(errors && errors.orgIds?.message) || ''}
                  </span>
                </>
              )}
            </>
          )}
          <div className={'base-modal-footer'}>
            <button
              className={'base-modal-footer--cancel-btn'}
              onClick={handleClose}
              disabled={
                isLoadingCreateAiJourneyModel || isLoadingUpdateAiJourneyModel || !!uploadProgress
              }>
              Cancel
            </button>
            <CustomButton
              type="submit"
              startIcon={false}
              data-testid={'submit-interview-btn-test-id'}
              sxStyles={{ width: '98px' }}
              disabled={
                isLoadingCreateAiJourneyModel || isLoadingUpdateAiJourneyModel || !!uploadProgress
              }
              isLoading={
                isLoadingCreateAiJourneyModel || isLoadingUpdateAiJourneyModel || !!uploadProgress
              }>
              {aiModel ? 'Update' : 'Create'}
            </CustomButton>
          </div>
        </form>
      </div>
    </CustomModal>
  );
};

export default CreateUpdateAiModelModal;
