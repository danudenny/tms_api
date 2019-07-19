import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Branch } from '../../../shared/orm-entity/branch';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { BranchFindAllResponseVm } from '../models/branch.response.vm';

describe('web-scanin-awb', () => {
  let branchs: Branch[];

  beforeAll(async () => {
    branchs = await TEST_GLOBAL_VARIABLE.entityFactory.for(Branch).create(5);
  });
});
