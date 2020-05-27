package pl.kejbi.tin.socket.parser;

import java.util.Arrays;
import java.util.HashMap;

public class MessageParser {

    private static HashMap<String, MessageType> map = new HashMap<>(){
        {
            put("CHANGE_CONFIG_RE", MessageType.CHANGE_CONFIG_RE);
            put("CHANGE_PARAMS_RE", MessageType.CHANGE_PARAMS_RE);
            put("CURRENT_DATA_RES", MessageType.CURRENT_DATA_RES);
        }
    };

    public static MessageType parseMessage(byte[] data) {
        String message = new String(Arrays.copyOfRange(data, 0, 16));

        return map.get(message);
    }
}
