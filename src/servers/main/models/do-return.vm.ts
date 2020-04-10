import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { take } from 'rxjs/operators';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class DoReturnResponseVm {

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
  doCodeCt: string;

  @ApiModelProperty()
  doCodeCollection: string;

  @ApiModelProperty()
  userDriver: string;
}
export class DoReturnAdminResponseVm {

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
export class DoReturnAwbListResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doReturnAdminId: string;

  @ApiModelProperty()
  doReturnCtId: string;

  @ApiModelProperty()
  doReturnCollectionId: string;
}
export class DoReturnCtResponseVm {

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

  @ApiModelProperty()
  employeeNik: string;
}

export class DoReturnFinanceResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  doReturnAwbId: number;

  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty()
  doReturnAwbNumber: string;

  @ApiModelProperty()
  originCode: string;

  @ApiModelProperty()
  asal: string;

  @ApiModelProperty()
  tujuan: string;

  @ApiModelProperty()
  destinationCode: number;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  awbDate: string;

  @ApiModelProperty()
  customerAccountName: string;

  @ApiModelProperty()
  customerAccountId: string;

  @ApiModelProperty()
  customerName: string;

  @ApiModelProperty()
  customerId: string;

  @ApiModelProperty()
  doPodDeliverDateTime: string;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  awbStatusId: string;

  @ApiModelProperty()
  harga: string;
}
export class DoReturnCollectionResponseVm {

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

  @ApiModelProperty()
  employeeNik: string;

  @ApiModelProperty()
  isReceiptCust: boolean;

  @ApiModelProperty()
  notes: string;

  @ApiModelProperty()
  customerName: string;

  @ApiModelProperty()
  updatedTime: string;

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
