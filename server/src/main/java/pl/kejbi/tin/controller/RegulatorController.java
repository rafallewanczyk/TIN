package pl.kejbi.tin.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import pl.kejbi.tin.controller.dto.RegulatorDTO;
import pl.kejbi.tin.controller.dto.RegulatorUpdateDTO;
import pl.kejbi.tin.devices.Regulator;
import pl.kejbi.tin.devices.RegulatorType;
import pl.kejbi.tin.repository.RegulatorRepository;
import pl.kejbi.tin.security.KeyGenerator;
import pl.kejbi.tin.service.RegulatorService;

import java.security.NoSuchAlgorithmException;
import java.security.spec.InvalidKeySpecException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/regulators")
@RequiredArgsConstructor
public class RegulatorController {
    private final RegulatorService regulatorService;
    private final KeyGenerator keyGenerator;

    @GetMapping
    public List<RegulatorDTO> getAllRegulators() {
        var regulators = regulatorService.getAllRegulators();

        return regulators.stream().map(RegulatorDTO::new).collect(Collectors.toList());
    }

    @PostMapping
    public void addRegulator(@RequestBody RegulatorDTO regulatorDTO) throws InvalidKeySpecException, NoSuchAlgorithmException {
        regulatorService.addRegulator(regulatorDTO.convertToRegulator());
    }

    @DeleteMapping("/{regulatorId}")
    public void deleteRegulator(@PathVariable Integer regulatorId) {
        regulatorService.deleteRegulator(regulatorId);
    }

    @PatchMapping("/{regulatorId}")
    public void updateRegulator(@PathVariable Integer regulatorId, @RequestBody RegulatorUpdateDTO regulatorUpdateDTO) throws InvalidKeySpecException, NoSuchAlgorithmException {
        regulatorService.updateRegulator(regulatorId, regulatorUpdateDTO);
    }
}
