import { DropCashlessVm, DropCashLessResponseVM } from '../../models/partner/fastpay-drop.vm';
import moment = require('moment');
import { BadRequestException } from '@nestjs/common';
import { RawQueryService } from '../../../../shared/services/raw-query.service';
import { WorkOrder } from '../../../../shared/orm-entity/work-order';
import { CustomCounterCode } from '../../../../shared/services/custom-counter-code.service';
import { WorkOrderDetail } from '../../../../shared/orm-entity/work-order-detail';
import { PickupRequestDetail } from '../../../../shared/orm-entity/pickup-request-detail';
import { WorkOrderHistory } from '../../../../shared/orm-entity/work-order-history';
import { BranchPartner } from '../../../../shared/orm-entity/branch-partner';
import { BranchChildPartner } from '../../../../shared/orm-entity/branch-child-partner';
import { Not } from 'typeorm';

export class PartnerFastpayService {

  static async dropCash(
    payload: DropCashlessVm,
  ): Promise<DropCashLessResponseVM> {
    return await this.dropCashless(payload);
  }

  static async dropCashless(
    payload: DropCashlessVm,
  ): Promise<DropCashLessResponseVM> {
    // check branch partner code
    const branchPartner = await this.getDataBranchChild(payload.branchCode);
    if (branchPartner) {
      // NOTE: check pickup request with awb number
      let pickupRequest = await this.getPickupRequestAwbNumber(
        payload.awbNumber,
      );
      // check pickup reqeust with referenceNo
      if (!pickupRequest) {
        pickupRequest = await this.getPickupRequestReferenceNo(
          payload.awbNumber,
        );
      }

      if (pickupRequest) {
        const timeNow = moment().toDate();
        const branchPartnerId = branchPartner.branchPartnerId;
        const pickupRequestDetailId = pickupRequest.pickupRequestDetailId;
        let workOrderId = pickupRequest.workOrderIdLast;

        if (workOrderId) {
          const workOrder = await WorkOrder.findOne({
            select: ['workOrderId', 'workOrderStatusIdLast'],
            where: { workOrderId, workOrderStatusIdLast: Not(7050), isDeleted: false },
          });
          if (workOrder) {
            await WorkOrder.update(
              { workOrderId },
              {
                branchIdAssigned: 0,
                branchId: 0,
                workOrderStatusIdLast: 7050,
                branchPartnerId,
                updatedTime: timeNow,
              },
            );
            // with status drop partner
            await this.createWorkOrderHistory(workOrderId, timeNow);
          } else {
            throw new BadRequestException('Data sudah di proses!');
          }
        } else {
          // Create data work order
          workOrderId = await this.createWorkOrder(branchPartnerId, timeNow);
          if (workOrderId) {
            // create data work order detail
            await this.createWorkOrderDetail(
              workOrderId,
              pickupRequest.pickupRequestId,
              pickupRequest.awbItemId,
              timeNow,
            );
            // update pickup request detail
            await PickupRequestDetail.update(
              { pickupRequestDetailId },
              {
                workOrderIdLast: workOrderId,
                userIdUpdated: 1,
                updatedTime: timeNow,
              },
            );
            // with status drop partner
            await this.createWorkOrderHistory(workOrderId, timeNow);
          } else {
            throw new BadRequestException('Gagal menyimpan data');
          }
        }

        // handle response request
        return this.handleResult(pickupRequest);
      } else {
        throw new BadRequestException('Data resi tidak ditemukan!');
      }
    } else {
      throw new BadRequestException('Data gerai tidak ditemukan!');
    }
  }

  private static async handleResult(
    pickupRequest: any,
  ): Promise<DropCashLessResponseVM> {
    return {
      partner: pickupRequest.partner,
      noRef: pickupRequest.noRef,
      refAwbNumber: pickupRequest.refAwbNumber,
      recipientCity: pickupRequest.recipientCity,
      deliveryType: pickupRequest.deliveryType,
      shipperName: pickupRequest.shipperName,
      shipperAddress: pickupRequest.shipperAddress,
      shipperDistrict: pickupRequest.shipperDistrict,
      shipperCity: pickupRequest.shipperCity,
      shipperProvince: pickupRequest.shipperProvince,
      shipperZip: pickupRequest.shipperZip,
      shipperPhone: pickupRequest.shipperPhone,
      recipientName: pickupRequest.recipientName,
      recipientAddress: pickupRequest.recipientAddress,
      recipientDistrict: pickupRequest.recipientDistrict,
      recipientProvince: pickupRequest.recipientProvince,
      recipientZip: pickupRequest.recipientZip,
      recipientPhone: pickupRequest.recipientPhone,
    };
  }

  private static async createWorkOrder(branchPartnerId: number, timeNow: Date) {
    const workOrderCode = await CustomCounterCode.workOrderCodeRandom(timeNow);
    const dataWorkOrder = WorkOrder.create({
      workOrderCode,
      workOrderDate: timeNow,
      pickupScheduleDateTime: timeNow,
      workOrderStatusIdLast: 7050,
      workOrderStatusIdPick: null,
      branchIdAssigned: 0,
      branchId: 0,
      isMember: false,
      workOrderType: 'automatic',
      branchPartnerId,
      userId: 1,
      userIdCreated: 1,
      createdTime: timeNow,
      userIdUpdated: 1,
      updatedTime: timeNow,
    });
    const workOrder = await WorkOrder.insert(dataWorkOrder);
    return workOrder.identifiers.length
      ? workOrder.identifiers[0].workOrderId
      : null;
  }

  private static async createWorkOrderDetail(
    workOrderId: number,
    pickupRequestId: number,
    awbItemId: number,
    timeNow: Date,
  ) {
    const workOrderDetail = WorkOrderDetail.create({
      workOrderId,
      pickupRequestId,
      workOrderStatusIdLast: 7050,
      workOrderStatusIdPick: null,
      awbItemId,
      userIdCreated: 1,
      createdTime: timeNow,
      userIdUpdated: 1,
      updatedTime: timeNow,
    });
    return await WorkOrderDetail.insert(workOrderDetail);
  }

  private static async createWorkOrderHistory(
    workOrderId: number,
    timeNow: Date,
  ) {
    const branchId = 111; // hardcode branch id (fastpay)
    const workOrderHistory = WorkOrderHistory.create({
      workOrderId,
      workOrderDate: timeNow,
      workOrderStatusId: 7050,
      userId: 1,
      branchId,
      isFinal: true,
      historyDateTime: timeNow,
      userIdCreated: 1,
      createdTime: timeNow,
      userIdUpdated: 1,
      updatedTime: timeNow,
    });
    return await WorkOrderHistory.insert(workOrderHistory);
  }

  private static async getPickupRequestAwbNumber(awb: string): Promise<any> {
    const query = `
      SELECT p.partner_name as "partner",
            pr.reference_no as "noRef",
            prd.pickup_request_id as "pickupRequestId",
            prd.pickup_request_detail_id as "pickupRequestDetailId",
            prd.awb_item_id as "awbItemId",
            prd.ref_awb_number as "refAwbNumber",
            prd.recipient_city as "recipientCity",
            prd.delivery_type as "deliveryType",
            prd.shipper_name as "shipperName",
            prd.shipper_address as "shipperAddress",
            prd.shipper_district as "shipperDistrict",
            prd.shipper_city as "shipperCity",
            prd.shipper_province as "shipperProvince",
            prd.shipper_zip as "shipperZip",
            prd.shipper_phone as "shipperPhone",
            prd.recipient_name as "recipientName",
            prd.recipient_address as "recipientAddress",
            prd.recipient_district as "recipientDistrict",
            prd.recipient_city as "recipientCity",
            prd.recipient_province as "recipientProvince",
            prd.recipient_zip as "recipientZip",
            prd.recipient_phone as "recipientPhone",
            prd.work_order_id_last as "workOrderIdLast"
      FROM pickup_request_detail prd
        JOIN pickup_request pr ON pr.pickup_request_id = prd.pickup_request_id
        JOIN partner p ON pr.partner_id = p.partner_id
      WHERE prd.ref_awb_number = :awb AND prd.is_deleted = FALSE;
    `;
    const rawData = await RawQueryService.queryWithParams(query, { awb });
    return rawData.length ? rawData[0] : null;
  }

  private static async getPickupRequestReferenceNo(
    referenceNo: string,
  ): Promise<any> {
    const query = `
      SELECT p.partner_name as "partner",
            pr.reference_no as "noRef",
            prd.pickup_request_id as "pickupRequestId",
            prd.pickup_request_detail_id as "pickupRequestDetailId",
            prd.awb_item_id as "awbItemId",
            prd.ref_awb_number as "refAwbNumber",
            prd.recipient_city as "recipientCity",
            prd.delivery_type as "deliveryType",
            prd.shipper_name as "shipperName",
            prd.shipper_address as "shipperAddress",
            prd.shipper_district as "shipperDistrict",
            prd.shipper_city as "shipperCity",
            prd.shipper_province as "shipperProvince",
            prd.shipper_zip as "shipperZip",
            prd.shipper_phone as "shipperPhone",
            prd.recipient_name as "recipientName",
            prd.recipient_address as "recipientAddress",
            prd.recipient_district as "recipientDistrict",
            prd.recipient_city as "recipientCity",
            prd.recipient_province as "recipientProvince",
            prd.recipient_zip as "recipientZip",
            prd.recipient_phone as "recipientPhone",
            prd.work_order_id_last as "workOrderIdLast"
      FROM pickup_request pr
        JOIN pickup_request_detail prd ON pr.pickup_request_id = prd.pickup_request_id
        JOIN partner p ON pr.partner_id = p.partner_id
      WHERE pr.reference_no = :referenceNo AND pr.is_deleted = FALSE;
    `;
    const rawData = await RawQueryService.queryWithParams(query, {
      referenceNo,
    });
    return rawData.length ? rawData[0] : null;
  }

  private static async getDataBranchChild(branchCode: string) {
    // Branch Child Partner
    let branchPartner = null;
    branchPartner = await BranchChildPartner.findOne({
      select: ['branchPartnerId'],
      where: {
        branchChildPartnerCode: branchCode,
        isDeleted: false,
      },
    });
    // Branch Partner
    if (!branchPartner) {
      branchPartner = await BranchPartner.findOne({
        select: ['branchPartnerId'],
        where: {
          branchPartnerCode: branchCode,
          isDeleted: false,
        },
      });
    }
    return branchPartner;
  }
}
