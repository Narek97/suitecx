import React, { FC, useEffect, useState } from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom-date-picker.scss';

interface ICustomDatePicker {
  isInline?: boolean;
  defaultDate?: Date | null;
  defaultMinDate?: any;
  onHandleChangeDate: (date: Date) => void;
}

const CustomDatePicker: FC<ICustomDatePicker> = ({
  isInline = true,
  defaultDate = null,
  defaultMinDate = null,
  onHandleChangeDate,
}) => {
  const [startDate, setStartDate] = useState(defaultDate);
  const [minDate, setMinDate] = useState(defaultMinDate);

  const onChange = (date: React.SetStateAction<Date | null>) => {
    setStartDate(date);
    onHandleChangeDate(date as Date);
  };

  useEffect(() => {
    setMinDate(defaultMinDate);
  }, [defaultMinDate]);

  return (
    <div className={'custom-date-picker'}>
      <DatePicker
        selected={startDate}
        // startDate={startDate}
        minDate={minDate}
        inline={isInline}
        onChange={onChange}
        showMonthDropdown
        showYearDropdown
        popperProps={{
          strategy: 'fixed',
        }}
      />
    </div>
  );
};

export default CustomDatePicker;
