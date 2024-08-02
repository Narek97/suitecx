import React, { ComponentClass } from 'react';

import './style.scss';

import { useParams } from 'next/navigation';
import {
  SortableContainer,
  SortableContainerProps,
  SortableElement,
  SortableElementProps,
} from 'react-sortable-hoc';

import ErrorBoundary from '@/components/templates/error-boundary';
import JourneyCard from '@/containers/journies-conatiner/sortable-journeys/journey-card';
import { JourneyViewTypeEnum } from '@/utils/ts/enums/global-enums';
import { JourneyMapCardType } from '@/utils/ts/types/journey-map/journey-map-types';

interface ISortableJourneyMapComponentProps extends SortableElementProps {
  map: JourneyMapCardType;
  onHandleDelete: (data: JourneyMapCardType) => void;
  onHandleCopy: (data: JourneyMapCardType) => void;
}

const SortableJourneyMapComponent = SortableElement<{
  map: JourneyMapCardType;
  onHandleDelete: (data: JourneyMapCardType) => void;
  onHandleCopy: (data: JourneyMapCardType) => void;
}>(({ map, onHandleDelete, onHandleCopy }: ISortableJourneyMapComponentProps) => {
  const { boardID } = useParams();
  return (
    <li data-testid="journey-item-test-id" key={map.id}>
      <ErrorBoundary>
        <JourneyCard
          key={map.id}
          map={map}
          viewType={JourneyViewTypeEnum.STANDARD}
          boardID={+boardID!}
          onHandleDelete={onHandleDelete}
          onHandleCopy={onHandleCopy}
        />
      </ErrorBoundary>
    </li>
  );
});

interface SortableComponentProps extends SortableContainerProps {
  items: JourneyMapCardType[];
  onHandleDelete: (data: JourneyMapCardType) => void;
  onHandleCopy: (data: JourneyMapCardType) => void;
}

const SortableJourneys: ComponentClass<SortableComponentProps & SortableContainerProps> =
  SortableContainer<SortableComponentProps>(
    ({ items, onHandleDelete, onHandleCopy }: SortableComponentProps) => (
      <ul className={'journeys-list'}>
        {items.map((map, index) => (
          <SortableJourneyMapComponent
            key={`item-${map?.id}`}
            index={index}
            map={map}
            onHandleCopy={onHandleCopy}
            onHandleDelete={onHandleDelete}
          />
        ))}
      </ul>
    ),
  );

export default SortableJourneys;
