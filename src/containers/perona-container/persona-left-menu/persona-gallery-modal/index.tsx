import React, { ChangeEvent, FC, useCallback, useState } from 'react';

import './style.scss';

import { Skeleton } from '@mui/material';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { FileUploader } from 'react-drag-drop-files';
import { useRecoilValue } from 'recoil';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomFileUploader from '@/components/atoms/custom-file-uploader/custom-file-uploader';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import Pagination from '@/components/templates/pagination';
import {
  AttachImageToPersonaMutation,
  useAttachImageToPersonaMutation,
} from '@/gql/mutations/generated/attachImageToPersona.generated';
import {
  DeleteAttachmentMutation,
  useDeleteAttachmentMutation,
} from '@/gql/mutations/generated/deleteFile.generated';
import {
  GetPersonaGalleryQuery,
  useGetPersonaGalleryQuery,
} from '@/gql/queries/generated/getPersonaGallery.generated';
import { AttachmentsEnum } from '@/gql/types';
import DeleteIcon from '@/public/operations/delete.svg';
import { userState } from '@/store/atoms/user.atom';
import { PERSONA_FILE_TYPES } from '@/utils/constants/general';
import { BOARDS_LIMIT, PERSONAS_GALLERY_LIMIT } from '@/utils/constants/pagination';
import { resizeFile } from '@/utils/helpers/resize-file';
import { UploadFile } from '@/utils/helpers/uploader';
import { PersonaGalleryType } from '@/utils/ts/types/persona/persona-types';

interface IPersonaGalleryModal {
  isOpen: boolean;
  onHandleCloseModal: () => void;
  onHandleChangeAvatar: (key: string) => void;
}

const PersonaGalleryModal: FC<IPersonaGalleryModal> = ({
  isOpen,
  onHandleCloseModal,
  onHandleChangeAvatar,
}) => {
  const user = useRecoilValue(userState);
  const { personaID } = useParams();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [selectedPersonaImgId, setSelectedPersonaImgId] = useState<number | null>(null);
  const [newGallery, setNewGallery] = useState<Array<PersonaGalleryType>>([]);
  const [allGallery, setAllGallery] = useState<Array<PersonaGalleryType>>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [offset, setOffset] = useState<number>(0);

  const {
    isLoading: isLoadingPersonaGallery,
    data: dataPersonaGallery,
    refetch,
  } = useGetPersonaGalleryQuery<GetPersonaGalleryQuery, Error>(
    {
      getPersonaGalleryInput: {
        offset: PERSONAS_GALLERY_LIMIT * offset,
        limit: PERSONAS_GALLERY_LIMIT,
        search,
      },
    },
    {
      onSuccess: response => {
        setNewGallery([]);
        setAllGallery(response.getPersonaGallery.attachments as Array<PersonaGalleryType>);
      },
    },
  );

  const { mutate: mutateAttachImageToPersona, isLoading: isLoadingAttachImageToPersona } =
    useAttachImageToPersonaMutation<AttachImageToPersonaMutation, Error>({
      onSuccess: response => {
        onHandleChangeAvatar(response.attachImageToPersona);
        onHandleCloseModal();
      },
    });

  const { mutate: mutateDeleteAttachment } = useDeleteAttachmentMutation<
    DeleteAttachmentMutation,
    Error
  >({
    onSuccess: async response => {
      if (currentPage !== 1 && galley.length === 1) {
        setCurrentPage(prev => prev - 1);
      }
      setNewGallery(prev => prev.filter(el => el.id !== response.deleteAttachment));
      setAllGallery(prev => prev.filter(el => el.id !== response.deleteAttachment));
      await refetch();
    },
  });

  const onHandleAttachImageToPersona = () => {
    if (selectedPersonaImgId) {
      mutateAttachImageToPersona({
        attachImageInput: {
          personaId: +personaID!,
          attachmentId: selectedPersonaImgId,
        },
      });
    } else {
      onHandleCloseModal();
    }
  };

  const handleUploadFiles = async (file: File | null) => {
    if (file) {
      let percentage: number | undefined = undefined;
      let indexLastsSlash = file.type.lastIndexOf('/');
      let fType = file.type.substring(indexLastsSlash + 1);
      const compressFile = await resizeFile(file);
      const videoUploaderOptions = {
        fileType: fType,
        file: compressFile.file,
        relatedId: user.orgID,
        type: AttachmentsEnum.PersonaGallery,
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
          setCurrentPage(1);
          setNewGallery(prev => [uploadFilesData, ...prev]);
          (dataPersonaGallery?.getPersonaGallery.count || 0) > PERSONAS_GALLERY_LIMIT &&
            setAllGallery(allGallery.slice(0, allGallery.length - 1));
          setUploadProgress(0);
        })
        .onError(() => {
          setUploadProgress(0);
        });

      uploadFile.start();
    }
  };

  const personaGallery = dataPersonaGallery?.getPersonaGallery.attachments || [];
  const galley = allGallery.length
    ? [...newGallery, ...allGallery]
    : [...newGallery, ...personaGallery];

  const galleyCount: number = dataPersonaGallery?.getPersonaGallery.count || 0;

  const onHandleChangePage = useCallback(
    (newPage: number) => {
      if (dataPersonaGallery?.getPersonaGallery && galley.length < galleyCount) {
        setOffset(newPage - 1);
      }
      if (galley.length >= newPage * BOARDS_LIMIT || galley.length + BOARDS_LIMIT > galleyCount) {
        setNewGallery([]);
        setCurrentPage(newPage);
      }
    },
    [dataPersonaGallery?.getPersonaGallery, galley.length, galleyCount],
  );

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={onHandleCloseModal}
      canCloseWithOutsideClick={!isLoadingAttachImageToPersona}
      modalSize={'lg'}>
      <div>
        <ModalHeader
          title={'Media library'}
          infoLink={'https://www.questionpro.com/help/add-image.html'}
        />
        <div className={'persona-gallery-modal'}>
          <div className={'persona-gallery-modal--header'}>
            <div className={'persona-gallery-modal--header--search-block'}>
              <CustomInput
                isIconInput={true}
                inputType={'primary'}
                placeholder="search..."
                name={'search'}
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              />
            </div>
            {galleyCount > PERSONAS_GALLERY_LIMIT && (
              <Pagination
                currentPage={currentPage}
                allCount={galleyCount}
                perPage={PERSONAS_GALLERY_LIMIT}
                changePage={onHandleChangePage}
              />
            )}
          </div>
          <div className={'persona-gallery-modal--gallery'}>
            {isLoadingPersonaGallery ? (
              <>
                {Array(14)
                  .fill('')
                  .map((_, index) => (
                    <div className={'persona-gallery-modal--gallery--item'} key={index}>
                      <Skeleton
                        sx={{
                          width: 160,
                          height: 160,
                          borderRadius: 1,
                        }}
                        animation="wave"
                        variant="rectangular"
                      />
                    </div>
                  ))}
              </>
            ) : (
              <>
                <div className={'persona-gallery-modal--gallery--item'}>
                  <FileUploader
                    classes={`attachments--file-uploader`}
                    multiple={false}
                    handleChange={handleUploadFiles}
                    name="file"
                    types={PERSONA_FILE_TYPES}>
                    <CustomFileUploader uploadProgress={uploadProgress} />
                  </FileUploader>
                </div>
                {galley.map(item => (
                  <figure
                    key={item.id}
                    data-testid={`persona-gallery-test-id`}
                    className={`persona-gallery-modal--gallery--item ${
                      selectedPersonaImgId === item.id
                        ? 'persona-gallery-modal--gallery--selected-item'
                        : ''
                    }`}
                    onClick={() => setSelectedPersonaImgId(item.id)}>
                    <Image
                      src={` ${
                        item.url
                          ? `${process.env.NEXT_PUBLIC_AWS_URL}/${item?.url}/large${item?.key}`
                          : ` ${process.env.NEXT_PUBLIC_AWS_URL}/${item.key}`
                      }`}
                      width={200}
                      height={200}
                      alt={item.name || 'img'}
                    />
                    <figcaption className={'persona-gallery-modal--gallery--item-title'}>
                      {item.name}
                    </figcaption>
                    <button
                      aria-label={'delete'}
                      className={'persona-gallery-modal--gallery--item-delete-btn'}
                      data-testid={`persona-gallery-delete-btn-test-id`}
                      onClick={() => mutateDeleteAttachment({ id: item.id })}>
                      <DeleteIcon fill={'#ffffff'} />
                    </button>
                  </figure>
                ))}
              </>
            )}
          </div>
          <div className={'persona-gallery-modal--footer'}>
            <p>To upload, drag files on the upload box.</p>
            <CustomButton
              onClick={onHandleAttachImageToPersona}
              startIcon={false}
              data-testid={'gallery-apply-test-id'}
              disabled={isLoadingAttachImageToPersona}
              isLoading={isLoadingAttachImageToPersona}>
              Apply
            </CustomButton>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default PersonaGalleryModal;
