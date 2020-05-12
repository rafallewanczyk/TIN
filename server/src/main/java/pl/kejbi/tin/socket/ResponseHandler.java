package pl.kejbi.tin.socket;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import pl.kejbi.tin.service.LightDeviceService;
import pl.kejbi.tin.service.TemperatureDeviceService;
import pl.kejbi.tin.socket.parser.MessageParser;

import java.nio.ByteBuffer;

@Component
@RequiredArgsConstructor
public class ResponseHandler {

    private final TemperatureDeviceService temperatureDeviceService;
    private final LightDeviceService lightDeviceService;
    private Logger logger = LoggerFactory.getLogger(ResponseHandler.class);

    public void handleResponse(byte[] response) {
        switch (MessageParser.parseMessage(response)) {
            case OK:
                logger.info("Response OK");
                break;
            case CURR_DATA_RE:
                switch (ByteBuffer.wrap(response).getInt(12)) {
                    case 1:
                        var logs = temperatureDeviceService.saveLog(response);
                        logger.info("Successfully converted temperature data");
                        logger.info(logs.toString());
                        break;
                    case 2:
                        var lightDeviceLogs = lightDeviceService.saveLog(response);
                        logger.info("Successfully converted light data");
                        logger.info(lightDeviceLogs.toString());
                        break;
                    default:
                        logger.error("Bad device type");
                }
                break;
            case ERROR_CONFIG:
                logger.error("Error Config");
                break;
            case ERROR_PARAMS:
                logger.error("Error Params");
                break;
            default:
                logger.error("No message type matching");
        }
    }
}
