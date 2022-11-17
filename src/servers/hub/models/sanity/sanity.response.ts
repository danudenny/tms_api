import { ApiModelProperty } from '../../../../shared/external/nestjs-swagger';
import { BaseResponse } from '../../../../shared/models/base-response';

class DeleteBagsData {
  @ApiModelProperty()
  bagNumbers: [string];
}

class DeleteAwbsData {
  @ApiModelProperty()
  awbNumbers: [string];
}

class DeleteDoSortationsData {
  @ApiModelProperty()
  doSortationCodes: [string];
}

class DeleteDoSMdData {
  @ApiModelProperty()
  doSmdCode: [string];
}

class DeleteBaggingData {
  @ApiModelProperty()
  baggingCode: [string];
}

class DeleteBagRepresentativeData {
  @ApiModelProperty()
  bagRepresentativeCode: [string];
}

export class DeleteBagsResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteBagsData;
}

export class DeleteAwbsResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteAwbsData;
}

export class DeleteDoSortationsResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteDoSortationsData;
}

export class DeleteDoSmdResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteDoSMdData;
}

export class DeleteBaggingResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteBaggingData;
}

export class DeleteBagRepresentativeResponse extends BaseResponse {
  @ApiModelProperty()
  data: DeleteBagRepresentativeData;
}
