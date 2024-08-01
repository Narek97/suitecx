import React, { FC, memo } from 'react';

import './style.scss';

import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import AddUpdateOutcomeForm from '@/containers/outcome-conatiner/add-update-outcome-item-modal/add-update-outcome-form';
import { OutcomeLevelEnum } from '@/utils/ts/enums/global-enums';
import { MapOutcomeItemType, OutcomeGroupItemType } from '@/utils/ts/types/outcome/outcome-type';

interface IAddUpdateOutcomeItem {
  isOpen: boolean;
  workspaceId: number;
  outcomeGroupId: number;
  singularName: string;
  selectedOutcome: MapOutcomeItemType | null;
  create: (data: OutcomeGroupItemType) => void;
  update: (data: OutcomeGroupItemType) => void;
  handleClose: () => void;
}

const AddUpdateOutcomeItemModal: FC<IAddUpdateOutcomeItem> = memo(
  ({
    isOpen,
    workspaceId,
    outcomeGroupId,
    singularName,
    selectedOutcome,
    create,
    update,
    handleClose,
  }) => {
    return (
      <CustomModal
        isOpen={isOpen}
        modalSize={'md'}
        handleClose={handleClose}
        canCloseWithOutsideClick={true}>
        <ModalHeader
          title={
            <div className={'add-update-outcome-modal-header'}>
              {selectedOutcome ? 'Update' : 'New'}{' '}
              <span className={'add-update-outcome-modal-header--outcome-item'}>
                {singularName}
              </span>
            </div>
          }
        />
        <AddUpdateOutcomeForm
          workspaceId={workspaceId!}
          outcomeGroupId={outcomeGroupId}
          defaultMapId={selectedOutcome?.map?.id || null}
          level={OutcomeLevelEnum.WORKSPACE}
          selectedOutcome={selectedOutcome}
          create={create}
          update={update}
          handleClose={handleClose}
        />
      </CustomModal>
    );
  },
);
export default AddUpdateOutcomeItemModal;
