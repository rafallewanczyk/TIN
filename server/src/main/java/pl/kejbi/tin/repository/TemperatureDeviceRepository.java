package pl.kejbi.tin.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import pl.kejbi.tin.devices.TemperatureDevice;

import java.util.List;

@Repository
public interface TemperatureDeviceRepository extends MongoRepository<TemperatureDevice, Integer> {
    List<TemperatureDevice> findAllByRegulatorId(int regulatorId);
}
