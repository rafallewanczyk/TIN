import { message } from 'antd';
import axios, { AxiosError } from 'axios';

interface InterceptedAxiosError extends AxiosError {
  severMessage: string;
}

export function isAxiosError(error?: any): error is InterceptedAxiosError {
  return Boolean(
    error?.isAxiosError && Object.prototype.hasOwnProperty.call(error, 'severMessage'),
  );
}

axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError): Promise<InterceptedAxiosError> => {
    console.log('Error in interceptor', error.response);

    const interceptedError: InterceptedAxiosError = {
      ...error,
      severMessage: error?.response?.data?.error,
    };

    return Promise.reject(interceptedError);
  },
);

export const sendServerError = (error: unknown): void => {
  const errorPrefix = 'Server responded with message: ';

  if (isAxiosError(error)) {
    message.error(`${errorPrefix}${error.severMessage}`);
  } else {
    message.error(`Unexpected error occurred that is not handled by application ${error}`);
  }
};
