import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiImplicitHeader, ApiOkResponse, ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { PartnerOrchestraService } from '../../services/integration/partner-orchestra.service';
import { PartnerOrchestraPayloadVm, PartnerOrchestraResponseVm } from '../../models/partner/orchestra-task.vm';
import { AuthXAPIKeyGuard } from '../../../../shared/guards/auth-x-api-key.guard';


@ApiUseTags('Integration Sicepat x Orchestra')
@Controller('integration')
export class PartnerOrchestraController {
  constructor() {}

  @Post('orchestra/handover')
  @HttpCode(HttpStatus.OK)
  @ApiImplicitHeader({ name: 'x-api-key' })
  @UseGuards(AuthXAPIKeyGuard)
  @ResponseSerializerOptions({ disable: true })
  @ApiOkResponse({
    description: 'Response Success',
    type: PartnerOrchestraResponseVm,
  })
  public async createTask(@Body() payload: PartnerOrchestraPayloadVm) {
    return PartnerOrchestraService.createAwbHistory(payload);
  }
}
