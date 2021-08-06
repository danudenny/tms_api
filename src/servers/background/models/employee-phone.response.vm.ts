import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class EmployeePhoneResponseVm {
  @ApiModelProperty()
  code: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  clearCacheMobile: string;

  @ApiModelProperty()
  clearCacheWeb: string;

}
