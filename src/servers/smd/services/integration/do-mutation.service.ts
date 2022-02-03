import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import moment = require('moment');
import uuid = require('uuid');
import { BagService } from '../../../../servers/main/services/v1/bag.service';
import { DoMutationQueueService } from '../../../../servers/queue/services/do-mutation-queue.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { DoMutation } from '../../../../shared/orm-entity/do-mutation';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { AuthService } from '../../../../shared/services/auth.service';
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
  PrintDetailDoMutationResponseVm,
} from '../../models/do-mutation.response.vm';
import { BAG_STATUS } from '../../../../shared/constants/bag-status.constant';
import { DoMutationDetail } from '../../../../shared/orm-entity/do-mutation-detail';
import { ReportBaseMetaPayloadVm } from '../../../../shared/models/base-meta-payload.vm';
import { createQueryBuilder } from 'typeorm';
import { RedisService } from '../../../../shared/services/redis.service';

@Injectable()
export class DoMutationService {
  public static async insert(
    payload: DoMutationPayloadVm,
  ): Promise<DoMutationResponseVm> {
    const authMeta = AuthService.getAuthData();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();

    // validate payload
    if (permissionPayload.branchId === payload.branch_id) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cabang asal tidak boleh sama dengan cabang tujuan',
        data: null,
      };
    }
    const toBranch = await Branch.findOne(
      {
        branchId: payload.branch_id,
        isDeleted: false,
      },
      { select: ['branchId'] },
    );
    if (!toBranch) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Cabang tidak ditemukan',
        data: null,
      };
    }

    // insert to do_mutation
    const doMutationCode = await CustomCounterCode.doMutationCodeCounter(
      timeNow,
    );
    const mutation = await DoMutation.create({
      doMutationId: uuid.v1(),
      doMutationCode,
      doMutationDate: payload.do_mutation_date,
      branchIdFrom: permissionPayload.branchId,
      branchIdTo: payload.branch_id,
      totalBag: 0,
      totalWeight: 0.0,
      note: payload.note,
      userIdUpdated: authMeta.userId,
      userIdCreated: authMeta.userId,
      createdTime: timeNow,
      updatedTime: timeNow,
    });
    await DoMutation.insert(mutation);

    return {
      statusCode: HttpStatus.CREATED,
      message: `Sukses buat mutasi ${doMutationCode}`,
      data: {
        do_mutation_id: mutation.doMutationId,
        do_mutation_code: doMutationCode,
        do_mutation_date: moment(timeNow).format('YYYY-MM-DD HH:mm:ss'),
      },
    } as DoMutationResponseVm;
  }

  public static async insertDetail(
    payload: InsertDoMutationDetailPayloadVm,
  ): Promise<InsertDoMutationDetailResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const branch = permissionPayload.branchId;
    const id = payload.do_mutation_id;
    const bagNumberSeq = payload.bag_number.toString();
    const bag = await BagService.validBagNumber(bagNumberSeq);
    if (!bag) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No Gabung Paket Tidak Ditemukan',
        data: null,
      };
    }
    if (bag.bagItemStatusIdLast != BAG_STATUS.DO_LINE_HAUL) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'No Gabung Paket Belum Di Scan Masuk',
        data: null,
      };
    }
    const q = RepositoryService.doMutationDetail.createQueryBuilder();
    const existingDetail = await q
      .innerJoin(
        'do_mutation_detail.doMutation',
        'dm',
        'dm.is_deleted = :dmDeleted',
        { dmDeleted: false },
      )
      .where('do_mutation_detail.bagItemId = :id', { id: bag.bagItemId })
      .andWhere('dm.branch_id_from = :branch', { branch })
      .andWhere('do_mutation_detail.is_deleted = :deleted', { deleted: false })
      .getCount();

    if (existingDetail) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Gabung Paket dengan nomor ${
          payload.bag_number
        } sudah pernah discan di cabang ini`,
        data: null,
      };
    }
    const mutation = await DoMutation.findOne(
      {
        doMutationId: id,
        isDeleted: false,
      },
      {
        select: ['doMutationId', 'totalBag', 'totalWeight'],
      },
    );
    if (!mutation) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Mutasi tidak ditemukan',
        data: null,
      };
    }

    // insert do mutation detail
    const timeNow = moment().toDate();
    const mutationDetail = await DoMutationDetail.create({
      doMutationDetailId: uuid.v1(),
      doMutationId: id,
      bagItemId: bag.bagItemId.toString(),
      weight: bag.weight,
      createdTime: timeNow,
      updatedTime: timeNow,
      userIdCreated: authMeta.userId,
      userIdUpdated: authMeta.userId,
    });
    await DoMutationDetail.insert(mutationDetail);

    // update do mutation total bag and total weight
    await DoMutation.update(
      {
        doMutationId: mutation.doMutationId,
        isDeleted: false,
      },
      {
        totalBag: mutation.totalBag + 1,
        totalWeight: mutation.totalWeight + parseFloat(bag.weight.toString()),
        updatedTime: timeNow,
        userIdUpdated: authMeta.userId,
      },
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Sukses input gabung paket',
      data: {
        is_success: 'success',
        bag_item_id: bag.bagItemId,
        bag_number: bagNumberSeq,
        do_mutation_detail_id: mutationDetail.doMutationDetailId,
      },
    };
  }

  public static async insertBagStatus(
    id: string,
  ): Promise<DoMutationBagStatusResponseVm> {
    const mutation = await DoMutation.findOne(
      {
        doMutationId: id,
        isDeleted: false,
      },
      {
        select: ['doMutationId', 'branchIdTo'],
      },
    );
    if (!mutation) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Mutasi tidak ditemukan',
      };
    }
    const repo = RepositoryService.doMutationDetail;
    const q = repo.createQueryBuilder();
    const bagItems = await q
      .select('bi.bag_id, bi.bag_item_id, bi.bag_item_status_id_last')
      .innerJoin(
        'do_mutation_detail.bagItem',
        'bi',
        'bi.is_deleted = :isDeleted',
        { isDeleted: false },
      )
      .where('do_mutation_detail.do_mutation_id = :id', { id })
      .andWhere('do_mutation_detail.is_deleted = :dmdDeleted', {
        dmdDeleted: false,
      })
      .getRawMany();
    if (bagItems.length === 0) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Belum ada gabung paket yang dimasukkan ke dalam mutasi ini',
      };
    }
    const redlock = await RedisService.redlock(
      `redlock:doMutationStatus:${id}`,
      10,
    );
    if (!redlock) {
      throw new BadRequestException(`Mutasi Gabung Paket sudah dalam proses`);
    }

    const authMeta = AuthService.getAuthMetadata();
    const permissionPayload = AuthService.getPermissionTokenPayload();
    const promises = [];
    bagItems.forEach(bagItem => {
      // queue only unprocessed bag items
      if (bagItem.bag_item_status_id_last === BAG_STATUS.DO_LINE_HAUL) {
        promises.push(
          DoMutationQueueService.addData(
            bagItem.bag_item_id,
            authMeta.userId.toString(),
            permissionPayload.branchId.toString(),
            mutation.branchIdTo.toString(),
          ),
        );
      }
    });
    await Promise.all(promises);

    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses mengubah status gabung paket dengan mutasi',
    };
  }

  public static async delete(id: string): Promise<DeleteDoMutationResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    const mutation = await DoMutation.findOne(
      {
        doMutationId: id,
        isDeleted: false,
      },
      {
        select: ['doMutationId'],
      },
    );
    if (!mutation) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Mutation id not found',
      };
    }
    const timeNow = moment().toDate();
    await Promise.all([
      DoMutation.update(
        {
          doMutationId: id,
          isDeleted: false,
        },
        {
          isDeleted: true,
          updatedTime: timeNow,
          userIdUpdated: authMeta.userId,
        },
      ),
      DoMutationDetail.update(
        {
          doMutationId: id,
          isDeleted: false,
        },
        {
          isDeleted: true,
          updatedTime: timeNow,
          userIdUpdated: authMeta.userId,
        },
      ),
    ]);

    return {
      statusCode: HttpStatus.OK,
      message: 'Sukses menghapus mutasi',
    };
  }

  public static async getList(
    payload: ReportBaseMetaPayloadVm,
  ): Promise<GetDoMutationResponseVm> {
    // construct query
    const q = RepositoryService.doMutation.createQueryBuilder();
    const selectColumns =
      'do_mutation_id, do_mutation_code, do_mutation.created_time do_mutation_date, bf.branch_name branch_from, bt.branch_name branch_to, total_bag, total_weight, note as do_mutation_note';
    q.select(selectColumns)
      .leftJoin('do_mutation.branchFrom', 'bf', 'bf.is_deleted = :isDeleted', {
        isDeleted: false,
      })
      .leftJoin('do_mutation.branchTo', 'bt', 'bt.is_deleted = :btIsDeleted', {
        btIsDeleted: false,
      });

    // apply filters
    payload.filters.forEach(filter => {
      const field = ['end_date', 'start_date'].includes(filter.field)
        ? 'do_mutation_date'
        : filter.field;
      q.andWhere(
        `do_mutation.${field} ${filter.sqlOperator} :${filter.field}`,
        { [filter.field]: filter.value },
      );
    });
    q.andWhere('do_mutation.is_deleted = :isDeleted', { isDeleted: false });

    // add sort, limit & offset
    let sortBy: string = payload.sortBy;
    if (['created_time', 'total_weight, do_mutation_date'].includes(sortBy)) {
      sortBy = `do_mutation.${sortBy}`;
    } else if (sortBy === 'branch_id_from') {
      sortBy = 'bf.branch_name';
    } else if (sortBy === 'branch_id_to') {
      sortBy = 'bt.branch_name';
    }

    const sortDir = payload.sortDir === 'asc' ? 'ASC' : 'DESC';
    q.orderBy(sortBy, sortDir)
      .limit(payload.limit)
      .offset((payload.page - 1) * payload.limit);
    const [mutations, count] = await Promise.all([
      q.getRawMany(),
      q.getCount(),
    ]);

    const result = new GetDoMutationResponseVm();
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar mutasi';
    result.data = mutations;
    result.buildPaging(payload.page, payload.limit, count);

    return result;
  }

  public static async getDetail(
    payload: ReportBaseMetaPayloadVm,
  ): Promise<GetDoMutationDetailResponseVm> {
    const result = new GetDoMutationDetailResponseVm();
    const filter = payload.filters.find(f => f.field === 'do_mutation_id');
    if (!filter) {
      result.message = 'Filter do_mutation_id dibutuhkan';
      result.statusCode = HttpStatus.BAD_REQUEST;
      return result;
    }
    const q = RepositoryService.doMutationDetail.createQueryBuilder();
    q.select('b.bag_number, bi.bag_seq')
      .innerJoin(
        'do_mutation_detail.bagItem',
        'bi',
        'bi.is_deleted = :biDeleted',
        { biDeleted: false },
      )
      .innerJoin('bi.bag', 'b', 'b.is_deleted = :bDeleted', { bDeleted: false })
      .andWhere(`${filter.field} = :${filter.field}`, {
        [filter.field]: filter.value,
      })
      .andWhere('do_mutation_detail.is_deleted = :isDeleted', {
        isDeleted: false,
      })
      .orderBy('do_mutation_detail.created_time', 'DESC')
      .limit(payload.limit)
      .offset((payload.page - 1) * payload.limit);
    const [bagItems, count] = await Promise.all([q.getRawMany(), q.getCount()]);
    result.statusCode = HttpStatus.OK;
    result.message = 'Sukses ambil daftar gabung paket mutasi';
    result.data = bagItems.map(bi => ({
      bag_number: `${bi.bag_number}${
        bi.bag_seq && bi.bag_number.length < 10
          ? bi.bag_seq.toString().padStart(3, '0')
          : ''
      }`,
    }));
    result.buildPaging(payload.page, payload.limit, count);

    return result;
  }

  public static async detailSmdMutationPrint(
    payload: InsertDoMutationStatusPayloadVm,
  ): Promise<any> {
    const result = new PrintDetailDoMutationResponseVm();
    const qb = createQueryBuilder();
    // qb.addSelect('dm.do_mutation_id', 'do_mutation_id');
    // qb.addSelect('dm.do_mutation_code', 'do_mutation_code');
    // qb.addSelect('dm.do_mutation_date', 'do_mutation_date');
    qb.addSelect('bi.weight', 'bagWeight');
    qb.addSelect('b.bag_number', 'bagNumber');
    qb.addSelect('bi.bag_seq', 'bagSeq');
    qb.from('do_mutation', 'dm');
    qb.innerJoin(
      'do_mutation_detail',
      'dmd',
      'dm.do_mutation_id = dmd.do_mutation_id AND dmd.is_deleted = FALSE',
    );
    qb.innerJoin(
      'bag_item',
      'bi',
      'bi.bag_item_id = dmd.bag_item_id AND bi.is_deleted = FALSE',
    );
    qb.innerJoin('bag', 'b', 'b.bag_id = bi.bag_id AND b.is_deleted = FALSE');
    qb.andWhere(`dm.do_mutation_id = '${payload.do_mutation_id}'`);
    qb.andWhere(`dm.is_deleted = FALSE`);
    const getData = await qb.getRawMany();
    result.data = getData.map(data => ({
      bagNumber: `${data.bagNumber}${
        data.bagSeq && data.bagNumber.length < 10
          ? data.bagSeq.toString().padStart(3, '0')
          : ''
      }`,
      bagWeight: data.bagWeight,
    }));
    return result;
  }
}
