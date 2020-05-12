package pl.kejbi.tin.device_logs;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class LightDeviceLog {
    private int id;
    private Boolean turnedOn;
    private LocalDateTime timestamp;
}
