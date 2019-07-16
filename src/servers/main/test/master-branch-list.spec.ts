import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Branch } from '../../../shared/orm-entity/branch';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { BranchFindAllResponseVm } from '../models/branch.response.vm';

describe('master-branch-list', () => {
  let branchs: Branch[];

  beforeAll(async () => {
    branchs = await TEST_GLOBAL_VARIABLE.entityFactory.for(Branch).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/branch/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qBranch = RepositoryService.branch.findAll();

        const result = response.data as BranchFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qBranch.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created branchs & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdBranchIds = branchs.map(e => e.branchId);
    payload.filters = [
      {
        field: 'branchId',
        operator: 'in',
        value: createdBranchIds,
      },
    ];

    payload.sortBy = 'branchName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/branch/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as BranchFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdBranchIds.includes(e.branchId)).length,
        ).toEqual(5);

        const sortedBranchsByBranchName = sortBy(branchs, e => e.branchName);
        expect(result.data[0].branchId).toEqual(
          sortedBranchsByBranchName[0].branchId,
        );

        const resultBranch = result.data[0];
        expect(resultBranch.branchId).toBeDefined();
        expect(resultBranch.branchCode).toBeDefined();
        expect(resultBranch.branchName).toBeDefined();

        const payloadBranch = branchs.find(
          e => e.branchId === resultBranch.branchId,
        );
        expect(payloadBranch.branchCode).toEqual(resultBranch.branchCode);
        expect(payloadBranch.branchName).toEqual(resultBranch.branchName);
      });
  });

  it('Verify all filters for 200', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const branchToCheck = branchs[0];

    payload.filters = [
      {
        field: 'branchCode',
        operator: 'eq',
        value: branchToCheck.branchCode,
      },
      {
        field: 'branchName',
        operator: 'eq',
        value: branchToCheck.branchName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/branch/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as BranchFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultBranch = result.data[0];
        expect(resultBranch.branchId).toEqual(branchToCheck.branchId);
        expect(resultBranch.branchCode).toEqual(branchToCheck.branchCode);
        expect(resultBranch.branchName).toEqual(branchToCheck.branchName);
      });
  });
});
