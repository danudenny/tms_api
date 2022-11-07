import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import {
  BAG_SERVICE,
  BagService,
} from '../../../../shared/interfaces/bag.service.interface';
import { JwtPermissionTokenPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../../../../shared/models/auth-login-metadata.model';
import { AuthService } from '../../../../shared/services/auth.service';
import {
  HUB_BAG_SERVICE,
  HubBagService,
} from '../../interfaces/hub-bag.interface';
import {
  SORTATION_MACHINE_SERVICE,
  SortationMachineService,
} from '../../interfaces/sortation-machine-service.interface';
import { HubBagInsertAwbPayload } from '../../models/bag/hub-bag.payload';
import { MockBagService } from '../mocks/bag.service';
import { MockSortationMachineService } from '../mocks/sortation-machine.service';
import { DefaultHubBagService } from './hub-bag.service';

describe('DefaultHubBagService', () => {
  let service: HubBagService;
  let sortationService: SortationMachineService;
  let bagService: BagService;
  const mockPermission = { branchId: 1 };
  const mockAuthData = { userId: 1 };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: SORTATION_MACHINE_SERVICE,
          useClass: MockSortationMachineService,
        },
        { provide: BAG_SERVICE, useClass: MockBagService },
        { provide: HUB_BAG_SERVICE, useClass: DefaultHubBagService },
      ],
    }).compile();
    service = module.get<HubBagService>(HUB_BAG_SERVICE);
    sortationService = module.get<SortationMachineService>(
      SORTATION_MACHINE_SERVICE,
    );
    bagService = module.get<BagService>(BAG_SERVICE);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .spyOn(AuthService, 'getPermissionTokenPayload')
      .mockReturnValue(mockPermission as JwtPermissionTokenPayload);
    jest
      .spyOn(AuthService, 'getAuthMetadata')
      .mockReturnValue(mockAuthData as AuthLoginMetadata);
  });

  const payload: HubBagInsertAwbPayload = {
    awbNumber: '601000000102',
    bagId: '61c1494786158d5dabdef1df',
    bagItemId: '61c1494786158d5dabdef1e0',
  };

  const createBagPayload: HubBagInsertAwbPayload = {
    awbNumber: '601000000101',
  };

  describe('insertAWB', () => {
    it('should create a new bag', async () => {
      const mockBag = {
        bag_number: 'SPBE09P001',
        bag_id: '61c1494786158d5dabdef1df',
        bag_item_id: '61c1494786158d5dabdef1e0',
        bag_status_id: 3000,
      };
      jest.spyOn(sortationService, 'getAwb').mockReturnValue(
        Promise.resolve({
          awb_item_id: 46958266,
          weight: 2.1,
          transport_type: 'SMU',
          district_code: 'DCODE',
          branch_id_lastmile: 1,
          representative_id: 1,
          representative: 'SUB',
        }),
      );
      jest
        .spyOn(bagService, 'create')
        .mockReturnValue(Promise.resolve(mockBag));
      jest.spyOn(bagService, 'insertAWB').mockReturnValue(
        Promise.resolve({
          bag_id: '61c1494786158d5dabdef1df',
          total_awb_weight: 46.9,
          total_awb: 2,
        }),
      );
      const result = await service.insertAWB(createBagPayload);
      expect(sortationService.getAwb).toHaveBeenCalledWith({
        tracking_number: createBagPayload.awbNumber,
        sorting_branch_id: mockPermission.branchId,
      });
      expect(bagService.create).toHaveBeenCalled();
      expect(bagService.insertAWB).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.data).toEqual({
        awbNumber: createBagPayload.awbNumber,
        bagId: mockBag.bag_id,
        bagItemId: mockBag.bag_item_id,
      });
    });

    it('should throw an error from sortation machine service', async () => {
      const errMsg = 'Unexpected database error';
      jest.spyOn(sortationService, 'getAwb').mockImplementation(async () => {
        throw new InternalServerErrorException(errMsg);
      });
      try {
        await service.insertAWB(createBagPayload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

    it('should throw an error from bag service', async () => {
      const errMsg = 'Unexpected database error';
      jest.spyOn(bagService, 'create').mockImplementation(async () => {
        throw new InternalServerErrorException(errMsg);
      });
      try {
        await service.insertAWB(createBagPayload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
        expect(err.message).toEqual(errMsg);
      }
    });

    it('should insert awb to bag', async () => {
      const mockBag = {
        bag_item_id: '628b27237be08440a68664e4',
        bag_item_id_old: '1528621295179153408',
        weight: 44.8,
        bag_number: 'ZBPJ0YU03Z',
        representative_id: 87,
        representative_code: 'SUB',
        transportation_mode: 'SMD',
        awbs: ['601000000101'],
      };

      jest.spyOn(sortationService, 'getAwb').mockReturnValue(
        Promise.resolve({
          awb_item_id: 46958266,
          weight: 2.1,
          transport_type: 'SMD',
          district_code: 'DCODE',
          branch_id_lastmile: 1,
          representative_id: 87,
          representative: 'SUB',
        }),
      );
      jest
        .spyOn(bagService, 'getBag')
        .mockReturnValue(Promise.resolve(mockBag));
      jest.spyOn(bagService, 'insertAWB').mockReturnValue(
        Promise.resolve({
          bag_id: '61c1494786158d5dabdef1df',
          total_awb_weight: 46.9,
          total_awb: 2,
        }),
      );
      const result = await service.insertAWB(payload);
      expect(bagService.getBag).toHaveBeenCalledWith({
        bag_item_id: payload.bagItemId,
      });
      expect(bagService.insertAWB).toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.data).toEqual({
        awbNumber: payload.awbNumber,
        bagId: payload.bagId,
        bagItemId: payload.bagItemId,
      });
    });

    it('should throw a bad request exception - awb has been scanned', async () => {
      const mockBag = {
        bag_item_id: '628b27237be08440a68664e4',
        bag_item_id_old: '1528621295179153408',
        weight: 44.8,
        bag_number: 'ZBPJ0YU03Z',
        representative_id: 87,
        representative_code: 'SUB',
        transportation_mode: 'SMD',
        awbs: ['601000000102'],
      };

      jest.spyOn(sortationService, 'getAwb').mockReturnValue(
        Promise.resolve({
          awb_item_id: 46958266,
          weight: 2.1,
          transport_type: 'SMD',
          district_code: 'DCODE',
          branch_id_lastmile: 1,
          representative_id: 87,
          representative: 'SUB',
        }),
      );
      jest
        .spyOn(bagService, 'getBag')
        .mockReturnValue(Promise.resolve(mockBag));

      try {
        await service.insertAWB(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    it('should throw a unprocessable entity exception - transportation modes do not match', async () => {
      const mockBag = {
        bag_item_id: '628b27237be08440a68664e4',
        bag_item_id_old: '1528621295179153408',
        weight: 44.8,
        bag_number: 'ZBPJ0YU03Z',
        representative_id: 87,
        representative_code: 'SUB',
        transportation_mode: 'SMU',
        awbs: ['601000000101'],
      };

      jest.spyOn(sortationService, 'getAwb').mockReturnValue(
        Promise.resolve({
          awb_item_id: 46958266,
          weight: 2.1,
          transport_type: 'SMD',
          district_code: 'DCODE',
          branch_id_lastmile: 1,
          representative_id: 87,
          representative: 'SUB',
        }),
      );
      jest
        .spyOn(bagService, 'getBag')
        .mockReturnValue(Promise.resolve(mockBag));

      try {
        await service.insertAWB(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });

    it('should throw a unprocessable entity exception - representative do not match', async () => {
      const mockBag = {
        bag_item_id: '628b27237be08440a68664e4',
        bag_item_id_old: '1528621295179153408',
        weight: 44.8,
        bag_number: 'ZBPJ0YU03Z',
        representative_id: 87,
        representative_code: 'CGK',
        transportation_mode: 'SMD',
        awbs: ['601000000101'],
      };

      jest.spyOn(sortationService, 'getAwb').mockReturnValue(
        Promise.resolve({
          awb_item_id: 46958266,
          weight: 2.1,
          transport_type: 'SMD',
          district_code: 'DCODE',
          branch_id_lastmile: 1,
          representative_id: 87,
          representative: 'SUB',
        }),
      );
      jest
        .spyOn(bagService, 'getBag')
        .mockReturnValue(Promise.resolve(mockBag));

      try {
        await service.insertAWB(payload);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.UNPROCESSABLE_ENTITY);
      }
    });
  });
});
