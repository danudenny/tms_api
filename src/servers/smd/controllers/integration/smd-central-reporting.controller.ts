import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  GenerateQueueSmdBerangkatPayload, GenerateQueueSmdVendorPayload, GenerateQueueDaftarScanMasukGabungPaketPayload,
  ListCentralExportPayloadVm, GenerateQueueDaftarGsk,
} from '../../models/smd-central-reporting.payload.vm';
import { SmdCentralReportingService } from '../../services/integration/smd-central-reporting.service';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';

@Controller('smd/central/reporting')
export class SmdCentralReportingController {
  @Post('scanout/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async getListSmdBerangkatQueue(@Body() body: ListCentralExportPayloadVm) {
    return SmdCentralReportingService.getListQueueSmd(body, 'smd_berangkat');
  }

  @Post('scanout/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async generateQueueSmdBerangkat(@Body() body: GenerateQueueSmdBerangkatPayload) {
    return SmdCentralReportingService.generateQueueSmd(body, 'smd_berangkat');
  }

  @Post('scanin/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async getListSmdTibaQueue(@Body() body: ListCentralExportPayloadVm) {
    return SmdCentralReportingService.getListQueueSmd(body, 'smd_tiba');
  }

  @Post('scanin/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async generateQueueSmdTiba(@Body() body: GenerateQueueSmdBerangkatPayload) {
    return SmdCentralReportingService.generateQueueSmd(body, 'smd_tiba');
  }

  @Post('vendor/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async getListSmdVendorQueue(@Body() body: ListCentralExportPayloadVm) {
    return SmdCentralReportingService.getListQueueSmd(body, 'smd_vendor');
  }

  @Post('vendor/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async generateQueueSmdVendor(@Body() body: GenerateQueueSmdVendorPayload) {
    return SmdCentralReportingService.generateQueueSmd(body, 'smd_vendor');
  }

  @Post('branch/scanIn/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async getListSmdScanGabungPaketQueue(@Body() body: ListCentralExportPayloadVm) {
    return SmdCentralReportingService.getListQueueSmd(body, 'daftar_scan_masuk_gabung_paket');
  }

  @Post('branch/scanIn/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async generateQueueScanGabungPaket(@Body() body: GenerateQueueDaftarScanMasukGabungPaketPayload) {
    return SmdCentralReportingService.generateQueueSmd(body, 'daftar_scan_masuk_gabung_paket');
  }

  @Post('bag-city/queue/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async getListBagCityQueue(@Body() body: ListCentralExportPayloadVm) {
    return SmdCentralReportingService.getListQueueSmd(body, 'daftar_gsk');
  }

  @Post('bag-city/queue/generate')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  async generateQueueBagCity(@Body() body: GenerateQueueDaftarGsk) {
    return SmdCentralReportingService.generateQueueSmd(body, 'daftar_gsk');
  }
}
