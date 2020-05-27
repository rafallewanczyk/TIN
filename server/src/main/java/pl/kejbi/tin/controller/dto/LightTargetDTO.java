package pl.kejbi.tin.controller.dto;

import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class LightTargetDTO {
    @NotNull
    private Integer id;
    @NotNull
    private Boolean target;
}
