import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobiledashboardVm } from './mobile-dashboard.vm';

export class MobileDashboardFindAllResponseVm  {
  @ApiModelProperty({ type: () => [MobiledashboardVm] })
  data: MobiledashboardVm[];
}

export class MobileDetailTransitResponseVm {

  @ApiModelProperty()
  totalNotScanInAwb: number;

  @ApiModelProperty()
  totalScanInAwb: number;

  @ApiModelProperty()
  totalNotScanOutAwb: number;
}