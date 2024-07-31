import React, { FC, useRef } from 'react';
import './custom-table.scss';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import fromNow from 'dayjs/plugin/relativeTime';
import { MenuOptionsType, TableColumnType } from '@/utils/ts/types/global-types';
import { OrderByEnum } from '@/gql/types';
import SortIcon from '@/public/base-icons/sort.svg';

interface ICustomTable {
  type?: string;
  isTableHead?: boolean;
  stickyHeader?: boolean;
  columns: Array<TableColumnType> | [];
  rows: Array<any> | [];
  align?: 'right' | 'left' | 'center';
  onClickRow?: (data: any) => void;
  onHandleFetch?: () => void;
  dashedStyle?: boolean;
  options?: Array<MenuOptionsType>;
  sortAscDescByField?: (sortType: OrderByEnum, fieldName: string, id: any) => void;
  processingItemId?: number | null;
  permissionCheckKey?: string;
}

const CustomTable: FC<ICustomTable> = ({
  isTableHead = true,
  stickyHeader = true,
  columns,
  rows,
  align = 'left',
  onClickRow,
  onHandleFetch,
  dashedStyle = true,
  sortAscDescByField,
  options = [],
  processingItemId = null,
  permissionCheckKey,
}) => {
  dayjs.extend(fromNow);
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLTableElement>(null);

  const onHandleScroll = () => {
    if (
      parentRef.current &&
      childRef.current &&
      parentRef?.current.offsetHeight + parentRef.current.scrollTop + 100 >=
        childRef.current.offsetHeight
    ) {
      onHandleFetch && onHandleFetch();
    }
  };

  const getStyle = (column: TableColumnType, value: number | string) => {
    let className = '';
    switch (column.id) {
      case 'payloadSize': {
        if (+value <= 1) {
          className = 'green-size';
        }
        if (+value > 1 && +value <= 10) {
          className = 'yellow-size';
        }
        if (+value > 10) {
          className = 'red-size';
        }
        break;
      }
      default: {
        break;
      }
    }
    return className;
  };

  return (
    <div
      className={`custom-table ${dashedStyle ? 'dashed-style' : ''}`}
      onScroll={onHandleFetch && onHandleScroll}
      ref={parentRef}>
      <Table
        data-testid={'table-test-id'}
        stickyHeader={stickyHeader}
        aria-label="sticky table"
        ref={childRef}>
        {isTableHead ? (
          <TableHead>
            <TableRow>
              {columns.map(column => (
                <TableCell key={column.id} align={column.align || align}>
                  <div className={'custom-table--header-head'}>
                    <div
                      onClick={() => column.onClick && column.onClick()}
                      className={'custom-table--header-item'}
                      data-testid={'table-header-item-test-id'}>
                      {column.label}
                    </div>
                    {column?.isAscDescSortable && sortAscDescByField && (
                      <div className={'custom-table--header-item-sort'}>
                        <button
                          aria-label={'asc'}
                          data-testid={'asc-sort-id'}
                          className={'asc-button'}
                          onClick={() =>
                            sortAscDescByField(
                              OrderByEnum.Asc,
                              column?.sortFieldName as string,
                              column.id as string,
                            )
                          }>
                          <div className={'asc-button--content'}>
                            <SortIcon fill={'#fff'} />
                          </div>
                        </button>
                        <button
                          aria-label={'desc'}
                          data-testid={'desc-sort-id'}
                          className={'desc-button'}
                          onClick={() =>
                            sortAscDescByField(
                              OrderByEnum.Desc,
                              column?.sortFieldName as string,
                              column.id as string,
                            )
                          }>
                          <div className={'desc-button--content'}>
                            <SortIcon fill={'#fff'} />
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
        ) : null}
        <TableBody>
          {rows.map(row => (
            <TableRow
              hover
              onClick={() => {
                onClickRow && onClickRow(row);
              }}
              data-testid={`table-row-test-id`}
              className={`cursor-pointer ${processingItemId === row?.id ? 'processing-item' : ''}`}
              role="checkbox"
              sx={{
                height: '40px',
              }}
              key={row.id}>
              {columns.map(column => {
                const value = row[column.id];
                return (
                  <TableCell
                    className={'custom-table--td'}
                    key={column.id}
                    align={column.align || align}
                    sx={{
                      backgroundColor: '#ffffff',
                      padding: column.id === 'operation' ? '0px' : '0 16px',
                      fontSize: 12,
                      borderBottom: '4px solid #f2f2f4',
                      color: '#545e6b',
                      ...column.style,
                    }}>
                    {column.id === 'operation' &&
                    (!permissionCheckKey || row[permissionCheckKey]) ? (
                      <div className={'operations'}>
                        {options?.map(itm => (
                          <button
                            data-testid={`table-${itm.name?.toLowerCase()}-item-test-id`}
                            key={itm.name}
                            onClick={() => itm.onClick && itm.onClick(row)}
                            className={'operations-item'}>
                            {itm?.icon}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className={`custom-table--${column.id} ${getStyle(column, value)}`}>
                        {column?.renderFunction
                          ? column.renderFunction(row)
                          : column.label === 'created date' || column.label === 'updated date'
                            ? dayjs(value).format('DD-MM-YYYY')
                            : value}
                      </span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomTable;
