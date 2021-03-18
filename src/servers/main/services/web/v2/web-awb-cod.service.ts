// #region import
import { getConnection, getManager } from 'typeorm';

import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AWB_STATUS } from '../../../../../shared/constants/awb-status.constant';
import { AwbItemAttr } from '../../../../../shared/orm-entity/awb-item-attr';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { CodTransaction } from '../../../../../shared/orm-entity/cod-transaction';
import { User } from '../../../../../shared/orm-entity/user';
import { AuthService } from '../../../../../shared/services/auth.service';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import {
  WebCodAwbPayloadVm,
  WebCodFirstTransactionPayloadVm,
  WebCodTransferPayloadVm,
  WebCodNominalUpdatePayloadVm,
  WebCodNominalCheckPayloadVm,
} from '../../../models/cod/web-awb-cod-payload.vm';
import {
  PrintCodTransferBranchVm,
  WebCodAwbPrintVm,
  WebCodPrintMetaVm,
  WebCodTransferBranchResponseVm,
  WebCodTransferBranchCashResponseVm,
  WebCodTransferBranchCashlessResponseVm,
  WebCodNominalUpdateResponseVm,
  WebCodNominalCheckResponseVm,
} from '../../../models/cod/web-awb-cod-response.vm';
import { PrintByStoreService } from '../../print-by-store.service';

import moment = require('moment');
import { TRANSACTION_STATUS } from '../../../../../shared/constants/transaction-status.constant';
import { RedisService } from '../../../../../shared/services/redis.service';
import { AuthLoginMetadata } from '../../../../../shared/models/auth-login-metadata.model';
import { JwtPermissionTokenPayload } from '../../../../../shared/interfaces/jwt-payload.interface';
import { CodTransactionDetail } from '../../../../../shared/orm-entity/cod-transaction-detail';
import { CodTransactionHistory } from '../../../../../shared/orm-entity/cod-transaction-history';
import { CodTransferTransactionQueueService } from '../../../../queue/services/cod/cod-transfer-transaction-queue.service';
// #endregion
import { AttachmentService } from '../../../../../shared/services/attachment.service';
import { Awb } from '../../../../../shared/orm-entity/awb';
import { CodPayment } from '../../../../../shared/orm-entity/cod-payment';
import { CodAwbRevision } from '../../../../../shared/orm-entity/cod-awb-revision';

export class V2WebAwbCodService {
  static async transferBranch(
    payload: WebCodTransferPayloadVm,
  ): Promise<WebCodTransferBranchResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const uuidv1 = require('uuid/v1');
    const uuidString = uuidv1();

    let codTransactionCash: WebCodTransferBranchCashResponseVm;
    if (payload.dataCash.length > 0) {
      codTransactionCash = await this.transferBranchCash(
        payload,
        authMeta,
        permissonPayload,
        uuidString,
      );
    }

    let codTransactionCashless: WebCodTransferBranchCashlessResponseVm;
    if (payload.dataCashless.length) {
      codTransactionCashless = await this.transferBranchCashless(
        payload,
        authMeta,
        permissonPayload,
        uuidString,
      );
    }

    const printIdCash = codTransactionCash
      ? codTransactionCash.printIdCash
      : null;
    const printIdCashless = codTransactionCashless
      ? codTransactionCashless.printIdCashless
      : null;

    let dataError = [];
    if (codTransactionCash && codTransactionCashless) {
      dataError = codTransactionCash.dataError.concat(
        codTransactionCashless.dataError,
      );
    } else if (codTransactionCash) {
      dataError = codTransactionCash.dataError;
    } else if (codTransactionCashless) {
      dataError = codTransactionCashless.dataError;
    }

    const result = new WebCodTransferBranchResponseVm();
    result.printIdCash = printIdCash;
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }

  static async nominalCheck(
    payload: WebCodNominalCheckPayloadVm,
  ): Promise<WebCodNominalCheckResponseVm> {
    let awb: Awb;
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      awb = await getConnection()
        .createQueryBuilder(Awb, 'awb')
        .setQueryRunner(masterQueryRunner)
        .where(
          'awb.awbNumber = :awbNumber AND awb.isCod = true AND awb.isDeleted = false',
          {
            awbNumber: payload.awbNumber,
          },
        )
        .getOne();
    } finally {
      await masterQueryRunner.release();
    }
    const totalCodValue = parseFloat(awb.totalCodValue.toString()).toFixed();
    const result = new WebCodNominalCheckResponseVm();
    if (Number(totalCodValue) !== payload.nominal) {
      result.message = 'Nominal COD tidak sama';
      result.status = true;
    } else {
      throw new BadRequestException(
        'Nominal COD sama, tidak dapat melakukan update!',
      );
    }
    return result;
  }

  static async nominalUpdate(
    payload: WebCodNominalUpdatePayloadVm,
    file,
  ): Promise<WebCodNominalUpdateResponseVm> {
    const authMeta = AuthService.getAuthData();

    if (payload.nominal < 0 || payload.nominal.toString().length > 9) {
      throw new BadRequestException('Nominal tidak sesuai!');
    }

    let awbItemAttr: AwbItemAttr;
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      awbItemAttr = await getConnection()
        .createQueryBuilder(AwbItemAttr, 'aia')
        .setQueryRunner(masterQueryRunner)
        .where(
          'aia.awbNumber = :awbNumber AND aia.awbStatusIdFinal = :awbStatusIdFinal AND aia.isDeleted = false',
          {
            awbNumber: payload.awbNumber,
            awbStatusIdFinal: AWB_STATUS.DLV,
          },
        )
        .getOne();
    } finally {
      await masterQueryRunner.release();
    }

    if (!awbItemAttr) {
      throw new BadRequestException('Resi tidak ditemukan!');
    }

    let codPayment: CodPayment;
    const masterCodPaymentQueryRunner = getConnection().createQueryRunner(
      'master',
    );
    try {
      codPayment = await getConnection()
        .createQueryBuilder(CodPayment, 'cp')
        .setQueryRunner(masterCodPaymentQueryRunner)
        .where('cp.awbNumber = :awbNumber AND cp.isDeleted = false', {
          awbNumber: payload.awbNumber,
        })
        .getOne();
    } finally {
      await masterCodPaymentQueryRunner.release();
    }

    if (!codPayment) {
      throw new BadRequestException('Resi tidak ditemukan!');
    }

    try {
      // upload file to aws s3
      if (file) {
        if (
          file.mimetype !== 'application/pdf' ||
          file.originalname.split('.')[0] !== payload.awbNumber
        ) {
          throw new BadRequestException(
            'Format file tidak sesuai, upload file dengan format pdf dan sesuai dengan nomor resi!',
          );
        }

        const uuidv1 = require('uuid/v1');
        const uuidString = uuidv1();
        const attachment = await AttachmentService.uploadFileBufferToS3(
          file.buffer,
          uuidString,
          file.mimetype,
          'update-nominal-cod',
        );
        if (attachment) {
          // update data table awb, total_cod_value set params new cod value where awb_number and is_deleted = false
          await getManager().transaction(async transactionManager => {
            await transactionManager.update(
              Awb,
              {
                awbNumber: payload.awbNumber,
                isDeleted: false,
              },
              {
                totalCodValue: Number(payload.nominal),
              },
            );

            // update data table cod_payment, cod_value set params new cod value where awb_number and is_deleted = false
            await transactionManager.update(
              CodPayment,
              {
                awbNumber: payload.awbNumber,
                isDeleted: false,
              },
              {
                codValue: Number(payload.nominal),
              },
            );

            if (awbItemAttr.transactionStatusId) {
              // find one data table cod_transaction_detail, get data cod_value
              let transactionDetail: CodTransactionDetail;
              const masterTransactionDetailQueryRunner = getConnection().createQueryRunner(
                'master',
              );
              try {
                transactionDetail = await getConnection()
                  .createQueryBuilder(CodTransactionDetail, 'ctd')
                  .setQueryRunner(masterTransactionDetailQueryRunner)
                  .where(
                    'ctd.awbNumber = :awbNumber AND ctd.isDeleted = false',
                    {
                      awbNumber: payload.awbNumber,
                    },
                  )
                  .getOne();
              } finally {
                await masterTransactionDetailQueryRunner.release();
              }

              // find one data table cod_transaction, get data total_cod_value
              let transaction: CodTransaction;
              const masterTransactionQueryRunner = getConnection().createQueryRunner(
                'master',
              );
              try {
                transaction = await getConnection()
                  .createQueryBuilder(CodTransaction, 'ct')
                  .setQueryRunner(masterTransactionQueryRunner)
                  .where(
                    'ct.codTransactionId = :codTransactionId AND ct.isDeleted = false',
                    {
                      codTransactionId: transactionDetail.codTransactionId,
                    },
                  )
                  .getOne();
              } finally {
                await masterTransactionQueryRunner.release();
              }

              // update data table cod_transaction, total_cod_value - cod_value + params cod_value where cod_transaction_id
              await transactionManager.update(
                CodTransaction,
                {
                  codTransactionId: transactionDetail.codTransactionId,
                  isDeleted: false,
                },
                {
                  totalCodValue:
                    Number(transaction.totalCodValue) -
                    Number(transactionDetail.codValue) +
                    Number(payload.nominal),
                },
              );

              // update data table cod_transaction_detail, cod_value where awb_number and is_deleted = false
              await transactionManager.update(
                CodTransactionDetail,
                {
                  awbNumber: payload.awbNumber,
                  isDeleted: false,
                },
                {
                  codValue: Number(payload.nominal),
                },
              );
            }

            await transactionManager.insert(CodAwbRevision, {
              awbId: awbItemAttr.awbId,
              awbItemId: awbItemAttr.awbItemId,
              awbNumber: payload.awbNumber,
              codValueCurrent: payload.nominal,
              codValue: codPayment.codValue,
              attachmentId: attachment.attachmentTmsId,
              userIdCreated: authMeta.userId,
              createdTime: moment().toDate(),
              requestUserId: payload.requestUser,
            });
          });

          const result = new WebCodNominalUpdateResponseVm();
          result.message = 'Nominal COD berhasil diupdate';
          result.status = true;
          return result;
        } else {
          throw new BadRequestException(
            'Gagal upload form attachment, coba ulangi lagi!',
          );
        }
      } else {
        throw new BadRequestException('Harap upload form attachment!');
      }
    } catch (error) {
      throw new ServiceUnavailableException(error.message);
    }
  }

  // func private ==============================================================
  private static async handleAwbCod(
    item: WebCodAwbPayloadVm,
    transactiontId: string,
    branchId: number,
    userId: number,
  ): Promise<boolean> {
    try {
      // update awb_item_attr transaction status 31000
      await getManager().transaction(async transactionManager => {
        await transactionManager.update(
          AwbItemAttr,
          {
            awbItemId: item.awbItemId,
          },
          {
            transactionStatusId: TRANSACTION_STATUS.TRM,
          },
        );

        // Validasi in cod_transaction_detail before insert
        let dataTransactionDetail: CodTransactionDetail;
        const masterQueryRunner = getConnection().createQueryRunner('master');
        try {
          dataTransactionDetail = await getConnection()
            .createQueryBuilder(CodTransactionDetail, 'ctd')
            .setQueryRunner(masterQueryRunner)
            .where('ctd.awbItemId = :awbItemId AND ctd.isDeleted = false', {
              awbItemId: item.awbItemId,
            })
            .getOne();
        } finally {
          await masterQueryRunner.release();
        }

        if (!dataTransactionDetail) {
          await transactionManager.insert(CodTransactionDetail, {
            codTransactionId: transactiontId,
            transactionStatusId: TRANSACTION_STATUS.TRM,
            awbItemId: item.awbItemId,
            awbNumber: item.awbNumber,
            podDate: moment().toDate(),
            paymentMethod: item.paymentMethod,
            branchId: Number(branchId),
            userIdDriver: Number(item.userIdDriver),
            currentPositionId: Number(branchId),
            consigneeName: 'Admin',
            partnerId: 0,
            userIdCreated: Number(userId),
            createdTime: moment().toDate(),
            userIdUpdated: Number(userId),
            updatedTime: moment().toDate(),
            paymentService: item.paymentService,
            noReference: item.noReference,
            codValue: item.codValue,
          });
        }

        // #region create transaction history
        await transactionManager.insert(CodTransactionHistory, {
          awbItemId: item.awbItemId,
          awbNumber: item.awbNumber,
          transactionDate: moment()
            .add(-1, 'minute')
            .toDate(),
          transactionStatusId: TRANSACTION_STATUS.SIGESIT,
          branchId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
        });

        await transactionManager.insert(CodTransactionHistory, {
          awbItemId: item.awbItemId,
          awbNumber: item.awbNumber,
          transactionDate: moment().toDate(),
          transactionStatusId: TRANSACTION_STATUS.TRM,
          branchId,
          userIdCreated: userId,
          userIdUpdated: userId,
          createdTime: moment().toDate(),
          updatedTime: moment().toDate(),
        });
        // #endregion transaction history
      }); // end transaction

      // #region send to background process with bull
      const firstTransaction = new WebCodFirstTransactionPayloadVm();
      firstTransaction.awbItemId = item.awbItemId;
      firstTransaction.awbNumber = item.awbNumber;
      (firstTransaction.transactionStatusId = TRANSACTION_STATUS.TRM),
        (firstTransaction.codTransactionId = transactiontId);
      firstTransaction.supplierInvoiceStatusId = null;
      firstTransaction.codSupplierInvoiceId = null;
      firstTransaction.paymentService = item.paymentService;
      firstTransaction.noReference = item.noReference;
      firstTransaction.userId = userId;

      CodTransferTransactionQueueService.perform(
        firstTransaction,
        moment().toDate(),
      );
      // #endregion send to background

      return true;
    } catch (err) {
      console.error('HandleAwb error: ', err);
      return false;
    }
  }

  private static async validStatusAwb(
    awbItemId: number,
    type: string,
  ): Promise<boolean> {
    // check awb status mush valid dlv
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      const awbValid = await getConnection()
        .createQueryBuilder(AwbItemAttr, 'aia')
        .setQueryRunner(masterQueryRunner)
        .select([
          'aia.awbItemAttrId',
          'aia.awbItemId',
          'aia.awbStatusIdFinal',
          'aia.transactionStatusId',
        ])
        .where(
          'aia.awbItemId = :awbItemId AND aia.awbStatusIdFinal = :awbStatusIdFinal AND aia.isDeleted = false',
          { awbItemId, awbStatusIdFinal: AWB_STATUS.DLV },
        )
        .getOne();

      if (
        (type === 'cash' && awbValid && !awbValid.transactionStatusId) ||
        (type === 'cashless' && awbValid)
      ) {
        return true;
      } else {
        return false;
      }
    } finally {
      await masterQueryRunner.release();
    }
  }

  // handle data store for printing
  private static async generatePrintMeta(
    transactionCode: string,
    adminName: string,
    nikAdmin: string,
    branchId: number,
    userIdDriver: number,
    transactionDate?: Date,
  ): Promise<WebCodPrintMetaVm> {
    // handle transactionDate
    const timestamp = transactionDate ? moment(transactionDate) : moment();
    const result = new WebCodPrintMetaVm();

    result.transactionCode = transactionCode;
    result.transactionDate = timestamp.format('DD/MM/YY');
    result.transactionTime = timestamp.format('HH:mm');
    result.adminName = adminName;
    result.nikAdmin = nikAdmin;

    const branch = await Branch.findOne({
      select: ['branchId', 'branchName'],
      where: {
        branchId,
        isDeleted: false,
      },
    });

    if (!branch) {
      throw new BadRequestException('Gerai tidak ditemukan!');
    }

    const user = await User.findOne({
      select: ['userId', 'employeeId', 'firstName', 'username'],
      where: {
        userId: userIdDriver,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new BadRequestException('User tidak ditemukan!');
    }
    // for data print store
    result.branchName = branch.branchName;
    result.driverName = user.firstName;
    result.nikDriver = user.username;
    return result;
  }

  private static async printStoreData(
    metaPrint: WebCodPrintMetaVm,
    codTransactionId: string,
    data: WebCodAwbPrintVm[],
    totalValue: number,
    type: string,
  ): Promise<string> {
    metaPrint.totalCodValue = totalValue;
    metaPrint.totalItems = data.length;
    const storePrint = new PrintCodTransferBranchVm();

    storePrint.meta = metaPrint;
    storePrint.data = data;
    // store redis
    const printId = `${codTransactionId}--${type}`;
    await PrintByStoreService.storeGenericPrintData(
      'cod-transfer-branch',
      printId,
      storePrint,
    );
    return printId;
  }

  private static async transferBranchCash(
    payload: WebCodTransferPayloadVm,
    authMeta: AuthLoginMetadata,
    permissonPayload: JwtPermissionTokenPayload,
    uuidString: string,
  ): Promise<WebCodTransferBranchCashResponseVm> {
    const timestamp = moment().toDate();
    let totalCodValueCash = 0;
    let printIdCash: string;

    const dataPrintCash: WebCodAwbPrintVm[] = [];
    const dataError = [];

    // #region data cash [optional]
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    const userIdDriver = payload.userIdDriver;
    const metaPrint = await this.generatePrintMeta(
      randomCode,
      authMeta.displayName,
      authMeta.username,
      permissonPayload.branchId,
      userIdDriver,
    );

    for (const item of payload.dataCash) {
      // handle race condition
      const redlock = await RedisService.redlock(
        `redlock:transaction:${item.awbNumber}`,
        10,
      );
      if (redlock) {
        const awbValid = await this.validStatusAwb(item.awbItemId, 'cash');
        if (awbValid) {
          // send to background process
          const handleData = await this.handleAwbCod(
            item,
            uuidString,
            permissonPayload.branchId,
            authMeta.userId,
          );
          if (handleData) {
            totalCodValueCash += Number(item.codValue);
            dataPrintCash.push({
              awbNumber: item.awbNumber,
              codValue: item.codValue,
              provider: item.paymentService,
            });
          } else {
            dataError.push(`resi ${item.awbNumber}, mohon di coba lagi!`);
          }
        } else {
          const errorMessage = `status resi ${
            item.awbNumber
          } tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } else {
        dataError.push(`resi ${item.awbNumber} sedang di proses!!`);
      }
    } // end of loop data cash

    if (dataPrintCash.length) {
      // insert data to cod_transaction
      const codBranchCash = new CodTransaction();
      codBranchCash.codTransactionId = uuidString;
      codBranchCash.transactionCode = randomCode;
      codBranchCash.transactionDate = timestamp;
      codBranchCash.transactionStatusId = TRANSACTION_STATUS.TRM;
      codBranchCash.transactionType = 'CASH';
      codBranchCash.totalCodValue = totalCodValueCash;
      codBranchCash.totalAwb = dataPrintCash.length;
      codBranchCash.branchId = permissonPayload.branchId;
      codBranchCash.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCash);

      // store data print cash on redis
      printIdCash = await this.printStoreData(
        metaPrint,
        uuidString,
        dataPrintCash,
        totalCodValueCash,
        'cash',
      );
    }
    // #endregion data cash

    const result = new WebCodTransferBranchCashResponseVm();
    result.printIdCash = printIdCash;
    result.dataError = dataError;
    return result;
  }

  private static async transferBranchCashless(
    payload: WebCodTransferPayloadVm,
    authMeta: AuthLoginMetadata,
    permissonPayload: JwtPermissionTokenPayload,
    uuidString: string,
  ): Promise<WebCodTransferBranchCashlessResponseVm> {
    const timestamp = moment().toDate();
    let totalCodValueCashless = 0;
    let printIdCashless: string;

    const dataPrintCashless: WebCodAwbPrintVm[] = [];
    const dataError = [];

    // #region data cashless [optional]
    const randomCode = await CustomCounterCode.transactionCodBranch(timestamp);
    const userIdDriver = payload.userIdDriver;
    const metaPrint = await this.generatePrintMeta(
      randomCode,
      authMeta.displayName,
      authMeta.username,
      permissonPayload.branchId,
      userIdDriver,
    );

    for (const item of payload.dataCashless) {
      // handle race condition
      const redlock = await RedisService.redlock(
        `redlock:transaction:${item.awbNumber}`,
        10,
      );
      if (redlock) {
        const awbValid = await this.validStatusAwb(item.awbItemId, 'cashless');
        if (awbValid) {
          const handleData = await this.handleAwbCod(
            item,
            uuidString,
            permissonPayload.branchId,
            authMeta.userId,
          );

          if (handleData) {
            totalCodValueCashless += Number(item.codValue);
            dataPrintCashless.push({
              awbNumber: item.awbNumber,
              codValue: item.codValue,
              provider: item.paymentService,
            });
          } else {
            dataError.push(`resi ${item.awbNumber}, mohon di coba lagi!`);
          }
        } else {
          // NOTE: error message
          const errorMessage = `status resi ${
            item.awbNumber
          } tidak valid, mohon di cek ulang!`;
          dataError.push(errorMessage);
        }
      } else {
        dataError.push(`resi ${item.awbNumber} sedang d proses!!`);
      }
    } // end of loop data cashless

    if (dataPrintCashless.length) {
      // insert data to cod_transaction
      const codBranchCashless = new CodTransaction();
      codBranchCashless.codTransactionId = uuidString;
      codBranchCashless.transactionCode = randomCode;
      codBranchCashless.transactionDate = timestamp;
      codBranchCashless.transactionStatusId = TRANSACTION_STATUS.TRF;
      codBranchCashless.transactionType = 'CASHLESS';
      codBranchCashless.totalCodValue = totalCodValueCashless;
      codBranchCashless.totalAwb = dataPrintCashless.length;
      codBranchCashless.branchId = permissonPayload.branchId;
      codBranchCashless.userIdDriver = payload.userIdDriver;
      await CodTransaction.save(codBranchCashless);

      // store data print cashless on redis
      printIdCashless = await this.printStoreData(
        metaPrint,
        uuidString,
        dataPrintCashless,
        totalCodValueCashless,
        'cashless',
      );
    }
    // end of check data cashless
    // #endregion data cashless

    const result = new WebCodTransferBranchCashlessResponseVm();
    result.printIdCashless = printIdCashless;
    result.dataError = dataError;
    return result;
  }
}
