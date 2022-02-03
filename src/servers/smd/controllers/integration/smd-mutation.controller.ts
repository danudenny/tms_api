import {
  Body,
  Controller,
  Post,
  UseGuards,
  Delete,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Transactional } from '../../../../shared/external/typeorm-transactional-cls-hooked/Transactional';
import { ApiUseTags } from '../../../../shared/external/nestjs-swagger';
import { PermissionTokenGuard } from '../../../../shared/guards/permission-token.guard';
import { AuthenticatedGuard } from '../../../../shared/guards/authenticated.guard';
import { DoMutationService } from '../../services/integration/do-mutation.service';
import {
  DoMutationPayloadVm,
  InsertDoMutationDetailPayloadVm,
  InsertDoMutationStatusPayloadVm,
} from '../../models/do-mutation.payload.vm';
import {
  DeleteDoMutationResponseVm,
  DoMutationBagStatusResponseVm,
  DoMutationResponseVm,
  GetDoMutationDetailResponseVm,
  GetDoMutationResponseVm,
  InsertDoMutationDetailResponseVm,
} from '../../models/do-mutation.response.vm';
import { ReportBaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';

@ApiUseTags('Line Haul Mutation')
@Controller('smd/mutation')
export class SmdMutationController {
  @Post('/')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async insertMutation(
    @Body() payload: DoMutationPayloadVm,
  ): Promise<DoMutationResponseVm> {
    return DoMutationService.insert(payload);
  }

  @Post('detail')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async insertMutationDetail(
    @Body() payload: InsertDoMutationDetailPayloadVm,
  ): Promise<InsertDoMutationDetailResponseVm> {
    return DoMutationService.insertDetail(payload);
  }

  @Post('status')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async insertBagStatus(
    @Body() payload: InsertDoMutationStatusPayloadVm,
  ): Promise<DoMutationBagStatusResponseVm> {
    return DoMutationService.insertBagStatus(payload.do_mutation_id);
  }

  @Delete(':id')
  @Transactional()
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async deleteMutation(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<DeleteDoMutationResponseVm> {
    return DoMutationService.delete(id);
  }

  @Post('/list')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async getMutationList(
    @Body() payload: ReportBaseMetaPayloadVm,
  ): Promise<GetDoMutationResponseVm> {
    payload.sortBy = payload.sortBy || 'created_time';
    payload.sortDir = payload.sortDir || 'desc';
    return DoMutationService.getList(payload);
  }

  @Post('/list/bag')
  @UseGuards(AuthenticatedGuard, PermissionTokenGuard)
  public async getMutationDetail(
    @Body() payload: ReportBaseMetaPayloadVm,
  ): Promise<GetDoMutationDetailResponseVm> {
    return DoMutationService.getDetail(payload);
  }
}
