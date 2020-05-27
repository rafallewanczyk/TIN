package pl.kejbi.tin.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import pl.kejbi.tin.devices.LightDevice;

import java.util.List;

@Repository
public interface LightDeviceRepository extends MongoRepository<LightDevice, Integer> {
    List<LightDevice> findAllByRegulatorId(int regulatorId);
}
