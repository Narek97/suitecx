import React, { FC, memo } from 'react';

import './style.scss';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IDivider {
  row: JourneyMapRowType;
}

const Divider: FC<IDivider> = memo(({ row }) => {
  return (
    <div className={'divider'} data-testid="divider-section-test-id">
      {row.boxes?.map((rowItem, index) => (
        <React.Fragment key={index}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'}>
              <CustomLoader />
            </div>
          ) : (
            <div
              className={'divider--item'}
              data-testid={`divider-item-${index}-test-id`}
              style={{
                width: `${index === row.boxes!.length - 1 ? '280px' : '282px'}`,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

export default Divider;
