import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';

export class UpdateRepresentativeManualPayload {
  @ApiModelProperty()
  bag_representative_code: string;
  @ApiModelProperty()
  representative_code_new: string;
}