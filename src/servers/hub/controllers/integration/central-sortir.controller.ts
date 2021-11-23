import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CentralSortirListPayloadVm, CentralSortirPayloadVm } from '../../models/central-sortir-payload.vm';
import { CentralSortirService } from '../../services/integration/central-sortir.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@Controller('central/sortir')
export class CentralSortirController {

  @Post('queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async generatedMesinSortirReporting(@Body() payload: CentralSortirPayloadVm) {
    return CentralSortirService.generateReportingMesinSortir(payload);
  }

  @Post('queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @HttpCode(HttpStatus.OK)
  async getListMesinSortirReporting(@Body() body: CentralSortirListPayloadVm) {
    return CentralSortirService.getListMesinSortirReporting(body);
  }
}