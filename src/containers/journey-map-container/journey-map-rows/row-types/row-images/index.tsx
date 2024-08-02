import React, { FC } from 'react';

import './style.scss';

import CustomLoader from '@/components/atoms/custom-loader/custom-loader';
import ErrorBoundary from '@/components/templates/error-boundary';
import RowImagesItem from '@/containers/journey-map-container/journey-map-rows/row-types/row-images/row-images-item';
import { JourneyMapRowType } from '@/utils/ts/types/journey-map/journey-map-types';

interface IRowImages {
  row: JourneyMapRowType;
  disabled: boolean;
}

const RowImages: FC<IRowImages> = ({ row, disabled }) => {
  return (
    <div className={'row-images'} data-testid={`row-images-${row.id}-test-id`}>
      {row?.boxes?.map((rowItem, index) => (
        <React.Fragment key={rowItem.id + '_' + index}>
          {rowItem.isLoading ? (
            <div className={'journey-map-row--loading'} data-testid="image-row-loading-test-id">
              <CustomLoader />
            </div>
          ) : (
            <ErrorBoundary>
              <RowImagesItem rowItem={rowItem} index={index} rowId={row?.id} disabled={disabled} />
            </ErrorBoundary>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default RowImages;
