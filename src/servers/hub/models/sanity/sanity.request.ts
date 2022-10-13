import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DeleteBagsRequest {
  @ApiModelProperty()
  bagNumbers: [string];
}
