package pl.kejbi.tin.sender;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import pl.kejbi.tin.devices.Device;
import pl.kejbi.tin.devices.LightDevice;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.TemperatureDevice;
import pl.kejbi.tin.security.KeyHolder;
import pl.kejbi.tin.socket.DataWithSignature;

import javax.crypto.BadPaddingException;
import javax.crypto.IllegalBlockSizeException;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.security.InvalidKeyException;
import java.util.List;

@RequiredArgsConstructor
@Component
public class RegulatorCommunicator {
    private final Communicator communicator;
    private final KeyHolder keyHolder;
    private static final int TIMEOUT = 5000;

    public void sendTemperatureChangeConfig(Regulator regulator, List<TemperatureDevice> devices) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        DataWithSignature response = communicator.sendData(
                temperatureDevicesToByteArray(devices),
                regulator.getHostname(),
                regulator.getPort(),
                TIMEOUT,
                regulator.getPublicKey(),
                keyHolder.getMyPrivateKey()
        );
        communicator.processResponse(response, regulator.getPublicKey(), keyHolder.getMyPrivateKey());
    }

    public void sendLightChangeConfig(Regulator regulator, List<LightDevice> devices) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        DataWithSignature response = communicator.sendData(
                lightDevicesToByteArray(devices),
                regulator.getHostname(),
                regulator.getPort(),
                TIMEOUT,
                regulator.getPublicKey(),
                keyHolder.getMyPrivateKey()
        );
        communicator.processResponse(response, regulator.getPublicKey(), keyHolder.getMyPrivateKey());
    }

    public void sendCurrData(Regulator regulator) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        DataWithSignature response = communicator.sendData(
                "CURR_DATA".getBytes(),
                regulator.getHostname(),
                regulator.getPort(),
                TIMEOUT,
                regulator.getPublicKey(),
                keyHolder.getMyPrivateKey()
        );
        communicator.processResponse(response, regulator.getPublicKey(), keyHolder.getMyPrivateKey());
    }

    public void sendLightChangeParams(Regulator regulator, LightDevice device) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        DataWithSignature response = communicator.sendData(
                lightDeviceChangeParamsToByteArray(device),
                regulator.getHostname(),
                regulator.getPort(),
                TIMEOUT,
                regulator.getPublicKey(),
                keyHolder.getMyPrivateKey()
        );
        communicator.processResponse(response, regulator.getPublicKey(), keyHolder.getMyPrivateKey());
    }

    public void sendTemperatureChangeParams(Regulator regulator, TemperatureDevice device) throws IOException, BadPaddingException, InvalidKeyException, IllegalBlockSizeException {
        DataWithSignature response = communicator.sendData(
                temperatureDeviceChangeParamsToByteArray(device),
                regulator.getHostname(),
                regulator.getPort(),
                TIMEOUT,
                regulator.getPublicKey(),
                keyHolder.getMyPrivateKey()
        );
        communicator.processResponse(response, regulator.getPublicKey(), keyHolder.getMyPrivateKey());
    }

    private byte[] temperatureDevicesToByteArray(List<TemperatureDevice> temperatureDevices) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_CONFIG".getBytes());
        for(TemperatureDevice device: temperatureDevices) {
            writeDeviceBasicAttributes(dataOutputStream, device);
            dataOutputStream.writeDouble(device.getTemperature());
        }

        return byteStream.toByteArray();
    }

    private byte[] lightDevicesToByteArray(List<LightDevice> lightDevices) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_CONFIG".getBytes());
        for(LightDevice device: lightDevices) {
            writeDeviceBasicAttributes(dataOutputStream, device);
            dataOutputStream.writeShort(device.getTurnedOn() ? 1 : 0);
        }

        return byteStream.toByteArray();
    }

    private void writeDeviceBasicAttributes(DataOutputStream dataOutputStream, Device device) throws IOException {
        dataOutputStream.writeInt(device.getId());
        dataOutputStream.writeInt(device.getPort());
        dataOutputStream.writeInt(device.getHostname().length());
        dataOutputStream.write(device.getHostname().getBytes());
        dataOutputStream.writeInt(device.getPublicKey().getEncoded().length);
        dataOutputStream.write(device.getPublicKey().getEncoded());
    }

    private byte[] lightDeviceChangeParamsToByteArray(LightDevice device) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_PARAMS".getBytes());
        dataOutputStream.writeInt(device.getId());
        dataOutputStream.writeShort(device.getTurnedOn() ? 1 : 0);

        return byteStream.toByteArray();
    }

    private byte[] temperatureDeviceChangeParamsToByteArray(TemperatureDevice device) throws IOException {
        ByteArrayOutputStream byteStream = new ByteArrayOutputStream();
        DataOutputStream dataOutputStream = new DataOutputStream(byteStream);
        dataOutputStream.write("CHANGE_PARAMS".getBytes());
        dataOutputStream.writeInt(device.getId());
        dataOutputStream.writeDouble(device.getTemperature());

        return byteStream.toByteArray();
    }
}
