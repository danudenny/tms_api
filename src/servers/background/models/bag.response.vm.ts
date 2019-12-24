import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class BagResponseVm {
  @ApiModelProperty()
  total_process: number;

  @ApiModelProperty()
  bag_inserted:any [];

  @ApiModelProperty()
  bag_updated:any [];
}