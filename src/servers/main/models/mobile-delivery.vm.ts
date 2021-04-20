import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { MobileDeliveryHistoryVm } from './mobile-delivery-history.vm';

export class MobileDeliveryVm {
  @ApiModelProperty()
  doPodDeliverDetailId: string;

  @ApiModelProperty()
  doPodDeliverId: string;

  @ApiModelProperty({ format: 'date-time' })
  doPodDeliverDateTime: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  awbId: number;

  @ApiModelProperty()
  awbItemId: number;

  @ApiModelProperty({ format: 'date-time' })
  awbDate: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  awbStatusName: string;

  @ApiModelProperty()
  merchant: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeNameNote: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneeNote: string;

  @ApiModelProperty()
  consigneeNumber: string;

  @ApiModelProperty()
  packageTypeName: string;

  @ApiModelProperty()
  productType: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  isCOD: boolean;

  @ApiModelProperty()
  isDoReturn: boolean;

  @ApiModelProperty()
  doReturnNumber: string;

  @ApiModelPropertyOptional()
  codPaymentMethod: string;

  @ApiModelPropertyOptional()
  codPaymentService: string;

  @ApiModelPropertyOptional()
  note: string;

  @ApiModelPropertyOptional()
  noReference: string;

  @ApiModelProperty({ type: [MobileDeliveryHistoryVm] })
  deliveryHistory: MobileDeliveryHistoryVm[];
}

export class ScanValidateBranchVm {
  @ApiModelProperty()
  bagNumber: string;

  @ApiModelProperty()
  totalAwbInBag: number;

  @ApiModelProperty()
  totalAwbScan: number;

  @ApiModelProperty()
  totalAwbMore: number;

  @ApiModelProperty()
  totalAwbLess: number;

}

export class MobileScanInValidateBranchVm {

  @ApiModelProperty()
  podScanInBranchId: string;

  @ApiModelPropertyOptional()
  notes?: string;

  @ApiModelPropertyOptional({type: [ScanValidateBranchVm]})
  bagNumberDetail?: ScanValidateBranchVm[];

}
