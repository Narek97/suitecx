export const generateRandomColor = () => {
  const random = Math.floor(Math.random() * 16777215).toString(16);
  return ('#0' + random.toString()).replace(/^#0([0-9a-f]{6})$/i, '#$1');
};

export const arrayMove = ({
  oldIndex,
  newIndex,
  list,
}: {
  oldIndex: number;
  newIndex: number;
  list: any[];
}) => {
  const newArray = [...list];
  if (oldIndex !== newIndex) {
    const removedElement = newArray.splice(oldIndex, 1)[0];
    newArray.splice(newIndex, 0, removedElement);
  }
  return newArray;
};

export const isValidNumberFormat = (value: any): value is number => {
  return /^-?\d*\.?\d+$/.test(value);
};

export const scrollNeighbours = (scrollLeft: number, neighbours: HTMLElement[]) => {
  neighbours.forEach(el => {
    el?.scroll({
      // top: 0,
      left: scrollLeft,
    });
  });
};

export const getMapColumnNameByType = (type: string) => {
  switch (type) {
    case 'list_item': {
      return 'List item';
    }
    default:
      return type;
  }
};
