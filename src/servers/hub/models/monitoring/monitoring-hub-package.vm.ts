import { integer } from 'aws-sdk/clients/lightsail';
import { ApiModelProperty, ApiModelPropertyOptional } from '../../../../shared/external/nestjs-swagger';

export class BaseReportingTypeHub {
  @ApiModelProperty({
    example: 'reporting-mesin-sortir, reporting-paket-hub, reporting-lebih-sortir',
  })
  report_type: string;
}

export class BaseMonitoringHubPackage extends BaseReportingTypeHub {

  @ApiModelProperty()
  start_date: string;

  @ApiModelProperty()
  end_date: string;

  @ApiModelProperty()
  branch_id: string;

  @ApiModelPropertyOptional()
  employee_id: number;

  @ApiModelPropertyOptional({
    description : 'Used in mesinSOrtir',
    example : 'true or false',
  })
  is_succeed?: boolean;

}

export class PayloadMonitoringHubPackageList extends BaseReportingTypeHub {

  @ApiModelProperty()
  page: integer;

  @ApiModelProperty()
  limit: integer;

  @ApiModelPropertyOptional()
  employee_id: number;

}

