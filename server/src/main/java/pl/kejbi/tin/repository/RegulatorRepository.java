package pl.kejbi.tin.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import pl.kejbi.tin.devices.Regulator;

@Repository
public interface RegulatorRepository extends MongoRepository<Regulator, Integer> {

}
