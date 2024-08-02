import React, { FC, useCallback, useState } from 'react';

import './style.scss';

import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { FileUploader } from 'react-drag-drop-files';
import { useRecoilValue } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomFileUploader from '@/components/atoms/custom-file-uploader/custom-file-uploader';
import CustomFileUploader2 from '@/components/atoms/custom-file-uploader/custom-file-uploader2';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import SearchNounProjectIcon from '@/containers/settings-container/outcomes/search-noun-project-icon';
import {
  CreateIconAttachmentMutation,
  useCreateIconAttachmentMutation,
} from '@/gql/mutations/generated/createIconAttachment.generated';
import { AttachmentsEnum } from '@/gql/types';
import { userState } from '@/store/atoms/user.atom';
import { PERSONA_FILE_TYPES } from '@/utils/constants/general';
import { resizeFile } from '@/utils/helpers/resize-file';
import { UploadFile } from '@/utils/helpers/uploader';
import { TouchpointIconsEnum } from '@/utils/ts/enums/global-enums';

interface ICreateTouchpointModal {
  isOpen: boolean;
  onHandleCloseModal: () => void;
}

const CreateTouchpointModal: FC<ICreateTouchpointModal> = ({ isOpen, onHandleCloseModal }) => {
  const user = useRecoilValue(userState);
  const queryClient = useQueryClient();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iconSearchText, setIconSearchText] = useState<string>('');
  const [isNounProjectIcon, setIsNounProjectIcon] = useState<boolean>(false);

  const refetch = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['GetTouchPointIcons'],
    });
  };

  const { mutate: mutateIconAttachment, isLoading: isLoadingIconAttachment } =
    useCreateIconAttachmentMutation<CreateIconAttachmentMutation, Error>({
      onSuccess: async () => {
        await refetch();
        onHandleCloseModal();
      },
    });

  const onHandleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
      setIsNounProjectIcon(false);
      const reader = new FileReader();
      reader.onload = event => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file as any);
    }
  };

  const onHandleUploadNounProjectIcon = () => {
    mutateIconAttachment({
      createIconInput: {
        name: fileName || iconSearchText,
        url: imagePreview,
      },
    });
  };

  const handleUploadFiles = async () => {
    if (selectedFile) {
      let percentage: number | undefined = undefined;
      let indexLastsSlash = selectedFile.type.lastIndexOf('/');
      let fType = selectedFile.type.substring(indexLastsSlash + 1);
      const compressFile = await resizeFile(selectedFile);

      const videoUploaderOptions = {
        fileType: fType,
        file: compressFile.file,
        relatedId: user.orgID,
        category: TouchpointIconsEnum.CUSTOM,
        fileName,
        type: AttachmentsEnum.TouchpointIcon,
      };
      setIsLoading(true);
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
        .onFinish(async () => {
          refetch();
          setFileName('');
          setUploadProgress(0);
          setIsLoading(false);
          onHandleCloseModal();
        })
        .onError(() => {
          setIsLoading(false);
          setUploadProgress(0);
        });

      uploadFile.start();
    }
  };

  const handleSelectIcon = useCallback((thumbnailUrl: string, searchText: string) => {
    setImagePreview(thumbnailUrl);
    setIconSearchText(searchText);
    setIsNounProjectIcon(true);
  }, []);

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoading || !isLoadingIconAttachment}>
      <ModalHeader title={'Media library'} />
      <div className={'create-touchpoint-modal'}>
        <div className={'create-touchpoint-modal--content'}>
          <div className={'create-touchpoint-modal--name-block'}>
            <label htmlFor="touchpoint-name">Name</label>
            <CustomInput
              value={fileName}
              onChange={e => setFileName(e.target.value)}
              id={'touchpoint-name'}
              data-testid={'create-touchpoint-name-test-id'}
              sxStyles={{ marginTop: '8px' }}
            />
          </div>
          <div className={'create-touchpoint-modal--icon-block'}>
            <label htmlFor="touchpoint-icon">Icon</label>
            <div className={'create-touchpoint-modal--icon-frame'}>
              <FileUploader
                id={'touchpoint-name'}
                classes={`attachments--file-uploader`}
                multiple={false}
                handleChange={onHandleFileSelect}
                name="file"
                types={PERSONA_FILE_TYPES}>
                <CustomFileUploader
                  uploadProgress={uploadProgress}
                  content={
                    imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="Selected File Preview"
                        width={200}
                        height={200}
                        style={{ width: '100px', height: '100px' }}
                      />
                    ) : (
                      <CustomFileUploader2 />
                    )
                  }
                />
              </FileUploader>
            </div>
          </div>
          <div className={'create-touchpoint-modal--or-block'}>
            <p>Or</p>
          </div>
          <SearchNounProjectIcon onIconSelect={handleSelectIcon} />
        </div>

        <div className={'base-modal-footer'}>
          <button
            className={'base-modal-footer--cancel-btn'}
            onClick={onHandleCloseModal}
            disabled={isLoading || isLoadingIconAttachment}>
            Cancel
          </button>
          <CustomButton
            startIcon={false}
            data-testid={'create-touchpoint-btn-test-id'}
            sxStyles={{ width: '98px' }}
            onClick={isNounProjectIcon ? onHandleUploadNounProjectIcon : handleUploadFiles}
            disabled={isLoading || isLoadingIconAttachment || !imagePreview}
            isLoading={isLoading || isLoadingIconAttachment}
            className={imagePreview ? '' : 'disabled-btn'}>
            Add
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

export default CreateTouchpointModal;
