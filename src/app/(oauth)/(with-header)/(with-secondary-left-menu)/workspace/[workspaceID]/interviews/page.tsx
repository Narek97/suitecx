import React from 'react';

import type { Metadata } from 'next';

import InterviewsContainer from '@/containers/interviews-container';

export const metadata: Metadata = {
  title: 'Interviews',
};

const Page = () => {
  return (
    <div className={'interviews'}>
      <InterviewsContainer />
    </div>
  );
};

export default Page;
