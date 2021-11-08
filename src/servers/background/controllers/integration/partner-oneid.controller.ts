import { Body, Controller, Post, UseGuards,Get, HttpCode, HttpStatus, HttpException, Query } from '@nestjs/common';
import { ApiImplicitHeader, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { PartnerOneidService } from '../../services/integration/partner-oneid.service';
import { PartnerOneidPayloadVm, ListOneidOrderActivityResponseVm, ListResiVm } from '../../models/partner/oneid-task.vm';
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


  @Get('oneid/resi')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({
    description: 'Response Success',
    type: ListOneidOrderActivityResponseVm,
  })
  public async getResi(@Query() queryParams: ListResiVm) {
    const result = await PartnerOneidService.getOrder(queryParams);
    // catch err
    if (result.status === false) {
      throw new HttpException(result, result.statusCode);
    }
    return result;
  }
}
