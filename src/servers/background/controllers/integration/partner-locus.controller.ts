import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { PartnerLocusService } from '../../services/integration/partner-locus.service';
import { AuthLocusGuard } from '../../../../shared/guards/auth-locus.guard';

@ApiUseTags('Integration Sicepat x Locus')
@Controller('integration')
@ApiBearerAuth()
export class PartnerLocusController {
  constructor() {}

  @Post('locus/createTask')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async createTask() {
    return PartnerLocusService.createTask();
  }

  @Post('locus/createBatchTask')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async createBatchTask() {
    return PartnerLocusService.createBatchTask();
  }

  @Post('locus/taskCallback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthLocusGuard)
  @ResponseSerializerOptions({ disable: true })
  public async webHookTaskCallback(@Body() payload: any) {
    console.log(payload);
    return { status: 'ok', message: 'success' };
  }

  @Post('locus/planCallback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthLocusGuard)
  @ResponseSerializerOptions({ disable: true })
  public async webHookPlanCallback(@Body() payload: any) {
    console.log(payload);
    return { status: 'ok', message: 'success' };
  }
}
