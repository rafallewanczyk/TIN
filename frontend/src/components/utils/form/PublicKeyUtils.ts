import { UploadFile } from 'antd/es/upload/interface';
import { UploadChangeParam } from 'antd/es/upload';

const PUBLIC_KEY_ALGORITHM_NAME = 'RSA-OAEP';
const PUBLIC_KEY_HASH = 'SHA-256';
const KEY_FORMAT = 'spki';
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
    await window.crypto.subtle.importKey(
      KEY_FORMAT,
      arrayBuffer,
      PUBLIC_KEY_ALGORITHM_PARAMS,
      true,
      ['encrypt'],
    );
  } catch (e) {
    // eslint-disable-next-line no-throw-literal
    throw `Key you have uploaded was invalid: ${e.message}`;
  }
};

export const normFile: (e: UploadChangeParam) => UploadFile[] | undefined = (e) => e?.fileList;

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  return window.btoa(binary);
}

export async function encodeInBase64(publicKeyArray: UploadFile[]) {
  const publicKey = publicKeyArray[0];
  const arrayBuffer = await publicKey.originFileObj?.arrayBuffer();

  if (!arrayBuffer) return '';

  return arrayBufferToBase64(arrayBuffer);
}
