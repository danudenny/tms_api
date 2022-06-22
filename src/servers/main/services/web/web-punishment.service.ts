import { Employee } from '../../../../shared/orm-entity/employee';
import { RequestErrorService } from '../../../../shared/services/request-error.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { PunishmentBranchListResponse } from '../../models/punishment-response.vm';
import { PunishmentBranchListPayload } from '../../models/punishment.vm';

export class WebPunishmentService {
  static async findEmployeeofBranch(payload : PunishmentBranchListPayload): Promise<PunishmentBranchListResponse> {
    const repo = new OrionRepositoryService(Employee, 't1');
    const q = repo.findAllRaw();
    q.selectRaw(
      ['t2.branch_code','branchCode'],
      ['t2.branch_id','branchId'],
      ['t2.branch_name','branchName'],
    );
    q.leftJoin(e => e.branch,'t2');
    q.andWhere(e => e.employeeId, w => w.equals(payload.employeeId));
    const data = await q.exec();
    if(data.length > 0){
      const result = new PunishmentBranchListResponse();
      result.branchCode = data[0].branchCode;
      result.branchId = data[0].branchId;
      result.branchName = data[0].branchName;
      return result;
    }else{
      RequestErrorService.throwObj({
        message: 'Data Karyawan tidak ditemukan',
      });
    }
    
  }
}