import { EntityRepository, Repository } from 'typeorm';

import { Customer } from '../orm-entity/customer';

@EntityRepository(Customer)
export class CustomerRepository extends Repository<Customer> {}
