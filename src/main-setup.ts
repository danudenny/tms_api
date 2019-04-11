import { patchTypeORMRepositoryWithBaseRepository } from './shared/external/typeorm-transactional-cls-hooked';
import { initializeTransactionalContext } from './shared/external/typeorm-transactional-cls-hooked/common';
import { ConfigService } from './shared/services/config.service';
import { DeferFunctionService } from './shared/services/defer-function.service';

process.setMaxListeners(0);

export const validateEnvironment = () => {
  if (process.env.PORT && !process.env.SINGLE_SERVER) {
    throw new Error(
      'Environment PORT cannot be used without SINGLE_SERVER environment variable',
    );
  }
};

export const bootServer = async (serverName: string, serverConfig: any) => {
  if (serverConfig.enabled) {
    const targetModule = require(`./servers/${serverName}/server.module`);

    DeferFunctionService.apply();

    const targetAppModuleClass: any = Object.values(targetModule)[0];
    await targetAppModuleClass.bootServer(serverName, serverConfig);

    return targetAppModuleClass;
  }
};

export const boot = async (): Promise<{ [key: string]: any }> => {
  initializeTransactionalContext();
  patchTypeORMRepositoryWithBaseRepository();
  validateEnvironment();

  const serverModules = {};
  const availableServers = ConfigService.get('servers');

  const singleServer = process.env.SINGLE_SERVER;
  if (singleServer && availableServers[singleServer]) {
    const serverModule = await bootServer(
      singleServer,
      availableServers[singleServer],
    );
    serverModules[singleServer] = serverModule;
  } else {
    for (const serverName in availableServers) {
      const serverModule = await bootServer(
        serverName,
        availableServers[serverName],
      );
      serverModules[serverName] = serverModule;
    }
  }

  return serverModules;
};
