'use client';
import React, { FC } from 'react';
import { RecoilRoot } from 'recoil';
import RecoilNexus from 'recoil-nexus';

interface IRecoilProvider {
  children: React.ReactNode;
}

const RecoilProvider: FC<IRecoilProvider> = ({ children }) => {
  return (
    <RecoilRoot>
      <RecoilNexus />
      {children}
    </RecoilRoot>
  );
};

export default RecoilProvider;
