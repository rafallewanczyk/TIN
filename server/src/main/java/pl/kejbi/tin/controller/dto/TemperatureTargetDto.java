package pl.kejbi.tin.controller.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class TemperatureTargetDto {
    @NotNull
    private Integer id;
    @NotNull
    private Double target;
}
