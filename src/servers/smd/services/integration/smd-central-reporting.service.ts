import { Injectable } from '@nestjs/common';
import moment = require('moment');
import FormData = require('form-data');
import axios from 'axios';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  GenerateQueueFormDataPayloadVm,
  GenerateQueueOptionPayloadVm,
  GenerateQueueSmdBerangkatPayload, GenerateQueueSmdVendorPayload, GenerateQueueDaftarScanMasukGabungPaketPayload,
  ListCentralExportPayloadVm,
  ListQueueRequestParamPayloadVm, GenerateQueueDaftarGsk,
} from '../../models/smd-central-reporting.payload.vm';
import { MetaService } from '../../../../shared/services/meta.service';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';

@Injectable()
export class SmdCentralReportingService {
  private static get baseUrlInternal() {
    return 'http://api-internal.sicepat.io/operation/reporting-service';
  }

  static async getListQueueSmd(payload: ListCentralExportPayloadVm, type: string): Promise<any> {
    try {
      const authMeta = AuthService.getAuthData();
      const params: ListQueueRequestParamPayloadVm = {
        ...payload,
        userId: authMeta.userId,
        reportType: type,
      };

      return this.listQueueRequest(params);
    } catch (e) {
      throw e.message;
    }
  }

  static async getBranch(branchId): Promise<string> {
    let branchName = '';
    const dataBranch = await Branch.findOne({where: {
        branchId,
      }});
    if (dataBranch) {
      branchName = dataBranch.branchName;
      branchName = branchName.replace(/ /g, '_');
    }
    return branchName;
  }

  static async getRepresentative(representativeCode): Promise <string> {
    let representativeName = '';
    const dataRepresentative = await Representative.findOne({where: {
        representativeCode,
      }});
    if (dataRepresentative) {
      representativeName = dataRepresentative.representativeName;
      representativeName = representativeName.replace(/ /g, '_');
    }

    return  representativeName;
  }

  static async generateQueueSmd(payload: any, type: string) {
    try {
      const authMeta = AuthService.getAuthData();
      let encodeQuery = ``;
      let branchName = 'Semua_Cabang';
      switch (type) {
        case 'smd_tiba' :
          encodeQuery = await this.querySmdTiba(payload); break;
        case 'monitoring_smd' :
          encodeQuery = await this.queryMonitoringSmd(payload); break;
        case 'smd_berangkat' :
          encodeQuery = await this.querySmdBerangkat(payload); break;
        case 'smd_vendor' :
          encodeQuery = await this.querySmdVendor(payload); break;
        case 'daftar_scan_masuk_gabung_paket' :
          encodeQuery = await this.queryDaftarScanMasukGabungPaket(payload); break;
        case 'daftar_gsk' :
          encodeQuery = await this.queryDaftarGsk(payload); break;
        default:
          encodeQuery = await this.querySmdTiba(payload); break;
      }

      if (type === 'daftar_gsk') {
        branchName = 'Semua_Perwakilan';
        if (payload.representativeCode != '') {
          branchName = await this.getRepresentative(payload.representativeCode);
        }
      } else if (type === 'monitoring_smd') {
        branchName = 'Semua_Surat_Jalan';
        if (payload.isIntercity == 1) {
          branchName = 'Surat_Jalan_Dalam_Kota';
        } else if (payload.isIntercity == 2) {
          branchName = 'Surat_Jalan_Darat';
        }
      } else {
        if (payload.branchId != null && payload.branchId != 0) {
          branchName = await this.getBranch(payload.branchId);
        }
        if (type === 'smd_vendor') {
          let vendor = 'Semua_Vendor';
          // console.log("payload.vendorName", payload.vendorName);
          if (payload.vendorName !== '') {
            // console.log('masuk if vendor');
            vendor = payload.vendorName;
            vendor = vendor.replace(/ /g, '_');
          }

          branchName = branchName + '_vendor_' + vendor ;
          console.log('branchName', branchName);
        }
      }

      const filename = `${type}_${payload.startDate}-${payload.endDate}_${moment().format('YYYYMMDDHHmmss')}|${branchName}`;
      const params: GenerateQueueOptionPayloadVm = {
        userId: authMeta.userId,
      };
      const formData: GenerateQueueFormDataPayloadVm = {
        encodeQuery,
        filename,
        reportType: type,
      };
      return this.generateQueueRequest(params, formData);
    } catch (e) {
      throw e.message;
    }
  }

  static async querySmdVendor(payload: GenerateQueueSmdVendorPayload): Promise<any> {
    let query = `SELECT \n
          t1.vendor_id AS vendor_id, \n
          t1.vendor_name AS vendor_name, \n
          t2.vendor_code AS vendor_code, \n
          t3.do_smd_detail_id AS do_smd_detail_id, \n
          t4.branch_name AS branch_name, \n
          t4.branch_id AS branch_id, \n
          t1.do_smd_id AS do_smd_id, \n
          t1.do_smd_code AS do_smd_code, \n
          t1.do_smd_time AS do_smd_time, \n
          t1.total_bag AS total_bag, \n
          t1.total_bagging AS total_bagging, \n
          t1.total_bag_representative AS total_bag_representative \n
      FROM public.do_smd t1 \n
      LEFT JOIN public.vendor t2 ON t2.vendor_id=t1.vendor_id AND t2.is_deleted = 'false' \n
      INNER JOIN public.do_smd_detail t3 ON t3.do_smd_id=t1.do_smd_id AND t3.is_deleted = 'false' \n
      INNER JOIN public.branch t4 ON t4.branch_id=t1.branch_id AND t4.is_deleted = 'false' \n
      WHERE t1.do_smd_time >= '${moment(payload.startDate).format('YYYY-MM-DD')}' \n
      AND t1.do_smd_time < '${moment(payload.endDate).format('YYYY-MM-DD')}' \n
      AND t1.is_deleted = false \n
      AND t1.is_vendor = 'true' \n`;
    if (payload.branchId !== null && payload.branchId !== 0) {
      query = query + `AND t3.branch_id_from = '${payload.branchId}' \n `;
    }

    if (payload.vendorName != '') {
      query = query + `AND t2.vendor_name = '${payload.vendorName}' \n`;
    }

    query =  query + `ORDER BY t1.created_time DESC`;

    console.log(query);
    return Buffer.from(query).toString('base64');
  }

  static async querySmdTiba(payload: GenerateQueueSmdBerangkatPayload): Promise<any> {
    let query = `SELECT \n
      CASE WHEN ds.is_intercity = 1 THEN 'DALAM KOTA' ELSE 'LUAR KOTA' END AS do_smd_intercity, \n
      ds.do_smd_code AS do_smd_code, \n
      ds.do_smd_time AS do_smd_time, \n
      dsd.arrival_time AS arrival_time, \n
      e.fullname AS fullname, \n
      dsv.vehicle_number AS vehicle_number, \n
      bf.branch_name AS branch_from_name, \n
      bt.branch_name AS branch_to_name, \n
      dsd.total_bag AS total_bag, \n
      dsd.total_bagging AS total_bagging, \n
      dsd.total_bag_representative AS total_bag_representative, \n
      dss.do_smd_status_title AS do_smd_status_title \n
    FROM public.do_smd_detail dsd \n
    INNER JOIN public.do_smd ds ON dsd.do_smd_id = ds.do_smd_id and ds.is_deleted = false \n
    INNER JOIN public.do_smd_vehicle dsv ON ds.vehicle_id_last = dsv.do_smd_vehicle_id  and dsv.is_deleted = false \n
    LEFT JOIN public.branch bf ON dsd.branch_id_from = bf.branch_id and bf.is_deleted = false \n
    LEFT JOIN public.branch bt ON dsd.branch_id_to  = bt.branch_id  and bt.is_deleted = false \n
    LEFT JOIN public.employee e ON dsv.employee_id_driver = e.employee_id and e.is_deleted = false \n
    LEFT JOIN public.do_smd_status dss ON dsd.do_smd_status_id_last = dss.do_smd_status_id and dss.is_deleted = false \n
    WHERE ds.do_smd_time >= '${moment(payload.startDate).format('YYYY-MM-DD')}' \n
    AND ds.do_smd_time < '${moment(payload.endDate).format('YYYY-MM-DD')}' \n
    AND ds.is_vendor = false \n
    AND ds.is_empty = false \n
    AND dsd.is_deleted = 'false' `;
    if (payload.branchId !== null && payload.branchId !== 0) {
      query = query + `AND dsd.branch_id_to = '${payload.branchId}' \n`;
    }
    console.log(query);
    return Buffer.from(query).toString('base64');
  }

  static async querySmdBerangkat(payload: GenerateQueueSmdBerangkatPayload): Promise<any> {
    let query = `SELECT \n
    ds.do_smd_code AS Nomor_SMD, \n
    CASE WHEN ds.is_intercity = 1 THEN 'DALAM KOTA' ELSE 'LUAR KOTA' END AS Jenis_SJ, \n
    TO_CHAR(ds.do_smd_time, 'DD Mon YYYY HH24:MI') AS Tanggal_di_Buat, \n
    e.fullname AS Handover, \n
    dsv.vehicle_number AS Kendaraan, \n
    b.branch_name AS Gerai_Asal, \n
    ds.branch_to_name_list AS Gerai_Tujuan, \n
    ds.total_bag AS Gabung_Paket, \n
    ds.total_bagging AS Bagging, \n
    dss.do_smd_status_title AS Status_Terakhir, \n
    ds.total_bag_representative AS Gabung_Kota \n
    FROM public.do_smd ds \n
    INNER JOIN public.do_smd_detail dsd ON dsd.do_smd_id = ds.do_smd_id AND (dsd.is_deleted = 'false') \n
    INNER JOIN public.do_smd_vehicle dsv ON dsv.do_smd_vehicle_id = ds.vehicle_id_last AND (dsv.is_deleted = 'false') \n
    LEFT JOIN public.branch b ON b.branch_id = ds.branch_id AND (b.is_deleted = 'false') \n
    LEFT JOIN public.employee e ON e.employee_id = dsv.employee_id_driver AND (e.is_deleted = 'false') \n
    LEFT JOIN public.do_smd_status dss ON ds.do_smd_status_id_last = dss.do_smd_status_id AND (dss.is_deleted = 'false') \n
    WHERE ds.do_smd_time >= '${moment(payload.startDate).format('YYYY-MM-DD')}' \n
    AND ds.do_smd_time < '${moment(payload.endDate).format('YYYY-MM-DD')}' `;

    if (payload.branchId !== null && payload.branchId !== 0) {
      query = query + ` AND ds.branch_id = '${payload.branchId}' \n`;
    }

    query = query + ` AND ds.is_deleted = 'false' \n
    GROUP BY ds.do_smd_id, ds.do_smd_code, ds.do_smd_time, e.fullname, e.employee_id, dsv.vehicle_number, b.branch_name, ds.total_bag, ds.total_bagging, ds.total_bag_representative, dss.do_smd_status_title, ds.is_intercity, ds.branch_to_name_list \n`;

    query = query + ` ORDER BY ds.do_smd_time DESC`;

    console.log(query);

    return Buffer.from(query).toString('base64');
  }

  static async queryDaftarGsk(payload: GenerateQueueDaftarGsk): Promise<any>{
    let query = `SELECT \n 
          t1.bag_representative_code AS bagRepresentativeCode, \n
          t1.bag_representative_id AS bagRepresentativeId, \n
          TO_CHAR(t1.bag_representative_date, 'dd-mm-YYYY HH24:MI:SS') AS bagRepresentativeDate, \n
          COUNT(t4.bag_representative_item_id) AS totalItem, \n
          CAST(t1.total_weight AS DECIMAL(18,2)) AS totalWeight, \n
          t2.representative_code AS representativeCode, \n 
          t2.representative_name AS representativeName, \n 
          t3.branch_name AS branchBagging \n 
        FROM public.bag_representative t1 \n 
        LEFT JOIN public.representative t2 ON t2.representative_id=t1.representative_id_to \n  
        INNER JOIN public.branch t3 ON t3.branch_id=t1.branch_id AND (t3.is_deleted = 'false') \n 
        INNER JOIN public.bag_representative_item t4 ON t4.bag_representative_id=t1.bag_representative_id AND (t4.is_deleted = 'false') \n 
    WHERE (t1.bag_representative_date >= '${moment(payload.startDate).format('YYYY-MM-DD')}' AND t1.bag_representative_date < '${moment(payload.endDate).format('YYYY-MM-DD')}')`;
    if (payload.representativeCode != '') {
      query = query + ` AND t2.representative_code = '${payload.representativeCode}' \n`;
    }

    query = query + ` GROUP BY \n
      t1.bag_representative_id, \n
      t1.bag_representative_code, \n
      t1.created_time, \n
      t1.bag_representative_date, \n
      t1.total_weight, \n
      t2.representative_code, \n
      t3.branch_name, \n
      t2.representative_name \n
ORDER BY t1.created_time DESC`;

    console.log(query);
    return Buffer.from(query).toString('base64');
  }

  static async queryDaftarScanMasukGabungPaket(payload: GenerateQueueDaftarScanMasukGabungPaketPayload): Promise<any> {
    let query = `SELECT \n
    b.bag_id AS bag_id, \n
    bi.bag_item_id AS bag_item_id, \n
    b.bag_number || LPAD(bi.bag_seq::text, 3, '0') AS bag_number_seq, \n 
    TO_CHAR(b.created_time, 'dd-mm-YYYY HH24:MI:SS') AS bagging_datetime, \n
    CASE  \n
      WHEN bhin.history_date IS NULL THEN 'Belum Scan IN' \n
      ELSE TO_CHAR(bhin.history_date, 'dd-mm-YYYY HH24:MI:SS')  \n
      END AS scan_in_datetime, bb.branch_name AS branch_name, CASE  \n
      WHEN b.representative_id_to IS NULL then 'Belum Upload' \n
      ELSE r.representative_name  \n
      END AS representative_name, ( \n
      SELECT count(bia.awb_number)  \n
      FROM bag_item_awb bia \n
      WHERE \n
      bia.bag_item_id = bi.bag_item_id AND  \n
      bia.is_deleted = FALSE  \n
      GROUP BY bia.bag_item_id) AS tot_resi, bi.weight::numeric(10,2) || ' kg' AS weight,  \n
      CASE  \n
      WHEN bi.weight > 10 THEN bi.weight  \n
      ELSE 10 \n
      END || ' kg' AS weight_accumulative, u.first_name || ' ' || u.last_name AS fullname \n
      FROM public.bag b \n
      INNER JOIN public.bag_item bi ON bi.bag_id = b.bag_id AND (bi.is_deleted = false)  \n
      LEFT JOIN public.branch br ON br.branch_id = b.branch_id AND (br.is_deleted = false)  \n
      LEFT JOIN public.bag_item_history bhin ON bhin.bag_item_id = bi.bag_item_id AND bhin.is_deleted = FALSE  \n
      LEFT JOIN public.representative r ON r.representative_id = b.representative_id_to AND (r.is_deleted = false)  \n
      LEFT JOIN public.branch bb ON bhin.branch_id = bb.branch_id and bb.is_deleted = FALSE   \n
      LEFT JOIN public.users u ON u.user_id = bhin.user_id_updated and u.is_deleted = FALSE  \n
      WHERE (bhin.history_date >= '${moment(payload.startDate).format('YYYY-MM-DD 00:00:00')}' \n
      AND bhin.history_date < '${moment(payload.endDate).format('YYYY-MM-DD 00:00:00')}' `;

    if (payload.branchId !== null && payload.branchId !== 0) {
      query = query + ` AND bhin.branch_id = '${payload.branchId}' \n`;
    }

    query = query + ` AND b.is_deleted = false AND bhin.bag_item_status_id in( 3550, 3500)) `;

    return Buffer.from(query).toString('base64');
  }

  static async queryMonitoringSmd(payload) {
    let query = `SELECT \n 
    ds.do_smd_code AS nomor_smd, \n
  ds.departure_date_time AS tanggal_berangkat, \n
  ds.do_smd_intercity AS surat_sj, \n
  ds.transit_date_time AS tanggal_transit, \n
  ds.arrival_date_time AS tanggal_tiba, \n
  ds.vehicle_number AS nomor_polisi, \n
  ds.vehicle_name AS type_kendaraan, \n
  ds.employee_driver_name AS nama_driver, \n
  ds.trip AS trip, \n 
  ds.smd_trip AS rute, \n
  ds.branch_name_from AS hub_asal, \n
  ds.branch_name_to AS hub_tujuan, \n
  ds.seal_number_last AS nomor_segel, \n
  ds.total_colly AS total_colly, \n
  COALESCE(ds.total_weight::integer, 0) AS aktual_berat, \n
  COALESCE(ds.vehicle_capacity::integer, 0) AS kapasitas, \n
  COALESCE((total_weight / vehicle_capacity::integer) * 100, 0.00) AS load \n  
    FROM ( \n
    SELECT ds.trip AS trip, \n 
    ds.do_smd_code, \n
    ds.is_intercity AS is_intercity, \n
    CASE WHEN ds.is_intercity = 1 THEN 'DALAM KOTA' ELSE 'LUAR KOTA' END AS do_smd_intercity, \n 
    bf.branch_name AS branch_name_from, \n 
    ds.branch_to_name_list AS branch_name_to, \n 
    dsv.vehicle_number AS vehicle_number, \n
    v.vehicle_name AS vehicle_name, \n
    ds.seal_number_last AS seal_number_last, \n 
    'T' || ds.counter_trip AS smd_trip, \n
    e.fullname AS employee_driver_name, \n
    ( \n
        select \n
            sum(bi.weight) \n
        from do_smd_detail dsd \n
        inner join do_smd_detail_item dsdi on dsd.do_smd_detail_id = dsdi.do_smd_detail_id and dsdi.is_deleted = false \n
        left join bag_item bi on dsdi.bag_item_id = bi.bag_item_id and bi.is_deleted = false \n
        where dsd.do_smd_id = ds.do_smd_id \n
        group by dsd.do_smd_id \n
    ) AS total_weight, \n
    ds.total_item AS total_colly, \n 
    v.vehicle_capacity AS vehicle_capacity, \n 
    ds.departure_date_time AS departure_date_time, \n 
    ds.transit_date_time AS transit_date_time, \n
    ds.arrival_date_time AS arrival_date_time \n
  FROM public.do_smd ds \n
  INNER JOIN public.do_smd_vehicle dsv ON ds.vehicle_id_last = dsv.do_smd_vehicle_id and dsv.is_deleted = false \n   
  LEFT JOIN public.branch bf ON ds.branch_id = bf.branch_id and bf.is_deleted = false \n 
  LEFT JOIN public.vehicle v ON dsv.vehicle_number = v.vehicle_number and v.is_deleted = false \n   
  LEFT JOIN public.employee e ON dsv.employee_id_driver = e.employee_id and e.is_deleted = false \n
  WHERE ( \n
    ds.departure_date_time >= '${moment(payload.startDate).format('YYYY-MM-DD 00:00:00')}' \n 
    AND ds.departure_date_time < '${moment(payload.endDate).format('YYYY-MM-DD 00:00:00')}' \n
    ) 
    AND ds.is_vendor = false \n
    AND ds.is_deleted = false \n
    ) ds \n`;
    if (payload.isIntercity == 1) {
      query = query + `WHERE (ds.is_intercity = 1) \n`;
    } else if (payload.isIntercity == 2) {
      query = query + `WHERE (ds.is_intercity != 1) \n`;
    }
    query = query + `ORDER BY ds.departure_date_time DESC`;
    console.log('query', query);
    return Buffer.from(query).toString('base64');
  }

  static async listQueueRequest(params: ListQueueRequestParamPayloadVm): Promise<any> {
    const url = `${this.baseUrlInternal}/v1/reporting/report`;
    const offset = Number(params.page - 1) * Number(params.limit);
    const options = {
      params: {
        employee: params.userId,
        report_type: params.reportType,
        limit: params.limit,
        offset,
      },
    };
    const res = await axios.get(url, options);
    const resData = res.data.data.report_queue;
    const total = res.data.data.total_count;

    const result = { data: [] };
    for (const valData  of resData) {
      const splitFilename = valData.file_name.split('|');
      let branch_name = '';
      let vendor_name = '';
      if (splitFilename.length > 0) {
        if (splitFilename[1]) {
          const splitVendor = splitFilename[1].split('_vendor_');
          if (splitVendor.length > 0) {
            branch_name = splitVendor[0].replace(/_/g, ' ');
            if (splitVendor[1]) {
              vendor_name = splitVendor[1].replace(/_/g, ' ');
            }
          }
        }
      }
      const obj = {...valData, branch_name, vendor_name};
      result.data.push(obj);
    }
    result['paging'] = MetaService.set(params.page, params.limit, total);
    return result;
  }

  static async generateQueueRequest(params: GenerateQueueOptionPayloadVm, data: GenerateQueueFormDataPayloadVm): Promise<any> {
    const url = `${this.baseUrlInternal}/v1/reporting/report`;
    const options = {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      params: {
        employee: params.userId,
      },
    };
    const qs = require('querystring');
    const body = {
      query_encoded: data.encodeQuery,
      filename: data.filename,
      report_type: data.reportType,
    };
    const request = await axios.post(url, qs.stringify(body), options);
    return { status: request.status, ...request.data };
  }
}
