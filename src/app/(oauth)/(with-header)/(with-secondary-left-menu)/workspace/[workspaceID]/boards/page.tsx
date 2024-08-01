import React from 'react';

import type { Metadata } from 'next';

import BoardsContainer from '@/containers/boards-container';

export const metadata: Metadata = {
  title: 'Boards',
};

const Page = () => {
  return (
    <>
      <BoardsContainer />
    </>
  );
};

export default Page;
