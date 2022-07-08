import { ApiModelProperty, ApiModelPropertyOptional } from '../../../shared/external/nestjs-swagger';
import { BaseMetaResponseVm } from '../../../shared/models/base-meta-response.vm';

export class ScanOutSmdDepartureResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutDepartureVm]})
  data: ScanOutDepartureVm[];
}

export class ScanOutDepartureVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  departure_date_time: Date;

}

export class ScanInSmdArrivalResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanInArrivalVm]})
  data: ScanInArrivalVm[];
}

export class ScanInArrivalVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_detail_id: number;

  @ApiModelProperty()
  departure_date_time: Date;

}

export class MobileUploadImageResponseVm {

  @ApiModelProperty()
  attachmentId: number;

  @ApiModelProperty()
  url: string;
}

export class ScanOutSmdProblemResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutProblemVm]})
  data: ScanOutProblemVm[];
}

export class ScanOutProblemVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  reason_date: Date;

}

export class ScanOutSmdContinueResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutContinueVm]})
  data: ScanOutContinueVm[];
}

export class ScanOutContinueVm {

  @ApiModelProperty()
  do_smd_id: number;

}

export class ScanOutSmdHandOverResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutHandOverVm]})
  data: ScanOutHandOverVm[];
}

export class ScanOutHandOverVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  handover_date: Date;

}

export class ScanOutSmdEndManualResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanOutEndManualVm]})
  data: ScanOutEndManualVm[];
}

export class ScanOutEndManualVm {

  @ApiModelProperty()
  do_smd_id: number;

  @ApiModelProperty()
  do_smd_code: string;

  @ApiModelProperty()
  departure_date_time: Date;

}

export class UnfinishedSmdResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [DoSmdCode]})
  data: DoSmdCode[];
}

export class DoSmdCode {
  @ApiModelProperty()
  do_smd_code: string;
}

export class ScanHistoryModuleFinishResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty()
  statusCode: number;

  @ApiModelProperty()
  message: string;

  @ApiModelProperty({type: () => [ScanModuleFinsihVm]})
  data: ScanModuleFinsihVm[];
}

export class ScanModuleFinsihVm {

  @ApiModelProperty()
  historyModuleFinishId: string;

  @ApiModelProperty()
  doSmdCode: string;

  @ApiModelProperty()
  vehicleId: number;

  @ApiModelProperty()
  driverId: number;

  @ApiModelProperty()
  vehicleNumber: number;

  @ApiModelProperty()
  branchId: number;

  @ApiModelProperty()
  createdTime: Date;

  @ApiModelProperty()
  updatedTime: Date;

  @ApiModelProperty()
  userIdCreated: number;

  @ApiModelProperty()
  userIdUpdated: number;

  @ApiModelProperty()
  employeeIdDriver: number;

  @ApiModelProperty()
  adminName: string;

  @ApiModelProperty()
  driverName: string;

  @ApiModelProperty()
  driverNik: number;

  @ApiModelProperty()
  adminNik: number;

}
