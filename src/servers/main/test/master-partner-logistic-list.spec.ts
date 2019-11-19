import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { PartnerLogistic } from '../../../shared/orm-entity/partner-logistic';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { PartnerLogisticFindAllResponseVm } from '../models/partner-logistic.vm';

describe('master-partner-logistic-list', () => {
  let partnerLogistics: PartnerLogistic[];

  beforeAll(async () => {
    partnerLogistics = await TEST_GLOBAL_VARIABLE.entityFactory.for(PartnerLogistic).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/partnerLogistic/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qPartnerLogistic = RepositoryService.partnerLogistic.findAll();

        const result = response.data as PartnerLogisticFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qPartnerLogistic.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created partner logistics & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdPartnerLogisticIds = partnerLogistics.map(e => e.partnerLogisticId);
    payload.filters = [
      {
        field: 'partnerLogisticId',
        operator: 'in',
        value: createdPartnerLogisticIds,
      },
    ];

    payload.sortBy = 'partnerLogisticName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/partnerLogistic/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as PartnerLogisticFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdPartnerLogisticIds.includes(e.partnerLogisticId)).length,
        ).toEqual(5);

        const sortedPartnerLogisticsByPartnerLogisticName = sortBy(partnerLogistics, e => e.partnerLogisticName);
        expect(result.data[0].partnerLogisticId).toEqual(
          sortedPartnerLogisticsByPartnerLogisticName[0].partnerLogisticId,
        );

        const resultPartnerLogistic = result.data[0];
        expect(resultPartnerLogistic.partnerLogisticId).toBeDefined();
        expect(resultPartnerLogistic.partnerLogisticName).toBeDefined();
        expect(resultPartnerLogistic.partnerLogisticEmail).toBeDefined();

        const payloadPartnerLogistic = partnerLogistics.find(
          e => e.partnerLogisticId === resultPartnerLogistic.partnerLogisticId,
        );
        expect(payloadPartnerLogistic.partnerLogisticName).toEqual(resultPartnerLogistic.partnerLogisticName);
        expect(payloadPartnerLogistic.partnerLogisticEmail).toEqual(resultPartnerLogistic.partnerLogisticEmail);
      });
  });

  it('Verify all filters', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const partnerLogisticToCheck = partnerLogistics[0];

    payload.filters = [
      {
        field: 'partnerLogisticName',
        operator: 'eq',
        value: partnerLogisticToCheck.partnerLogisticName,
      },
      {
        field: 'partnerLogisticEmail',
        operator: 'eq',
        value: partnerLogisticToCheck.partnerLogisticEmail,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/partnerLogistic/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as PartnerLogisticFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultPartnerLogistic = result.data[0];
        expect(resultPartnerLogistic.partnerLogisticId).toEqual(partnerLogisticToCheck.partnerLogisticId);
        expect(resultPartnerLogistic.partnerLogisticName).toEqual(partnerLogisticToCheck.partnerLogisticName);
        expect(resultPartnerLogistic.partnerLogisticEmail).toEqual(partnerLogisticToCheck.partnerLogisticEmail);
      });
  });

  it('Verify global search', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const partnerLogisticToCheck = partnerLogistics[0];

    payload.search = partnerLogisticToCheck.partnerLogisticEmail;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/partnerLogistic/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as PartnerLogisticFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultPartnerLogistic = result.data[0];
        expect(resultPartnerLogistic.partnerLogisticId).toEqual(partnerLogisticToCheck.partnerLogisticId);
        expect(resultPartnerLogistic.partnerLogisticName).toEqual(partnerLogisticToCheck.partnerLogisticName);
        expect(resultPartnerLogistic.partnerLogisticEmail).toEqual(partnerLogisticToCheck.partnerLogisticEmail);
      });
  });
});
