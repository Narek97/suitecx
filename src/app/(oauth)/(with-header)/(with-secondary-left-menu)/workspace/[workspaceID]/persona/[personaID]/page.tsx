import PersonaContainer from '@/containers/perona-container';
import type { Metadata } from 'next';
import React from 'react';

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
