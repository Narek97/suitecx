import React, { FC, useState } from 'react';

import './style.scss';

import { FileUploader } from 'react-drag-drop-files';
import * as XLSX from 'xlsx';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomFileUploader from '@/components/atoms/custom-file-uploader/custom-file-uploader';
import CustomFileUploader2 from '@/components/atoms/custom-file-uploader/custom-file-uploader2';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import ModalHeader from '@/components/templates/modal-header';
import { MetricsTypeEnum } from '@/gql/types';
import Import from '@/public/base-icons/file-import.svg';
import { EXEL_FILE_TYPES } from '@/utils/constants/general';
import { CES_TEMPLATE, CSAT_TEMPLATE, NPS_TEMPLATE } from '@/utils/constants/metrics';
import { ObjectKeysType } from '@/utils/ts/types/global-types';

interface IImportDataPointModal {
  metricsType: MetricsTypeEnum;
  isOpen: boolean;
  onHandleSetUploadFile: (dataFile: Array<ObjectKeysType>) => void;
  onToggleImportDataPointTableModal: () => void;
  handleClose: () => void;
}

const ImportDataPointModal: FC<IImportDataPointModal> = ({
  isOpen,
  metricsType,
  onHandleSetUploadFile,
  onToggleImportDataPointTableModal,
  handleClose,
}) => {
  const [fileName, setFileName] = useState<string>('Choose file');
  const [isFileUpload, setIsFileUpload] = useState<boolean>(false);

  const isValidDate = (d: Date | any): boolean => {
    return d instanceof Date && !isNaN(d.getTime());
  };

  const processDates = (data: any[]): any[] => {
    return data.map(item => {
      let date: Date;

      if (typeof item.Date === 'number') {
        date = new Date((item.Date - 25569) * 86400 * 1000);
      } else if (typeof item.Date === 'string') {
        date = new Date(item.Date);
      } else {
        return null;
      }

      if (isValidDate(date)) {
        return {
          ...item,
          Date: date.toISOString().split('T')[0],
        };
      } else {
        return {
          ...item,
          Date: null,
        };
      }
    });
  };

  const handleFileUpload = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const workbook = XLSX.read(event.target?.result, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_json(sheet);
        onHandleSetUploadFile(processDates(sheetData) as ObjectKeysType[]);
        setFileName(file?.name);
        setIsFileUpload(true);
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleFileExport = () => {
    const templates: ObjectKeysType = {
      [MetricsTypeEnum.Nps]: NPS_TEMPLATE,
      [MetricsTypeEnum.Csat]: CSAT_TEMPLATE,
      [MetricsTypeEnum.Ces]: CES_TEMPLATE,
    };

    const ws = XLSX.utils.json_to_sheet(templates[metricsType]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, `example-${metricsType}.xlsx`);
  };

  const onHandleNext = () => {
    onToggleImportDataPointTableModal();
  };

  return (
    <CustomModal isOpen={isOpen} handleClose={handleClose} canCloseWithOutsideClick={true}>
      <ModalHeader title={'Import data points'} />
      <div className={'import-data-point-modal'}>
        <p className={'import-data-point-modal--title'}>
          You can import your Excel or CSV files here to upload the data points to your journey.
        </p>
        <div className={'import-data-point-modal--file-upload'}>
          <FileUploader
            id={'touchpoint-name'}
            classes={`attachments--file-uploader`}
            multiple={false}
            handleChange={handleFileUpload}
            name="file"
            types={EXEL_FILE_TYPES}>
            <CustomFileUploader
              uploadProgress={0}
              content={<CustomFileUploader2 title={fileName} />}
            />
          </FileUploader>
        </div>

        <button
          data-testid="export-data-point-exel-test-id"
          className={'import-data-point-modal--file-download'}
          onClick={handleFileExport}>
          <p className={'import-data-point-modal--file-download--title'}>
            <Import /> Download import template
          </p>
        </button>
        <div className={'base-modal-footer'}>
          <CustomButton
            onClick={handleClose}
            data-testid="cansel-data-point-test-id"
            variant={'text'}
            startIcon={false}
            style={{
              textTransform: 'inherit',
            }}>
            Cancel
          </CustomButton>
          <CustomButton
            type={'submit'}
            data-testid="next-data-point-btn-test-id"
            variant={'contained'}
            startIcon={false}
            disabled={!isFileUpload}
            onClick={onHandleNext}>
            Next
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

export default ImportDataPointModal;
