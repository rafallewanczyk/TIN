import React, { ReactElement } from 'react';
import { AppLayout, HelloWorldProps } from '../AppLayout';

export const buildHelloWorld = (props?: Partial<HelloWorldProps>): ReactElement => (
  <AppLayout what="test what" {...props} />
);
