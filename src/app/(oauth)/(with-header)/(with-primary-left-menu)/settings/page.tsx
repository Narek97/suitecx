import React from 'react';

import type { Metadata } from 'next';

import './style.scss';
import SettingsContainer from '@/containers/settings-container';

export const metadata: Metadata = {
  title: 'Settings',
};

const Page = () => {
  return (
    <div className={'settings'}>
      <div className="base-page-header" data-testid="settings-title-test-id">
        <h3 className={'base-title'}>My workspace settings</h3>
      </div>
      <div className={'settings--main'}>
        <SettingsContainer />
      </div>
    </div>
  );
};

export default Page;
