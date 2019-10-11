// NOTE:
// 3010 = OUT_HUB (Hub)
// 3005 = OUT_BRANCH (Transit)
// 20000 = CC (Criss Cross)
// 14000 = ANT (Antar)
// TODO: need confirm
export const POD_TYPE = {
  TRANSIT_INTERNAL: 3005, // old Type
  TRANSIT_HUB: 3010, // old Type
  OUT_BRANCH: 3005,
  OUT_HUB: 3010,
  HUB_TRANSIT: 3020,
  CRISS_CROSS: 20000,
  DELIVERY: 14000,
};
