import { UploadFile } from 'antd/es/upload/interface';
import { UploadChangeParam } from 'antd/es/upload';

const PUBLIC_KEY_ALGORITHM_NAME = 'RSA-OAEP';
const PUBLIC_KEY_HASH = 'SHA-256';
const PUBLIC_KEY_ALGORITHM_PARAMS: RsaHashedImportParams = {
  name: PUBLIC_KEY_ALGORITHM_NAME,
  hash: PUBLIC_KEY_HASH,
};

export const publicKeyValidator = async (
  _: unknown,
  value: UploadFile<any>[] | undefined,
): Promise<void> => {
  if (!value || value.length === 0) return;

  const file = value[0];
  const arrayBuffer = await file.originFileObj?.arrayBuffer();

  // eslint-disable-next-line no-throw-literal
  if (!arrayBuffer) throw 'There was a problem with parsing the file';

  try {
    await window.crypto.subtle.importKey('spki', arrayBuffer, PUBLIC_KEY_ALGORITHM_PARAMS, true, [
      'encrypt',
    ]);
  } catch (e) {
    // eslint-disable-next-line no-throw-literal
    throw `Key you have uploaded was invalid: ${e.message}`;
  }
};

export const normFile: (e: UploadChangeParam<UploadFile<any>>) => UploadFile<any>[] | undefined = (
  e,
) => {
  console.log('E', e);

  return e?.fileList;
};
