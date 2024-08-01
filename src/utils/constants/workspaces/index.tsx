import { ReactNode } from 'react';

import JourneyIcon from '@/public/workspace/journey.svg';
import PersonaIcon from '@/public/workspace/persona.svg';

export const WORKSPACE_ANALYTICS_ITEMS = (
  onHandleClick: (type: string) => void,
): Array<{
  name: string;
  key: 'journeyMapCount' | 'personasCount';
  icon: ReactNode;
  onClick: () => void;
}> => [
  {
    key: 'journeyMapCount',
    name: 'Journeys',
    icon: <JourneyIcon />,
    onClick: () => onHandleClick('Journeys'),
  },
  {
    key: 'personasCount',
    name: 'Personas',
    icon: <PersonaIcon />,
    onClick: () => onHandleClick('Personas'),
  },
];
