import React from 'react';

import type { Metadata } from 'next';

import JourneyMapContainer from '@/containers/journey-map-container';

export const metadata: Metadata = {
  title: 'Journey map',
};

const Page = () => {
  return (
    <>
      <JourneyMapContainer />
    </>
  );
};

export default Page;
