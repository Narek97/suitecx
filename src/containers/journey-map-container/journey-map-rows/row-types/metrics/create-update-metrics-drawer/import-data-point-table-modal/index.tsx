import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';

import './style.scss';

import { useSetRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import CustomButton from '@/components/atoms/custom-button/custom-button';
import CustomModal from '@/components/atoms/custom-modal/custom-modal';
import CustomTable from '@/components/atoms/custom-table/custom-table';
import ModalHeader from '@/components/templates/modal-header';
import { MetricsTypeEnum } from '@/gql/types';
import { snackbarState } from '@/store/atoms/snackbar.atom';
import { METRICS_DATA_POINT_EXEL_OPTIONS } from '@/utils/constants/options';
import {
  METRIC_CES_DATA_POINT_EXEL_TABLE_COLUMNS,
  METRIC_CSAT_DATA_POINT_EXEL_TABLE_COLUMNS,
  METRIC_NPS_DATA_POINT_EXEL_TABLE_COLUMNS,
} from '@/utils/constants/table';
import { isValidNumberFormat } from '@/utils/helpers/general';
import {
  ObjectKeysType,
  TableColumnType,
  TableRowItemChangeType,
} from '@/utils/ts/types/global-types';
import { DatapointType } from '@/utils/ts/types/metrics/metrics-type';

interface IImportDataPointTableModal {
  metricsType: MetricsTypeEnum;
  isOpen: boolean;
  datapointFile: Array<ObjectKeysType>;
  onHandleAddDataPont: (data: Array<DatapointType>) => void;
  handleClose: () => void;
}

const ImportDataPointTableModal: FC<IImportDataPointTableModal> = ({
  metricsType,
  isOpen,
  datapointFile,
  onHandleAddDataPont,
  handleClose,
}) => {
  const setSnackbar = useSetRecoilState(snackbarState);

  const [rows, setRows] = useState<Array<DatapointType>>([]);

  const lowercaseKeys = (obj: ObjectKeysType) => {
    const newObj: ObjectKeysType = {};
    for (const key in obj) {
      newObj[key.toLowerCase()] = obj[key];
    }
    return newObj;
  };

  const getTableRowByType = useCallback(
    (obj: ObjectKeysType) => {
      switch (metricsType) {
        case MetricsTypeEnum.Nps: {
          return {
            id: uuidv4(),
            date: obj.date,
            detractor: isValidNumberFormat(obj.detractor) ? obj.detractor : null,
            passive: isValidNumberFormat(obj.passive) ? obj.passive : null,
            promoter: isValidNumberFormat(obj.promoter) ? obj.promoter : null,
          };
        }
        case MetricsTypeEnum.Csat: {
          return {
            id: uuidv4(),
            date: obj.date,
            satisfied: isValidNumberFormat(obj.satisfied) ? obj.satisfied : null,
            neutral: isValidNumberFormat(obj.neutral) ? obj.neutral : null,
            dissatisfied: isValidNumberFormat(obj.dissatisfied) ? obj.dissatisfied : null,
          };
        }
        case MetricsTypeEnum.Ces: {
          return {
            id: uuidv4(),
            date: obj.date,
            easy: isValidNumberFormat(obj.easy) ? obj.easy : null,
            neutral: isValidNumberFormat(obj.neutral) ? obj.neutral : null,
            difficult: isValidNumberFormat(obj.difficult) ? obj.difficult : null,
          };
        }
      }
    },
    [metricsType],
  );

  const onHandleSaveDataPoint = () => {
    let isError = false;
    rows.forEach(object => {
      for (let key in object) {
        if (key !== 'id') {
          // @ts-ignore
          if (key.toLowerCase() === 'date' && typeof object[key] !== 'string') {
            isError = true;
          }
          // @ts-ignore
          if (key.toLowerCase() !== 'date' && typeof object[key] !== 'number') {
            isError = true;
          }
        }
      }
    });

    if (isError) {
      setSnackbar(prev => ({
        ...prev,
        message: 'You need to fill in all the cells',
        open: true,
      }));
    } else {
      onHandleAddDataPont(rows);
      handleClose();
    }
  };

  const onHandleRowChange = useCallback((item: TableRowItemChangeType) => {
    setRows(prev =>
      prev.map(r => {
        if (r.id === item.id) {
          return { ...r, [item.key]: item.value };
        }
        return r;
      }),
    );
  }, []);

  const onHandleDelete = useCallback(
    (item: { id: string | number }) => {
      if (rows.length === 1) {
        handleClose();
      }
      setRows(prev => prev.filter(r => r.id !== item.id));
    },
    [handleClose, rows.length],
  );

  const options = useMemo(() => {
    return METRICS_DATA_POINT_EXEL_OPTIONS({
      onHandleDelete,
    });
  }, [onHandleDelete]);

  const columns: {
    [key: string]: Array<TableColumnType>;
  } = useMemo(() => {
    return {
      [MetricsTypeEnum.Nps]: METRIC_NPS_DATA_POINT_EXEL_TABLE_COLUMNS({ onHandleRowChange }),
      [MetricsTypeEnum.Csat]: METRIC_CSAT_DATA_POINT_EXEL_TABLE_COLUMNS({ onHandleRowChange }),
      [MetricsTypeEnum.Ces]: METRIC_CES_DATA_POINT_EXEL_TABLE_COLUMNS({ onHandleRowChange }),
    };
  }, [onHandleRowChange]);

  useEffect(() => {
    const transformedData = datapointFile
      .map(obj => lowercaseKeys(obj))
      .map(obj => getTableRowByType(obj));
    setRows(transformedData as Array<DatapointType>);
  }, [datapointFile, getTableRowByType]);

  return (
    <CustomModal
      isOpen={isOpen}
      handleClose={handleClose}
      canCloseWithOutsideClick={true}
      modalSize={'lg'}>
      <ModalHeader title={'Map data points'} />
      <div className={'import-data-point-table-modal'}>
        <p className={'import-data-point-table-modal--title'}>
          Remap your data before importing it into your new metric
        </p>
        <div className={'import-data-point-table-modal--table-block'}>
          <CustomTable columns={columns[metricsType]} rows={rows} options={options} />
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
            data-testid="submit-outcome-test-id"
            variant={'contained'}
            startIcon={false}
            onClick={onHandleSaveDataPoint}>
            Save
          </CustomButton>
        </div>
      </div>
    </CustomModal>
  );
};

export default ImportDataPointTableModal;
