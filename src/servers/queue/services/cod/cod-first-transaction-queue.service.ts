import { getConnection } from 'typeorm';
import { QueueBullBoard } from '../queue-bull-board';
import { ConfigService } from '../../../../shared/services/config.service';
import { AwbTransactionDetailVm } from '../../../main/models/cod/web-awb-cod-response.vm';
import { CodTransactionDetail } from '../../../../shared/orm-entity/cod-transaction-detail';
import { User } from '../../../../shared/orm-entity/user';
import { CodTransactionHistory } from '../../../../shared/orm-entity/cod-transaction-history';
import { WebCodFirstTransactionPayloadVm } from '../../../main/models/cod/web-awb-cod-payload.vm';
import { MongoDbConfig } from '../../config/database/mongodb.config';
import moment = require('moment');
import { AWB_STATUS } from '../../../../shared/constants/awb-status.constant';
import { TRANSACTION_STATUS } from '../../../../shared/constants/transaction-status.constant';

// DOC: https://optimalbits.github.io/bull/

export class CodFirstTransactionQueueService {
  public static queue = QueueBullBoard.createQueue.add(
    'cod-first-transaction-queue',
    {
      defaultJobOptions: {
        timeout: 0,
        attempts: Math.round(
          (+ConfigService.get('queue.doPodDetailPostMeta.keepRetryInHours') *
            60 *
            60 *
            1000) /
            +ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
        ),
        backoff: {
          type: 'fixed',
          delay: ConfigService.get('queue.doPodDetailPostMeta.retryDelayMs'),
        },
      },
      limiter: {
        max: 1000,
        duration: 5000, // on seconds
      },
    },
  );

  public static boot() {
    // NOTE: Concurrency defaults to 1 if not specified.
    this.queue.process(async job => {
      const data = job.data;
      let isValidData = true;
      // let isNewData = false;

      console.log('#### JOB ID  ::: ', job.id);
      console.log(
        '##################### SYNC DATA AWB NUMBER ::: ',
        data.awbNumber,
      );

      let transactionDetail: CodTransactionDetail;
      const masterTransactionDetailQueryRunner = getConnection().createQueryRunner(
        'master',
      );
      try {
        transactionDetail = await getConnection()
          .createQueryBuilder(CodTransactionDetail, 'ctd')
          .setQueryRunner(masterTransactionDetailQueryRunner)
          .where('ctd.awbItemId = :awbItemId AND ctd.isDeleted = false', {
            awbItemId: data.awbItemId,
          })
          .getOne();
      } finally {
        await masterTransactionDetailQueryRunner.release();
      }

      // Handle first awb scan
      // only transaction
      if (transactionDetail && data.codTransactionId) {
        await CodTransactionDetail.update(
          {
            awbItemId: data.awbItemId,
          },
          {
            codTransactionId: data.codTransactionId,
            transactionStatusId: data.transactionStatusId,
            updatedTime: data.timestamp,
          },
        );
      } else {
        const codDetail = await this.dataTransaction(data.awbItemId);
        if (codDetail) {
          // manipulation data
          const weightRounded =
            codDetail.weightRealRounded > 0
              ? codDetail.weightRealRounded
              : codDetail.weightFinalRounded;
          const percentFee = 1; // set on config COD
          const codFee = (Number(codDetail.codValue) * percentFee) / 100;
          // Create data Cod Transaction Detail
          const transactionStatusId = data.transactionStatusId
            ? Number(data.transactionStatusId)
            : TRANSACTION_STATUS.TRM;
          const supplierInvoiceStatusId = data.supplierInvoiceStatusId
            ? Number(data.supplierInvoiceStatusId)
            : null;
          const newTransactionDetail = CodTransactionDetail.create({
            codTransactionId: data.codTransactionId,
            transactionStatusId,
            supplierInvoiceStatusId,
            codSupplierInvoiceId: data.codSupplierInvoiceId,
            branchId: Number(data.branchId),
            userIdDriver: Number(data.userIdDriver),

            paymentMethod: data.paymentMethod,
            paymentService: data.paymentService,
            noReference: data.noReference,

            awbItemId: Number(codDetail.awbItemId),
            awbNumber: codDetail.awbNumber,
            awbDate: codDetail.awbDate,
            podDate: codDetail.podDate,
            codValue: codDetail.codValue,
            parcelValue: codDetail.parcelValue,
            weightRounded,
            codFee,
            pickupSourceId: codDetail.pickupSourceId,
            pickupSource: codDetail.pickupSource,
            currentPositionId: codDetail.currentPositionId,
            currentPosition: codDetail.currentPosition,
            destinationCode: codDetail.destinationCode,
            destinationId: codDetail.destinationId,
            destination: codDetail.destination,

            consigneeName: codDetail.consigneeName,
            partnerId: codDetail.partnerId,
            partnerName: codDetail.partnerName,
            custPackage: codDetail.custPackage,
            packageTypeId: Number(codDetail.packageTypeId),
            packageTypeCode: codDetail.packageTypeCode,
            packageType: codDetail.packageTypeName,
            parcelContent: codDetail.parcelContent,
            parcelNote: codDetail.parcelNote,
            userIdCreated: Number(data.userId),
            userIdUpdated: Number(data.userId),
            createdTime: moment(data.timestamp).toDate(),
            updatedTime: moment(data.timestamp).toDate(),
          });
          transactionDetail = await CodTransactionDetail.save(
            newTransactionDetail,
          );
          // isNewData = true; // flag for insert data mongo
          // sync first data to mongo
          const newMongo = await this.insertMongo(transactionDetail);
          console.log(' ############ NEW DATA MONGO :: ', newMongo);
        } else {
          isValidData = false;
          console.error('## Data COD Transaction :: Not Found !!! :: ', data);
        }
      }

      // transaction history
      if (isValidData) {
        if (data.supplierInvoiceStatusId) {
          // supplier invoice status
          const historyInvoice = CodTransactionHistory.create({
            awbItemId: data.awbItemId,
            awbNumber: data.awbNumber,
            transactionDate: data.timestamp,
            transactionStatusId: data.supplierInvoiceStatusId,
            branchId: data.branchId,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await CodTransactionHistory.insert(historyInvoice);
        } else {
          // create transaction history
          const historyDriver = CodTransactionHistory.create({
            awbItemId: data.awbItemId,
            awbNumber: data.awbNumber,
            transactionDate: moment(data.timestamp)
              .add(-1, 'minute')
              .toDate(),
            transactionStatusId: TRANSACTION_STATUS.SIGESIT,
            branchId: data.branchId,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await CodTransactionHistory.insert(historyDriver);

          const historyBranch = CodTransactionHistory.create({
            awbItemId: data.awbItemId,
            awbNumber: data.awbNumber,
            transactionDate: data.timestamp,
            transactionStatusId: TRANSACTION_STATUS.TRM,
            branchId: data.branchId,
            userIdCreated: data.userId,
            userIdUpdated: data.userId,
            createdTime: data.timestamp,
            updatedTime: data.timestamp,
          });
          await CodTransactionHistory.insert(historyBranch);
        }
      }

      // console.log(' ### SYNC DATA MONGO :: NEW DATA ', isNewData);
      // if (isNewData) {
      //   // sync first data to mongo
      //   // const newMongo = await this.insertMongo(transactionDetail);
      //   CodSyncTransactionQueueService.perform(
      //     data.awbNumber,
      //     data.timestamp,
      //   );
      // }
      return true;
    });

    this.queue.on('completed', () => {
      // cleans all jobs that completed over 5 seconds ago.
      this.queue.clean(5000);
    });

    this.queue.on('cleaned', function(job, type) {
      console.log('Cleaned %s %s jobs', job.length, type);
    });
  }

  public static async perform(
    params: WebCodFirstTransactionPayloadVm,
    timestamp: Date,
  ) {
    // mapping object
    const obj = {
      awbItemId: params.awbItemId,
      awbNumber: params.awbNumber,
      codTransactionId: params.codTransactionId,
      transactionStatusId: params.transactionStatusId,
      supplierInvoiceStatusId: params.supplierInvoiceStatusId,
      codSupplierInvoiceId: params.codSupplierInvoiceId,
      paymentMethod: params.paymentMethod,
      paymentService: params.paymentService,
      noReference: params.noReference,
      branchId: params.branchId,
      userId: params.userId,
      userIdDriver: params.userIdDriver,
      timestamp,
    };

    return CodFirstTransactionQueueService.queue.add(obj);
  }

  private static async dataTransaction(
    awbItemId: number,
  ): Promise<AwbTransactionDetailVm> {
    let results: AwbTransactionDetailVm;
    const masterQueryRunner = getConnection().createQueryRunner('master');
    try {
      const qb = await getConnection()
        .createQueryBuilder()
        .setQueryRunner(masterQueryRunner);

      qb.addSelect('t1.awb_item_id', 'awbItemId');
      qb.addSelect('t1.awb_number', 'awbNumber');
      qb.addSelect('t10.branch_id', 'currentPositionId');
      qb.addSelect('t7.branch_name', 'currentPosition');
      qb.addSelect('t1.awb_history_date_last', 'podDate');
      qb.addSelect('t2.awb_date', 'awbDate');
      qb.addSelect('t2.ref_destination_code', 'destinationCode');
      qb.addSelect('t2.to_id', 'destinationId');
      qb.addSelect('t9.district_name', 'destination');
      qb.addSelect('t2.package_type_id', 'packageTypeId');
      qb.addSelect('t5.package_type_code', 'packageTypeCode');
      qb.addSelect('t5.package_type_name', 'packageTypeName');
      qb.addSelect('t2.branch_id_last', 'pickupSourceId');
      qb.addSelect('t8.branch_name', 'pickupSource');
      qb.addSelect('t2.total_weight_real_rounded', 'weightRealRounded');
      qb.addSelect('t2.total_weight_final_rounded', 'weightFinalRounded');
      qb.addSelect('t2.consignee_name', 'consigneeName');
      qb.addSelect('t3.parcel_value', 'parcelValue');
      qb.addSelect('t3.cod_value', 'codValue');
      qb.addSelect('t3.parcel_content', 'parcelContent');
      qb.addSelect('t3.notes', 'parcelNote');
      qb.addSelect('t4.partner_id', 'partnerId');
      qb.addSelect('t6.partner_name', 'partnerName');
      qb.addSelect('t4.reference_no', 'custPackage');

      qb.from('awb_item_attr', 't1');
      qb.innerJoin(
        'awb',
        't2',
        't1.awb_id = t2.awb_id AND t2.is_deleted = false',
      );
      qb.innerJoin(
        'pickup_request_detail',
        't3',
        't1.awb_item_id = t3.awb_item_id AND t3.is_deleted = false',
      );
      qb.innerJoin(
        'pickup_request',
        't4',
        't3.pickup_request_id = t4.pickup_request_id AND t4.is_deleted = false',
      );
      qb.innerJoin(
        'package_type',
        't5',
        't2.package_type_id = t5.package_type_id',
      );
      qb.innerJoin(
        'partner',
        't6',
        't4.partner_id = t6.partner_id AND t6.is_deleted = false',
      );
      qb.innerJoin(
        'cod_payment',
        't10',
        't10.awb_item_id = t1.awb_item_id AND t10.is_deleted = false',
      );
      qb.innerJoin(
        'branch',
        't7',
        't10.branch_id = t7.branch_id AND t7.is_deleted = false',
      );
      qb.leftJoin(
        'branch',
        't8',
        't2.branch_id_last = t8.branch_id AND t8.is_deleted = false',
      );
      qb.leftJoin(
        'district',
        't9',
        't2.to_id = t9.district_id AND t8.is_deleted = false',
      );
      qb.where('t1.awb_item_id = :awbItemId', { awbItemId });
      qb.andWhere('t1.awb_status_id_final = :statusDLV', {
        statusDLV: AWB_STATUS.DLV,
      });
      qb.andWhere('t1.is_deleted = false');

      results = await qb.getRawOne();
    } finally {
      await masterQueryRunner.release();
    }
    return results;
  }

  private static async insertMongo(
    transaction: CodTransactionDetail,
  ): Promise<boolean> {
    // get config mongodb
    const collection = await MongoDbConfig.getDbSicepatCod(
      'transaction_detail',
    );
    delete transaction['changedValues'];
    transaction.userIdCreated = Number(transaction.userIdCreated);
    transaction.userIdUpdated = Number(transaction.userIdUpdated);

    const userUpdated = await User.findOne({
      select: ['userId', 'firstName', 'username'],
      where: {
        userId: transaction.userIdUpdated,
        isDeleted: false,
      },
      cache: true,
    });

    transaction['adminName'] = userUpdated.firstName;
    transaction['nikAdmin'] = userUpdated.username;

    const userSigesit = await User.findOne({
      select: ['userId', 'firstName', 'username'],
      where: {
        userId: transaction.userIdDriver,
        isDeleted: false,
      },
      cache: true,
    });

    transaction['sigesit'] = userSigesit.firstName;
    transaction['nikSigesit'] = userSigesit.username;

    console.log('## FIRST DATA IN MONGO :: ', transaction.awbNumber);

    try {
      const checkData = await collection.findOne({
        _id: transaction.awbNumber,
      });
      if (checkData) {
        const objUpdate = {
          codTransactionId: transaction.codTransactionId,
          transactionStatusId: transaction.transactionStatusId,
          supplierInvoiceStatusId: transaction.supplierInvoiceStatusId,
          codSupplierInvoiceId: transaction.codSupplierInvoiceId,
          userIdUpdated: transaction.userIdUpdated,
          adminName: userUpdated.firstName,
          nikAdmin: userUpdated.username,
        };
        await collection.updateOne(
          { _id: transaction.awbNumber },
          {
            $set: objUpdate,
          },
        );
        console.log('#### Success Update data mongo !!!');
      } else {
        await collection.insertOne({
          _id: transaction.awbNumber,
          ...transaction,
        });
        console.log(' #### Success first insert data mongo');
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
