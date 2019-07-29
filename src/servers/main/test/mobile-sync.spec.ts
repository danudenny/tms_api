import { HttpStatus } from '@nestjs/common';
import moment = require('moment');

import { Awb } from '../../../shared/orm-entity/awb';
import { AwbAttr } from '../../../shared/orm-entity/awb-attr';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { MobileDeliveryHistoryVm } from '../models/mobile-delivery-history.vm';
import { MobileDeliveryVm } from '../models/mobile-delivery.vm';
import { MobileInitDataResponseVm } from '../models/mobile-init-response.vm';
import { MobileSyncPayloadVm } from '../models/mobile-sync-payload.vm';
import { MobileSyncResponseVm } from '../models/mobile-sync-response.vm';
import { WebScanOutAwbResponseVm, WebScanOutCreateResponseVm } from '../models/web-scan-out-response.vm';
import { WebScanOutAwbVm, WebScanOutCreateVm } from '../models/web-scan-out.vm';

describe('mobile-sync-spec', () => {
  let awb: Awb;
  let awbAttr: AwbAttr;
  const awbItemAttrs: AwbItemAttr[] = [];
  let doPodId = 0;
  let initData: MobileInitDataResponseVm;
  let awbDelivery: MobileDeliveryVm;

  beforeAll(async () => {
    awb = await TEST_GLOBAL_VARIABLE.entityFactory
      .for(Awb)
      .state('awb-items')
      .create();

    awbAttr = await TEST_GLOBAL_VARIABLE.entityFactory
      .for(AwbAttr)
      .with({
        awbId: awb.awbId,
        awbNumber: awb.awbNumber,
      })
      .create(1);

    for (const awbItem of awb.awbItems) {
      const awbItemAttr = await TEST_GLOBAL_VARIABLE.entityFactory
        .for(AwbItemAttr)
        .with({
          branchIdLast: 121,
          awbStatusIdLast: 2500,
          awbNumber: awb.awbNumber,
          awbItemId: awbItem.awbItemId,
        })
        .create(1);
      awbItemAttrs.push(awbItemAttr);
    }
  });

  it('Surat jalan antar', async () => {
    const payload = new WebScanOutCreateVm();
    payload.doPodType = 14000; // Deliver
    payload.branchIdTo = 123;
    payload.doPodMethod = 'internal';
    payload.employeeIdDriver = 15;
    payload.vehicleNumber = 'DPS-17010675-523423-CD';
    payload.doPodDateTime = new Date().toISOString();
    payload.desc = 'test';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('/web/pod/scanOut/createDeliver', payload)
      .then(async response => {
        const result = response.data as WebScanOutCreateResponseVm;

        doPodId = result.doPodId;

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response).toBeDefined();
      });
  });

  it('Scan awb', async () => {
    const payload = new WebScanOutAwbVm();
    payload.doPodId = doPodId;
    payload.awbNumber = [awb.awbNumber];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('/web/pod/scanOut/awbDeliver', payload)
      .then(async response => {
        const result = response.data as WebScanOutAwbResponseVm;
        expect(result).toBeDefined();
      });
  });

  it('Correct mobile init data', async () => {
    return TestUtility.getAuthenticatedMainServerAxios('mobile')
      .post('mobile/initData')
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response).toBeDefined();

        const result = response.data as MobileInitDataResponseVm;

        initData = result;

        awbDelivery = result.delivery.find(e => e.awbNumber === awb.awbNumber);
        expect(awbDelivery).toBeDefined();
      });
  });

  it('Sync correctly', async () => {
    const payload = new MobileSyncPayloadVm();
    payload.lastSyncDateTime = new Date().toISOString();

    const deliveryHistory = new MobileDeliveryHistoryVm();
    deliveryHistory.awbStatusId = 22000;
    deliveryHistory.reasonId = 16;
    deliveryHistory.reasonNotes = 'Lahan kosong paboss';
    deliveryHistory.historyDateTime = '2019-01-01 00:00:00';
    deliveryHistory.employeeId = 2981;
    deliveryHistory.latitudeDelivery = '123';
    deliveryHistory.longitudeDelivery = '456';

    const delivery = Object.assign({}, awbDelivery);
    delivery.awbStatusId = 22000;
    delivery.deliveryHistory = [deliveryHistory];

    payload.deliveries = [delivery];

    return TestUtility.getAuthenticatedMainServerAxios('mobile')
      .post('mobile/sync', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as MobileSyncResponseVm;
        const updatedDelivery = result.delivery.find(e => e.awbNumber === delivery.awbNumber);

        expect(updatedDelivery).toBeDefined();
        expect(updatedDelivery.deliveryHistory.length).toEqual(1);
        expect(updatedDelivery.awbStatusId).toEqual(deliveryHistory.awbStatusId);

        const updatedDeliveryHistory = updatedDelivery.deliveryHistory[0];
        expect(updatedDeliveryHistory.awbStatusId).toEqual(deliveryHistory.awbStatusId);
        expect(updatedDeliveryHistory.reasonId).toEqual(deliveryHistory.reasonId);
        expect(updatedDeliveryHistory.reasonNotes).toEqual(deliveryHistory.reasonNotes);
        expect(moment(updatedDeliveryHistory.historyDateTime).format('YYYY-MM-DD HH:mm:ss')).toEqual(deliveryHistory.historyDateTime);
        expect(updatedDeliveryHistory.employeeId).toEqual(deliveryHistory.employeeId);
        expect(updatedDeliveryHistory.latitudeDelivery).toEqual(deliveryHistory.latitudeDelivery);
        expect(updatedDeliveryHistory.longitudeDelivery).toEqual(deliveryHistory.longitudeDelivery);
      });
  });
});
