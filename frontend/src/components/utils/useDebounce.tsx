import { useEffect, useState } from 'react';

export const useDebounce: (
  handler: (value?: number) => void,
  timeout: number,
) => [(value?: number) => void, boolean] = (handler, timeout) => {
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);
  const [isTimeoutOn, setIsTimeoutOn] = useState(false);
  const handleChange = (value: number | undefined) => {
    setIsTimeoutOn(true);
    setTimeoutId(
      window.setTimeout(() => {
        handler(value);
        setIsTimeoutOn(false);
      }, timeout),
    );
  };

  useEffect(
    () => () => {
      window.clearTimeout(timeoutId);
    },
    [timeoutId],
  );

  return [handleChange, isTimeoutOn];
};
