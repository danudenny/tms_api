import { EntityRepository, Repository } from 'typeorm';

import { AwbHistory } from '../orm-entity/awb-history';

@EntityRepository(AwbHistory)
export class AwbHistoryRepository extends Repository<AwbHistory> {
  // sample data:
  // {
  //   awb_history_id: 20793807,
  //   awb_item_id: 11942018,
  //   user_id: 1,
  //   branch_id: null,
  //   history_date: '2019-06-20 10:29:34.000000',
  //   awb_status_id: 1000,
  //   awb_note: 'Charger',
  //   customer_account_id: 4316,
  //   ref_id_tracking_note: null,
  //   ref_id_tracking_site: null,
  //   ref_id_cust_package: '46423414',
  //   ref_awb_number: '100000118925',
  //   ref_tracking_site_code: null,
  //   ref_tracking_site_name: null,
  //   ref_partner_name: 'Tokopedia',
  //   ref_recipient_name: 'Timotius',
  //   ref_id_courier: null,
  //   ref_courier_name: null,
  //   ref_tracking_type: null,
  //   ref_user_created: null,
  //   ref_user_updated: null,
  //   user_id_created: 1,
  //   created_time: '2019-06-20 10:29:34.000000',
  //   user_id_updated: 1,
  //   updated_time: '2019-06-20 10:29:34.000000',
  //   is_deleted: false,
  //   ref_table: null,
  //   ref_id: null,
  //   ref_module: null,
  //   employee_id_driver: null,
  //   is_scan_single: true,
  //   is_direction_back: false,
  //   latitude: null,
  //   longitude: null,
  //   awb_history_id_prev: null,
  // }

  // TODO:
  // create awb history
  // get awb history id
  // update awb history id and awb status id on table awb
}
