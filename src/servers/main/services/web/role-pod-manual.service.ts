import {
    RolePodManualPayloadGetVm, RolePodManualPayloadStoreVm, RolePodManualPayloadPostVm,
  } from '../../models/role-pod-manual-payload.vm';
import { AuthService } from 'src/shared/services/auth.service';
import { RolePodManualStatus } from '../../../../shared/orm-entity/role-pod-manual-status';
import { RolePodManualResponseVm, PodManualStatusResponseGetVm } from '../../models/role-pod-manual-response.vm';
import { getConnection } from 'typeorm';

export class RolePodManual {
    static async getStatus(
      payload: RolePodManualPayloadGetVm,
    ) {
        const result = new  PodManualStatusResponseGetVm();

        const db = await RolePodManualStatus.find({
            select: [
                'isBulky',
                'awbStatusId',
              ],
              where: {
                roleId: payload.roleId,
                isDeleted: false,
              },
        });
        result.data = db.length === 0 ? [] : db;
        result.message = 'Berhasil mengambil Data';
        result.status = 'success';
        return result;
    }
    static async postStatus(
      payload: RolePodManualPayloadPostVm,
    ) {
        const authMeta = AuthService.getAuthData();
        const result = new RolePodManualResponseVm();
        const deleteData = await getConnection()
        .createQueryBuilder()
        .delete()
        .from(RolePodManualStatus)
        .where(`role_id = ${payload.roleId}`, { roleId: payload.roleId })
        .execute();

        payload.data.forEach(async data => {
            const insertData = await RolePodManualStatus.create({
                roleId: payload.roleId  ,
                awbStatusId: data.awbStatusId,
                isBulky: data.isBulky,
                userIdCreated: authMeta.userId,
                userIdUpdated: authMeta.userId,
                createdTime: new Date(),
                updatedTime: new Date(),
              });
            const response = await RolePodManualStatus.save(insertData);
        });
        result.message = 'Berhasil Menyimpan data';
        result.status = 'success';
        return result;
    }
}
