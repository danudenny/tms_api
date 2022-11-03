export interface CreateBagPayload {
  branch_id: number;
  district_code: string;
  branch_last_mile_id: number;
  representative_id_to: number;
  representative_code: string;
  tag_seal_number: string;
  chute_number: number;
  bag_type: string;
  transportation_mode: string;
  user_id: number;
}

export interface CreateBagResponse {
  bag_number: string;
  bag_id: string;
  bag_item_id: string;
  bag_status_id: number;
}

interface InsertAWBReference {
  reference_number: string;
  weight: number;
  awb_item_id: number;
}

export interface InsertAWBPayload {
  bag_item_id: string;
  bag_id: string;
  references: InsertAWBReference[];
}

export interface InsertAWBResponse {
  bag_id: string;
  total_awb_weight: number;
  total_awb: number;
}

export interface GetBagPayload {
  bag_item_id: string;
}

export interface GetBagResponse {
  bag_item_id: string;
  bag_item_id_old: string;
  weight: number;
  bag_number: string;
  representative_id: number;
  representative_code: string;
  transportation_mode: string;
}
