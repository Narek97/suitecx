import React from 'react';

import type { Metadata } from 'next';

import OutcomeContainer from '@/containers/outcome-conatiner';

export const metadata: Metadata = {
  title: 'Outcome',
};

const Page = () => {
  return (
    <>
      <OutcomeContainer />
    </>
  );
};

export default Page;
