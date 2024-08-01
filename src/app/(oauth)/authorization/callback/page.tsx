import React from 'react';

import AuthContainer from '@/containers/auth-container';

const Page = ({ searchParams }: { searchParams: { code: string } }) => (
  <AuthContainer code={searchParams.code} />
);

export default Page;
