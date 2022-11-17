export interface CheckAwbRequest {
  tracking_number: string;
  sorting_branch_id: number;
}

export interface CheckAwbResponse {
  destination: string;
  transport_type: string;
}
