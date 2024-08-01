import React from 'react';

import type { Metadata } from 'next';

import JourniesContainer from '@/containers/journies-conatiner';

export const metadata: Metadata = {
  title: 'Journies',
};

const Page = () => {
  return (
    <>
      <JourniesContainer />
    </>
  );
};

export default Page;
