import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiUseTags } from "../../../../shared/external/nestjs-swagger";
import { SlackService } from "nestjs-slack";
import { PinoLoggerService } from "../../../../shared/services/pino-logger.service";

@ApiUseTags('SLACK TEST')
@Controller('slack')
export class SlackTestController{
  constructor(private slackService: SlackService) {}

  @Post('sendmessage')
  public async sendSLackMessage(@Req() request: any, @Body() payload: any) : Promise<void> {
    if (typeof(payload.message) !== "undefined"){
      let message =  payload.message;
      this.slackService.sendText(message);
    }
    return ;
  }
}