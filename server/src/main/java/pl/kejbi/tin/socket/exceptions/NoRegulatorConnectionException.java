package pl.kejbi.tin.socket.exceptions;

public class NoRegulatorConnectionException extends RuntimeException {
    public NoRegulatorConnectionException() {
        super("Connection with regulator failed");
    }
}
