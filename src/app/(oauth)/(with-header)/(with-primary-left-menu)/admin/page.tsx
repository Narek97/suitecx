import React from 'react';
import './style.scss';
import AdminContainer from '@/containers/admin-container';

const Admin = () => {
  return (
    <div className={'admin'}>
      <div className={'base-page-header'}>
        <h3 className={'base-title'}>Admin</h3>
      </div>
      <div className={'admin--main'}>
        <AdminContainer />
      </div>
    </div>
  );
};

export default Admin;
