package pl.kejbi.tin.service;

import org.springframework.stereotype.Service;
import pl.kejbi.tin.device_logs.TemperatureDeviceLog;
import pl.kejbi.tin.device_logs.converter.TemperatureDeviceLogConverter;

import java.util.List;

@Service
public class TemperatureDeviceService {

    public List<TemperatureDeviceLog> saveLog(byte[] data) {
        var logs = TemperatureDeviceLogConverter.convertToLogs(data);
        //save to DB
        return logs;
    }
}
