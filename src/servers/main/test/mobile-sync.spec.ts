import { HttpStatus } from '@nestjs/common';

import { Awb } from '../../../shared/orm-entity/awb';
import { AwbAttr } from '../../../shared/orm-entity/awb-attr';
import { AwbItemAttr } from '../../../shared/orm-entity/awb-item-attr';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { MobileInitDataResponseVm } from '../models/mobile-init-response.vm';
import { WebScanOutAwbResponseVm, WebScanOutCreateResponseVm } from '../models/web-scan-out-response.vm';
import { WebScanOutAwbVm, WebScanOutCreateVm } from '../models/web-scan-out.vm';

describe('mobile-sync-spec', () => {
  let awb: Awb;
  let awbAttr: AwbAttr;
  const awbItemAttrs: AwbItemAttr[] = [];
  let doPodId = 0;

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

  it('Surat Jalan Deliver', async () => {
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

  it('Deliver Scan Awb', async () => {
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
    return TestUtility.getAuthenticatedMainServerAxios('web')
      .post('mobile/initData')
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);
        expect(response).toBeDefined();

        const result = response.data as MobileInitDataResponseVm;
        const awbNumbers = result.delivery.map(e => e.awbNumber);
        expect(awbNumbers).toContain(awb.awbNumber);
      });
  });
});
