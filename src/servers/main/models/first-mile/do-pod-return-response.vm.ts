import {
  ApiModelProperty,
  ApiModelPropertyOptional,
} from '../../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../../shared/models/base-meta-response.vm';
import { AwbStatusVm } from '../awb-status.vm';
import { MobileCheckInResponseVm } from '../mobile-check-in-response.vm';
import { PrintDoPodDeliverDataDoPodDeliverDetailVm, PrintDoPodDeliverDataUserDriverVm } from '../print-do-pod-deliver.vm';
import { ReasonVm } from '../reason.vm';

export class PrintDoPodReturnDataVm {
  @ApiModelProperty()
  doPodReturnId: number;

  @ApiModelProperty()
  doPodReturnCode: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty({ type: () => PrintDoPodDeliverDataUserDriverVm })
  userDriver: PrintDoPodDeliverDataUserDriverVm = new PrintDoPodDeliverDataUserDriverVm();

  @ApiModelProperty({ type: () => [PrintDoPodDeliverDataDoPodDeliverDetailVm] })
  doPodReturnDetails: PrintDoPodDeliverDataDoPodDeliverDetailVm[] = [];
}

export class WebDoPodCreateReturnResponseVm {
  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty()
  doPodReturnId: string;

  // @ApiModelProperty({ type: () => PrintDoPodDataVm })
  // printDoPodMetadata: PrintDoPodDataVm = new PrintDoPodDataVm();

  // @ApiModelProperty({ type: () => PrintDoPodBagDataVm })
  // printDoPodBagMetadata: PrintDoPodBagDataVm = new PrintDoPodBagDataVm();

  @ApiModelProperty({ type: () => PrintDoPodReturnDataVm })
  printDoPodReturnMetadata: PrintDoPodReturnDataVm = new PrintDoPodReturnDataVm();
}

export class ScanAwbReturnVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;

  @ApiModelPropertyOptional({
    type: () => PrintDoPodDeliverDataDoPodDeliverDetailVm,
  })
  printDoPodReturnMetadata?: PrintDoPodDeliverDataDoPodDeliverDetailVm = new PrintDoPodDeliverDataDoPodDeliverDetailVm();
}

export class WebScanAwbReturnResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({ type: [ScanAwbReturnVm] })
  data: ScanAwbReturnVm[];
}

export class WebScanInReturnGroupResponseVm {
  @ApiModelProperty({ format: 'date' })
  datePOD: string;

  @ApiModelProperty()
  totalSuratJalan: number;

  @ApiModelProperty()
  totalAssigned: number;

  @ApiModelProperty()
  totalOnProcess: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  branchName: number;

  @ApiModelProperty()
  nickname: string;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  userIdDriver: number;
}

export class WebScanOutReturnGroupListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({
    type: () => [WebScanInReturnGroupResponseVm],
  })
  data: WebScanInReturnGroupResponseVm[];

}

export class WebScanInReturnResponseVm {
  @ApiModelProperty()
  doPodReturnId: number;

  @ApiModelProperty()
  doPodReturnCode: string;

  @ApiModelProperty()
  doPodReturnDateTime: string;

  @ApiModelProperty()
  description: string;

  @ApiModelProperty()
  totalAssigned: number;

  @ApiModelProperty()
  totalOnProcess: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalProblem: number;

  @ApiModelProperty()
  isCod: boolean;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  nickname: string;
}

export class WebScanOutReturnListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [WebScanInReturnResponseVm] })
  data: WebScanInReturnResponseVm[];
}

export class ItemReturnResponseVm {

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  totalCodValue: number;

  @ApiModelProperty()
  awbStatusTitle: string;

  @ApiModelProperty()
  isCod: string;

  @ApiModelProperty()
  isDoReturn: string;

  @ApiModelProperty()
  doReturnNumber: string;

  @ApiModelProperty()
  doPodReturnDetailId: string;

  @ApiModelProperty()
  awbStatusIdLast: number;

  @ApiModelProperty()
  note: string;
}

export class WebReturnListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [ItemReturnResponseVm] })
  data: ItemReturnResponseVm[];
}

export class MobileCreateDoPodResponseVm {
  @ApiModelProperty()
  doPodReturnId: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}

export class MobileScanAwbReturnVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  trouble: boolean;

  @ApiModelProperty()
  message: string;
}

export class MobileScanAwbReturnResponseVm {
  @ApiModelProperty()
  service: string;

  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  consigneeName: string;

  @ApiModelProperty()
  consigneeAddress: string;

  @ApiModelProperty()
  consigneePhone: string;

  @ApiModelProperty()
  totalCodValue: string;

  @ApiModelProperty()
  dateTime: string;

  @ApiModelProperty()
  doPodReturnId: string;

  @ApiModelProperty({ type: [MobileScanAwbReturnVm] })
  data: MobileScanAwbReturnVm;
}

export class MobileReturnHistoryVm {
  @ApiModelProperty()
  doPodReturnHistoryId: string;

  @ApiModelProperty({ format: 'date-time' })
  historyDateTime: string;

  @ApiModelProperty()
  reasonId: number;

  @ApiModelProperty()
  reasonCode: string;

  @ApiModelProperty()
  reasonNotes: string;

  @ApiModelProperty()
  employeeId: number;

  @ApiModelProperty()
  employeeName: string;

  @ApiModelProperty()
  awbStatusId: number;

  @ApiModelProperty()
  latitudeReturn: string;

  @ApiModelProperty()
  longitudeReturn: string;
}

export class MobileReturnVm {
  @ApiModelProperty()
  doPodReturnDetailId: string;

  @ApiModelProperty()
  doPodReturnId: string;

  @ApiModelProperty({ format: 'date-time' })
  doPodReturnDateTime: string;

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

  @ApiModelProperty()
  isHighValue: boolean;

  @ApiModelProperty({ type: [MobileReturnHistoryVm] })
  returnHistory: MobileReturnHistoryVm[];
}

export class MobileInitDataReturnResponseVm {
  @ApiModelProperty({ type: [MobileReturnVm] })
  returnsData: MobileReturnVm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;
}

export class MobileSyncAwbReturnVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  process: boolean;

  @ApiModelProperty()
  message: string;
}

export class MobileSyncDataReturnResponseVm {
  @ApiModelProperty({ type: [MobileSyncAwbReturnVm] })
  data: MobileSyncAwbReturnVm[];
}

export class MobileSyncReturnImageDataResponseVm {
  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;

  @ApiModelProperty()
  totalData: number;
}

export class MobileInitReturnDataResponseVm {
  @ApiModelProperty({ type: () => [ReasonVm] })
  reason: ReasonVm[];

  @ApiModelProperty({ type: () => [AwbStatusVm]})
  awbStatus: AwbStatusVm[];

  @ApiModelProperty({ type: [MobileReturnVm] })
  returnsData: MobileReturnVm[];

  @ApiModelProperty({ format: 'date-time' })
  serverDateTime: string;

  @ApiModelProperty()
  checkIn: MobileCheckInResponseVm;
}
