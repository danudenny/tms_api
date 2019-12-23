import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';
import { ItemDeliveryResponseVm } from './web-delivery-list-response.vm';

// Scan Out Awb List
export class WebScanInResponseVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  doPodDateTime: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  percenScanInOut: number;

  @ApiModelProperty()
  totalScanIn: number;

  @ApiModelProperty()
  totalScanOut: number;

  @ApiModelProperty()
  lastDateScanIn: string;

  @ApiModelProperty()
  lastDateScanOut: string;

  @ApiModelProperty()
  nickname: string;

  @ApiModelProperty()
  branchTo: string;

  @ApiModelProperty()
  employeeIdDriver: string;

  @ApiModelProperty()
  partnerLogisticId: string;

  @ApiModelProperty()
  doPodMethod: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchIdTo: string;

  @ApiModelProperty()
  url: string;
}

export class WebScanTransitResponseVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  doPodDateTime: string;

  @ApiModelProperty()
  doPodCode: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  totalAwb: string;

  @ApiModelProperty()
  description: string;

}

export class WebScanTransitAwbResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  bagItemId: string;

  @ApiModelProperty()
  createdTime: string;

  @ApiModelProperty()
  branchName: string;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  representativeIdTo: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  districtName: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  isCod: string;

  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  doPodId: number;

  // @ApiModelProperty()
  // photoType: string;

  // @ApiModelProperty()
  // url: string;
}

export class WebScanInDeliverResponseVm {
  @ApiModelProperty()
  doPodDeliverId: number;

  @ApiModelProperty()
  doPodDeliverCode: string;

  @ApiModelProperty()
  doPodDeliverDateTime: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  totalAssigned: number;

  @ApiModelProperty()
  totalDelivery: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  isCod: boolean;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  nickname: string;
}

export class WebScanInDeliverGroupResponseVm {

  @ApiModelProperty({ format: 'date' })
  datePOD: string;

  @ApiModelProperty()
  totalSuratJalan: number;

  @ApiModelProperty()
  totalAssigned: number;

  @ApiModelProperty()
  totalDelivery: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  totalAwb: number;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  nickname: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  userIdDriver: number;
}

export class WebScanOutAwbListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInResponseVm] })
  data: WebScanInResponseVm[];
}

export class WebScanOutTransitListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanTransitResponseVm] })
  data: WebScanTransitAwbResponseVm[];
}

export class WebScanOutTransitListAwbResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebScanTransitAwbResponseVm] })
  data: WebScanTransitAwbResponseVm[];
}

export class WebScanOutDeliverListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [WebScanInDeliverResponseVm] })
  data: WebScanInDeliverResponseVm[];
}

export class WebScanOutDeliverGroupListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({
    type: () => [WebScanInDeliverGroupResponseVm],
  })
  data: WebScanInDeliverGroupResponseVm[];
}

// Create DO POD
export class WebScanOutCreateResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  doPodId: string;
}

// Scan Out Awb
export class ScanAwbVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanOutAwbResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbVm] })
  data: ScanAwbVm[];
}

// Scan Out Bag
// Scan Out Awb
export class ScanBagVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class WebScanOutBagResponseVm {

  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanBagVm] })
  data: ScanBagVm[];
}

export class EditDataAwbVm {
  @ApiModelProperty()
  doPodId: number;

  @ApiModelProperty()
  nik: string;

  @ApiModelProperty()
  branchCode: string;

  @ApiModelProperty()
  branchTo: string;

  @ApiModelProperty()
  userIdDriver: string;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  partnerLogisticId: string;

  @ApiModelProperty()
  partnerLogisticName: string;

  @ApiModelProperty()
  doPodMethod: string;

  @ApiModelProperty()
  vehicleNumber: string;

  @ApiModelProperty()
  branchIdTo: string;
}

export class WebScanOutResponseForEditVm {
  @ApiModelProperty({ type: () => EditDataAwbVm })
  data: EditDataAwbVm;

  @ApiModelProperty({ type: () => [ItemDeliveryResponseVm] })
  data_detail: ItemDeliveryResponseVm[];
}

export class WebScanOutResponseForPrintVm {
  @ApiModelProperty()
  bagItemId: number;
}
