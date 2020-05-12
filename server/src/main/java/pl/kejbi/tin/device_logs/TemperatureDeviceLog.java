package pl.kejbi.tin.device_logs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class TemperatureDeviceLog {
    private int id;
    private Double param;
    private LocalDateTime timestamp;
}
