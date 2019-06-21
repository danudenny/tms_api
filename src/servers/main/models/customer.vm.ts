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

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'customer_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}
