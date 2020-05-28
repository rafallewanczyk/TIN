package pl.kejbi.tin.controller.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotNull;

@Data
@NoArgsConstructor
public class LightTargetDTO {
    @NotNull
    private Integer id;
    @NotNull
    private Boolean targetData;
}
