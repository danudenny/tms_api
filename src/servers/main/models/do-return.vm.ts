import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { BaseMetaResponseVm } from 'src/shared/models/base-meta-response.vm';

export class DoReturnResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatus: string;

  @ApiModelProperty()
  customerName: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  podDatetime: string;

  @ApiModelProperty()
  doReturnAwbNumber: string;

  @ApiModelProperty()
  doReturnHistoryIdLast: string;

  @ApiModelProperty()
  doReturnAdminToCtId: string;

  @ApiModelProperty()
  doReturnCtToCollectionId: string;

  @ApiModelProperty()
  doReturnCollectionToCustId: string;

  @ApiModelProperty()
  doReturnMasterCode: number;

  @ApiModelProperty()
  doReturnMasterDesc: string;

  @ApiModelProperty()
  doCode: string;
}
export class DoReturnAdminResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  doReturnAdminId: string;

  @ApiModelProperty()
  doReturnAdminCode: string;

  @ApiModelProperty()
  countAwb: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  newAwbNumber: string;
}

export class ReturnSearchVm {
  @ApiModelProperty()
  search: string;

}

export class ReturnPayloadVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => ReturnSearchVm })
  filters: ReturnSearchVm;

  @ApiModelProperty({
    example: 1,
  })
  page: number;

  @ApiModelProperty({
    example: 10,
  })
  limit: number;

  @ApiModelProperty({
    example: 'branch_name',
  })
  sortBy: string;

  @ApiModelProperty({
    example: 'asc',
  })
  sortDir: string;
}
