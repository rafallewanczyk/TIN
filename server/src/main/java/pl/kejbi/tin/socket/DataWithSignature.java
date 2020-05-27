package pl.kejbi.tin.socket;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DataWithSignature {
    private byte[] data;
    private byte[] signature;
}
