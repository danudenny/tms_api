import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class ExportHandoverSigesitResponseVM {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;
}
