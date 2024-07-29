import { useRef } from 'react';

const useAutoscrollAnimation = (containerRef: any) => {
  const scrollThreshold = 200;
  const actionSpeed = 20;
  const stepSize = 10;
  const intervalIDRef = useRef<any>(null);
  const intervalIDRefLeft = useRef<any>(null);
  const movement = (
    event: MouseEvent,
    element?: {
      elementInitialSideX: number;
      elementInitialSideY: number;
      width: number;
    },
    callback?: () => void,
  ) => {
    const innerWidth = element?.elementInitialSideX || 0;
    const innerHeight = element?.elementInitialSideY || 0;
    const elementWidth = element?.width || 0;
    if (event.y - innerHeight < scrollThreshold && containerRef.current.scrollTop) {
      intervalIDRef?.current && clearInterval(intervalIDRef?.current);
      intervalIDRef.current = setInterval(() => {
        containerRef.current.scrollTop -= stepSize;
      }, actionSpeed);
    } else if (window.innerHeight - event.clientY <= scrollThreshold) {
      callback && callback();
      clearInterval(intervalIDRef.current);
      intervalIDRef.current = setInterval(() => {
        containerRef.current.scrollTop += stepSize;
      }, actionSpeed);
    } else {
      clearInterval(intervalIDRef.current);
    }
    if (event?.x - (elementWidth - innerWidth) < scrollThreshold) {
      clearInterval(intervalIDRefLeft.current);
      intervalIDRefLeft.current = setInterval(() => {
        containerRef.current.scrollLeft -= stepSize;
      }, actionSpeed);
    } else if (window.innerWidth - (event?.x + innerWidth) < scrollThreshold) {
      clearInterval(intervalIDRefLeft.current);
      intervalIDRefLeft.current = setInterval(() => {
        callback && callback();
        containerRef.current.scrollLeft += stepSize;
      }, actionSpeed);
    } else {
      clearInterval(intervalIDRefLeft.current);
    }
  };

  const onStopMovement = () => {
    clearInterval(intervalIDRef.current);
    clearInterval(intervalIDRefLeft.current);
  };

  return {
    movement,
    onStopMovement,
  };
};

export default useAutoscrollAnimation;
