import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import Image from 'next/image';

import CustomDatePicker from '@/components/atoms/custom-date-picker/custom-date-picker';
import HighlightedText from '@/components/templates/hightlited-text';
import DeleteIcon from '@/public/operations/delete.svg';
import { isValidNumberFormat } from '@/utils/helpers/general';
import {
  MenuOptionsType,
  TableColumnType,
  TableRowItemChangeType,
} from '@/utils/ts/types/global-types';

dayjs.extend(fromNow);

interface ITableColumn {
  toggleDeleteModal?: () => void;
  onHandleRowChange?: (item: TableRowItemChangeType) => void;
  onHandleRowDelete?: (item: TableRowItemChangeType) => void;
  options?: Array<MenuOptionsType>;
}

const USER_TABLE_COLUMNS: Array<TableColumnType> = [
  {
    id: 'name',
    label: 'User Name',
  },
  {
    id: 'emailAddress',
    label: 'Email',
  },
  {
    id: 'lastSeen',
    label: 'Last Seen',
  },
];

const WORKSPACE_OUTCOMES_COLUMNS: Array<TableColumnType> = [
  {
    sortFieldName: 'ICON',
    id: 'icon',
    label: 'Icon',
    isAscDescSortable: false,
    renderFunction: ({ icon }) => (
      <div className={'outcome-icon'}>
        {icon && (
          <Image
            src={icon}
            alt="icon"
            width={30}
            height={30}
            style={{
              width: '30px',
              height: '30px',
            }}
          />
        )}
      </div>
    ),
  },
  {
    sortFieldName: 'NAME',
    id: 'name',
    label: 'Title',
    isAscDescSortable: true,
    renderFunction: ({ name, pluralName }) => name + ' / ' + pluralName,
  },
  {
    sortFieldName: 'CREATED_BY',
    id: 'createdBy',
    label: 'Created by',
    isAscDescSortable: true,
    renderFunction: ({ user }) => user?.firstName + ' ' + user?.lastName,
  },
  {
    sortFieldName: 'CREATED_AT',
    id: 'createdAt',
    label: 'Date Created',
    isAscDescSortable: true,
    renderFunction: ({ createdAt }) => createdAt && dayjs(createdAt)?.format('MMM DD, YYYY'),
  },
  {
    id: 'operation',
    label: ' ',
  },
];

const OUTCOME_TABLE_COLUMNS: Array<TableColumnType> = [
  {
    sortFieldName: 'TITLE',
    id: 'title',
    label: 'Title',
    isAscDescSortable: true,
  },
  {
    id: 'status',
    label: 'Status',
  },
  {
    sortFieldName: 'CREATED_BY',
    id: 'createdBy',
    label: 'Created by',
    isAscDescSortable: true,
    renderFunction: ({ user }) => user?.firstName + ' ' + user?.lastName,
  },
  {
    sortFieldName: 'CREATED_AT',
    id: 'createdAt',
    label: 'Date Created',
    isAscDescSortable: true,
    renderFunction: ({ createdAt }) => createdAt && dayjs(createdAt)?.format('MMM DD, YYYY'),
  },
  {
    id: 'mapName',
    label: 'Map Name',
    renderFunction: ({ map }) => map?.title,
  },
  {
    id: 'column',
    label: 'Stage Name',
    renderFunction: ({ column }) => {
      return column?.label;
    },
  },
  {
    id: 'operation',
    label: ' ',
  },
];

const ADMIN_ERROR_TABLE_COLUMNS = ({ toggleDeleteModal }: ITableColumn): Array<TableColumnType> => {
  return [
    {
      id: 'path',
      label: 'Path',
    },
    {
      id: 'message',
      label: 'Message',
    },
    {
      id: 'status',
      label: 'Status',
    },
    {
      id: 'DeleteTable',
      label: (
        <DeleteIcon width={18} height={18} fill={'#fff'} data-testid={'error-logs-delete-btn'} />
      ),
      onClick: toggleDeleteModal,
    },
  ];
};

const ORGS_TABLE_COLUMNS = (search: string): Array<TableColumnType> => {
  return [
    {
      id: 'orgId',
      label: 'OrgId',
      renderFunction: ({ orgId }) => <HighlightedText name={String(orgId)} search={search} />,
    },
    {
      id: 'name',
      label: 'Name',
      renderFunction: ({ name }) => <HighlightedText name={name} search={search} />,
    },
  ];
};

const ADMIN_PERFORMANCE_TABLE_COLUMNS = ({
  toggleDeleteModal,
}: ITableColumn): Array<TableColumnType> => {
  return [
    {
      id: 'path',
      label: 'Path',
      isAscDescSortable: true,
    },
    {
      id: 'createdAt',
      label: 'Date',
      renderFunction: ({ value }) => value && dayjs(value)?.format('MM-DD-YYYY'),
    },
    {
      id: 'responseTime',
      label: 'Response Time',
    },
    {
      id: 'queryCount',
      label: 'Query Count',
    },
    {
      id: 'payloadSize',
      label: 'Payload Size',
    },
    {
      id: 'DeleteTable',
      label: (
        <DeleteIcon
          width={18}
          height={18}
          fill={'#fff'}
          data-testid={'performance-logs-delete-btn'}
        />
      ),
      onClick: toggleDeleteModal,
    },
  ];
};

const ORG_USERS_TABLE: Array<TableColumnType> = [
  {
    id: 'acc_name',
    label: 'Name',
  },
  {
    id: 'acc_status',
    label: 'Status',
  },
  {
    id: 'acc_date_added',
    label: 'Date added',
    renderFunction: ({ acc_date_added }) =>
      acc_date_added && dayjs(acc_date_added)?.format('MM-DD-YYYY'),
  },
];

const ORGS_USERS_TABLE = (): Array<TableColumnType> => {
  return [
    {
      id: 'user_fname',
      label: 'Name',
    },
    {
      id: 'user_email',
      label: 'Email',
    },
    {
      id: 'user_status',
      label: 'Status',
    },
    {
      id: 'user_date_added',
      label: 'Date added',
      renderFunction: ({ user_date_added }) =>
        user_date_added && dayjs(user_date_added)?.format('MM-DD-YYYY'),
    },
  ];
};

const ORG_BOARDS: Array<TableColumnType> = [
  {
    id: 'pro_project_name',
    label: 'Name',
  },
  {
    id: 'pro_project_desc',
    label: 'Description',
  },
  {
    id: 'pro_add_date',
    label: 'Date added',
    renderFunction: ({ pro_add_date }) => pro_add_date && dayjs(pro_add_date)?.format('MM-DD-YYYY'),
  },
];

const PROJECT_MAPS_COLUMNS = (): Array<TableColumnType> => {
  return [
    {
      id: 'cs_name',
      label: 'Name',
    },
    {
      id: 'cs_added_date',
      label: 'Date added',
      renderFunction: ({ cs_added_date }) =>
        cs_added_date && dayjs(cs_added_date)?.format('MM-DD-YYYY'),
    },
  ];
};

const METRIC_NPS_DATA_POINT_EXEL_TABLE_COLUMNS = ({
  onHandleRowChange,
}: ITableColumn): Array<TableColumnType> => {
  const getCorrectInputValue = (value: unknown) => {
    return isValidNumberFormat(value) ? (+value).toString() : undefined;
  };

  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.date ? '' : '1px solid #e53251',
            }}>
            <CustomDatePicker
              isInline={false}
              defaultDate={row.date}
              onHandleChangeDate={date =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'date', value: date.toString() })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'detractor',
      label: 'Detractor',
      renderFunction: row => {
        const value = getCorrectInputValue(row.detractor);
        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              data-testid={'data-point-table-detractor-test-id'}
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'detractor', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'passive',
      label: 'Passive',
      renderFunction: row => {
        const value = getCorrectInputValue(row.passive);
        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              data-testid={'data-point-table-passive-test-id'}
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'passive', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'promoter',
      label: 'Promoter',
      renderFunction: row => {
        const value = getCorrectInputValue(row.promoter);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              data-testid={'data-point-table-promoter-test-id'}
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'promoter', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'operation',
      label: ' ',
      align: 'right',
    },
  ];
};

const METRIC_CSAT_DATA_POINT_EXEL_TABLE_COLUMNS = ({
  onHandleRowChange,
}: ITableColumn): Array<TableColumnType> => {
  const getCorrectInputValue = (value: unknown) => {
    return isValidNumberFormat(value) ? (+value).toString() : undefined;
  };

  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.date ? '' : '1px solid #e53251',
            }}>
            <CustomDatePicker
              isInline={false}
              defaultDate={row.date}
              onHandleChangeDate={date =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'date', value: date.toString() })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'satisfied',
      label: 'Satisfied',
      renderFunction: row => {
        const value = getCorrectInputValue(row.satisfied);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'satisfied', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'neutral',
      label: 'Neutral',
      renderFunction: row => {
        const value = getCorrectInputValue(row.neutral);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'neutral', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'dissatisfied',
      label: 'Dissatisfied',
      renderFunction: row => {
        const value = getCorrectInputValue(row.dissatisfied);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'dissatisfied', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'operation',
      label: ' ',
    },
  ];
};

const METRIC_CES_DATA_POINT_EXEL_TABLE_COLUMNS = ({
  onHandleRowChange,
}: ITableColumn): Array<TableColumnType> => {
  const getCorrectInputValue = (value: unknown) => {
    return isValidNumberFormat(value) ? (+value).toString() : undefined;
  };

  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.date ? '' : '1px solid #e53251',
            }}>
            <CustomDatePicker
              isInline={false}
              defaultDate={row.date}
              onHandleChangeDate={date =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'date', value: date.toString() })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'easy',
      label: 'Easy',
      renderFunction: row => {
        const value = getCorrectInputValue(row.easy);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              value={value}
              min={0}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'easy', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'neutral',
      label: 'Neutral',
      renderFunction: row => {
        const value = getCorrectInputValue(row.neutral);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'neutral', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'difficult',
      label: 'Difficult',
      renderFunction: row => {
        const value = getCorrectInputValue(row.difficult);

        return (
          <div
            style={{
              borderBottom: value ? '' : '1px solid #e53251',
            }}>
            <input
              type="number"
              min={0}
              value={value}
              onChange={e =>
                onHandleRowChange
                  ? onHandleRowChange({ id: row.id, key: 'difficult', value: +e.target.value })
                  : {}
              }
            />
          </div>
        );
      },
    },
    {
      id: 'operation',
      label: ' ',
    },
  ];
};

const METRIC_NPS_DATA_POINT_TABLE_COLUMNS = (): Array<TableColumnType> => {
  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.repeat ? '1px solid #e53251' : '',
            }}>
            {dayjs(row.date).format('MM-DD-YYYY')}
          </div>
        );
      },
    },
    {
      id: 'detractor',
      label: 'Detractor',
    },
    {
      id: 'passive',
      label: 'Passive',
    },
    {
      id: 'promoter',
      label: 'Promoter',
    },
    {
      id: 'operation',
      label: ' ',
      align: 'right',
    },
  ];
};

const METRIC_CSAT_DATA_POINT_TABLE_COLUMNS = (): Array<TableColumnType> => {
  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.repeat ? '1px solid #e53251' : '',
            }}>
            {dayjs(row.date).format('MM-DD-YYYY')}
          </div>
        );
      },
    },
    {
      id: 'satisfied',
      label: 'Satisfied',
    },
    {
      id: 'neutral',
      label: 'Neutral',
    },
    {
      id: 'dissatisfied',
      label: 'Dissatisfied',
    },
    {
      id: 'operation',
      label: ' ',
    },
  ];
};

const METRIC_CES_DATA_POINT_TABLE_COLUMNS = (): Array<TableColumnType> => {
  return [
    {
      id: 'date',
      label: 'Date',
      renderFunction: row => {
        return (
          <div
            style={{
              borderBottom: row.repeat ? '1px solid #e53251' : '',
            }}>
            {dayjs(row.date).format('MM-DD-YYYY')}
          </div>
        );
      },
    },
    {
      id: 'easy',
      label: 'Easy',
    },
    {
      id: 'neutral',
      label: 'Neutral',
    },
    {
      id: 'difficult',
      label: 'Difficult',
    },
    {
      id: 'operation',
      label: ' ',
    },
  ];
};

export {
  USER_TABLE_COLUMNS,
  OUTCOME_TABLE_COLUMNS,
  WORKSPACE_OUTCOMES_COLUMNS,
  ORG_BOARDS,
  PROJECT_MAPS_COLUMNS,
  ORGS_USERS_TABLE,
  ORG_USERS_TABLE,
  ORGS_TABLE_COLUMNS,
  ADMIN_ERROR_TABLE_COLUMNS,
  ADMIN_PERFORMANCE_TABLE_COLUMNS,
  METRIC_NPS_DATA_POINT_EXEL_TABLE_COLUMNS,
  METRIC_CSAT_DATA_POINT_EXEL_TABLE_COLUMNS,
  METRIC_CES_DATA_POINT_EXEL_TABLE_COLUMNS,
  METRIC_NPS_DATA_POINT_TABLE_COLUMNS,
  METRIC_CSAT_DATA_POINT_TABLE_COLUMNS,
  METRIC_CES_DATA_POINT_TABLE_COLUMNS,
};
