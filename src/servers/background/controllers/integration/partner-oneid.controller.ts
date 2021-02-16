import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiImplicitHeader, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { PartnerOneidService } from '../../services/integration/partner-oneid.service';
import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm } from '../../models/partner/oneid-task.vm';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';


@ApiUseTags('Integration Sicepat x Oneid')
@Controller('integration')
export class PartnerOneidController {
  constructor() {}

  @Post('oneid/orderActivity')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({
    description: 'Response Success',
    type: ListOneidOrderActivityResponseVm,
  })
  public async orderActivity(@Body() payload: PartnerOneidPayloadVm) {
    return PartnerOneidService.orderActivity(payload);
  }
}
