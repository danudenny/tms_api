import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Representative } from '../../../shared/orm-entity/representative';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { RepresentativeFindAllResponseVm } from '../models/representative-response.vm';

describe('master-representative-list', () => {
  let representatives: Representative[];

  beforeAll(async () => {
    representatives = await TEST_GLOBAL_VARIABLE.entityFactory.for(Representative).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/representative/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qRepresentative = RepositoryService.representative.findAll();

        const result = response.data as RepresentativeFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qRepresentative.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created representatives & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdRepresentativeIds = representatives.map(e => e.representativeId);
    payload.filters = [
      {
        field: 'representativeId',
        operator: 'in',
        value: createdRepresentativeIds,
      },
    ];

    payload.sortBy = 'representativeName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/representative/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RepresentativeFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdRepresentativeIds.includes(e.representativeId)).length,
        ).toEqual(5);

        const sortedRepresentativesByRepresentativeName = sortBy(representatives, e => e.representativeName);
        expect(result.data[0].representativeId).toEqual(
          sortedRepresentativesByRepresentativeName[0].representativeId,
        );

        const resultRepresentative = result.data[0];
        expect(resultRepresentative.representativeId).toBeDefined();
        expect(resultRepresentative.representativeCode).toBeDefined();
        expect(resultRepresentative.representativeName).toBeDefined();

        const payloadRepresentative = representatives.find(
          e => e.representativeId === resultRepresentative.representativeId,
        );
        expect(payloadRepresentative.representativeCode).toEqual(resultRepresentative.representativeCode);
        expect(payloadRepresentative.representativeName).toEqual(resultRepresentative.representativeName);
      });
  });

  it('Verify all filters', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const representativeToCheck = representatives[0];

    payload.filters = [
      {
        field: 'representativeCode',
        operator: 'eq',
        value: representativeToCheck.representativeCode,
      },
      {
        field: 'representativeName',
        operator: 'eq',
        value: representativeToCheck.representativeName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/representative/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RepresentativeFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultRepresentative = result.data[0];
        expect(resultRepresentative.representativeId).toEqual(representativeToCheck.representativeId);
        expect(resultRepresentative.representativeCode).toEqual(representativeToCheck.representativeCode);
        expect(resultRepresentative.representativeName).toEqual(representativeToCheck.representativeName);
      });
  });

  it('Verify global search', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const representativeToCheck = representatives[0];

    payload.search = representativeToCheck.representativeCode;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/representative/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as RepresentativeFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultRepresentative = result.data[0];
        expect(resultRepresentative.representativeId).toEqual(representativeToCheck.representativeId);
        expect(resultRepresentative.representativeCode).toEqual(representativeToCheck.representativeCode);
        expect(resultRepresentative.representativeName).toEqual(representativeToCheck.representativeName);
      });
  });
});
