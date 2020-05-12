package pl.kejbi.tin.socket.exceptions;

public class IncorrectSignatureException extends RuntimeException {
    public IncorrectSignatureException() {
        super("Incorrect Signature - not verified");
    }
}
