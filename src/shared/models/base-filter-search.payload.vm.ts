import { ApiModelProperty } from '../external/nestjs-swagger';

export class WebDeliverySearchVm {
  @ApiModelProperty()
  fields: string[];

  @ApiModelProperty()
  value: string;
}

export class SearchColumnsVm {
  @ApiModelProperty()
  field: string;

  @ApiModelProperty()
  value: string;
}
