package pl.kejbi.tin.socket;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import pl.kejbi.tin.service.DeviceService;
import pl.kejbi.tin.socket.exceptions.IncorrectMessageTypeException;
import pl.kejbi.tin.socket.exceptions.NoConnectionException;
import pl.kejbi.tin.socket.exceptions.NoSuchDeviceException;
import pl.kejbi.tin.socket.parser.MessageParser;

import java.nio.ByteBuffer;

@Component
@RequiredArgsConstructor
public class ResponseHandler {

    private final DeviceService deviceService;
    private Logger logger = LoggerFactory.getLogger(ResponseHandler.class);

    public void handleResponse(byte[] response) {
        switch (MessageParser.parseMessage(response)) {
            case CURRENT_DATA_RES:
                switch (ByteBuffer.wrap(response).getShort(16)) {
                    case 0:
                        deviceService.updateTemperatureCurrData(response);
                        logger.info("Successfully converted temperature data");
                        break;
                    case 1:
                        deviceService.updateLightCurrData(response);
                        logger.info("Successfully converted light data");
                        break;
                    default:
                        logger.error("Bad device type");
                }
                break;
            case CHANGE_PARAMS_RE:
                switch (ByteBuffer.wrap(response).getShort(16)) {
                    case 0:
                        logger.info("CHANGE PARAMS succeed");
                        break;
                    case 1:
                        logger.error("No device found");
                        throw new NoSuchDeviceException();
                    default:
                        logger.error("No connection established with device");
                        throw new NoConnectionException();
                }
                break;
            case CHANGE_CONFIG_RE:
                logger.info("CONFIG sent successfully");
                break;
            default:
                logger.error("No message type matching");
                throw new IncorrectMessageTypeException();
        }
    }
}
