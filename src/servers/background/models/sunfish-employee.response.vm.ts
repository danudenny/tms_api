import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { SunfishEmployeeVm } from './sunfishemployee.vm';

export class SunfishEmployeeResponseVm {
  @ApiModelProperty()
  code: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({ type: () => [SunfishEmployeeVm] })
  data: SunfishEmployeeVm[];
}
