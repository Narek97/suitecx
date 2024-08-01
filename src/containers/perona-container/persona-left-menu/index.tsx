import React, {
  ChangeEvent,
  FC,
  FormEvent,
  LegacyRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import './style.scss';
import DemographicInfoItem from '@/containers/perona-container/persona-left-menu/demographic-Info-Item';
import PersonaGalleryModal from '@/containers/perona-container/persona-left-menu/persona-gallery-modal';
import ColorPicker from '@/components/atoms/color-picker/color-picker';
import { personaTypeMenuItems } from '@/utils/constants/dropdown';
import { DEMOGRAPHIC_INFO_POPOVER } from '@/utils/constants/popover';
import CustomDropDown from '@/components/atoms/custom-drop-down/custom-drop-down';
import CustomFileUploader from '@/components/atoms/custom-file-uploader/custom-file-uploader';
import CustomInput from '@/components/atoms/custom-Input/custom-Input';
import { DemographicInfoTypeEnum } from '@/gql/types';
import { debounced400 } from '@/hooks/useDebounce';
import { PERSONA_DEMOGRAPHIC_INFO_OPTIONS } from '@/utils/constants/options';
import { PersonaTypeEnum } from '@/utils/ts/enums/global-enums';
import {
  PersonaDemographicInfoType,
  PersonaInfoType,
} from '@/utils/ts/types/persona/persona-types';
import Image from 'next/image';
import { Popover, Skeleton } from '@mui/material';
import PlusIcon from '@/public/operations/plus.svg';
import TickIcon from '@/public/operations/tick.svg';
import XDeleteIcon from '@/public/operations/xdelete.svg';

interface IPersonaLeftMenu {
  personaInfo: PersonaInfoType;
  demographicInfos: Array<PersonaDemographicInfoType>;
  onHandleUpdateInfo: (key: string, value: string) => void;
  onHandleChangeDemographicInfo: (
    demographicInfoId: number,
    value: string,
    key: 'key' | 'value',
  ) => void;
  onHandleAddNewDemographicInfo: (
    name: string,
    type: DemographicInfoTypeEnum,
    value: string,
  ) => void;
  onHandleDeleteDemographicInfo: (id: number) => void;
  isLoadingCreateDemographicInfo: boolean;
  isLoadingDeleteDemographicInfo: boolean;
  demographicInfoRef: LegacyRef<HTMLDivElement> | undefined;
}

const PersonaLeftMenu: FC<IPersonaLeftMenu> = memo(
  ({
    personaInfo,
    demographicInfos,
    onHandleUpdateInfo,
    onHandleChangeDemographicInfo,
    onHandleAddNewDemographicInfo,
    onHandleDeleteDemographicInfo,
    isLoadingCreateDemographicInfo,
    isLoadingDeleteDemographicInfo,
    demographicInfoRef,
  }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const personaTypeInputRef = useRef<HTMLInputElement | null>(null);
    const [name, setName] = useState<string>('');
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [selectedDemographicInfoType, setSelectedDemographicInfoType] =
      useState<DemographicInfoTypeEnum | null>(null);
    const [selectedDemographicInfoId, setSelectedDemographicInfoId] = useState<number | null>(null);
    // const [isOpenOtherType, setIsOpenOtherType] = useState<boolean>(false);
    const [otherTypeText, setOtherTypeText] = useState<string>(personaInfo.type);
    const [isAutoFocusOn, setIsAutoFocusOn] = useState<boolean>(false);
    const [isOpenGalleryModal, setIsOpenGalleryModal] = useState<boolean>(false);
    const [avatarKey, setAvatarKey] = useState<string>(
      personaInfo.attachment
        ? `${personaInfo?.attachment?.url}/large${personaInfo?.attachment?.key}`
        : '',
    );

    const onHandleChangeAvatar = useCallback((key: string) => {
      setAvatarKey(key);
    }, []);

    const onHandleToggleGalleryModal = () => {
      setIsOpenGalleryModal(prev => !prev);
    };

    const onHandleTogglePopup = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(anchorEl ? null : event?.currentTarget);
    };

    const onHandleSelectDemographicInfo = (type: DemographicInfoTypeEnum) => {
      setSelectedDemographicInfoType(type);
      setAnchorEl(null);
    };

    const onHandleCreateDemographicInfo = (e: FormEvent) => {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      setSelectedDemographicInfoType(null);
      setName('');
      onHandleAddNewDemographicInfo(
        name,
        selectedDemographicInfoType as DemographicInfoTypeEnum,
        target.value || '',
      );
    };

    const onHandleEditDemographicInfoItem = useCallback((item: PersonaDemographicInfoType) => {
      setSelectedDemographicInfoId(item.id);
    }, []);

    const onHandleRemoveSelectedDemographicInfoId = useCallback(() => {
      setSelectedDemographicInfoId(null);
    }, []);

    const onHandleDeleteDemographicInfoItem = useCallback(
      (item: PersonaDemographicInfoType) => {
        onHandleDeleteDemographicInfo(item.id);
      },
      [onHandleDeleteDemographicInfo],
    );

    const onHandleAddOtherType = (e: ChangeEvent<HTMLInputElement>) => {
      setOtherTypeText(e.target.value);
      debounced400(() => {
        onHandleUpdateInfo('type', e.target.value);
      });
    };
    const options = useMemo(() => {
      return PERSONA_DEMOGRAPHIC_INFO_OPTIONS({
        onHandleEdit: onHandleEditDemographicInfoItem,
        onHandleDelete: onHandleDeleteDemographicInfoItem,
      });
    }, [onHandleDeleteDemographicInfoItem, onHandleEditDemographicInfoItem]);

    useEffect(() => {
      if (isAutoFocusOn) {
        personaTypeInputRef?.current?.focus();
      }
    }, [isAutoFocusOn]);

    return (
      <div className={'perosna-left-menu'}>
        {isOpenGalleryModal && (
          <PersonaGalleryModal
            isOpen={isOpenGalleryModal}
            onHandleCloseModal={onHandleToggleGalleryModal}
            onHandleChangeAvatar={onHandleChangeAvatar}
          />
        )}
        <div className={'perosna-left-menu--content'}>
          <div
            className={'perosna-left-menu--avatar-frame'}
            style={{ background: `${personaInfo.color}` }}
            onClick={onHandleToggleGalleryModal}>
            {avatarKey ? (
              <div className={'perosna-left-menu--avatar-border'}>
                <Image
                  className={'perosna-left-menu--avatar'}
                  src={`${process.env.NEXT_PUBLIC_AWS_URL}/${avatarKey}`}
                  alt="Avatar"
                  width={200}
                  height={200}
                />
              </div>
            ) : (
              <CustomFileUploader uploadProgress={0} />
            )}
          </div>
          <div className={'perosna-left-menu--color-type-block'}>
            <div className={'perosna-left-menu--color-block'}>
              <p>Color:</p>
              <ColorPicker
                defaultColor={personaInfo.color || '#1b87e6'}
                onChange={colorData => {
                  onHandleUpdateInfo('color', colorData);
                }}
              />
            </div>
            <div className={'perosna-left-menu--type-block'}>
              <p>Type:</p>
              {personaInfo.type !== PersonaTypeEnum.Customer &&
                personaInfo.type !== PersonaTypeEnum.Employee && (
                  <div className={'custom-type-input'}>
                    <CustomInput
                      data-testid="custom-user-type"
                      sxStyles={{
                        background: 'white',
                        '& .Mui-focused': {
                          backgroundColor: 'white',
                        },
                      }}
                      inputRef={personaTypeInputRef}
                      value={otherTypeText}
                      onChange={onHandleAddOtherType}
                      onBlur={() => setIsAutoFocusOn(false)}
                      onKeyDown={event => {
                        if (event.keyCode === 13) {
                          event.preventDefault();
                          (event.target as HTMLElement).blur();
                        }
                      }}
                    />
                  </div>
                )}
              <CustomDropDown
                menuItems={personaTypeMenuItems}
                onSelect={item => {
                  if (item.value === PersonaTypeEnum.Others) {
                    setIsAutoFocusOn(true);
                    setOtherTypeText('');
                    onHandleUpdateInfo('type', '');
                  } else {
                    onHandleUpdateInfo('type', item.value as string);
                  }
                }}
                // defaultValue={personaInfo.type}
                selectItemValue={
                  personaInfo.type !== PersonaTypeEnum.Customer &&
                  personaInfo.type !== PersonaTypeEnum.Employee
                    ? PersonaTypeEnum.Others
                    : personaInfo.type
                }
              />
            </div>
          </div>
        </div>
        <div className={'perosna-left-menu--block-2'}>
          <p className={'perosna-left-menu--block-2-title'}>Demographic info</p>
          <div className={'perosna-left-menu--demographic-info-block'} ref={demographicInfoRef}>
            {demographicInfos.map((demographicInfo, index) => (
              <DemographicInfoItem
                key={demographicInfo.id}
                demographicInfo={demographicInfo}
                index={index}
                onHandleChangeDemographicInfo={onHandleChangeDemographicInfo}
                selectedDemographicInfoId={selectedDemographicInfoId}
                onHandleRemoveSelectedDemographicInfoId={onHandleRemoveSelectedDemographicInfoId}
                options={options}
              />
            ))}
          </div>
          {isLoadingCreateDemographicInfo && (
            <div className={'perosna-left-menu--demographic-info-create-loading-block'}>
              <Skeleton
                sx={{
                  width: 'auto',
                  height: '34px',
                }}
                animation="wave"
                variant="rectangular"
              />
            </div>
          )}
          <form
            autoComplete="off"
            className={`${
              isLoadingCreateDemographicInfo
                ? 'perosna-left-menu--demographic-none-info-create-block'
                : 'perosna-left-menu--demographic-info-create-block'
            }  ${
              selectedDemographicInfoType
                ? 'perosna-left-menu--demographic-open-info-create-block'
                : ''
            }`}
            onSubmit={onHandleCreateDemographicInfo}>
            <CustomInput
              inputRef={inputRef}
              value={name}
              data-testid={'demographic-info-name-test-id'}
              onChange={e => setName(e.target.value)}
            />
            <div className={'perosna-left-menu--demographic-info-actions'}>
              <button
                type={'submit'}
                aria-label={'Tick'}
                data-testid={'create-demographic-info-test-id'}>
                <TickIcon />
              </button>
              <button
                type={'button'}
                aria-label={'XDelete'}
                disabled={isLoadingDeleteDemographicInfo}
                onClick={() => setSelectedDemographicInfoType(null)}>
                <XDeleteIcon />
              </button>
            </div>
          </form>

          <button
            aria-label={'add'}
            data-testid={'add-demographic-info-test-id'}
            className={'perosna-left-menu--add-demographic-info'}
            style={{ background: anchorEl ? '#1b87e6' : '' }}
            onClick={e => {
              onHandleTogglePopup(e);
              inputRef.current?.focus();
            }}
            disabled={isLoadingCreateDemographicInfo}>
            <PlusIcon fill={anchorEl ? '#ffffff' : '#1b87e6'} />
          </button>
          <Popover
            sx={{
              '& .MuiPopover-paper': {
                borderRadius: '0',
              },
            }}
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onHandleTogglePopup}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}>
            <ul className={'perosna-left-menu--demographic-info-popover'}>
              {DEMOGRAPHIC_INFO_POPOVER.map(item => (
                <li
                  key={item.id}
                  data-testid={`${item.type.toLowerCase()}-test-id`}
                  className={'perosna-left-menu--demographic-info-popover-item'}
                  onClick={() => onHandleSelectDemographicInfo(item.type)}>
                  {item.name}
                </li>
              ))}
            </ul>
          </Popover>
        </div>
      </div>
    );
  },
);

export default PersonaLeftMenu;
