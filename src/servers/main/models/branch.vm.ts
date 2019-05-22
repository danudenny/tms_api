import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';

export class BranchVm {
  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchName: string;
}

export class BranchSearchVm {
  @ApiModelProperty()
  search: string;

}

export class BranchPayloadVm {
  @ApiModelProperty({ type: () => BranchSearchVm })
  filters: BranchSearchVm;

  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  sortBy: string;

  @ApiModelProperty()
  sortDir: string;
}
