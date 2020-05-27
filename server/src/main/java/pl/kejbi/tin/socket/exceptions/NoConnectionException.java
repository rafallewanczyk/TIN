package pl.kejbi.tin.socket.exceptions;

public class NoConnectionException extends RuntimeException {
    public NoConnectionException() {
        super("No connection to the device");
    }
}
