'use client';
import React from 'react';
import { useEffect } from 'react';

export default function ErrorPage({ error }: { error: Error }) {
  useEffect(() => {
    console.error(`${error}`);
  }, [error]);
  return <div>Error {error.name} header</div>;
}
