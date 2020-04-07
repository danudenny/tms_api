import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobiledashboardVm } from './mobile-dashboard.vm';

export class MobileDashboardFindAllResponseVm  {
  @ApiModelProperty({ type: () => [MobiledashboardVm] })
  data: MobiledashboardVm[];
}

export class MobileTransitResponseVm {
  @ApiModelProperty()
  dateTime: string;

  @ApiModelProperty()
  total: number;
}

export class MobileDetailTransitResponseVm {

  @ApiModelProperty()
  notScanInAwb: MobileTransitResponseVm;

  @ApiModelProperty()
  scanInAwb: MobileTransitResponseVm;

  @ApiModelProperty()
  notScanOutAwb: MobileTransitResponseVm;

  @ApiModelProperty()
  status: string;

  @ApiModelProperty()
  message: string;
}