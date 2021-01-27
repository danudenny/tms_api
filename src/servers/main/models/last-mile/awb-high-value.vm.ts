import { BaseMetaResponseVm } from 'src/shared/models/base-meta-response.vm';
import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';

export class AwbHighValueUploadResponseVm {
  @ApiModelProperty()
  notValid: string[];

  @ApiModelProperty()
  totalNotValid: number;

  @ApiModelProperty()
  totalValid: number;
}

export class AwbHighValueUploadListDataResponseVm {
  @ApiModelProperty()
  awbNumber: string;

  @ApiModelProperty()
  partnerName: string;

  @ApiModelProperty()
  recipientName: string;

  @ApiModelProperty()
  recipientPhone: string;

  @ApiModelProperty()
  parcelValue: string;

  @ApiModelProperty()
  isUpload: boolean;

  @ApiModelProperty()
  uploadedDate: string;

  @ApiModelProperty()
  user: string;
}

export class AwbHighValueUploadListResponseVm extends BaseMetaResponseVm {
  @ApiModelProperty({ type: () => [AwbHighValueUploadListDataResponseVm] })
  data: AwbHighValueUploadListDataResponseVm[];
}