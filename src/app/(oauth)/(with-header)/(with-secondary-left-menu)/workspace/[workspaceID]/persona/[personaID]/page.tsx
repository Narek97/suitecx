import React from 'react';

import type { Metadata } from 'next';

import PersonaContainer from '@/containers/perona-container';

export const metadata: Metadata = {
  title: 'Persona',
};

const Page = () => {
  return (
    <>
      <PersonaContainer />
    </>
  );
};

export default Page;
