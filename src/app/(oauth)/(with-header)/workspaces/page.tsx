import React from 'react';
import './style.scss';
import WorkspacesContainer from '@/containers/workspaces-container';

const Page = () => {
  return (
    <section>
      <div className={'workspaces'}>
        <div className={'base-page-header'}>
          <h3 className={'base-title'} data-testid="workspace-title-test-id">
            My Workspaces
          </h3>
        </div>
        <WorkspacesContainer />
      </div>
    </section>
  );
};

export default Page;
