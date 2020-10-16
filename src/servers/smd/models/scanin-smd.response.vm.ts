import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanInSmdBagResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInBagVm]})
  data: ScanInBagVm[];
}

export class ScanInBagVm {
  @ApiModelProperty()
  show_number: string;

  @ApiModelProperty()
  id: string;

  @ApiModelProperty()
  received_bag_id: string;

  @ApiModelProperty()
  received_bag_code: string;

  @ApiModelProperty()
  received_bag_date: string;

  @ApiModelProperty()
  bag_weight: string;

  @ApiModelProperty()
  bag_number: string;
}

export class ScanInSmdBagMoreResponseVm {
  @ApiModelProperty()
  totalData: number;

  @ApiModelProperty()
  totalSuccess: number;

  @ApiModelProperty()
  totalError: number;

  @ApiModelProperty({type: () => [ScanInSmdBagDataResponseVm]})
  data: ScanInSmdBagDataResponseVm[];
}

export class ScanInSmdBagDataResponseVm extends ScanInSmdBagResponseVm {
  @ApiModelProperty()
  bag_item_number: string;
}

export class ScanInSmdBaggingResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInBaggingVm]})
  data: ScanInBaggingVm[];
}

export class ScanInBaggingVm {
  @ApiModelProperty({type: () => [ScanInBagNotScannedVm]})
  data_bag: ScanInBagNotScannedVm[];

  @ApiModelProperty({type: () => [ScanInBagScannedVm]})
  data_bag_scanned: ScanInBagScannedVm[];

}

export class ScanInBagScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}

export class ScanInBagNotScannedVm {
  @ApiModelProperty()
  bagnumber: string;

}

export class ScanInListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanInListVm] })
  data: ScanInListVm[];
  // @ApiModelProperty({ type: () => [ScanInListVm] })
  // data: ScanInListVm[];
}

export class ScanInListVm {
  @ApiModelProperty()
  bag_id: number;

  @ApiModelProperty()
  bag_item_id: number;

  @ApiModelProperty()
  bag_number_seq: string;

  @ApiModelProperty()
  branch_name: string;

  @ApiModelProperty()
  bagging_datetime: string;

  @ApiModelProperty()
  scan_in_datetime: string;

  @ApiModelProperty()
  representative_name: string;

  @ApiModelProperty()
  tot_resi: number;

  @ApiModelProperty()
  weight: number;

  @ApiModelProperty()
  weight_accumulative: number;

  @ApiModelProperty()
  fullname: string;
}

export class ScanInDetailListResponseVm extends BaseMetaResponseVm {

  @ApiModelProperty({ type: () => [ScanInDetailListVm] })
  data: ScanInDetailListVm[];
}

export class ScanInDetailListVm {
  @ApiModelProperty()
  awb_number: string;
}

export class ScaninDataDetailScanResponseVm {
  @ApiModelProperty()
  received_bag_id: string;

  @ApiModelProperty()
  received_bag_code: string;

  @ApiModelProperty()
  received_bag_date: string;

  @ApiModelProperty()
  bag_weight: string;

  @ApiModelProperty()
  bag_number: string;
}

export class ScaninDetailScanResponseVm {
  @ApiModelProperty({ type: () => [ScaninDataDetailScanResponseVm] })
  data: ScaninDataDetailScanResponseVm[];
}
