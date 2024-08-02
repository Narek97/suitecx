import React, { ChangeEvent } from 'react';

import EyeIcon from '@/public/button-icons/eye.svg';
import CopyIcon from '@/public/canvas/operations/copy.svg';
import LockIcon from '@/public/canvas/operations/lock.svg';
import UnLockIcon from '@/public/canvas/operations/unlock.svg';
import ImageIcon from '@/public/files/img.svg';
import PDFIcon from '@/public/files/pdf.svg';
import ColorPickerIcon from '@/public/operations/color-picker.svg';
import CropIcon from '@/public/operations/crop.svg';
import DeleteIcon from '@/public/operations/delete.svg';
import EditIcon from '@/public/operations/edit.svg';
import FillIcon from '@/public/operations/fill.svg';
import FitIcon from '@/public/operations/fit.svg';
import ShareIcon from '@/public/operations/share.svg';
import { JourneyMapHeaderExportEnum } from '@/utils/ts/enums/global-enums';
import { AiModelType } from '@/utils/ts/types/ai-model/ai-model-type';
import { BoardType } from '@/utils/ts/types/board/board-types';
import {
  CommentButtonItemType,
  MenuOptionsType,
  NotesAndCommentsDrawerType,
} from '@/utils/ts/types/global-types';
import { InterviewType } from '@/utils/ts/types/interview/interview-type';
import {
  BoxItemType,
  JourneyMapCardType,
  TouchPointType,
} from '@/utils/ts/types/journey-map/journey-map-types';
import { LinkType } from '@/utils/ts/types/link/link-type';
import { PersonaDemographicInfoType, PersonaType } from '@/utils/ts/types/persona/persona-types';

const BOARD_CARD_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: (board: BoardType) => void;
  onHandleDelete: (board: BoardType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Rename',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const INTERVIEW_CARD_OPTIONS = ({
  onHandleNavigateToMap,
  onHandleView,
  onHandleDelete,
}: {
  onHandleNavigateToMap: () => void;
  onHandleView: (interview: InterviewType) => void;
  onHandleDelete: (interview: InterviewType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <ShareIcon fill={'#545E6B'} />,
      name: 'Map',
      onClick: onHandleNavigateToMap,
    },
    {
      icon: <EyeIcon />,
      name: 'View',
      onClick: onHandleView,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const PERSONA_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: (data: PersonaType) => void;
  onHandleDelete: (data: PersonaType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const JOURNEY_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
  onHandleCopyShareUrl,
  onHandleCopy,
}: {
  onHandleEdit: () => void;
  onHandleDelete: (data: JourneyMapCardType) => void;
  onHandleCopyShareUrl: () => void;
  onHandleCopy: (data: JourneyMapCardType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Rename',
      onClick: onHandleEdit,
    },
    {
      icon: <ShareIcon fill={'#545E6B'} />,
      name: 'Share',
      onClick: onHandleCopyShareUrl,
    },
    {
      name: 'Copy',
      icon: <CopyIcon fill={'#545E6B'} />,
      onClick: onHandleCopy,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: item => onHandleDelete(item),
    },
  ];
};

const JOURNEY_MAP_COLUM_ROW_OPTIONS = ({
  isDisabled,
  onHandleDelete,
  onHandleLock,
}: {
  isDisabled: boolean;
  onHandleDelete: () => void;
  onHandleLock: () => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      disabled: isDisabled,
      onClick: onHandleDelete,
    },
    {
      icon: isDisabled ? (
        <UnLockIcon fill={'#545E6B'} width={16} height={16} />
      ) : (
        <LockIcon fill={'#545E6B'} width={16} height={16} />
      ),
      name: isDisabled ? 'Unlock' : 'Lock',
      onClick: onHandleLock,
    },
  ];
};

const JOURNEY_MAP_COLUM_OPTIONS = ({
  onHandleDelete,
}: {
  onHandleDelete: (data: BoxItemType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: item => onHandleDelete(item),
    },
  ];
};

const JOURNEY_MAP_TEXT_FIELD_OPTIONS = ({
  onHandleDelete,
}: {
  onHandleDelete: (data: { itemId: number }) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const JOURNEY_MAP_IMAGE_OPTIONS = ({
  onHandleOpenViewModal,
  onHandleFileUpload,
  onHandleFit,
  onHandleFill,
  onHandleCrop,
  onHandleDelete,
}: {
  onHandleOpenViewModal: () => void;
  onHandleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onHandleFit: (data: CommentButtonItemType) => void;
  onHandleFill: (data: CommentButtonItemType) => void;
  onHandleCrop: (data: CommentButtonItemType) => void;
  onHandleDelete: (data: CommentButtonItemType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EyeIcon />,
      name: 'View',
      onClick: onHandleOpenViewModal,
    },
    {
      icon: (
        <>
          <EditIcon />
          <input
            style={{
              opacity: 0,
              position: 'absolute',
              top: 0,
              left: 0,
              width: '109px',
              height: '100%',
              cursor: 'pointer',
            }}
            id={'file'}
            type="file"
            accept="image/jpeg, image/png"
            onChange={e => {
              onHandleFileUpload(e);
            }}
            hidden
          />
        </>
      ),
      name: 'Update',
      isFileUpload: true,
    },
    {
      icon: <FitIcon />,
      name: 'Fit',
      onClick: item => onHandleFit(item),
    },
    {
      icon: <FillIcon />,
      name: 'Fill',
      onClick: item => onHandleFill(item),
    },
    {
      icon: <CropIcon />,
      name: 'Crop',
      onClick: item => onHandleCrop(item),
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: item => onHandleDelete(item),
    },
  ];
};

const JOURNEY_MAP_OUTCOME_ITEM_OPTIONS = ({
  onHandleDelete,
  onHandleEdit,
}: {
  onHandleEdit: () => void;
  onHandleDelete: (data: NotesAndCommentsDrawerType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const JOURNEY_MAP_METRICS_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: () => void;
  onHandleDelete: () => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const JOURNEY_MAP_EXPORTS_OPTIONS = ({
  onHandleClick,
}: {
  onHandleClick: (type: JourneyMapHeaderExportEnum) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <ImageIcon fill={'#545E6B'} />,
      name: 'Download image',
      onClick: () => onHandleClick(JourneyMapHeaderExportEnum.IMAGE),
    },
    {
      icon: <PDFIcon fill={'#545E6B'} />,
      name: 'Download PDF',
      onClick: () => onHandleClick(JourneyMapHeaderExportEnum.PDF),
    },
  ];
};

const PERSONA_DEMOGRAPHIC_INFO_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: (data: PersonaDemographicInfoType) => void;
  onHandleDelete: (data: PersonaDemographicInfoType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const TOUCHPOINT_ITEM_OPTIONS = ({
  onHandleDelete,
  onHandleChangeColor,
}: {
  onHandleDelete: (data: TouchPointType) => void;
  onHandleChangeColor: (e: ChangeEvent<HTMLInputElement>) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
    {
      icon: (
        <>
          <label htmlFor="head" className={'custom-vertical-menu--menu-item-content-icon'}>
            <ColorPickerIcon />
            <input
              data-testid={'color-picker'}
              type={'color'}
              id={'head'}
              onChange={onHandleChangeColor}
              style={{
                opacity: 0,
              }}
            />
          </label>
        </>
      ),
      isColorPicker: true,
      name: 'background',
      label: (
        <label htmlFor="head" style={{ height: '32px', lineHeight: '32px' }}>
          Background
        </label>
      ),
      onClick: () => {},
    },
  ];
};

const LINK_ITEM_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: () => void;
  onHandleDelete: (data: LinkType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

// const ATLAS_FOLDER_OPTIONS = ({
//   onHandleEdit,
//   onHandleDelete,
// }: {
//   onHandleEdit: (folder: AtlasFolderType) => void;
//   onHandleDelete: (folder: AtlasFolderType) => void;
// }): Array<MenuOptionsType> => {
//   return [
//     {
//       icon: <EditIcon />,
//       name: 'Edit',
//       onClick: onHandleEdit,
//     },
//     {
//       icon: <DeleteIcon />,
//       name: 'Delete',
//       onClick: onHandleDelete,
//     },
//   ];
// };

const METRICS_DATA_POINT_EXEL_OPTIONS = ({
  onHandleDelete,
}: {
  onHandleDelete: (data: { id: string | number }) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <DeleteIcon fill={'#545E6B'} />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const OUTCOME_OPTIONS = ({
  onHandleDelete,
  onHandleEdit,
  color,
}: {
  onHandleEdit: (data?: any) => void;
  onHandleDelete: (data: any) => void;
  color?: string;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon fill={color || '#545E6B'} />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon fill={color || '#545E6B'} />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const COMMENT_ITEM_OPTIONS = ({
  onHandleDelete,
  onHandleEdit,
  color,
}: {
  onHandleEdit: (data?: any) => void;
  onHandleDelete: (data: any) => void;
  color?: string;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon fill={color || '#545E6B'} />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon fill={color || '#545E6B'} />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

const AI_MODEL_CARD_OPTIONS = ({
  onHandleEdit,
  onHandleDelete,
}: {
  onHandleEdit: (board: AiModelType) => void;
  onHandleDelete: (board: AiModelType) => void;
}): Array<MenuOptionsType> => {
  return [
    {
      icon: <EditIcon />,
      name: 'Edit',
      onClick: onHandleEdit,
    },
    {
      icon: <DeleteIcon />,
      name: 'Delete',
      onClick: onHandleDelete,
    },
  ];
};

export {
  BOARD_CARD_OPTIONS,
  INTERVIEW_CARD_OPTIONS,
  PERSONA_OPTIONS,
  JOURNEY_OPTIONS,
  JOURNEY_MAP_COLUM_ROW_OPTIONS,
  JOURNEY_MAP_COLUM_OPTIONS,
  JOURNEY_MAP_TEXT_FIELD_OPTIONS,
  JOURNEY_MAP_IMAGE_OPTIONS,
  JOURNEY_MAP_OUTCOME_ITEM_OPTIONS,
  JOURNEY_MAP_METRICS_OPTIONS,
  JOURNEY_MAP_EXPORTS_OPTIONS,
  PERSONA_DEMOGRAPHIC_INFO_OPTIONS,
  TOUCHPOINT_ITEM_OPTIONS,
  LINK_ITEM_OPTIONS,
  // ATLAS_FOLDER_OPTIONS,
  METRICS_DATA_POINT_EXEL_OPTIONS,
  AI_MODEL_CARD_OPTIONS,
  OUTCOME_OPTIONS,
  COMMENT_ITEM_OPTIONS,
};
