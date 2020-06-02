import { createQueryBuilder, Not } from 'typeorm';
import { isEmpty, clone } from 'lodash';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  BranchListKorwilResponseVm,
  MobileKorwilTransactionResponseVm,
  ItemListKorwilResponseVm,
  DetailPhotoKorwilResponseVm,
  MobileUpdateProcessKorwilResponseVm,
  KorwilHistoryResponseVm,
  DetailHistoryKorwilResponseVm,
} from '../../models/mobile-korwil-response.vm';
import {
  MobilePostKorwilTransactionPayloadVm,
  MobileUpdateProcessKorwilPayloadVm,
  MobileValidateCoordinateKorwilTransactionPayloadVm,
  KorwilHistoryPayloadVm,
} from '../../models/mobile-korwil-payload.vm';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { ValidateBranchCoordinateResponseVm } from '../../models/branch-response.vm';
import { KorwilTransaction } from '../../../../shared/orm-entity/korwil-transaction';
import { KorwilTransactionDetail } from '../../../../shared/orm-entity/korwil-transaction-detail';
import moment = require('moment');
import { AttachmentService } from '../../../../shared/services/attachment.service';
import { KorwilTransactionDetailPhoto } from '../../../../shared/orm-entity/korwil-transaction-detail-photo';
import { AttachmentTms } from '../../../../shared/orm-entity/attachment-tms';
import { getType } from 'mime';
import { ConfigService } from '../../../../shared/services/config.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { MetaService } from '../../../../shared/services/meta.service';

export class MobileKorwilService {
  constructor() { }
  static E_RADIUS = 6372.8;
  static configKorwil = ConfigService.get('korwil');

  public static async getBranchList(): Promise<BranchListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // Branch list dari user role korwil
    const qb = createQueryBuilder();
    qb.addSelect('b.branch_id', 'branchId');
    qb.addSelect('b.branch_name', 'branchName');
    qb.from('user_to_branch', 'utb');
    qb.innerJoin(
      'branch',
      'b',
      'b.branch_id = utb.ref_branch_id AND b.is_deleted = false',
    );
    qb.where('utb.is_deleted = false');
    qb.andWhere('utb.ref_user_id = :userId', {
      userId: authMeta.userId,
    });

    const result = new BranchListKorwilResponseVm();
    result.branchList = await qb.getRawMany();

    return result;
  }

  public static async updateDoneKorwil(
    payload: MobileUpdateProcessKorwilPayloadVm,
  ): Promise<MobileUpdateProcessKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new MobileUpdateProcessKorwilResponseVm();
    const timeNow = moment().toDate();
    result.message = 'success';
    result.status = 'ok';

    // update status sedang dikerjakan(2) jadi status selesai(3)
    await KorwilTransactionDetail.update(
      {
        korwilTransactionId: payload.korwilTransactionId,
        status: Not(0),
        isDeleted: false,
      },
      {
        isDone: true,
      },
    );

    let korwilTransaction = await KorwilTransaction.findOne({
      where: {
        korwilTransactionId: payload.korwilTransactionId,
      },
    });
    if (!korwilTransaction) {
      result.message = 'error';
      result.status = 'Korwil tidak ditemukan';
      return result;
    }
    const task = await this.getTotalTask(
      payload.korwilTransactionId,
    );
    korwilTransaction.totalTask = task[0];
    korwilTransaction.userIdUpdated = authMeta.userId;
    korwilTransaction.updatedTime = timeNow;
    korwilTransaction.totalTaskDone = task[1];
    await KorwilTransaction.save(korwilTransaction);

    result.statusKorwilTransaction = korwilTransaction.status;
    return result;
  }

  public static async updateSubmitKorwil(
    payload: MobileUpdateProcessKorwilPayloadVm,
  ): Promise<MobileUpdateProcessKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const result = new MobileUpdateProcessKorwilResponseVm();
    const timeNow = moment().toDate();
    result.message = 'success';
    result.status = 'ok';

    let korwilTransaction = await KorwilTransaction.findOne({
      where: {
        korwilTransactionId: payload.korwilTransactionId,
        status: 0,
      },
    });

    const qb = createQueryBuilder();
    qb.addSelect('kt.status', 'status');
    qb.addSelect('ktd.is_done', 'isDone');
    qb.from('korwil_transaction', 'kt');
    qb.innerJoin(
      'korwil_transaction_detail',
      'ktd',
      'ktd.korwil_transaction_id = kt.korwil_transaction_id AND ktd.is_deleted = false',
    );
    qb.andWhere('kt.korwil_transaction_id = :korwilTransactionId', {
      korwilTransactionId: payload.korwilTransactionId,
    });
    const dataKorwil = await qb.getRawOne();

    if (dataKorwil && dataKorwil.status == 1) {
      result.message = 'error';
      result.status = 'Korwil sudah di submit';
      return result;
    } else if (!dataKorwil) {
      result.message = 'error';
      result.status = 'Korwil tidak ditemukan';
      return result;
    }
    const task = await this.getTotalTask(
      payload.korwilTransactionId,
    );
    korwilTransaction.totalTask = task[0];
    korwilTransaction.totalTaskDone = task[1];
    korwilTransaction.userIdUpdated = authMeta.userId;
    korwilTransaction.updatedTime = timeNow;
    korwilTransaction.status = 1;
    await KorwilTransaction.save(korwilTransaction);

    result.statusKorwilTransaction = korwilTransaction.status;
    return result;
  }

  public static async getDataListItem(branchId, userId, id, roleId): Promise<any> {
    // item list korwil
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ktd.korwil_item_id', 'korwilItemId');
    qb.addSelect(
      'ktd.korwil_transaction_detail_id',
      'korwilTransactionDetailId',
    );
    qb.addSelect('ktd.is_done', 'isDone');
    qb.addSelect('ktd.status', 'status');
    qb.addSelect('kt.korwil_transaction_id', 'korwilTransactionId');
    qb.addSelect('kt.status', 'statusTransaction');
    qb.addSelect('ktd.note', 'note');
    qb.from('korwil_transaction', 'kt');
    qb.addSelect('ki.is_required', 'isRequired');
    qb.innerJoin(
      'korwil_transaction_detail',
      'ktd',
      'ktd.korwil_transaction_id = kt.korwil_transaction_id AND ktd.is_deleted = false',
    );
    qb.innerJoin(
      'korwil_item',
      'ki',
      'ki.korwil_item_id = ktd.korwil_item_id AND ki.is_deleted = false',
    );
    if (!this.configKorwil.palkurRoleId.includes(roleId)) {
      qb.innerJoin(
        'user_to_branch',
        'utb',
        'utb.ref_branch_id = kt.branch_id AND utb.is_deleted = false',
      );
      qb.andWhere('utb.ref_user_id = :userId', {
        userId,
      });
    }
    qb.andWhere('kt.is_deleted = false');
    qb.andWhere('kt.branch_id = :branchIdTemp', {
      branchIdTemp: branchId,
    });
    qb.andWhere('kt.korwil_transaction_id = :korwilId', {
      korwilId: id,
    });
    qb.orderBy('ki.sort_order', 'ASC');
    const data = await qb.getRawMany();

    return data;
  }

  public static async insertAndGetKorwilTransactionDetail(branchId, roleId)
    : Promise<ItemListKorwilResponseVm> {
    const result = new ItemListKorwilResponseVm();
    const authMeta = AuthService.getAuthData();
    const itemList = [];
    // let statusTransaction = null;

    // GET item korwil
    let qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ki.is_required', 'isRequired');
    qb.addSelect('ki.korwil_item_id', 'korwilItemId');
    qb.from('korwil_item', 'ki');
    qb.andWhere('ki.is_deleted = false');
    qb.andWhere(`ki.role_id = ${roleId}`);
    qb.orderBy('ki.sort_order', 'ASC');
    const korwilItem = await qb.getRawMany();

    // get last data checkin
    qb = createQueryBuilder();
    qb.addSelect('ej.employee_journey_id', 'employeeJourneyId');
    qb.from('employee_journey', 'ej');
    qb.andWhere('ej.is_deleted = false');
    qb.andWhere('ej.employee_id = :employeeId', {
      employeeId: authMeta.employeeId,
    });
    qb.andWhere(`ej.check_out_date IS NULL`);
    qb.orderBy('ej.created_time', 'DESC');
    const dataLatestLogin = await qb.getRawOne();

    const totalTaskDone = 0;
    const totalTask = korwilItem.length;
    let korwilId = null;
    let korwil = null;

    if (korwilItem.length != 0) {
      // Insert Korwil Transaction
      korwil = KorwilTransaction.create();
      korwil.branchId = branchId;
      korwil.createdTime = moment().toDate();
      korwil.date = moment().toDate();
      korwil.employeeJourneyId = dataLatestLogin.employeeJourneyId;
      korwil.isDeleted = false;
      korwil.status = 0;
      korwil.totalTask = totalTask;
      korwil.totalTaskDone = totalTaskDone;
      korwil.updatedTime = moment().toDate();
      korwil.userId = authMeta.userId;
      korwil.userIdCreated = authMeta.userId;
      korwil.userIdUpdated = authMeta.userId;
      korwil.userToBranchId = branchId;
      await KorwilTransaction.save(korwil);

      korwilId = korwil.korwilTransactionId;
      // Create Korwil Item
      for (const item of korwilItem) {
        const korwilTransactionDetail = KorwilTransactionDetail.create();
        korwilTransactionDetail.korwilItemId = item.korwilItemId;
        korwilTransactionDetail.korwilTransactionId = korwilId;
        korwilTransactionDetail.latChecklist = '';
        korwilTransactionDetail.longChecklist = '';
        korwilTransactionDetail.note = '';
        korwilTransactionDetail.status = 0;
        korwilTransactionDetail.isDone = false;
        korwilTransactionDetail.date = moment().toDate();
        korwilTransactionDetail.photoCount = 0;
        korwilTransactionDetail.userIdCreated = authMeta.userId;
        korwilTransactionDetail.createdTime = moment().toDate();
        korwilTransactionDetail.updatedTime = moment().toDate();
        korwilTransactionDetail.userIdUpdated = authMeta.userId;
        await KorwilTransactionDetail.save(korwilTransactionDetail);
        itemList.push({
          ...item,
          ...korwilTransactionDetail,
        });
      }
    }

    result.itemList = itemList;
    result.korwilTransactionId = korwilId;
    result.status = korwil ? korwil.status.toString() : null;
    return result;
  }
  public static async getItemList(
    branchId: string,
  ): Promise<ItemListKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();
    const permissonPayload = AuthService.getPermissionTokenPayload();
    const timeNow = moment().toDate();
    let now = moment();
    // NOTE: configure dateFrom and dateTo
    // 1. if time now LOWER THAN 06:00 o'clock, dateFrom = 06:00 yesterday and dateTo = 06:00 today
    // 2. else if time now GREATER THAN EQUAL to 06:00 o'clock, dateFrom = 06:00 today and dateTo = 06:00 tomorrow

    // Choose condition 1
    let fromDate = moment()
      .subtract(1, 'days')
      .format('YYYY-MM-DD 06:00:00');
    let toDate = moment().format('YYYY-MM-DD 06:00:00');
    if (moment().isSameOrAfter(moment().format('YYYY-MM-DD 06:00:00'))) {
      // choose condition 2
      fromDate = moment().format('YYYY-MM-DD 06:00:00');
      toDate = moment()
        .add(1, 'days')
        .format('YYYY-MM-DD 06:00:00');
    }

    const qb1 = createQueryBuilder();
    qb1.addSelect('kt.korwil_transaction_id', 'id');
    qb1.from('korwil_transaction', 'kt');
    qb1.andWhere('kt.branch_id = :branchIdTemp', {
      branchIdTemp: branchId,
    });
    qb1.andWhere('kt.user_id = :userId', {
      userId: authMeta.userId,
    });
    qb1.andWhere('kt.employee_journey_id Is Not Null');
    qb1.andWhere(
      'kt.created_time >= :startDate and kt.created_time <= :endDate',
      {
        startDate: fromDate,
        endDate: toDate,
      },
    );
    qb1.andWhere('kt.is_deleted = false');
    qb1.orderBy('created_time', 'DESC');
    const dataKorwil = await qb1.getRawOne();
    let id = dataKorwil ? dataKorwil.id : null;

    // get data item list
    const data = await this.getDataListItem(branchId, authMeta.userId, id, permissonPayload.roleId);
    let result = new ItemListKorwilResponseVm();
    if (data.length != 0) {
      result.itemList = data;
      result.korwilTransactionId = data[0].korwilTransactionId;
      result.status = data[0].statusTransaction;
    } else {
      result = await this.insertAndGetKorwilTransactionDetail(branchId, permissonPayload.roleId);
    }
    return result;
  }

  public static validateHistory(payload: KorwilHistoryPayloadVm) {
    let checkInDateFrom = null;
    let checkInDateTo = null;
    let checkOutDateFrom = null;
    let checkOutDateTo = null;

    if (
      payload.status &&
      payload.status != 'checkIn' &&
      payload.status != 'checkOut'
    ) {
      return {
        status: 'error',
        message: 'status filter harus checkIN atau checkOut',
        data: null,
      };
    }
    if (
      payload.sortDir &&
      payload.sortDir != 'asc' &&
      payload.sortDir != 'desc'
    ) {
      return {
        status: 'error',
        message: 'status filter harus asc atau desc',
        data: null,
      };
    }

    if (payload.checkInDateFrom && payload.checkInDateTo) {
      if (moment(payload.checkInDateFrom, 'ddd MMM DD YYYY', true).isValid()) {
        checkInDateFrom = moment(payload.checkInDateFrom, 'ddd MMM DD YYYY');
        checkInDateTo = moment(payload.checkInDateTo, 'ddd MMM DD YYYY');
      } else if (
        moment(payload.checkInDateFrom, 'DD MMM YYYY', true).isValid()
      ) {
        checkInDateFrom = moment(payload.checkInDateFrom, 'DD MMM YYYY');
        checkInDateTo = moment(payload.checkInDateTo, 'DD MMM YYYY');
      } else {
        checkInDateFrom = moment(payload.checkInDateFrom);
        checkInDateTo = moment(payload.checkInDateTo);
      }
    }

    if (payload.checkOutDateFrom && payload.checkOutDateTo) {
      if (moment(payload.checkOutDateFrom, 'ddd MMM DD YYYY', true).isValid()) {
        checkOutDateFrom = moment(payload.checkOutDateFrom, 'ddd MMM DD YYYY');
        checkOutDateTo = moment(payload.checkOutDateTo, 'ddd MMM DD YYYY');
      } else if (
        moment(payload.checkOutDateFrom, 'DD MMM YYYY', true).isValid()
      ) {
        checkOutDateFrom = moment(payload.checkOutDateFrom, 'DD MMM YYYY');
        checkOutDateTo = moment(payload.checkOutDateTo, 'DD MMM YYYY');
      } else {
        checkOutDateFrom = moment(payload.checkOutDateFrom);
        checkOutDateTo = moment(payload.checkOutDateTo);
      }
    }

    checkInDateFrom = checkInDateFrom
      ? checkInDateFrom.format('YYYY-MM-DD 00:00:00')
      : moment().format('YYYY-MM-DD 00:00:00');
    checkInDateTo = checkInDateTo
      ? checkInDateTo.format('YYYY-MM-DD 23:59:59')
      : moment().format('YYYY-MM-DD 23:59:59');

    if (moment(checkInDateTo).isBefore(checkInDateFrom)) {
      return {
        status: 'error',
        message: 'Tanggal Check In yang dipilih tidak valid',
        data: null,
      };
    }

    checkOutDateFrom = checkOutDateFrom
      ? checkOutDateFrom.format('YYYY-MM-DD 00:00:00')
      : moment().format('YYYY-MM-DD 00:00:00');
    checkOutDateTo = checkOutDateTo
      ? checkOutDateTo.format('YYYY-MM-DD 23:59:59')
      : moment().format('YYYY-MM-DD 23:59:59');

    if (moment(checkOutDateTo).isBefore(checkOutDateFrom)) {
      return {
        status: 'error',
        message: 'Tanggal Check Out yang dipilih tidak valid',
        data: null,
      };
    }

    return {
      status: 'ok',
      message: '',
      data: [checkInDateFrom, checkInDateTo, checkOutDateFrom, checkOutDateTo],
    };
  }

  public static async getListTransactionHistory(
    payload: KorwilHistoryPayloadVm,
  ): Promise<KorwilHistoryResponseVm> {
    // mapping search field and operator default ilike
    // payload.fieldResolverMap['korwilTransactionId'] = 't1.korwil_transaction_id';
    const authMeta = AuthService.getAuthMetadata();
    const repo = new OrionRepositoryService(KorwilTransaction, 't1');
    const result = new KorwilHistoryResponseVm();

    const res = this.validateHistory(payload);

    if (res.status == 'error') {
      result.status = 'error';
      result.message = res.message;
      result.data = [];
      return result;
    }

    const checkInDateFrom = res.data[0];
    const checkInDateTo = res.data[1];
    const checkOutDateFrom = res.data[2];
    const checkOutDateTo = res.data[3];
    const sortDir = payload.sortDir ? payload.sortDir.toUpperCase() : 'DESC';

    // NOTE: get all korwil only status = 1 (done)
    const q = repo.findAllRaw();
    payload.applyToOrionRepositoryQuery(q, true);

    q.selectRaw(
      ['t1.korwil_transaction_id', 'korwilTransactionId'],
      ['COUNT(CASE WHEN t4.is_done = true then 1 END)', 'totalTask'],
      ['t1.user_id', 'userId'],
      ['t2.check_in_date', 'checkInDate'],
      ['t2.check_out_date', 'checkOutDate'],
      ['t3.branch_id', 'branchId'],
      ['t3.branch_name', 'branchName'],
    );
    q.innerJoin(e => e.employeeJourney, 't2', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.innerJoin(e => e.branches, 't3', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.leftJoin(e => e.korwilTransactionDetail, 't4', j =>
      j.andWhere(e => e.isDeleted, w => w.isFalse()),
    );
    q.andWhere(e => e.employeeJourneyId, w => w.isNotNull());
    q.andWhere(e => e.userId, w => w.equals(authMeta.userId));
    q.andWhere(e => e.status, w => w.equals(1));
    if (payload.branchId) {
      q.andWhere(e => e.branchId, w => w.equals(payload.branchId));
    }

    // NOTE: if status checkIn filter checkIn date
    // if status checkOut filter checkOut date
    // else filter all checkIn and checkOut date
    if (payload.status && payload.status == 'checkIn') {
      q.andWhere(e => e.employeeJourney.checkOutDate, w => w.isNull());
      q.andWhere(
        e => e.employeeJourney.checkInDate,
        w => w.greaterThanOrEqual(checkInDateFrom),
      );
      q.andWhere(
        e => e.employeeJourney.checkInDate,
        w => w.lessThanOrEqual(checkInDateTo),
      );
    } else if (payload.status && payload.status == 'checkOut') {
      q.andWhere(e => e.employeeJourney.checkOutDate, w => w.isNotNull());
      q.andWhere(
        e => e.employeeJourney.checkOutDate,
        w => w.greaterThanOrEqual(checkOutDateFrom),
      );
      q.andWhere(
        e => e.employeeJourney.checkOutDate,
        w => w.lessThanOrEqual(checkOutDateTo),
      );
    } else {
      q.andWhereIsolated(qw => {
        qw.andWhereIsolated(qw2 => {
          qw2.andWhere(
            e => e.employeeJourney.checkOutDate,
            w => w.greaterThanOrEqual(checkOutDateFrom),
          );
          qw2.andWhere(
            e => e.employeeJourney.checkOutDate,
            w => w.lessThanOrEqual(checkOutDateTo),
          );
        });
        qw.orWhere(e => e.employeeJourney.checkOutDate, w => w.isNull());
      });
      q.andWhere(
        e => e.employeeJourney.checkInDate,
        w => w.greaterThanOrEqual(checkInDateFrom),
      );
      q.andWhere(
        e => e.employeeJourney.checkInDate,
        w => w.lessThanOrEqual(checkInDateTo),
      );
    }
    q.groupByRaw('t1.korwil_transaction_id, t1.user_id, t2.check_in_date, t2.check_out_date, t3.branch_id, t3.branch_name');
    if (sortDir == 'DESC') {
      q.orderBy({
        createdTime: 'DESC',
      });
    } else {
      q.orderBy({
        createdTime: 'ASC',
      });
    }
    const data = await q.exec();
    const total = await q.countWithoutTakeAndSkip();

    result.data = data;
    result.paging = MetaService.set(payload.page, payload.limit, total);

    return result;
  }

  public static async detailPDF(
    korwilTransactionId: string,
  ): Promise<DetailHistoryKorwilResponseVm> {
    const result = {
      items: [],
      checkInDate: null,
      checkOutDate: null,
      korwilTransactionId: null,
      statusKorwil: null,
      status: 'ok',
      message: '',
    };
    const initDetailItem = {
      korwilItemName: null,
      korwilItemId: null,
      isDone: null,
      statusItem: null,
      note: null,
      photo: null,
      isRequired: null,
    };
    const authMeta = AuthService.getAuthMetadata();
    var items = [];

    // NOTE: get transaction and detail name
    const qb = createQueryBuilder();
    qb.addSelect('ki.korwil_item_name', 'korwilItemName');
    qb.addSelect('ki.korwil_item_id', 'korwilItemId');
    qb.addSelect(
      'ktd.korwil_transaction_detail_id',
      'korwilTransactionDetailId',
    );
    qb.addSelect('ktd.is_done', 'isDone');
    qb.addSelect('ktd.status', 'statusItem');
    qb.addSelect("COALESCE(ktd.note, '')", 'note');
    qb.addSelect('COALESCE(ej.check_in_date, null)', 'checkInDate');
    qb.addSelect('COALESCE(ej.check_out_date, null)', 'checkOutDate');
    qb.addSelect('kt.korwil_transaction_id', 'korwilTransactionId');
    qb.addSelect('kt.status', 'statusKorwil');
    qb.addSelect('ki.is_required', 'isRequired');
    qb.from('korwil_transaction', 'kt');
    qb.innerJoin(
      'employee_journey',
      'ej',
      'ej.employee_journey_id = kt.employee_journey_id',
    );
    qb.innerJoin(
      'korwil_transaction_detail',
      'ktd',
      'ktd.korwil_transaction_id = kt.korwil_transaction_id AND ktd.is_deleted = false',
    );
    qb.innerJoin(
      'korwil_item',
      'ki',
      'ki.korwil_item_id = ktd.korwil_item_id AND ki.is_deleted = false',
    );
    qb.where('kt.is_deleted = false');
    qb.where('kt.status = 1');
    qb.andWhere('kt.user_id = :userId', {
      userId: authMeta.userId,
    });
    qb.andWhere('kt.korwil_transaction_id = :korwilId', {
      korwilId: korwilTransactionId,
    });
    qb.orderBy('ki.sort_order', 'ASC');
    const data = await qb.getRawMany();

    if (isEmpty(data)) {
      result.status = 'error';
      result.message = 'Data tidak ditemukan';
      return result;
    }

    for (let i = 0; i < data.length; i++) {
      // NOTE: each of item korwil get the detail photo
      const q = createQueryBuilder();
      q.addSelect('at.url', 'url');
      q.addSelect('ktdp.photo_id', 'id');
      q.from('korwil_transaction_detail_photo', 'ktdp');
      q.innerJoin(
        'attachment_tms',
        'at',
        'at.attachment_tms_id = ktdp.photo_id AND at.is_deleted = false',
      );
      q.where('ktdp.is_deleted = false');
      q.andWhere(
        'ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId',
        {
          korwilTransactionDetailId: data[i].korwilTransactionDetailId,
        },
      );
      const photos = await q.getRawMany();
      const detailItem = initDetailItem;
      detailItem.korwilItemName = data[i].korwilItemName;
      detailItem.korwilItemId = data[i].korwilItemId;
      detailItem.isDone = data[i].isDone;
      detailItem.statusItem = data[i].statusItem;
      detailItem.note = data[i].note;
      detailItem.isRequired = data[i].isRequired;
      detailItem.photo = photos;
      let temp = clone(detailItem);
      items.push(temp);
    }
    result.items = items;
    result.checkInDate = data[0].checkInDate;
    result.checkOutDate = data[0].checkOutDate;
    result.korwilTransactionId = data[0].korwilTransactionId;
    result.statusKorwil = data[0].statusKorwil;

    return result;
  }

  public static async getDetailPhoto(
    korwilTransactionDetailId: string,
  ): Promise<DetailPhotoKorwilResponseVm> {
    const authMeta = AuthService.getAuthMetadata();

    // detail photo
    let qb = createQueryBuilder();
    qb.addSelect('ktd.note', 'note');
    qb.addSelect('ktd.is_done', 'isDone');
    qb.addSelect('ktd.status', 'status');
    qb.from('korwil_transaction_detail', 'ktd');
    qb.where('ktd.is_deleted = false');
    qb.andWhere(
      'ktd.korwil_transaction_detail_id = :korwilTransactionDetailId',
      { korwilTransactionDetailId: korwilTransactionDetailId },
    );

    const data = await qb.getRawOne();
    const result = new DetailPhotoKorwilResponseVm();
    result.isDone = data.isDone;
    result.note = data.note;
    result.status = data.status;

    qb = createQueryBuilder();
    qb.addSelect('at.url', 'url');
    qb.addSelect('ktdp.photo_id', 'id');
    qb.from('korwil_transaction_detail_photo', 'ktdp');
    qb.innerJoin(
      'attachment_tms',
      'at',
      'at.attachment_tms_id = ktdp.photo_id AND at.is_deleted = false',
    );
    qb.where('ktdp.is_deleted = false');
    qb.andWhere(
      'ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId',
      { korwilTransactionDetailId: korwilTransactionDetailId },
    );
    const dataUrl = await qb.getRawMany();

    result.photo = dataUrl;
    return result;
  }

  public static async validateBranchCoordinate(
    payload: MobileValidateCoordinateKorwilTransactionPayloadVm,
  ): Promise<MobileKorwilTransactionResponseVm> {
    const result = new MobileKorwilTransactionResponseVm();
    result.message = 'success';
    result.status = 'ok';

    const responseCheckBranch = await this.validateBranchByCoordinate(
      payload.latitude,
      payload.longitude,
      payload.branchId,
    );
    if (responseCheckBranch.status == false) {
      result.status = 'error';
      result.message = responseCheckBranch.message;
    }

    return result;
  }
  public static async updateTransaction(
    payload: MobilePostKorwilTransactionPayloadVm,
    files,
  ): Promise<MobileKorwilTransactionResponseVm> {
    const result = new MobileKorwilTransactionResponseVm();
    const authMeta = AuthService.getAuthMetadata();
    const timeNow = moment().toDate();

    result.message = 'success';
    result.status = 'ok';

    // validate branch must near coordinate user
    const responseCheckBranch = await this.validateBranchByCoordinate(
      payload.latitude,
      payload.longitude,
      payload.branchId,
    );
    if (responseCheckBranch.status == false) {
      result.status = 'error';
      result.message = responseCheckBranch.message;
      return result;
    } else if (payload.status < 1 || payload.status > 2) {
      result.status = 'error';
      result.message = 'Status yang dikirim hanya boleh 1 atau 2';
      return result;
    }

    let qb = createQueryBuilder();
    qb.addSelect(
      'ktd.korwil_transaction_detail_id',
      'korwilTransactionDetailId',
    );
    qb.from('korwil_transaction_detail', 'ktd');
    qb.innerJoin(
      'korwil_transaction',
      'kt',
      'kt.korwil_transaction_id = ktd.korwil_transaction_id AND ktd.is_deleted = false',
    );
    qb.where('ktd.is_deleted = false');
    qb.andWhere(
      'ktd.korwil_transaction_detail_id = :korwilTransactionDetailId',
      {
        korwilTransactionDetailId: payload.korwilTransactionDetailId,
      },
    );
    qb.andWhere('kt.korwil_transaction_id = :korwilTransactionId', {
      korwilTransactionId: payload.korwilTransactionId,
    });
    const checkData = await qb.getRawOne();

    if (!checkData) {
      result.message = 'Data korwil tidak ditemukan';
      result.status = 'error';
      return result;
    }

    let countInsertedImage = 0;
    // upload image
    files.forEach(file => {
      countInsertedImage++;
      this.uploadImage(file, payload.korwilTransactionDetailId);
    });

    // Delete unused photo
    const deletedPhotos = JSON.parse(payload.deletedPhotos);
    if (deletedPhotos) {
      deletedPhotos.forEach(id => {
        this.deletePhotoKorwil(id);
      });
    }

    // GET total photo after delete and upload
    let qb1 = createQueryBuilder();
    qb1.addSelect(
      'ktdp.korwil_transaction_detail_photo_id',
      'korwilTransactionDetailPhotoId',
    );
    qb1.from('korwil_transaction_detail_photo', 'ktdp');
    qb1.where('ktdp.is_deleted = false');
    qb1.andWhere(
      'ktdp.korwil_transaction_detail_id = :korwilTransactionDetailId',
      {
        korwilTransactionDetailId: payload.korwilTransactionDetailId,
      },
    );
    const photos = await qb1.getRawMany();
    const temp = photos.length;

    const deletedPhotoLength = deletedPhotos ? deletedPhotos.length : 0;
    const countPhoto = temp - deletedPhotoLength + countInsertedImage;
    // update count photo in korwil
    let korwilTransactionDetail = await KorwilTransactionDetail.findOne({
      where: {
        korwilTransactionDetailId: payload.korwilTransactionDetailId,
      },
    });
    korwilTransactionDetail.latChecklist = payload.latitude;
    korwilTransactionDetail.longChecklist = payload.longitude;
    korwilTransactionDetail.note = payload.note;
    // korwilTransactionDetail.isDone = payload.isDone;
    korwilTransactionDetail.status = payload.status;
    korwilTransactionDetail.userIdUpdated = authMeta.userId;
    korwilTransactionDetail.updatedTime = timeNow;
    korwilTransactionDetail.photoCount = countPhoto;
    await KorwilTransactionDetail.save(korwilTransactionDetail);

    return result;
  }

  private static async uploadImage(file, korwilTransactionDetailId) {
    if (file) {
      const timeNow = moment().toDate();
      const authMeta = AuthService.getAuthMetadata();
      let attachmentId = null;
      const attachment = await AttachmentService.uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        file.mimetype,
        'tms-korwil',
      );
      if (attachment) {
        attachmentId = attachment.attachmentTmsId;
      }

      const korwilTransactionDetailPhoto = KorwilTransactionDetailPhoto.create();
      korwilTransactionDetailPhoto.photoId = attachmentId;
      korwilTransactionDetailPhoto.korwilTransactionDetailId = korwilTransactionDetailId;
      korwilTransactionDetailPhoto.isDeleted = false;
      korwilTransactionDetailPhoto.updatedTime = timeNow;
      korwilTransactionDetailPhoto.createdTime = timeNow;
      korwilTransactionDetailPhoto.userIdCreated = authMeta.userId;
      korwilTransactionDetailPhoto.userIdUpdated = authMeta.userId;
      await KorwilTransactionDetailPhoto.save(korwilTransactionDetailPhoto);
    }
  }

  private static async getTotalTask(korwilTransactionId) {
    const qb = createQueryBuilder();
    qb.addSelect('COUNT(ktd.korwil_transaction_detail_id)', 'totalTask');
    qb.addSelect('COUNT(CASE WHEN ktd.is_done = true then 1 END)', 'totalTaskDone');
    qb.from('korwil_item', 'ki');
    qb.innerJoin(
      'korwil_transaction_detail',
      'ktd',
      'ktd.korwil_item_id = ki.korwil_item_id AND ktd.is_deleted = false',
    );
    qb.where('ki.is_deleted = false');
    qb.where('ktd.korwil_transaction_id = :korwilTransactionIdTemp', {
      korwilTransactionIdTemp: korwilTransactionId,
    });
    qb.limit(1);
    const data = await qb.getRawMany();
    const result = [data[0].totalTask, data[0].totalTaskDone];
    return result;
  }

  private static async deletePhotoKorwil(id) {
    const attachmentTms = await AttachmentTms.findOne({
      where: {
        attachmentTmsId: Number(id),
        isDeleted: false,
      },
    });
    if (attachmentTms) {
      AttachmentService.deleteAttachment(attachmentTms.attachmentTmsId);
    }

    const deleteKorwilPhoto = await KorwilTransactionDetailPhoto.findOne({
      where: {
        photoId: Number(id),
        isDeleted: false,
      },
    });
    if (deleteKorwilPhoto) {
      deleteKorwilPhoto.isDeleted = true;
      await KorwilTransactionDetailPhoto.save(deleteKorwilPhoto);
    }
  }

  public static async validateBranchByCoordinate(
    lat,
    long,
    branchId,
  ): Promise<ValidateBranchCoordinateResponseVm> {
    const lata = parseFloat(lat);
    const longa = parseFloat(long);
    const radius = [0.5, 0.5]; // in kilometer
    const data = [];
    const response = new ValidateBranchCoordinateResponseVm();
    let nearby_branch = await this.getNearby(lata, longa, radius[0]);

    response.status = false;
    response.message = 'Lokasi anda tidak sesuai dengan lokasi gerai';

    const res = await RawQueryService.query(`SELECT branch_id FROM branch WHERE is_deleted = false
      AND longitude IS NOT NULL AND latitude IS NOT NULL
      AND latitude::float >= ${nearby_branch[0]} AND latitude::float <= ${
      nearby_branch[2]
      }
      AND longitude::float >= ${nearby_branch[1]} AND longitude::float <= ${
      nearby_branch[3]
      }
      AND branch_id = ${branchId}`);
    if (res.length != 0) {
      response.message = 'Lokasi branch valid';
      response.status = true;
    }
    return response;
  }

  static async getNearby(lat, long, radius) {
    // NOTE:
    // PURPOSE: get latitude and longitude in radius by method get_nearby
    // (see https://gist.github.com/rochacbruno/2883505)

    // offsets in kilometers
    const dn = radius;
    const de = radius;

    // coordinate offsets in radians
    const dLat = dn / this.E_RADIUS;
    const dLon = de / (this.E_RADIUS * Math.cos((Math.PI * lat) / 180));

    // offset position, decimal degrees
    const min_lat = lat - (dLat * 180) / Math.PI;
    const min_lon = long - (dLon * 180) / Math.PI;

    // offset position, decimal degrees
    const max_lat = lat + (dLat * 180) / Math.PI;
    const max_lon = long + (dLon * 180) / Math.PI;

    return [min_lat, min_lon, max_lat, max_lon];
  }

  static async haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    // var dlat: number, dlon: number, a: number, c: number, R: number;
    let dlat, dlon, a, c, R: number;

    dlat = this.radians(lat2 - lat1);
    dlon = this.radians(lon2 - lon1);
    lat1 = this.radians(lat1);
    lat2 = this.radians(lat2);
    a =
      Math.sin(dlat / 2) * Math.sin(dlat / 2) +
      Math.sin(dlon / 2) * Math.sin(dlon / 2) * Math.cos(lat1) * Math.cos(lat2);
    c = 2 * Math.asin(Math.sqrt(a));
    return this.E_RADIUS * c;
  }

  static radians(degree: number) {
    // degrees to radians
    return (degree * Math.PI) / 180;
  }
}
