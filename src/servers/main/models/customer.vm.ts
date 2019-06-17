import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';

export class CustomerSearchVm {
  @ApiModelProperty()
  search: string;
}

export class CustomerVm {
  @ApiModelProperty()
  customerId: number;

  @ApiModelProperty()
  customerCode: string;

  @ApiModelProperty()
  customerName: string;
}

export class CustomerPayloadVm {
  @ApiModelProperty({ type: () => CustomerSearchVm })
  filters: CustomerSearchVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}




