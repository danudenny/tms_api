import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BaseEntity } from 'typeorm';

import {
  BAG_SERVICE,
  BagService,
} from '../../../../shared/interfaces/bag.service.interface';
import { JwtPermissionTokenPayload } from '../../../../shared/interfaces/jwt-payload.interface';
import { AuthLoginMetadata } from '../../../../shared/models/auth-login-metadata.model';
import { BagItem } from '../../../../shared/orm-entity/bag-item';
import { Branch } from '../../../../shared/orm-entity/branch';
import { Representative } from '../../../../shared/orm-entity/representative';
import { AuthService } from '../../../../shared/services/auth.service';
import { OrionRepositoryService } from '../../../../shared/services/orion-repository.service';
import { PrinterService } from '../../../../shared/services/printer.service';
import { RepositoryService } from '../../../../shared/services/repository.service';
import { DoSmdPostAwbHistoryMetaQueueService } from '../../../queue/services/do-smd-post-awb-history-meta-queue.service';
import {
  HUB_BAG_SERVICE,
  HubBagService,
} from '../../interfaces/hub-bag.interface';
import {
  SORTATION_MACHINE_SERVICE,
  SortationMachineService,
} from '../../interfaces/sortation-machine-service.interface';
import {
  HubBagInsertAwbPayload,
  HubBagSummary,
} from '../../models/bag/hub-bag.payload';
import { MockBagService } from '../mocks/bag.service';
import { MockSortationMachineService } from '../mocks/sortation-machine.service';
import { DefaultHubBagService } from './hub-bag.service';

DoSmdPostAwbHistoryMetaQueueService.createJobByScanDoSmd = jest.fn();

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
      const mockAwb = {
        awb_item_id: 46958266,
        weight: 2.1,
        transport_type: 'SMU',
        district_code: 'DCODE',
        branch_id_lastmile: 1,
        representative_id: 1,
        representative: 'SUB',
        consignee_name: 'N',
        consignee_address: 'A',
      };

      jest
        .spyOn(sortationService, 'getAwb')
        .mockReturnValue(Promise.resolve(mockAwb));
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
        bagNumber: mockBag.bag_number,
        transportationMode: mockAwb.transport_type,
        representativeCode: mockAwb.representative,
        weight: mockAwb.weight,
        consigneeName: mockAwb.consignee_name,
        consigneeAddress: mockAwb.consignee_address,
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
      jest.spyOn(bagService, 'getBag').mockImplementation(async () => {
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
        transportation_mode: 'smd',
        awbs: ['601000000101'],
      };
      const mockAwb = {
        awb_item_id: 46958266,
        weight: 2.1,
        transport_type: 'SMD',
        district_code: 'DCODE',
        branch_id_lastmile: 1,
        representative_id: 87,
        representative: 'sub',
        consignee_name: 'N',
        consignee_address: 'A',
      };
      jest
        .spyOn(sortationService, 'getAwb')
        .mockReturnValue(Promise.resolve(mockAwb));
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
        bagNumber: mockBag.bag_number,
        transportationMode: mockAwb.transport_type,
        representativeCode: mockAwb.representative,
        weight: mockAwb.weight,
        consigneeName: mockAwb.consignee_name,
        consigneeAddress: mockAwb.consignee_address,
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
          consignee_name: 'N',
          consignee_address: 'A',
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
          consignee_name: 'N',
          consignee_address: 'A',
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
          consignee_name: 'N',
          consignee_address: 'A',
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

  describe('get', () => {
    const bagItemId = '63588cd81e421c6da5ccc5d4';
    const mockBagItem = {
      changedValues: {},
      weight: '6.00000',
      bagSeq: 1,
      bag: {
        changedValues: {},
        bagNumber: 'SPE7W7Q819',
        transportationMode: 'SMD',
      },
      bagItemAwbs: [
        {
          bagItemAwbId: '1589839066352844800',
          awbItem: {
            awbItemId: '46971288',
            awb: {
              awbNumber: '014991020870',
              consigneeName: 'A',
              consigneeNumber: '6280123456789',
              totalWeightReal: '2.10000',
            },
          },
        },
      ],
    };

    const getMockQueryBuilder = val =>
      ({
        select: () => getMockQueryBuilder(val),
        whereRaw: () => getMockQueryBuilder(val),
        andWhereRaw: () => val,
      } as any);

    it('should return a bagItem', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(mockBagItem));
      const result = await service.get(bagItemId);
      expect(result).toEqual(mockBagItem);
    });

    it('should throw a not found error', async () => {
      jest
        .spyOn(OrionRepositoryService.prototype, 'findOne')
        .mockReturnValue(getMockQueryBuilder(null));
      try {
        await service.get(bagItemId);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('print', () => {
    const mockBagItem = { bagItemId: '63588cd81e421c6da5ccc5d4' };
    const mockUser = { employee: { nickname: 'A' } };
    const mockBranch = { branchName: 'B' };
    const getMockQueryBuilder = val => {
      return { select: () => val } as any;
    };
    const getMockRepo = val =>
      ({
        loadById: () => getMockQueryBuilder(val),
      } as any);
    it('should call PrinterService.responseForJsReport', async () => {
      jest
        .spyOn(RepositoryService, 'user', 'get')
        .mockReturnValue(getMockRepo(mockUser));
      jest
        .spyOn(Branch, 'findOne')
        .mockReturnValue(
          Promise.resolve((mockBranch as unknown) as BaseEntity),
        );
      jest
        .spyOn(PrinterService, 'responseForJsReport')
        .mockImplementation(async () => {});
      await service.print(
        (mockBagItem as unknown) as Partial<BagItem>,
        mockAuthData.userId,
        mockPermission.branchId,
        null,
      );
      expect(PrinterService.responseForJsReport).toBeCalled();
    });

    it('should throw an internal server error', async () => {
      jest.spyOn(RepositoryService, 'user', 'get').mockImplementation(() => {
        throw new InternalServerErrorException('Unexpected Service Error');
      });
      try {
        await service.print(
          (mockBagItem as unknown) as Partial<BagItem>,
          mockAuthData.userId,
          mockPermission.branchId,
          null,
        );
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw an internal server error from PrinterService', async () => {
      jest
        .spyOn(RepositoryService, 'user', 'get')
        .mockReturnValue(getMockRepo(mockUser));
      jest
        .spyOn(Branch, 'findOne')
        .mockReturnValue(
          Promise.resolve((mockBranch as unknown) as BaseEntity),
        );
      jest
        .spyOn(PrinterService, 'responseForJsReport')
        .mockImplementation(async () => {
          throw new InternalServerErrorException('Unexpected service error');
        });

      try {
        await service.print(
          (mockBagItem as unknown) as Partial<BagItem>,
          mockAuthData.userId,
          mockPermission.branchId,
          null,
        );
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('getSummary', () => {
    const bagItemId = '63588cd81e421c6da5ccc5d4';
    const mockBagSummary = {
      bag_number: 'ZBPJ0YU03Z',
      weight: 2.1,
      awbs: 1,
      transportation_mode: 'SMD',
      representative_id_to: 1,
      representative_code: 'SOC',
    };
    const mockRepresentative = { representativeName: 'SOLO' };

    it('should return a bag summary', async () => {
      jest
        .spyOn(bagService, 'getBagSummary')
        .mockReturnValue(Promise.resolve(mockBagSummary));
      jest
        .spyOn(Representative, 'findOne')
        .mockReturnValue(
          Promise.resolve((mockRepresentative as unknown) as BaseEntity),
        );

      const result = await service.getSummary(bagItemId);
      expect(result).toEqual({
        bagNumber: mockBagSummary.bag_number,
        weight: mockBagSummary.weight,
        awbs: mockBagSummary.awbs,
        transportationMode: mockBagSummary.transportation_mode,
        representativeCode: mockBagSummary.representative_code,
        representativeName: mockRepresentative.representativeName,
      });
    });

    it('should throw an unexpected server error - error from bag service', async () => {
      jest.spyOn(bagService, 'getBagSummary').mockImplementation(() => {
        throw new InternalServerErrorException('Unexpected Service error');
      });
      try {
        await service.getSummary(bagItemId);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw an unexpected server error', async () => {
      jest
        .spyOn(bagService, 'getBagSummary')
        .mockReturnValue(Promise.resolve(mockBagSummary));
      jest.spyOn(Representative, 'findOne').mockImplementation(() => {
        throw new InternalServerErrorException('Unexpected database error');
      });
      try {
        await service.getSummary(bagItemId);
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('printSticker', () => {
    const mockBagSummary = {
      bagNumber: 'ZBPJ0YU03Z',
      weight: 2.1,
      awbs: 1,
      transportationMode: 'SMD',
      representativeCode: 1,
      representativeName: 'SOC',
    };
    const mockUser = { employee: { nickname: 'A' } };
    const mockBranch = { branchName: 'B' };
    const getMockQueryBuilder = val => {
      return { select: () => val } as any;
    };
    const getMockRepo = val =>
      ({
        loadById: () => getMockQueryBuilder(val),
      } as any);
    it('should call PrinterService.responseForRawCommands', async () => {
      jest
        .spyOn(RepositoryService, 'user', 'get')
        .mockReturnValue(getMockRepo(mockUser));
      jest
        .spyOn(Branch, 'findOne')
        .mockReturnValue(
          Promise.resolve((mockBranch as unknown) as BaseEntity),
        );
      jest
        .spyOn(PrinterService, 'responseForRawCommands')
        .mockImplementation(async () => {});
      await service.printSticker(
        (mockBagSummary as unknown) as HubBagSummary,
        mockAuthData.userId,
        mockPermission.branchId,
        null,
      );
      expect(PrinterService.responseForRawCommands).toBeCalled();
    });

    it('should throw an internal server error', async () => {
      jest.spyOn(RepositoryService, 'user', 'get').mockImplementation(() => {
        throw new InternalServerErrorException('Unexpected Service Error');
      });
      try {
        await service.printSticker(
          (mockBagSummary as unknown) as HubBagSummary,
          mockAuthData.userId,
          mockPermission.branchId,
          null,
        );
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should throw an internal server error from PrinterService', async () => {
      jest
        .spyOn(RepositoryService, 'user', 'get')
        .mockReturnValue(getMockRepo(mockUser));
      jest
        .spyOn(Branch, 'findOne')
        .mockReturnValue(
          Promise.resolve((mockBranch as unknown) as BaseEntity),
        );
      jest
        .spyOn(PrinterService, 'responseForJsReport')
        .mockImplementation(async () => {
          throw new InternalServerErrorException('Unexpected service error');
        });

      try {
        await service.printSticker(
          (mockBagSummary as unknown) as HubBagSummary,
          mockAuthData.userId,
          mockPermission.branchId,
          null,
        );
      } catch (err) {
        err = err.response;
        expect(err.statusCode).toEqual(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });
});
