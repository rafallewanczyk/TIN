import { useEffect, useState } from 'react';

export const useDebounce = (handler: (value: number | undefined) => void, timeout: number) => {
  const [timeoutId, setTimeoutId] = useState<number | undefined>(undefined);
  const handleChange = (value: number | undefined) => {
    setTimeoutId(window.setTimeout(() => handler(value), timeout));
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return handleChange;
};
