import React from 'react';

import type { Metadata } from 'next';

import PersonasContainer from '@/containers/personas-container';

export const metadata: Metadata = {
  title: 'Personas',
};

const Page = () => {
  return (
    <>
      <PersonasContainer />
    </>
  );
};

export default Page;
