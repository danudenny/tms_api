import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class DownloadQueryPayloadVm {
  @ApiModelProperty()
  lastId: number;

  @ApiModelProperty()
  branchCode: string;
}
