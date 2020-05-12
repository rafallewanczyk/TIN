package pl.kejbi.tin.service;

import org.springframework.stereotype.Service;
import pl.kejbi.tin.device_logs.LightDeviceLog;
import pl.kejbi.tin.device_logs.converter.LightDeviceLogConverter;

import java.util.List;

@Service
public class LightDeviceService {

    public List<LightDeviceLog> saveLog(byte[] data) {
        var logs = LightDeviceLogConverter.convertToLogs(data);
        // save in DB
        return logs;
    }
}
