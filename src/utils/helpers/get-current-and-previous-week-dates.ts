export interface WeekData {
  current: {
    start: Date;
    end: Date;
    startMonth: Date;
    endMonth: Date;
    startYear: Date;
    endYear: Date;
  };
  previous: {
    start: Date;
    end: Date;
    startMonth: Date;
    endMonth: Date;
    startYear: Date;
    endYear: Date;
  };
}

export const getCurrentAndPreviousWeekDates = (currentDate: Date = new Date()): WeekData => {
  // Calculate the number of the current day (0 for Sunday, 1 for Monday, ..., 6 for Saturday)

  // Calculate the difference between the current day and the first day of the week (Assuming Sunday as the first day)
  const firstDayOfWeekDiff: number = currentDate.getDay(); // Change 0 if your week starts on a different day

  // Calculate the date of the first day of the current week
  const firstDayOfWeek: Date = new Date(currentDate);
  firstDayOfWeek.setDate(currentDate.getDate() - firstDayOfWeekDiff);

  // Calculate the date of the last day of the current week
  const lastDayOfWeek: Date = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);

  // Calculate the date of the first day of the current month
  const startMonth: Date = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  // Calculate the date of the last day of the current month
  const endMonth: Date = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  // Calculate the date of the first day of the current year
  const startYear: Date = new Date(currentDate.getFullYear(), 0, 1);

  // Calculate the date of the last day of the current year
  const endYear: Date = new Date(currentDate.getFullYear(), 11, 31);

  // Calculate the date of the first day of the previous week
  const firstDayOfPreviousWeek: Date = new Date(firstDayOfWeek);
  firstDayOfPreviousWeek.setDate(firstDayOfWeek.getDate() - 7);

  // Calculate the date of the last day of the previous week
  const lastDayOfPreviousWeek: Date = new Date(lastDayOfWeek);
  lastDayOfPreviousWeek.setDate(lastDayOfWeek.getDate() - 7);

  // Return the start and end dates of the current and previous weeks,
  // months, and years
  return {
    current: {
      start: firstDayOfWeek,
      end: lastDayOfWeek,
      startMonth: startMonth,
      endMonth: endMonth,
      startYear: startYear,
      endYear: endYear,
    },
    previous: {
      start: firstDayOfPreviousWeek,
      end: lastDayOfPreviousWeek,
      startMonth: new Date(startMonth.getFullYear(), startMonth.getMonth() - 1, 1),
      endMonth: new Date(endMonth.getFullYear(), endMonth.getMonth() - 1, 0),
      startYear: new Date(startYear.getFullYear() - 1, 0, 1),
      endYear: new Date(endYear.getFullYear() - 1, 11, 31),
    },
  };
};
