import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

class DeleteBagsData {
  @ApiModelProperty()
  bagNumbers: [string];
}

export class DeleteBagsResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteBagsData;
}
