package pl.kejbi.tin.socket.parser;

import java.util.Arrays;
import java.util.HashMap;

public class MessageParser {

    private static HashMap<String, MessageType> map = new HashMap<>(){
        {
            put("OK", MessageType.OK);
            put("ERROR_CONFIG", MessageType.ERROR_CONFIG);
            put("ERROR_PARAMS", MessageType.ERROR_PARAMS);
            put("ERROR_CURR_D", MessageType.ERROR_CURR_D);
        }
    };

    public static MessageType parseMessage(byte[] data) {
        String message = new String(Arrays.copyOfRange(data, 0, 2));
        MessageType type = map.get(message);
        if(type == null) {
            message = new String(Arrays.copyOfRange(data, 0, 12));
            type = map.get(message);
        }

        return type;
    }
}
