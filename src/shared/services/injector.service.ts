import { ModuleRef } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectType } from 'typeorm';

export class InjectorService {
  public static targetModuleRef: ModuleRef;

  public static setModuleRef(moduleRef: ModuleRef) {
    InjectorService.targetModuleRef = moduleRef;
  }

  public static get<T>(instance: any) {
    return InjectorService.targetModuleRef.get<T>(instance, { strict: false });
  }

  public static getRepository<T>(instance: ObjectType<T>):T {
    return InjectorService.get<T>(getRepositoryToken(instance));
  }
}
