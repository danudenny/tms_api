import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { BaseMetaResponseVm } from 'src/shared/models/base-meta-response.vm';

export class DoReturnResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  doReturnAwbId: string;

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

  @ApiModelProperty()
  userDriver: string;
}
export class DoReturnAdminResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  doReturnAdminId: string;

  @ApiModelProperty()
  doCode: string;

  @ApiModelProperty()
  countAwb: number;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  awbNumberNew: string;

  @ApiModelProperty()
  partnerLogisticName: string;

  @ApiModelProperty()
  attachUrl: string;

  @ApiModelProperty()
  isPartnerLogistic: boolean;

  @ApiModelProperty()
  createdTime: string;
}
export class DoReturnCtResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  doReturnCtId: string;

  @ApiModelProperty()
  doCode: string;

  @ApiModelProperty()
  countAwb: number;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  userCreated: string;
}
export class DoReturnCollectionResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty()
  doReturnCollectionId: string;

  @ApiModelProperty()
  doCode: string;

  @ApiModelProperty()
  countAwb: number;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  userCreated: string;
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
