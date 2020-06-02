package pl.kejbi.tin.controller.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class TemperatureTargetDto {
    @NotNull
    private Integer id;
    @NotNull
    private Double targetData;
}
