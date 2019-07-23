import { HttpStatus } from '@nestjs/common';
import { map } from 'lodash';
import faker = require('faker');

import TEST_GLOBAL_VARIABLE from '../../../../test/test-global-variable';
import { AwbAttr } from '../../../../shared/orm-entity/awb-attr';
import { AwbItemAttr } from '../../../../shared/orm-entity/awb-item-attr';
import { WebScanOutCreateVm, WebScanOutAwbVm } from '../../models/web-scan-out.vm';
import { TestUtility } from '../../../../test/test-utility';
import { WebScanOutCreateResponseVm, WebScanOutAwbResponseVm } from '../../models/web-scan-out-response.vm';

describe('transit-external-awb', () => {
  let awbAttr: AwbAttr[];
  let awbItemAttr: AwbItemAttr[];

  let doPodId = 0;

  beforeAll(async () => {
    awbAttr = await TEST_GLOBAL_VARIABLE.entityFactory.for(AwbAttr).with({
      awbStatusIdLast: 1500,
    }).create(5);
    awbItemAttr = await TEST_GLOBAL_VARIABLE.entityFactory.for(AwbItemAttr).with({
        awbStatusIdLast: 2500,
        branchIdLast: 121,
      }).create(5);
  });
  // Transit External
  it('Surat Jalan Transit External', async () => {
    const payload = new WebScanOutCreateVm();
    payload.doPodType = 3005; // Transit External
    payload.branchIdTo = 123;
    payload.doPodMethod = 'external';
    payload.partnerLogisticId = 1;
    payload.employeeIdDriver = 15;
    payload.vehicleNumber = 'DPS-17010675-523423-BC';
    payload.doPodDateTime = faker.date.between(
      '2019-01-01',
      '2019-08-01',
      ).toDateString(); // '2019-07-15 10:10:00';
    payload.desc = 'test Transit External';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('/web/pod/scanOut/create', payload)
      .then(async response => {
        const result = response.data as WebScanOutCreateResponseVm;

        // const doPod = new OrionRepositoryService(DoPod);
        // doPod.findOne();

        doPodId = result.doPodId;

        expect(response.status).toEqual(HttpStatus.OK);
        expect(response).toBeDefined();
        // expect(result.data.length).toEqual(payload.limit);
        // expect(result.paging.currentPage).toEqual(1);
        // expect(result.paging.nextPage).toEqual(2);
        // expect(result.paging.limit).toEqual(payload.limit);

        // const totalData = await qBranch.countWithoutTakeAndSkip();
        // expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Transit External Scan Awb', async () => {
    const arrAwbNumber = map(awbItemAttr, item => item.awbNumber);

    const payload = new WebScanOutAwbVm();
    payload.doPodId = doPodId;
    payload.awbNumber = arrAwbNumber;

    // tslint:disable-next-line: no-console
    console.log('##############====================================', doPodId);

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('/web/pod/scanOut/awb', payload)
      .then(async response => {

        const result = response.data as WebScanOutAwbResponseVm;
        // console.log(result);
        expect(result).toBeDefined();
      });

  });
});
