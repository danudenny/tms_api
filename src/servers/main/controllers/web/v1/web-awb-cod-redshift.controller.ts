import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiUseTags } from "../../../../../shared/external/nestjs-swagger";
import { AuthenticatedGuard } from "../../../../../shared/guards/authenticated.guard";
import { PermissionTokenGuard } from "../../../../../shared/guards/permission-token.guard";
import { BaseAwbCodDlvV2PayloadVm } from "../../../models/cod/web-awb-cod-payload.vm";
import { CodRedshiftService } from "../../../services/cod/cod-redshift.service";

@ApiUseTags('COD Redshift')
@Controller('web/v1/cod/rs')
@ApiBearerAuth()
export class WebAwbCodRedshiftController {

  constructor(
    private codRedshiftService: CodRedshiftService
  ){

  }

  @Get('awbDlvV2')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async getAwbDlvV2Redshit(
    @Query() payload: BaseAwbCodDlvV2PayloadVm
   ) {
    return this.codRedshiftService.getAwbCodDlvV2Redshift(payload);
  }

  @Get('countAwbDlvV2')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async getCountAwbDlvV2Redshit(
    @Query() payload: BaseAwbCodDlvV2PayloadVm
   ) {
    return this.codRedshiftService.getCountAwbCodDlvV2Redshift(payload);
  }

}