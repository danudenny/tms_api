import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
    ApiOkResponse, ApiUseTags, ApiOperation, ApiBadRequestResponse,
} from '../../../../shared/external/nestjs-swagger';
import { CancelDeliverOkResponseVm, CancelDeliverFailedResponseVm, CancelDeliverPayloadVm } from '../../models/partner/cancel-dlv.vm';
import { ApiPartnersService } from '../../services/api/partners.service';

@ApiUseTags('API Partners')
@Controller('api/partner')
export class ApiPartnersController {
  constructor() {}

  @Post('cancel-delivery')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    title: 'Cancel Delivery',
    description:
      `Cancel Delivery Request by Receipt Number,
      Used by partner to cancel their delivery request based on SiCepat receipt number.`,
  })
  @ApiOkResponse({ description: 'Response Success', type: CancelDeliverOkResponseVm })
  @ApiBadRequestResponse({ description: 'Response Failed', type: CancelDeliverFailedResponseVm })
  public async cancelDlv(@Body() payload: CancelDeliverPayloadVm) {
    return ApiPartnersService.cancelDelivery(payload);
  }
}
