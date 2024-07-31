import PersonasContainer from '@/containers/personas-container';
import type { Metadata } from 'next';
import React from 'react';

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
