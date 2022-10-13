import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class DeleteBagRequest {
  @ApiModelProperty()
  bagNumbers: [string];
}
