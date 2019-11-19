import { ApiModelProperty } from '../../../shared/external/nestjs-swagger';
import { MobiledashboardVm } from './mobile-dashboard.vm';

export class MobileDashboardFindAllResponseVm  {
  @ApiModelProperty({ type: () => [MobiledashboardVm] })
  data: MobiledashboardVm[];
}
