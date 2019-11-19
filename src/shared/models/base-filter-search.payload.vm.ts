import { ApiModelProperty } from '../external/nestjs-swagger';
import { IsDefined } from 'class-validator';

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

export class BaseMetaSortirPayloadVm  {
  @ApiModelProperty()
  @IsDefined({message: 'No Resi harus diisi'})
  awbNumber: string;
}
