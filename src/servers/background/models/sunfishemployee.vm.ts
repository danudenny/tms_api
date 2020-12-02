import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class SunfishEmployeeVm {
  @ApiModelProperty()
  NIK: string;

  @ApiModelProperty()
  status: string;
}
