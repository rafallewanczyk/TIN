package pl.kejbi.tin.socket;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

public interface Protocol {
    int DEVICE_ID = 10001;
    int PROTOCOL_VERSION = 1;
    int HEADER_SIZE = 12;

    static byte[] messageWithHeader(byte[] dataByteArray) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(PROTOCOL_VERSION);
        byteStream.write(dataByteArray.length + HEADER_SIZE);
        byteStream.write(DEVICE_ID);
        byteStream.write(dataByteArray);

        return byteStream.toByteArray();
    }
}
