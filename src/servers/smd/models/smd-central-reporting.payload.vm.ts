import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';

export class GenerateQueueSmdBerangkatPayload {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class GenerateQueueSmdVendorPayload {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelPropertyOptional()
  branchId: number;

  @ApiModelProperty()
  vendorName: string;
}

export class GenerateQueueDaftarGsk {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelPropertyOptional()
  representativeCode: string;
}

export class GenerateQueueDaftarScanMasukGabungPaketPayload {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelPropertyOptional()
  branchId: number;
}

export class GenerateQueueFormDataPayloadVm {
  @ApiModelProperty()
  encodeQuery: string;

  @ApiModelProperty()
  filename: string;

  @ApiModelProperty()
  reportType: string;
}

export class GenerateQueueOptionPayloadVm {
  @ApiModelProperty()
  userId: number;
}

export class ListCentralExportPayloadVm {
  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;
}

export class ListQueueRequestParamPayloadVm {
  @ApiModelProperty()
  page: number;

  @ApiModelProperty()
  limit: number;

  @ApiModelProperty()
  userId: number;

  @ApiModelProperty()
  reportType: string;
}

export class GenerateQueueMonitoringSmd {
  @ApiModelProperty()
  startDate: string;

  @ApiModelProperty()
  endDate: string;

  @ApiModelProperty()
  isIntercity: number;
}

