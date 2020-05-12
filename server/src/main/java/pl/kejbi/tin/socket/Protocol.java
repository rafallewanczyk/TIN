package pl.kejbi.tin.socket;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

public interface Protocol {
    int DEVICE_ID = 10001;
    int PROTOCOL_VERSION = 1;
    int HEADER_SIZE = 12;

    static byte[] messageWithHeader(byte[] dataByteArray) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        byteStream.write(ByteBuffer.allocate(4).putInt(PROTOCOL_VERSION).array());
        byteStream.write(ByteBuffer.allocate(4).putInt(dataByteArray.length + HEADER_SIZE).array());
        byteStream.write(ByteBuffer.allocate(4).putInt(DEVICE_ID).array());
        byteStream.write(dataByteArray);

        return byteStream.toByteArray();
    }
}
