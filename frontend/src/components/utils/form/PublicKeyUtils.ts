import { UploadFile } from 'antd/es/upload/interface';
import { UploadChangeParam } from 'antd/es/upload';

const PUBLIC_KEY_ALGORITHM_NAME = 'RSA-OAEP';
const PUBLIC_KEY_HASH = 'SHA-256';
const KEY_FORMAT = 'spki';
const PUBLIC_KEY_ALGORITHM_PARAMS: RsaHashedImportParams = {
  name: PUBLIC_KEY_ALGORITHM_NAME,
  hash: PUBLIC_KEY_HASH,
};

function ab2str(buf: any) {
  // @ts-ignore
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str: any) {
  const buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}

export const publicKeyValidator = async (
  _: unknown,
  value: UploadFile<any>[] | undefined,
): Promise<void> => {
  if (!value || value.length === 0) return;

  const file = value[0];
  const arrayBuffer = await file.originFileObj?.arrayBuffer();

  // eslint-disable-next-line no-throw-literal
  if (!arrayBuffer) throw 'There was a problem with parsing the file';

  console.log('ArrayBuffer', arrayBuffer);

  try {
    const x = str2ab(atob(ab2str(arrayBuffer)));
    console.log('X', x);
    await window.crypto.subtle.importKey(KEY_FORMAT, x, PUBLIC_KEY_ALGORITHM_PARAMS, true, [
      'encrypt',
    ]);

    return;
  } catch (e) {
    console.log(`base64 ${e.message}`);
  }

  try {
    await window.crypto.subtle.importKey(
      KEY_FORMAT,
      arrayBuffer,
      PUBLIC_KEY_ALGORITHM_PARAMS,
      true,
      ['encrypt'],
    );
  } catch (e) {
    console.log('E', e);

    // eslint-disable-next-line no-throw-literal
    throw `Key you have uploaded was invalid: ${e.message}`;
  }
};

export const normFile: (e: UploadChangeParam<UploadFile<any>>) => UploadFile<any>[] | undefined = (
  e,
) =>
  // console.log('E', e);

  e?.fileList;

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
  console.log(arrayBuffer?.byteLength);

  if (!arrayBuffer) return '';

  return arrayBufferToBase64(arrayBuffer);
}
