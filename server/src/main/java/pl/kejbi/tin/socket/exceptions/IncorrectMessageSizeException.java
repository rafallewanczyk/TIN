package pl.kejbi.tin.socket.exceptions;

public class IncorrectMessageSizeException extends RuntimeException {

    public IncorrectMessageSizeException() {
        super("Incorrect message size in header");
    }
}
