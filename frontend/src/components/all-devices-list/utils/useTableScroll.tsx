import { RefObject, useEffect, useState } from 'react';
import { TableProps as RcTableProps } from 'rc-table/lib/Table';

export const useTableScroll = (ref: RefObject<HTMLDivElement> | undefined, maxWidth: number) => {
  const [tableScroll, setTableScroll] = useState<RcTableProps<unknown>['scroll']>(undefined);

  useEffect(() => {
    if (!ref?.current) return;

    setTableScroll(
      ref.current?.getBoundingClientRect().width < maxWidth ? { x: '900' } : undefined,
    );
  }, [maxWidth, ref]);

  return tableScroll;
};
