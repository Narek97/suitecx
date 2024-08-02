import React, { ChangeEvent, FC, memo, useCallback, useState } from 'react';

import './style.scss';

import { Skeleton } from '@mui/material';
import { useRecoilValue } from 'recoil';

import { useCrudMapBoxElement } from '@/containers/journey-map-container/hooks/useCRUDMapBoxElement';
import ImageViewModal from '@/containers/journey-map-container/journey-map-rows/row-types/row-images/image-view-modal';
import ImageCard from '@/containers/journey-map-container/journey-map-rows/row-types/row-images/row-images-item/image-card';
import { useAddBoxElementMutation } from '@/gql/mutations/generated/addBoxElement.generated';
import { useRemoveBoxElementMutation } from '@/gql/mutations/generated/removeBoxElement.generated';
import { useUpdateBoxElementMutation } from '@/gql/mutations/generated/updateBoxElement.generated';
import { AttachmentsEnum } from '@/gql/types';
import PlusIcon from '@/public/button-icons/plus.svg';
import { selectedJourneyMapPersona } from '@/store/atoms/journeyMap.atom';
import { resizeFile } from '@/utils/helpers/resize-file';
import { UploadFile } from '@/utils/helpers/uploader';
import { ActionsEnum } from '@/utils/ts/enums/global-enums';
import { ObjectKeysType } from '@/utils/ts/types/global-types';
import { BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IRowImagesItem {
  rowItem: BoxItemType;
  rowId: number;
  index: number;
  disabled: boolean;
}

const RowImagesItem: FC<IRowImagesItem> = memo(({ rowItem, rowId, index, disabled }) => {
  const { crudBoxElement } = useCrudMapBoxElement();

  const selectedPerson = useRecoilValue(selectedJourneyMapPersona);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isViewModalOpen, setIsOpenViewModal] = useState<boolean>(false);
  const [currentImageUrl, setCurrentImageUrl] = useState<any>({});

  const { mutate: addBoxElement } = useAddBoxElementMutation({
    onSuccess: response => {
      crudBoxElement(response.addBoxElement, ActionsEnum.CREATE);
      setIsUploading(false);
    },
  });

  const { mutate: updateBoxElement } = useUpdateBoxElementMutation({
    onSuccess: response => {
      crudBoxElement(response?.updateBoxElement, ActionsEnum.UPDATE);
    },
  });

  const { mutate: removeBoxElement } = useRemoveBoxElementMutation({
    onSuccess: response => {
      crudBoxElement(response?.removeBoxElement, ActionsEnum.DELETE);
    },
  });

  const deleteImage = useCallback(
    (boxElementId: number) => {
      removeBoxElement({
        removeBoxElementInput: {
          boxElementId,
        },
      });
    },
    [removeBoxElement],
  );

  const viewImage = useCallback((imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setIsOpenViewModal(true);
  }, []);

  const handleFileUpload = useCallback(
    async (e: ChangeEvent<HTMLInputElement>): Promise<ObjectKeysType | undefined> => {
      const file = e?.target?.files?.length && e?.target?.files[0];
      if (file) {
        const compressFile = await resizeFile(file);
        return new Promise((resolve, reject) => {
          let indexLastsSlash = file.type.lastIndexOf('/');
          let fType = file.type.substring(indexLastsSlash + 1);
          const videoUploaderOptions = {
            fileType: fType,
            file: compressFile.file,
            relatedId: rowId,
            type: AttachmentsEnum.MapRow,
          };
          const uploadFile = new UploadFile(videoUploaderOptions);
          uploadFile.start();
          uploadFile.onFinish((uploadFilesData: ObjectKeysType) => {
            resolve(uploadFilesData);
          });
          uploadFile.onError(() => {
            reject(new Error('File upload failed'));
          });
        });
      }
    },
    [rowId],
  );

  const addImageItem = useCallback(
    async (e: ChangeEvent<HTMLInputElement>, stepId: number) => {
      setIsUploading(true);
      const uploadFilesData = await handleFileUpload(e);
      addBoxElement({
        addBoxElementInput: {
          rowId: rowId,
          imageId: uploadFilesData?.id,
          columnId: rowItem?.columnId!,
          text: uploadFilesData?.key,
          personaId: selectedPerson?.id || null,
          stepId,
        },
      });
      setIsUploading(false);
    },
    [addBoxElement, handleFileUpload, rowId, rowItem?.columnId, selectedPerson?.id],
  );

  const updateImageItem = useCallback(
    async (
      e: ChangeEvent<HTMLInputElement>,
      { boxElementId, callback }: { boxElementId: number; callback: () => void },
    ) => {
      const uploadFilesData = await handleFileUpload(e);

      updateBoxElement(
        {
          updateBoxDataInput: {
            attachmentId: uploadFilesData?.id,
            boxElementId,
            text: uploadFilesData?.key,
          },
        },
        {
          onSuccess: () => {
            callback();
          },
          onError: () => {
            callback();
          },
        },
      );
    },
    [handleFileUpload, updateBoxElement],
  );

  return (
    <div className={'row-images-item'}>
      {isViewModalOpen && (
        <ImageViewModal
          url={currentImageUrl}
          handleClose={() => {
            setIsOpenViewModal(false);
          }}
          isOpen={isViewModalOpen}
        />
      )}

      {rowItem?.boxElements.length === 1 && !isUploading ? (
        <div className={'row-images-item--first-image map-item'}>
          <ImageCard
            rowItem={rowItem}
            boxImage={rowItem?.boxElements[0]}
            deleteImage={deleteImage}
            viewImage={viewImage}
            disabled={disabled}
            handleUpdateFile={(e, callback) =>
              updateImageItem(e, {
                boxElementId: rowItem?.boxElements[0].id,
                callback,
              })
            }
          />
          <FileUploadButton rowItem={rowItem} index={index} addImageItem={addImageItem} />
        </div>
      ) : (
        <div
          className={`row-images-item--images map-item ${
            rowItem?.boxElements.length ? '' : 'row-images-item--images--full-height'
          }`}>
          {rowItem?.boxElements.map(boxImage => (
            <div className={'row-images-item--images--card'} key={boxImage.id}>
              <ImageCard
                rowItem={rowItem}
                boxImage={boxImage}
                deleteImage={deleteImage}
                viewImage={viewImage}
                disabled={disabled}
                handleUpdateFile={(e, callback) =>
                  updateImageItem(e, {
                    boxElementId: boxImage.id,
                    callback,
                  })
                }
              />
            </div>
          ))}

          {isUploading ? (
            <div
              className={`row-images-item--images--card ${
                rowItem?.boxElements.length ? '' : 'row-images-item--images--firs-card'
              }`}>
              <Skeleton
                sx={{
                  borderRadius: 1,
                  width: '100%',
                  height: '100%',
                }}
                animation="wave"
                variant="rectangular"
              />
            </div>
          ) : (
            <>
              {disabled ? null : (
                <FileUploadButton rowItem={rowItem} index={index} addImageItem={addImageItem} />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
});

export default RowImagesItem;

interface IFileUploadButton {
  rowItem: BoxItemType;
  index: number;
  addImageItem: (e: ChangeEvent<HTMLInputElement>, stepId: number) => void;
}

const FileUploadButton: FC<IFileUploadButton> = ({ rowItem, index, addImageItem }) => {
  return (
    <div
      className={`row-images-item--images--card ${
        rowItem?.boxElements.length ? '' : 'row-images-item--images--firs-card'
      }`}>
      <label
        htmlFor={rowItem.id?.toString() || `file+${index}`}
        className={`row-images-item--add-image-button ${
          rowItem?.boxElements.length ? '' : 'row-images-item--add-image-first-button'
        }`}>
        <PlusIcon />
        <input
          className={'image-upload-input'}
          id={rowItem.id?.toString() || `file+${index}`}
          type="file"
          accept="image/jpeg, image/png"
          onChange={e => addImageItem(e, rowItem.step.id)}
        />
      </label>
    </div>
  );
};
