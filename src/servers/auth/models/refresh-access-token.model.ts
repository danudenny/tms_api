import { ApiModelProperty } from '@nestjs/swagger';

export class RefreshAccessTokenPayload {
  @ApiModelProperty()
  refreshToken: string;
}

export class RefreshAccessTokenResponse {
  @ApiModelProperty()
  accessToken: string;
}
