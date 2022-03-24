
import moment = require('moment');
import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthService } from '../../../../../shared/services/auth.service';
import { SortationScanOutBagsPayloadVm, SortationScanOutDonePayloadVm, SortationScanOutLoadPayloadVm, SortationScanOutRoutePayloadVm, SortationScanOutVehiclePayloadVm } from '../../../models/sortation/web/sortation-scanout-payload.vm';
import { SortationBagDetailResponseVm, SortationLoadDetailVm, SortationScanOutBagsResponseVm, SortationScanOutDonedVm, SortationScanOutDoneResponseVm, SortationScanOutLoadResponseVm, SortationScanOutLoadVm, SortationScanOutRouteResponseVm, SortationScanOutRouteVm, SortationScanOutVehicleResponseVm, SortationScanOutVehicleVm } from '../../../models/sortation/web/sortation-scanout-response.vm';
import { RawQueryService } from '../../../../../shared/services/raw-query.service';
import { DO_SORTATION_STATUS } from '../../../../../shared/constants/do-sortation-status.constant';
import { toInteger } from 'lodash';
import { DoSortationDetail } from '../../../../../shared/orm-entity/do-sortation-detail';
import { CustomCounterCode } from '../../../../../shared/services/custom-counter-code.service';
import { RedisService } from '../../../../../shared/services/redis.service';
import { DoSortation } from '../../../../../shared/orm-entity/do-sortation';
import { SortationService } from './sortation.service';
import { Vehicle } from '../../../../../shared/orm-entity/vehicle';
import { Branch } from '../../../../../shared/orm-entity/branch';
import { BagService } from '../../../../main/services/v1/bag.service';
import { BAG_STATUS } from '../../../../../shared/constants/bag-status.constant';
import { EntityManager, getManager, In } from 'typeorm';
import { BagScanDoSortationQueueService } from '../../../../queue/services/bag-scan-do-sortation-queue.service';
import { OrionRepositoryService } from '../../../../../shared/services/orion-repository.service';
import { DoSortationDetailItem } from '../../../../../shared/orm-entity/do-sortation-detail-item';
import { DoSortationVehicle } from '../../../../../shared/orm-entity/do-sortation-vehicle';

@Injectable()
export class SortationScanOutService {
  static async sortationScanOutVehicle(
    payload: SortationScanOutVehiclePayloadVm)
    : Promise<SortationScanOutVehicleResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const timeNow = moment().toDate();

      // untuk fase 2 --- START ---
      let vehicleNumber = payload.vehicleNumber;
      let vehicleId = null; // default vehicleId
      if (payload.vehicleId) {
        const vehicle = await Vehicle.findOne({
          where: {
            vehicleId: payload.vehicleId,
            isActive : 1,
            isDeleted : false,
          },
        });

        if (!vehicle) {
          throw new BadRequestException('Kendaraan tidak ditemukan!.');
        }
        vehicleNumber = vehicle.vehicleNumber;
        vehicleId = vehicle.vehicleId;
      }
      // untuk fase 2 --- END ---, todo:: setelah fase 2 harap di reafactor bagian code di atas

      const dataDrivers = await this.getDataDriver(payload.employeeDriverId);
      if (dataDrivers) {
        for (const dataDriver of dataDrivers) {
          await this.validationDriverStatus(dataDriver, permissonPayload.branchId);
        }
      }

      const doSortationCode = await CustomCounterCode.doSortationCodeRandomCounter(timeNow);
      const redlock = await RedisService.redlock(`redlock:doSortation:${doSortationCode}`, 10);

      if (!redlock) {
        throw new BadRequestException('Data Surat Jalan Sortation Sedang di proses, Silahkan Coba Beberapa Saat');
      }

      const doSortationId = await SortationService.createDoSortation(
            doSortationCode,
            payload.doSortationDate,
            permissonPayload.branchId,
            authMeta.userId,
            payload.sortationTrip,
            payload.desc,
            DO_SORTATION_STATUS.CREATED,
          );

      const doSortationVehicleId = await SortationService.createDoSortationVehicle(
            doSortationId,
            vehicleId,
            vehicleNumber,
            1,
            payload.employeeDriverId,
            permissonPayload.branchId,
            authMeta.userId,
          );

      await DoSortation.update(
            { doSortationId },
            {
              doSortationVehicleIdLast: doSortationVehicleId,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );

      await SortationService.createDoSortationHistory(
            doSortationId,
            null,
            doSortationVehicleId,
            payload.doSortationDate,
            permissonPayload.branchId,
            DO_SORTATION_STATUS.CREATED,
            null,
            authMeta.userId,
          );

      const responseDetail = new SortationScanOutVehicleVm();
      responseDetail.doSortationId = doSortationId;
      responseDetail.doSortationCode = doSortationCode;
      responseDetail.doSortationVehicleId = doSortationVehicleId;
      responseDetail.doSortationTime = payload.doSortationDate;
      responseDetail.employeeIdDriver = payload.employeeDriverId;

      const result = new SortationScanOutVehicleResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = 'sucess';
      result.data = responseDetail;
      return result;
  }

  static async sortationScanOutRoute(
    payload: SortationScanOutRoutePayloadVm)
    : Promise<SortationScanOutRouteResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const timeNow = moment().toDate();

      const resultDoSortaion = await DoSortation.findOne({
        where: {
          doSortationId: payload.doSortationId,
          isDeleted: false,
        },
      });

      if (!resultDoSortaion) {
        throw new BadRequestException(`ID Sortation ${payload.doSortationId.toString()} tidak ditemukan`);
      }

      const resultBranchTo = await Branch.findOne({
        where: {
          branchCode: payload.branchCode,
          isDeleted : false,
          isActive : true,
        },
      });

      if (!resultBranchTo) {
        throw new BadRequestException(`Kode Gerai ${payload.branchCode} tidak ditemukan`);
      }

      const resultDoSortaionDetail = await DoSortationDetail.findOne({
        where: {
          doSortationId: resultDoSortaion.doSortationId,
          branchIdTo: resultBranchTo.branchId,
          isDeleted: false,
        },
      });

      if (resultDoSortaionDetail) {
        throw new BadRequestException(`Kode Gerai ${payload.branchCode} sudah di scan!!`);
      }

      const doSortationDetailId = await SortationService.createDoSortationDetail(
        resultDoSortaion.doSortationId,
        resultDoSortaion.doSortationVehicleIdLast,
        resultDoSortaion.doSortationTime,
        permissonPayload.branchId,
        resultBranchTo.branchId,
        authMeta.userId,
        DO_SORTATION_STATUS.CREATED,
      );

      let branchIdToArray = [];
      let branchNameToArray = [];
      if ((resultDoSortaion.branchIdToList && resultDoSortaion.branchIdToList.length > 0)
        || (resultDoSortaion.branchNameToList && resultDoSortaion.branchNameToList.length > 0)) {
          branchIdToArray = resultDoSortaion.branchIdToList;
          branchNameToArray = resultDoSortaion.branchNameToList;
      }
      branchIdToArray.push(resultBranchTo.branchId.toString());
      branchNameToArray.push(resultBranchTo.branchName);

      await DoSortation.update(
        {doSortationId: resultDoSortaion.doSortationId},
        {
          branchIdToList: branchIdToArray,
          branchNameToList: branchNameToArray,
          totalDoSortationDetail: resultDoSortaion.totalDoSortationDetail + 1,
          userIdUpdated: authMeta.userId,
          updatedTime: timeNow,
        },
      );

      const responseDetail = new SortationScanOutRouteVm();
      responseDetail.doSortationDetailId = doSortationDetailId;
      // responseDetail.doSortationId = resultDoSortaion.doSortationId,
      // responseDetail.doSortationCode = resultDoSortaion.doSortationCode;
      responseDetail.branchId = resultBranchTo.branchId;
      responseDetail.branchCode = resultBranchTo.branchCode;
      responseDetail.branchName = resultBranchTo.branchName;

      const result = new SortationScanOutRouteResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = 'sucess';
      result.data = responseDetail;
      return result;
  }

  static async sortationScanOutBags(
    payload: SortationScanOutBagsPayloadVm)
    : Promise<SortationScanOutBagsResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const data = [];

      const result = new SortationScanOutBagsResponseVm();
      result.statusCode = HttpStatus.BAD_REQUEST;

      const resultDoSortaionDetail = await DoSortationDetail.findOne({
        where: {
          doSortationDetailId: payload.doSortationDetailId,
          isDeleted: false,
        },
      });

      if (!resultDoSortaionDetail) {
        result.message = 'Rute dengan id tersebut tidak di temukan!.';
        return result;
      }

      const resultDoSortation =  await DoSortation.findOne({
        where: {
          doSortationId: resultDoSortaionDetail.doSortationId,
          isDeleted: false,
        },
      });

      if (!resultDoSortation) {
        result.message = 'Surat Jalan tidak ada!.';
        return result;
      }

      for (const bagNumber of payload.bagNumbers) {
        const bagDetail = await BagService.validBagNumber(bagNumber);
        if (!bagDetail) {
          result.message = `Gabung Paket/Sortir ${bagNumber} tidak ditemukan`;
          return result;
        }

        let isSortir = false;
        let messageBagType: string = 'Gabung Paket';
        if (bagDetail.bag.isSortir) {
          messageBagType = 'Gabung Sortir';
          isSortir = true;

          if (BAG_STATUS.DO_HUB != bagDetail.bagItemStatusIdLast) {
            result.message = `${messageBagType} ${bagNumber} belum di scan masuk`;
            return result;
          }
        }

        // pengecekan jika total bag/bagsortir sudah pernah scan, akan di cek kembali scan selanjutnya tidak boleh beda type bag
        if (resultDoSortaionDetail.totalBag > 0 || resultDoSortaionDetail.totalBagSortir > 0) {
          if (resultDoSortaionDetail.isSortir != isSortir) {
            result.message = `Tipe gabung paket dengan gabung sortir tidak bisa di gabung galam 1 rute`;
            return result;
          }
        }

        // HOLD VALIDASI KEBUTUHAN TESTING DEV
        // const branch = await Branch.findOne({
        //     where: {
        //       branchId: resultDoSortaionDetail.branchIdTo,
        //       isDeleted: false,
        //       isActive: true,
        //     },
        // });
        // if (bagDetail.bag.representativeIdTo != Number(branch.representativeId)) {
        //   result.message = `Tujuan kota ${messageBagType} ${bagNumber} dengan kota rute tidak sama.`;
        //   return result;
        // }

        const sortationDetailItemExist = await this.getSortationDetailItemExist(
            bagDetail.bagItemId,
            resultDoSortaionDetail.doSortationDetailId,
        );
        if (sortationDetailItemExist) {
          result.message = `${messageBagType} ${bagNumber} sudah di scan`;
          return result;
        }

        await getManager().transaction(async transactional => {
          await SortationService.createDoSortationDetailItem(
            resultDoSortaionDetail.doSortationDetailId,
            bagDetail.bagItemId,
            isSortir,
            authMeta.userId,
            transactional,
          );

          await this.updateTotalBagSortationAndSortationDetail(
            isSortir,
            resultDoSortation,
            resultDoSortaionDetail,
            authMeta.userId,
            transactional,
          );
        });

        if (!isSortir) {
          BagScanDoSortationQueueService.perform(
            bagDetail.bagItemId,
            authMeta.userId,
            permissonPayload.branchId,
            );
        }

        const detailResponse = new SortationBagDetailResponseVm();
        detailResponse.doSortationDetailId = resultDoSortaionDetail.doSortationDetailId;
        detailResponse.bagItemId = bagDetail.bagItemId;
        detailResponse.bagNumber = (bagDetail.bag.bagNumber + String(bagDetail.bagSeq).padStart(3, '0')).substring(0, 10);
        detailResponse.isSortir = isSortir;
        detailResponse.message = `${messageBagType} dengan nomor ${bagNumber} berhasil di scan`;
        // detailResponse.bagNumber = bagDetail.bag.bagNumber;
        // detailResponse.bagSeq = bagDetail.bagSeq;
        // detailResponse.weight = bagDetail.weight;
        // detailResponse.branchId = branch.branchId;
        // detailResponse.branchCode = branch.branchCode;
        // detailResponse.branchToName = branch.branchName;

        data.push(detailResponse);
      }
      result.statusCode = HttpStatus.OK;
      result.message = `Gabung Paket/Sortir berhasil di scan`;
      result.data = data;
      return result;
  }

  static async sortationScanOutLoadDoSortation(
    payload: SortationScanOutLoadPayloadVm)
    : Promise<SortationScanOutLoadResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const timeNow = moment().toDate();

      const result = new SortationScanOutLoadResponseVm();
      const data = new SortationScanOutLoadVm();
      const resultDoSortation = await DoSortation.findOne({
        where: {
          doSortationId: payload.doSortationId,
          doSortationStatusIdLast: DO_SORTATION_STATUS.CREATED,
          branchIdFrom: permissonPayload.branchId,
          userIdCreated: authMeta.userId,
          isDeleted: false,
        },
      });

      if (!resultDoSortation) {
        throw new BadRequestException('Surat Jalan tidak valid!.');
      }

      const repo = new OrionRepositoryService(DoSortationDetail, 't1');
      const q = repo.findAllRaw();
      q.selectRaw(
        ['t2.do_sortation_id', 'doSortationId'],
        ['t2.do_sortation_code', 'doSortationCode'],
        ['t1.do_sortation_detail_id', 'doSortationDetailId'],
        ['t3.branch_id', 'branchIdTo'],
        ['t3.branch_name', 'branchToName'],
        ['t3.branch_code', 'branchCode'],
      );

      q.innerJoin(e => e.doSortation, 't2', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.innerJoin(e => e.branchTo, 't3', j =>
        j.andWhere(e => e.isDeleted, w => w.isFalse()),
      );

      q.andWhere(e => e.doSortationId, w => w.equals(resultDoSortation.doSortationId));
      q.andWhere(e => e.isDeleted, w => w.isFalse());

      const details = await q.exec();
      data.doSortationDetails = details;

      if (!data.doSortationDetails || data.doSortationDetails.length < 1) {
        throw new BadRequestException('Surat Jalan sudah di proses');
      }

      for (const doSortationDetail of data.doSortationDetails ) {
        const repoDetailItem = new OrionRepositoryService(DoSortationDetailItem, 't1');
        const query = repoDetailItem.findAllRaw();
        query.selectRaw(
          ['SUBSTR(CONCAT(t2.bag_number, LPAD(t3.bag_seq::text, 3, \'0\')), 1, 10)', 'bagNumber'],
        );
        query.innerJoin(e => e.bagItem, 't3', j =>
          j.andWhere(e => e.isDeleted, w => w.isFalse()),
        );
        query.innerJoin(e => e.bagItem.bag, 't2', j =>
          j.andWhere(e => e.isDeleted, w => w.isFalse()),
        );

        query.andWhere(e => e.doSortationDetailId, w => w.equals(doSortationDetail.doSortationDetailId));
        query.andWhere(e => e.isDeleted, w => w.isFalse());
        const resultBagNumberList = await query.exec();

        const bagNumberList = [];
        for (const bagItem of resultBagNumberList) {
          bagNumberList.push(bagItem.bagNumber);
        }
        doSortationDetail.bagItems = bagNumberList;
      }
      data.doSortationId = resultDoSortation.doSortationId;
      data.doSortationCode = resultDoSortation.doSortationCode;

      result.message = 'sucess';
      result.statusCode = HttpStatus.OK;
      result.data = data;

      return result;
  }

  static async sortationScanOutDone(
    payload: SortationScanOutDonePayloadVm)
    : Promise<SortationScanOutDoneResponseVm> {
      const authMeta = AuthService.getAuthData();
      const permissonPayload = AuthService.getPermissionTokenPayload();
      const timeNow = moment().toDate();

      const resultDoSortaion = await DoSortation.findOne({
        where: {
          doSortationId: payload.doSortationId,
          isDeleted: false,
        },
      });

      if (!resultDoSortaion) {
        throw new BadRequestException(`Surat Jalan tidak ditemukan, Gagal membuat surat jalan`);
      }

      if (resultDoSortaion.doSortationStatusIdLast != DO_SORTATION_STATUS.CREATED) {
        throw new BadRequestException(`Surat Jalan Sudah Di proses`);
      }

      /* TODO::
        * Phase 2
        * validation if driver sudah berangkat harus change driver
        *
      */
      // const resultDoSortaionDetail = await DoSortationDetail.find({
      //   where: {
      //     doSortationId: payload.doSortationId,
      //     arrivalDateTime: null,
      //     isDeleted: false,
      //   },
      // });

      // cara ini hanya mengecek jika salah satu rute sudah terisi boleh lanjut DONE
      // harus di make sure kembali secara bisnis flow
      // apakaha harus di looping satu2 cek jika salah satu rute kosong bag nya????
      // sementara seperti ini dulu code nya.
      const rawQuery = `
        SELECT ARRAY(
          SELECT
            do_sortation_detail_id
          FROM do_sortation_detail
          WHERE
            do_sortation_id = '${payload.doSortationId}'
            AND is_deleted = false
            AND check_point = 0
        );
      `;
      const resultDoSortaionDetailIds = await RawQueryService.query(rawQuery);
      if (!resultDoSortaionDetailIds[0].array || resultDoSortaionDetailIds[0].array.length < 1) {
        throw new BadRequestException(`Gagal membuat surat jalan`);
      }

      const checkDetailItem = await DoSortationDetailItem.find({
        select: ['doSortationDetailId', 'bagItemId'],
        where: {
          doSortationDetailId: In(resultDoSortaionDetailIds[0].array),
          isDeleted: false,
        },
      });

      if (!checkDetailItem || checkDetailItem.length < 1) {
        throw new BadRequestException(`Belum pernah scan bag`);
      }

      await getManager().transaction(async transactional => {
        for (const sortationDetailId of resultDoSortaionDetailIds[0].array) {
          await transactional.update(DoSortationDetail,
            {doSortationDetailId:  sortationDetailId},
            {
              doSortationStatusIdLast: DO_SORTATION_STATUS.ASSIGNED,
              userIdUpdated: authMeta.userId,
              updatedTime: timeNow,
            },
          );
        }
        await transactional.update(DoSortation,
          {doSortationId:  payload.doSortationId},
          {
            doSortationStatusIdLast: DO_SORTATION_STATUS.ASSIGNED,
            userIdUpdated: authMeta.userId,
            updatedTime: timeNow,
          },
        );
      });

      await SortationService.createDoSortationHistory(
        resultDoSortaion.doSortationId,
        null,
        resultDoSortaion.doSortationVehicleIdLast,
        resultDoSortaion.doSortationTime,
        permissonPayload.branchId,
        DO_SORTATION_STATUS.ASSIGNED,
        null,
        authMeta.userId,
      );

      const data = new SortationScanOutDonedVm();
      data.doSortationId = resultDoSortaion.doSortationId;
      data.doSortationCode = resultDoSortaion.doSortationCode;

      const result = new SortationScanOutDoneResponseVm();
      result.statusCode = HttpStatus.OK;
      result.message = `Kode Surat Jalan ${resultDoSortaion.doSortationCode} sukses di buat.`;
      result.data = data;
      return result;
  }

  static async sortaionScanOutDeleted(doSortationId: string) {
    const authMeta = AuthService.getAuthData();
    const permissonPayload = AuthService.getPermissionTokenPayload();

    if (!doSortationId) {
      throw new BadRequestException(`ID Surat Jalan Sortation harus di isi`);
    }

    const resultDoSortaion = await DoSortation.findOne({
      where: {
        doSortationId,
        isDeleted: false,
      },
    });

    if (!resultDoSortaion) {
      throw new BadRequestException(`ID ${doSortationId} harus di isi`);
    }

    if (![DO_SORTATION_STATUS.CREATED, DO_SORTATION_STATUS.ASSIGNED].includes(Number(resultDoSortaion.doSortationStatusIdLast))) {
      throw new BadRequestException(`Sortation Code ` + resultDoSortaion.doSortationCode + ` Status tidak Created / Assigned`);
    }

    const doSortationDetails = await DoSortationDetail.find({
      where: {
        doSortationId,
        isDeleted: false,
      },
    });

    await getManager().transaction(async transactional => {
      await transactional.update(DoSortation,
          { doSortationId: resultDoSortaion.doSortationId},
          {
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
            isDeleted: true,
          },
      );

      await transactional.update(DoSortationVehicle,
          { doSortationId: resultDoSortaion.doSortationId},
          {
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
            isDeleted: true,
          },
      );

      if (doSortationDetails && doSortationDetails.length > 0) {
        await transactional.update(DoSortationDetail,
          { doSortationId: resultDoSortaion.doSortationId},
          {
            userIdUpdated: authMeta.userId,
            updatedTime: moment().toDate(),
            isDeleted: true,
          },
        );

        for (const detail of doSortationDetails) {
          await transactional.update(DoSortationDetailItem,
            { doSortationDetailId: detail.doSortationDetailId},
            {
              userIdUpdated: authMeta.userId,
              updatedTime: moment().toDate(),
              isDeleted: true,
            },
          );
        }

        await SortationService.createDoSortationHistory(
          resultDoSortaion.doSortationId,
          null,
          resultDoSortaion.doSortationVehicleIdLast,
          resultDoSortaion.doSortationTime,
          permissonPayload.branchId,
          DO_SORTATION_STATUS.DELETED,
          null,
          authMeta.userId,
        );
      }
    });

  }

  private static async updateTotalBagSortationAndSortationDetail(
    isSortir: boolean,
    resultDoSortation: DoSortation,
    resultDoSortationDetail: DoSortationDetail,
    userId: number,
    transactional: EntityManager,
  ) {
    if (isSortir) {
      await transactional.update(DoSortation,
        { doSortationId: resultDoSortationDetail.doSortationId},
        {
          totalBagSortir: resultDoSortation.totalBagSortir + 1,
          updatedTime: moment().toDate(),
          userIdUpdated: userId,
        });

      await transactional.update(DoSortationDetail,
        {doSortationDetailId: resultDoSortationDetail.doSortationDetailId},
        {
          isSortir: true,
          totalBagSortir: resultDoSortationDetail.totalBagSortir + 1,
          updatedTime: moment().toDate(),
          userIdUpdated: userId,
        });
    } else {
      await transactional.update(DoSortation,
        { doSortationId: resultDoSortationDetail.doSortationId},
        {
          totalBag: resultDoSortation.totalBag + 1,
          updatedTime: moment().toDate(),
          userIdUpdated: userId,
        });
      await transactional.update(DoSortationDetail,
        {doSortationDetailId: resultDoSortationDetail.doSortationDetailId},
        {
          totalBag: resultDoSortationDetail.totalBag + 1,
          updatedTime: moment().toDate(),
          userIdUpdated: userId,
        });
    }
  }

  private static async getSortationDetailItemExist(
    bagItemId: number,
    doSortationDetailId: string): Promise<any> {
      const rawQuery = `
          SELECT
            dsd.do_sortation_detail_id AS "doSmdDetailId",
            dsdi.bag_item_id AS "bagItemId"
          FROM do_sortation_detail dsd
          INNER JOIN do_sortation_detail_item dsdi ON dsd.do_sortation_detail_id = dsdi.do_sortation_detail_id
            AND dsdi.bag_item_id = ${bagItemId}
            AND dsdi.is_deleted = FALSE
          WHERE
            dsd.do_sortation_detail_id = '${doSortationDetailId}' AND
            dsd.do_sortation_status_id_last != ${DO_SORTATION_STATUS.CREATED} AND
            dsd.is_deleted = FALSE;
        `;
      const result = await RawQueryService.query(rawQuery);
      return result.length > 0 ? result : null ;
  }

  private static async getDataDriver(employeeDriverId: number): Promise<any> {
    const rawQueryDriver = `
      SELECT
        dsv.employee_driver_id,
        ds.do_sortation_status_id_last,
        ds.do_sortation_id,
        ds.branch_id_from
      FROM do_sortation_vehicle dsv
      INNER JOIN do_sortation ds ON dsv.do_sortation_vehicle_id = ds.do_sortation_vehicle_id_last
        AND ds.do_sortation_status_id_last <> ${DO_SORTATION_STATUS.FINISHED}
        AND ds.is_deleted = FALSE
      WHERE
        dsv.created_time >= '${moment().subtract(30, 'days').format('YYYY-MM-DD 00:00:00')}' AND
        dsv.created_time <= '${moment().format('YYYY-MM-DD 23:59:59')}' AND
        dsv.employee_driver_id = ${employeeDriverId} AND
        dsv.is_deleted = FALSE;
    `;
    return await RawQueryService.query(rawQueryDriver);
  }

  private static async validationDriverStatus(dataDriver: any, payloadBranchId: number) {
    // Cek Status OTW
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.ON_THE_WAY) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena sedang OTW !!`);
    }
    // Cek Status PROBLEM
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.PROBLEM) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena sedang PROBLEM !!`);
    }
    // Cek Status HAS ARRIVED
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.HAS_ARRIVED) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena baru tiba !!`);
    }
    // Cek Status INVALID
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.INVALID) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena INVALID  !!`);
    }
    // Cek Status VALID
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.VALID) {
      throw new BadRequestException(`Driver tidak bisa di assign, karena belum DITERIMA !!`);
    }
    // Cek Status Created, Assigned, Driver Changed
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.CREATED
        || toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.ASSIGNED
        || toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.DRIVER_CHANGED) {
        if (toInteger(dataDriver.branch_id_from) != toInteger(payloadBranchId)) {
          throw new BadRequestException(`Driver Tidak boleh di assign beda cabang`);
        }
    } else if ( toInteger(dataDriver.do_sortation_status_id_last) < DO_SORTATION_STATUS.ON_THE_WAY ) {
      throw new BadRequestException(`Driver Tidak boleh di assign`);
    }
    // Cek Status Received
    if ( toInteger(dataDriver.do_sortation_status_id_last) == DO_SORTATION_STATUS.RECEIVED) {
      const resultDoSortationDetail = await DoSortationDetail.findOne({
        where: {
          doSmdId: dataDriver.do_smd_id,
          doSmdStatusIdLast: DO_SORTATION_STATUS.RECEIVED,
          branchIdTo: payloadBranchId,
          isDeleted: false,
        },
      });
      if (!resultDoSortationDetail) {
        throw new BadRequestException(`Driver tidak bisa di assign, karena SMD ID : ` + dataDriver.do_sortation_id + ` beda cabang.`);
      }
    }
  }

}
