package pl.kejbi.tin.socket.exceptions;

public class IncorrectMessageTypeException extends RuntimeException {
    public IncorrectMessageTypeException() {
        super("No message type available");
    }
}
