import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Reason } from '../../../shared/orm-entity/reason';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { ReasonFindAllResponseVm } from '../models/reason.vm';

describe('master-reason-list', () => {
  let reasons: Reason[];

  beforeAll(async () => {
    reasons = await TEST_GLOBAL_VARIABLE.entityFactory.for(Reason).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/reason/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qReason = RepositoryService.reason.findAll();

        const result = response.data as ReasonFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qReason.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created reasons & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdReasonIds = reasons.map(e => e.reasonId);
    payload.filters = [
      {
        field: 'reasonId',
        operator: 'in',
        value: createdReasonIds,
      },
    ];

    payload.sortBy = 'reasonName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/reason/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as ReasonFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdReasonIds.includes(e.reasonId)).length,
        ).toEqual(5);

        const sortedReasonsByReasonName = sortBy(reasons, e => e.reasonName);
        expect(result.data[0].reasonId).toEqual(
          sortedReasonsByReasonName[0].reasonId,
        );

        const resultReason = result.data[0];
        expect(resultReason.reasonId).toBeDefined();
        expect(resultReason.reasonCode).toBeDefined();
        expect(resultReason.reasonName).toBeDefined();

        const payloadReason = reasons.find(
          e => e.reasonId === resultReason.reasonId,
        );
        expect(payloadReason.reasonCode).toEqual(resultReason.reasonCode);
        expect(payloadReason.reasonName).toEqual(resultReason.reasonName);
      });
  });

  it('Verify all filters for 200', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const reasonToCheck = reasons[0];

    payload.filters = [
      {
        field: 'reasonCode',
        operator: 'eq',
        value: reasonToCheck.reasonCode,
      },
      {
        field: 'reasonName',
        operator: 'eq',
        value: reasonToCheck.reasonName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/reason/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as ReasonFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultReason = result.data[0];
        expect(resultReason.reasonId).toEqual(reasonToCheck.reasonId);
        expect(resultReason.reasonCode).toEqual(reasonToCheck.reasonCode);
        expect(resultReason.reasonName).toEqual(reasonToCheck.reasonName);
      });
  });
});
