import { HttpStatus } from '@nestjs/common';
import { sortBy } from 'lodash';

import { BaseMetaPayloadVm } from '../../../shared/models/base-meta-payload.vm';
import { Customer } from '../../../shared/orm-entity/customer';
import { RepositoryService } from '../../../shared/services/repository.service';
import TEST_GLOBAL_VARIABLE from '../../../test/test-global-variable';
import { TestUtility } from '../../../test/test-utility';
import { CustomerFindAllResponseVm } from '../models/customer.response.vm';

describe('master-customer-list', () => {
  let customers: Customer[];

  beforeAll(async () => {
    customers = await TEST_GLOBAL_VARIABLE.entityFactory.for(Customer).create(5);
  });

  it('Valid list', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 2;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/customer/list', payload)
      .then(async response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const qCustomer = RepositoryService.customer.findAll();

        const result = response.data as CustomerFindAllResponseVm;

        expect(result.data).toBeDefined();
        expect(result.data.length).toEqual(payload.limit);

        expect(result.paging.currentPage).toEqual(1);
        expect(result.paging.nextPage).toEqual(2);
        expect(result.paging.limit).toEqual(payload.limit);

        const totalData = await qCustomer.countWithoutTakeAndSkip();
        expect(result.paging.totalData).toEqual(totalData);
      });
  });

  it('Verify created customers & sort', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const createdCustomerIds = customers.map(e => e.customerId);
    payload.filters = [
      {
        field: 'customerId',
        operator: 'in',
        value: createdCustomerIds,
      },
    ];

    payload.sortBy = 'customerName';
    payload.sortDir = 'asc';

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/customer/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as CustomerFindAllResponseVm;
        expect(result.data.length).toEqual(5);
        expect(result.paging.totalData).toEqual(5);
        expect(
          result.data.filter(e => createdCustomerIds.includes(e.customerId)).length,
        ).toEqual(5);

        const sortedCustomersByCustomerName = sortBy(customers, e => e.customerName);
        expect(result.data[0].customerId).toEqual(
          sortedCustomersByCustomerName[0].customerId,
        );

        const resultCustomer = result.data[0];
        expect(resultCustomer.customerId).toBeDefined();
        expect(resultCustomer.customerCode).toBeDefined();
        expect(resultCustomer.customerName).toBeDefined();

        const payloadCustomer = customers.find(
          e => e.customerId === resultCustomer.customerId,
        );
        expect(payloadCustomer.customerCode).toEqual(resultCustomer.customerCode);
        expect(payloadCustomer.customerName).toEqual(resultCustomer.customerName);
      });
  });

  it('Verify all filters', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const customerToCheck = customers[0];

    payload.filters = [
      {
        field: 'customerCode',
        operator: 'eq',
        value: customerToCheck.customerCode,
      },
      {
        field: 'customerName',
        operator: 'eq',
        value: customerToCheck.customerName,
      },
    ];

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/customer/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as CustomerFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultCustomer = result.data[0];
        expect(resultCustomer.customerId).toEqual(customerToCheck.customerId);
        expect(resultCustomer.customerCode).toEqual(customerToCheck.customerCode);
        expect(resultCustomer.customerName).toEqual(customerToCheck.customerName);
      });
  });

  it('Verify global search', async () => {
    const payload = new BaseMetaPayloadVm();
    payload.page = 1;
    payload.limit = 10;

    const customerToCheck = customers[0];

    payload.search = customerToCheck.customerCode;

    await TestUtility.getAuthenticatedMainServerAxios()
      .post('master/customer/list', payload)
      .then(response => {
        expect(response.status).toEqual(HttpStatus.OK);

        const result = response.data as CustomerFindAllResponseVm;
        expect(result.data.length).toEqual(1);
        expect(result.paging.totalData).toEqual(1);

        const resultCustomer = result.data[0];
        expect(resultCustomer.customerId).toEqual(customerToCheck.customerId);
        expect(resultCustomer.customerCode).toEqual(customerToCheck.customerCode);
        expect(resultCustomer.customerName).toEqual(customerToCheck.customerName);
      });
  });
});
