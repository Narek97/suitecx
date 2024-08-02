import React, { ChangeEvent, FC, memo, useCallback, useMemo, useState } from 'react';

import './style.scss';

import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Cropper from 'react-easy-crop';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomLongMenu from '@/components/atoms/custom-long-menu/custom-long-menu';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import CommentBtn from '@/containers/journey-map-container/journey-map-card-comments-drawer/comment-btn';
import JourneyMapCardNote from '@/containers/journey-map-container/journey-map-card-note';
import {
  UpdateAttachmentCroppedAreaMutation,
  useUpdateAttachmentCroppedAreaMutation,
} from '@/gql/mutations/generated/updateAttachmentCroppedArea.generated';
import {
  UpdateAttachmentScaleTypeMutation,
  useUpdateAttachmentScaleTypeMutation,
} from '@/gql/mutations/generated/updateAttachmentScaleType.generated';
import { CommentAndNoteModelsEnum, ImgScaleTypeEnum } from '@/gql/types';
import NoteIcon from '@/public/journey-map/note.svg';
import { JOURNEY_MAP_IMAGE_OPTIONS } from '@/utils/constants/options';
import { menuViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { CommentButtonItemType } from '@/utils/ts/types/global-types';
import { BoxElementType, BoxItemType } from '@/utils/ts/types/journey-map/journey-map-types';

const CROP_AREA_ASPECT = 3 / 2;

interface IImageCard {
  rowItem: BoxItemType;
  boxImage: BoxElementType;
  deleteImage: (boxElementId: number) => void;
  viewImage: (imageUrl: string) => void;
  disabled: boolean;
  handleUpdateFile: (e: ChangeEvent<HTMLInputElement>, onFinish: () => void) => void;
}

const ImageCard: FC<IImageCard> = memo(
  ({ boxImage, rowItem, deleteImage, viewImage, disabled, handleUpdateFile }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isOpenNote, setIsOpenNote] = useState<boolean>(false);
    const [isOpenCropModal, setIsOpenCropModal] = useState<boolean>(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [imgScaleType, setImgScaleType] = useState<ImgScaleTypeEnum>(
      boxImage.attachment?.imgScaleType || ImgScaleTypeEnum.Fit,
    );

    const [croppedArea, setCroppedArea] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>(
      boxImage.attachmentPosition || {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    );

    const [newCroppedArea, setNewCroppedArea] = useState<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>(
      boxImage.attachmentPosition || {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      },
    );

    const { mutate: updateAttachmentScaleType } = useUpdateAttachmentScaleTypeMutation<
      UpdateAttachmentScaleTypeMutation,
      Error
    >();

    const { mutate: updateAttachmentCroppedArea, isLoading: isLoadingAttachmentCroppedArea } =
      useUpdateAttachmentCroppedAreaMutation<UpdateAttachmentCroppedAreaMutation, Error>({
        onSuccess: () => {
          setIsOpenCropModal(false);
        },
      });

    const onHandleToggleNote = useCallback(() => {
      setIsOpenNote(prev => !prev);
    }, []);

    const onHandleChangeImgScale = useCallback(
      (scale: ImgScaleTypeEnum) => {
        setImgScaleType(scale);
        updateAttachmentScaleType({
          updateAttachmentScaleTypeInput: {
            attachmentId: boxImage.attachmentId!,
            imgScaleType: scale,
          },
        });
      },
      [boxImage.attachmentId, updateAttachmentScaleType],
    );

    const onHandleSaveCropImage = () => {
      setCroppedArea(newCroppedArea);
      updateAttachmentCroppedArea({
        updateAttachmentCroppedAreaInput: {
          attachmentId: boxImage.attachmentId!,
          ...newCroppedArea,
        },
      });
    };

    const options = useMemo(() => {
      return JOURNEY_MAP_IMAGE_OPTIONS({
        onHandleOpenViewModal: () => {
          viewImage(boxImage?.text);
        },
        onHandleFileUpload: (e: ChangeEvent<HTMLInputElement>) => {
          setIsLoading(true);
          handleUpdateFile(e, () => {
            setIsLoading(false);
          });
        },
        onHandleFit: () => {
          onHandleChangeImgScale(ImgScaleTypeEnum.Fit);
        },
        onHandleFill: () => {
          onHandleChangeImgScale(ImgScaleTypeEnum.Fill);
        },
        onHandleCrop: () => {
          onHandleChangeImgScale(ImgScaleTypeEnum.Crop);
          setIsOpenCropModal(true);
        },
        onHandleDelete: item => {
          deleteImage(item?.itemId!);
          setIsLoading(true);
        },
      });
    }, [boxImage?.text, deleteImage, handleUpdateFile, onHandleChangeImgScale, viewImage]);

    const commentRelatedData: CommentButtonItemType = {
      title: rowItem?.boxTextElement?.text || '',
      itemId: boxImage.id,
      rowId: boxImage.rowId,
      columnId: rowItem.columnId!,
      stepId: rowItem.step.id,
      type: CommentAndNoteModelsEnum.BoxElement,
    };

    const Output = () => {
      const scale = 100 / croppedArea.width;
      const transform = {
        x: `${-croppedArea.x * scale}%`,
        y: `${-croppedArea.y * scale}%`,
        scale,
        width: 'calc(100% + 0.5px)',
        height: 'auto',
      };

      const imageStyle = {
        transform: `translate3d(${transform.x}, ${transform.y}, 0) scale3d(${transform.scale},${transform.scale},1)`,
        width: transform.width,
        height: transform.height,
      };

      return (
        <div className="output" style={{ paddingBottom: `${100 / CROP_AREA_ASPECT}%` }}>
          <Image
            src={`${process.env.NEXT_PUBLIC_AWS_URL}/${boxImage?.text}`}
            alt="Img"
            style={imageStyle}
            onClick={() => {
              viewImage(boxImage?.text);
            }}
            width={200}
            height={200}
          />
        </div>
      );
    };

    return (
      <>
        {isOpenCropModal && (
          <CustomModal
            isOpen={isOpenCropModal}
            modalSize={'md'}
            handleClose={() => setIsOpenCropModal(false)}
            canCloseWithOutsideClick={true}>
            <ModalHeader title={'Crop image'} />
            <div className="image-card-cropper-modal">
              <div className="image-card-cropper">
                <Cropper
                  image={`${process.env.NEXT_PUBLIC_AWS_URL}/${boxImage?.text}`}
                  aspect={CROP_AREA_ASPECT}
                  crop={crop}
                  zoom={zoom}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropAreaChange={setNewCroppedArea}
                />
              </div>
              <div className={'base-modal-footer'}>
                <button
                  className={'base-modal-footer--cancel-btn'}
                  onClick={() => setIsOpenCropModal(false)}
                  disabled={isLoadingAttachmentCroppedArea}>
                  Cancel
                </button>
                <CustomButton
                  startIcon={false}
                  data-testid={'crop-btn-test-id'}
                  sxStyles={{ width: '98px' }}
                  onClick={onHandleSaveCropImage}
                  disabled={isLoadingAttachmentCroppedArea}
                  isLoading={isLoadingAttachmentCroppedArea}>
                  Save
                </CustomButton>
              </div>
            </div>
          </CustomModal>
        )}

        <div key={boxImage?.id} className={'image-card'}>
          {isOpenNote && (
            <JourneyMapCardNote
              type={CommentAndNoteModelsEnum.BoxElement}
              itemId={boxImage.id}
              rowId={boxImage.rowId}
              stepId={rowItem.step.id}
              onClickAway={onHandleToggleNote}
            />
          )}
          <div className={'image-card--header'}>
            <div className={'image-card--header--comment'}>
              <CommentBtn commentsCount={boxImage.commentsCount} item={commentRelatedData} />
            </div>
            <div className={'image-card--header--note'}>
              <button aria-label={'Note'} onClick={onHandleToggleNote}>
                <NoteIcon />
              </button>
            </div>

            <div className={'image-card--header--menu'}>
              <CustomLongMenu
                type={menuViewTypeEnum.VERTICAL}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                item={commentRelatedData}
                options={options}
                disabled={disabled}
                sxStyles={{
                  display: 'inline-block',
                  background: 'transparent',
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <Skeleton
              sx={{
                width: '100%',
                height: '100%',
                borderRadius: 1,
              }}
              animation="wave"
              variant="rectangular"
            />
          ) : (
            <>
              {imgScaleType === ImgScaleTypeEnum.Crop ? (
                <Output />
              ) : (
                <div className="output">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_AWS_URL}/${boxImage?.text}`}
                    alt="Img"
                    onClick={() => {
                      viewImage(boxImage?.text);
                    }}
                    width={200}
                    height={200}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: `${imgScaleType === ImgScaleTypeEnum.Fit ? 'contain' : 'cover'}`,
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </>
    );
  },
);

export default ImageCard;
