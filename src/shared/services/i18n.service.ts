import { Injectable } from '@nestjs/common';
import * as glob from 'glob';
import { forEach, get, has } from 'lodash';
import * as path from 'path';
import { sprintf } from 'sprintf-js';

import { I18N_LANGUAGES } from '../constants/i18n.constant';
import { ConfigService } from './config.service';
import { PathService } from './path.service';
import { RequestContextMetadataService } from './request-context-metadata.service';

@Injectable()
export class I18nService {
  public static i18n: { [key in keyof typeof I18N_LANGUAGES]?: any } = {};

  public static defaultLanguage: string = I18N_LANGUAGES.INDONESIA;

  public static boot() {
    const serverIds = Object.keys(ConfigService.get('servers'));
    Object.values(I18N_LANGUAGES).forEach(languageCode => {
      const languageTranslationsGlobal = {};

      const translationJsonFilesPath = `${PathService.getAssetsPath()}/i18n/${languageCode}/*.json`;
      const translationJsonFiles = glob.sync(translationJsonFilesPath);
      translationJsonFiles.forEach(translationJsonFile => {
        try {
          const fileNameWithoutExtension = path.basename(
            translationJsonFile,
            path.extname(translationJsonFile),
          );

          const languageTranslationGlobal = require(translationJsonFile);
          Object.assign(languageTranslationsGlobal, {
            [fileNameWithoutExtension]: languageTranslationGlobal,
          });
        } catch (err) {
          // skip
        }
      });

      const languageTranslationServers = {};

      forEach(serverIds, serverId => {
        languageTranslationServers[serverId] = {};
        const languageTranslationServer = languageTranslationServers[serverId];
        const targetCurrentServerI18nPath = `${PathService.getRootPath()}/servers/${serverId}/i18n/${languageCode}/*.json`;
        const targetCurrentServerI18nJsonFiles = glob.sync(
          targetCurrentServerI18nPath,
        );
        targetCurrentServerI18nJsonFiles.forEach(
          targetCurrentServerI18nJsonFile => {
            try {
              const fileNameWithoutExtension = path.basename(
                targetCurrentServerI18nJsonFile,
                path.extname(targetCurrentServerI18nJsonFile),
              );

              const languageTranslationCurrentServer = require(targetCurrentServerI18nJsonFile);
              Object.assign(languageTranslationServer, {
                [fileNameWithoutExtension]: languageTranslationCurrentServer,
              });
            } catch (err) {
              // skip
            }
          },
        );
      });

      I18nService.i18n[languageCode] = {
        global: languageTranslationsGlobal,
        servers: languageTranslationServers,
      };
    });
  }

  public static translate(
    key: string,
    // tslint:disable-next-line: trailing-comma
    ...parameters: any[]
  ) {
    const language = I18nService.getRequestLanguage();
    const fullKey = `${language}.${key}`;

    if (has(I18nService.i18n, fullKey)) {
      return sprintf(get(I18nService.i18n, fullKey), ...parameters);
    }
    return key;
  }

  public static getRequestLanguage() {
    return (
      RequestContextMetadataService.getMetadata('REQUEST_LANGUAGE') ||
      I18nService.defaultLanguage
    );
  }
}
