package pl.kejbi.tin.socket.exceptions;

public class NoSuchDeviceException extends RuntimeException {
    public NoSuchDeviceException() {
        super("No device found with that id");
    }
}
