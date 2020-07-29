import {
    RolePodManualPayloadGetVm, RolePodManualPayloadStoreVm, RolePodManualPayloadPostVm,
  } from '../../models/role-pod-manual-payload.vm';
import { RolePodManualStatus } from '../../../../shared/orm-entity/role-pod-manual-status';
import { RolePodManualResponseVm, PodManualStatusResponseGetVm } from '../../models/role-pod-manual-response.vm';
import { getConnection, createQueryBuilder } from 'typeorm';
import { AuthService } from '../../../../shared/services/auth.service';

export class RolePodManual {
    static async getStatus(
      payload: RolePodManualPayloadGetVm,
    ) {
        const result = new  PodManualStatusResponseGetVm();
        const qb = createQueryBuilder();
        qb.addSelect('ssr.awb_status_id', 'awbStatusId');
        qb.addSelect('is_bulky', 'isBulky');
        qb.addSelect('awb.is_return', 'isReturn');
        qb.from('setting_status_role', 'ssr');
        qb.innerJoin(
          'awb_status',
          'awb',
          'awb.awb_status_id = ssr.awb_status_id AND ssr.is_deleted = false',
        );
        qb.andWhere('ssr.is_deleted = false');
        qb.andWhere(`ssr.role_id = '${payload.roleId}'`);
        const data = await qb.getRawMany();
        result.data = data.length === 0 ? [] : data;
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
