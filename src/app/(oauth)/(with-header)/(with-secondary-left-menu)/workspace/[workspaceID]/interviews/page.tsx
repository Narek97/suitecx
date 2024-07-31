import type { Metadata } from 'next';
import React from 'react';
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
