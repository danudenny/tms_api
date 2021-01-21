import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post, UseGuards, Res } from '@nestjs/common';
import {
    ApiBearerAuth, ApiOkResponse, ApiUseTags,
} from '../../../../../shared/external/nestjs-swagger';
import { ResponseSerializerOptions } from '../../../../../shared/decorators/response-serializer-options.decorator';
import { AuthenticatedGuard } from '../../../../../shared/guards/authenticated.guard';
import { BaseMetaPayloadVm } from '../../../../../shared/models/base-meta-payload.vm';
import { PermissionTokenGuard } from '../../../../../shared/guards/permission-token.guard';
import { 
  EmployeePenaltyListResponseVM, 
  EmployeePenaltyPayloadVm, 
  PenaltyEmployeeRoleNameListResponseVm,
  EmployeePenaltyFindAllResponseVm 
} from '../../../models/employee-penalty.vm';
import { PenaltyCategoryPayloadVm, PenaltyCategoryListResponseVm, PenaltyCategoryFeeListResponseVm } from '../../../models/penalty-category.vm';
import { EmployeePenaltyService } from '../../../services/web/v1/web-employee-penalty.service';
import { PenaltyCategoryService } from 'src/servers/main/services/web/v1/web-penalty-category.service';

@ApiUseTags('Web Employee Penalty')
@Controller('web/v1/employee/penalty')
@ApiBearerAuth()
export class EmployeePenalty {
  @Post('category/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PenaltyCategoryListResponseVm })
  public async getCategoryPenalty(@Body() payload: BaseMetaPayloadVm) {
    return EmployeePenaltyService.findPenaltyCategories(payload);
  }

  @Post('categories')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PenaltyCategoryListResponseVm })
  public async getCategoryPenalties(@Body() payload: BaseMetaPayloadVm) {
    return PenaltyCategoryService.findPenaltyCategories(payload);
  }

  @Post('category/fee/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PenaltyCategoryFeeListResponseVm })
  public async getCategoryPenaltyFee(@Body() payload: BaseMetaPayloadVm) {
    return PenaltyCategoryService.findPenaltyCategorieFeeList(payload);
  }

  @Post('category/create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async createCategory(@Body() payload: PenaltyCategoryPayloadVm) {
    return PenaltyCategoryService.createPenaltyCategory(payload);
  }

  @Post('category/edit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async editCategory(@Body() payload: PenaltyCategoryPayloadVm) {
    return PenaltyCategoryService.editPenaltyCategory(payload);
  }

  @Delete('category/delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteCategory(@Param('id') penaltyCategoryFeeId: string) {
    return PenaltyCategoryService.deletePenaltyCategory(penaltyCategoryFeeId);
  }

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: EmployeePenaltyListResponseVM })
  public async list(@Body() payload: BaseMetaPayloadVm) {
    return EmployeePenaltyService.findEmpolyeePenalties(payload);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async create(@Body() payload: EmployeePenaltyPayloadVm) {
    return EmployeePenaltyService.createEmployeePenalty(payload);
  }

  @Post('edit')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async edit(@Body() payload: EmployeePenaltyPayloadVm) {
    return EmployeePenaltyService.editEmployeePenalty(payload);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async delete(@Param('id') employeePenaltyId: string) {
    return EmployeePenaltyService.deleteEmployeePenalty(employeePenaltyId);
  }

  @Post('report/stream')
  @HttpCode(HttpStatus.OK)
  @ResponseSerializerOptions({ disable: true })
  public async awbCodFinanceDownload(
    @Body() payload: BaseMetaPayloadVm,
    @Res() outgoingHTTP,
  ) {
    return await EmployeePenaltyService.exportEmployeePenalty(
      payload,
      outgoingHTTP,
    );
  }

  @Post('role-name/list')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: PenaltyEmployeeRoleNameListResponseVm })
  public async getEmployeeRoleName(@Body() payload: BaseMetaPayloadVm) {
    return EmployeePenaltyService.findPenaltyEmployeeRoleName(payload);
  }

  @Post('/list-employee')
  @HttpCode(HttpStatus.OK)
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  @ApiOkResponse({ type: EmployeePenaltyFindAllResponseVm })
  public async findAllEmployee(@Body() payload: BaseMetaPayloadVm) {
    return EmployeePenaltyService.findAllEmployeePenaltyByRequest(payload);
  }
}