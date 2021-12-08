import { EntityManager, getManager } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { CodPayment } from '../../../../shared/orm-entity/cod-payment';
import { PinoLoggerService } from '../../../../shared/services/pino-logger.service';
import moment = require('moment');

export class AwbCodService {
  constructor() {}

  public static async transfer(
    payment: {
      doPodDeliverDetailId: string;
      awbNumber: string;
      awbItemId: number;
      amount: number;
      method: string;
      service: string;
      noReference: string;
      note: string;
    },
    branchId: number,
    userId: number,
    manager: EntityManager,
  ): Promise<void> {
    // Transfer amount should do in db transaction mode
    // we asume if there is `manager` it's mean has transaction
    // otherwise, should initialize db transaction.
    // TODO: add Row Locking when updating data for data consistency.
    const awbCod = new AwbCodService();
    if (manager) {
      await awbCod.doTransfer(payment, branchId, userId, manager);
    } else {
      PinoLoggerService.log(' COD MANUAL :: ', payment);
      await getManager().transaction(async newManager => {
        await awbCod.doTransfer(payment, branchId, userId, newManager);
      });
    }
  }

  private async doTransfer(
    payment: {
      doPodDeliverDetailId: string;
      awbNumber: string;
      awbItemId: number;
      amount: number;
      method: string;
      service: string;
      noReference: string;
      note: string;
    },
    branchId: number,
    userId: number,
    manager: EntityManager,
  ): Promise<boolean> {
    const timeNow = moment().toDate();
    try {
      const codPayment = await manager.findOne(CodPayment, {
        where: {
          awbItemId: payment.awbItemId,
          isDeleted: false,
        },
      });
      if (codPayment) {
        // update data
        await manager.update(
          CodPayment,
          {
            codPaymentId: codPayment.codPaymentId,
          },
          {
            codValue: payment.amount,
            codPaymentMethod: payment.method,
            codPaymentService: payment.service,
            note: payment.note,
            noReference: payment.noReference,
            branchId,
            userIdDriver: userId,
            userIdUpdated: userId,
            updatedTime: timeNow,
          },
        );
      } else {
        // TODO: add init transaction_status_id = TRANSACTION_STATUS.SIGESIT
        await manager.insert(CodPayment, {
          awbNumber: payment.awbNumber,
          awbItemId: payment.awbItemId,
          codValue: payment.amount,
          codPaymentMethod: payment.method,
          codPaymentService: payment.service,
          note: payment.note,
          noReference: payment.noReference,
          doPodDeliverDetailId: payment.doPodDeliverDetailId,
          branchId,
          userIdDriver: userId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: timeNow,
          updatedTime: timeNow,
        });
      }
      return true;
    } catch (error) {
      throw new BadRequestException(`Terjadi Kesalahan, Coba lagi!`);
    }
  }
}
