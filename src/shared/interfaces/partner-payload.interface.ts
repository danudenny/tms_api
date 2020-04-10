export interface PartnerTokenPayload {
  partnerId: number;
  partnerName: string;
  partnerEmail: string;
  apiKey: string;
  customerAccountId: number;
  awbNumberStart: number;
  awbNumberEnd: number;
  currentAwbNumber: number;
  slaHourPickup: number;
  isActive: boolean;
  isEmailLog: boolean;
  isAssignToBranch: boolean;
  isAssignToCourier: boolean;
  isPickUnpick: boolean;
  isReschedule: boolean;
  smCode: string;
  isDeleted: boolean;
}
