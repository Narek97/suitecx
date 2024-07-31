import type { Metadata } from 'next';
import React from 'react';
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
