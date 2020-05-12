package pl.kejbi.tin.device_logs.converter;

import pl.kejbi.tin.device_logs.LightDeviceLog;
import pl.kejbi.tin.device_logs.TemperatureDeviceLog;
import pl.kejbi.tin.device_logs.converter.exceptions.InvalidDataException;

import java.nio.ByteBuffer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class LightDeviceLogConverter {
    private static final int OFFSET = 16;
    private static final int DATA_SIZE = 6;

    public static List<LightDeviceLog> convertToLogs(byte[] data) {
        ByteBuffer buffer = ByteBuffer.wrap(data, OFFSET, data.length - OFFSET);
        List<LightDeviceLog> logs = new ArrayList<>();
        int bytesRemaining = data.length - OFFSET;
        if(bytesRemaining % DATA_SIZE != 0) {
            throw new InvalidDataException();
        }
        while(bytesRemaining > 0) {
            int id = buffer.getInt();
            boolean param = buffer.getShort() == 1;
            bytesRemaining -= DATA_SIZE;
            logs.add(new LightDeviceLog(id, param, LocalDateTime.now()));
        }

        return logs;
    }
}
