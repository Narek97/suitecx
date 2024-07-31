import type { Metadata } from 'next';
import React from 'react';
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
