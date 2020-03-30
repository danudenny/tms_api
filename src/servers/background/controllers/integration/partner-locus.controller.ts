import { Body, Controller, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiUseTags, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../shared/decorators/response-serializer-options.decorator';
import { PartnerLocusService } from '../../services/integration/partner-locus.service';
import { AuthLocusGuard } from '../../../../shared/guards/auth-locus.guard';
import { LocusCreateTaskVm } from '../../models/partner/locus-task.vm';

@ApiUseTags('Integration Sicepat x Locus')
@Controller('integration')
@ApiBearerAuth()
export class PartnerLocusController {
  constructor() {}

  @Post('locus/createTask')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async createTask(@Body() payload: LocusCreateTaskVm) {
    return PartnerLocusService.createTask(payload);
  }

  @Post('locus/createBatchTask')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async createBatchTask(@Body() payload: LocusCreateTaskVm) {
    return PartnerLocusService.createBatchTask(payload);
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
