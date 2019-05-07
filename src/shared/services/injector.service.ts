import { Type } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectType } from 'typeorm';

export class InjectorService {
  public static targetModuleRef: ModuleRef;

  public static setModuleRef(moduleRef: ModuleRef) {
    this.targetModuleRef = moduleRef;
  }

  public static get<T>(instance: Type<T>) {
    return this.targetModuleRef.get<T>(instance, { strict: false });
  }

  public static getRepository<T>(instance: ObjectType<T>): T {
    return this.get<T>(getRepositoryToken(instance) as any);
  }
}
