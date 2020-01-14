import { Body, Controller, Post, Put, Get } from '@nestjs/common';
import { PartnerService } from '../../services/integration/partner.service';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';

@ApiUseTags('Partner Integration Gojek')
@Controller('integration')
export class PartnerGojekController {
  constructor() {}

  @Post('gojek/createBooking')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async createBoking(@Body() payload: any) {
    return {};
  }

  @Put('gojek/cancelBooking')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async cancelBooking(@Body() payload: any) {
    return {};
  }

  @Get('gojek/estimatePrice')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async estimatePrice(@Body() payload: any) {
    return {};
  }

  @Get('gojek/checkOrderStatus')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async checkOrderStatus(@Body() payload: any) {
    return {};
  }

  @Post('gojek/callback')
  // @HttpCode(HttpStatus.OK)
  // @ApiBearerAuth()
  // @UseGuards(AuthenticatedGuard)
  // @ApiOkResponse({ type: TrackingNoteResponseVm })
  public async webHookCallback(@Body() payload: any) {
    return {};
  }
}
