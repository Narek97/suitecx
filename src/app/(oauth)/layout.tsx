import React, { FC } from 'react';

interface IOauthLayout {
  children: React.ReactNode;
}
const OauthLayout: FC<IOauthLayout> = ({ children }) => {
  return <>{children}</>;
};

export default OauthLayout;
