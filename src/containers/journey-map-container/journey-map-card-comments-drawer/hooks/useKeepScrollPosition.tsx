import { useLayoutEffect, useMemo, useRef } from 'react';

import { CommentType } from '@/utils/ts/types/global-types';

const useKeepScrollPosition = (deps: CommentType[][] = []) => {
  const containerRef = useRef(null);
  const previousScrollPosition = useRef(0);

  useMemo(() => {
    if (containerRef?.current) {
      const container: HTMLElement = containerRef?.current;
      previousScrollPosition.current = container?.scrollHeight - container?.scrollTop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  useLayoutEffect(() => {
    if (containerRef?.current) {
      const container: HTMLElement = containerRef?.current;
      container.scrollTop = container?.scrollHeight - previousScrollPosition.current;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps]);

  return {
    containerRef,
  };
};

export default useKeepScrollPosition;
