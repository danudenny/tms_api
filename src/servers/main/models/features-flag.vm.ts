import { ApiModelProperty } from "../../../shared/external/nestjs-swagger";

export class FeaturesFlagResponse {
  @ApiModelProperty()
  webLoginNewVersion: boolean;

  @ApiModelProperty()
  mobileLoginNewVersion: boolean;
}