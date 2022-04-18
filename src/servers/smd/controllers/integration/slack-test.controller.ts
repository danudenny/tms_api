import { BadGatewayException, BadRequestException, Body, Controller, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { ApiUseTags } from "../../../../shared/external/nestjs-swagger";

@ApiUseTags('SLACK TEST')
@Controller('slack')
export class SlackTestController{
  @Post('sendmessage')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthenticatedGuard )
  public async sendSLackMessage(@Req() request: any, @Body() payload: any) : Promise<void> {
    if (typeof(payload.message) !== "undefined"){
      let message =  payload.message;
      throw new BadGatewayException(message);
    }
  }
}