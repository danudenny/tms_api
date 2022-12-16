export interface CheckAwbRequest {
  tracking_number: string;
  sorting_branch_id: number;
}

export interface CheckAwbResponse {
  destination: string;
  transport_type: string;
}

export interface GetAwbResponse {
  awb_item_id: number;
  weight: number;
  transport_type: string;
  representative_id: number;
  representative: string;
  district_code: string;
  branch_id_lastmile: number;
  consignee_name: string;
  consignee_address: string;
}
