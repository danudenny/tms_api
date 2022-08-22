import { Body, Controller, Post, Req, UseGuards, HttpCode, HttpStatus, Param } from '@nestjs/common';
import { ScaninSmdService } from '../../services/integration/scanin-smd.service';
// import { Partner } from '../../../../shared/orm-entity/partner';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags, ApiOkResponse, ApiBearerAuth } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import {MasterDataService} from '../../services/integration/masterdata.service';
import {DoSmdStatusResponseVm, MappingDoSmdResponseVm, MappingVendorResponseVm} from '../../models/mapping-do-smd.response.vm';

@ApiUseTags('MASTER DATA')
@Controller('smd/masterdata')
export class MasterDataController {
  constructor() {}

  @Post('doSmd/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MappingDoSmdResponseVm })
  public async mappingDoSMD(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return MasterDataService.mappingDoSMD(payload);
  }

  @Post('doSmd/list/:branchId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MappingDoSmdResponseVm })
  public async findAllEmployeeBranch(
    @Param('branchId') branchId: string,
    @Body() payload: BaseMetaPayloadVm,
  ) {
    return MasterDataService.findAllDoSmdByRequestBranch(
      payload,
      branchId,
    );
  }

  @Post('vendor/list')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: MappingVendorResponseVm })
  public async mappingVendor(@Req() request: any, @Body() payload: BaseMetaPayloadVm) {
    return MasterDataService.mappingVendor(payload);
  }

  @Post('doSmd/status/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard)
  @ApiOkResponse({ type: DoSmdStatusResponseVm })
  public async getDoSmdStatus(
    @Body() payload: BaseMetaPayloadVm,
  ): Promise<DoSmdStatusResponseVm> {
    return MasterDataService.getDoSmdStatus(payload);
  }
}
