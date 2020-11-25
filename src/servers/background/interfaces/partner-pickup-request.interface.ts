export interface IPartnerPickupRequest {
  pickupRequestId: number;
  awbNumber: string;
  awbItemId: number;
  awbStatusIdLast: number;
  awbStatusIdFinal: number;
  branchIdLast: number;
  pickupRequestStatusId: number;
}
