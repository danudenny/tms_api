import express = require('express');

import { pack } from '../util/php-pack';

export class WebClientPrintService {
  private static licenseOwner: string = 'SiCepat - 1 WebApp Lic - 2 WebServer Lic';
  private static licenseKey: string = 'E905ED5D9F61187C8584807B6E1B3C0CEA4A5894';

  private static formatHexValues(str: string) {
    let buffer = '';

    let i = 0;
    const l = str.length;

    while (i < l) {
      if (str[i] == '0') {
        if (i + 1 < l && (str[i] == '0' && str[i + 1] == 'x')) {
          if (
            i + 2 < l &&
            ((str[i + 2] >= '0' && str[i + 2] <= '9') ||
              (str[i + 2] >= 'a' && str[i + 2] <= 'f') ||
              (str[i + 2] >= 'A' && str[i + 2] <= 'F'))
          ) {
            if (
              i + 3 < l &&
              ((str[i + 3] >= '0' && str[i + 3] <= '9') ||
                (str[i + 3] >= 'a' && str[i + 3] <= 'f') ||
                (str[i + 3] >= 'A' && str[i + 3] <= 'F'))
            ) {
              try {
                buffer += String.fromCharCode(str.substr(i, 4) as any);
                i += 4;
                continue;
              } catch (err) {
                throw new Error(
                  'Invalid hex notation in the specified printer commands at index: ' +
                    i,
                );
              }
            } else {
              try {
                buffer += String.fromCharCode(str.substr(i, 3) as any);
                i += 3;
                continue;
              } catch (err) {
                throw new Error(
                  'Invalid hex notation in the specified printer commands at index: ' +
                    i,
                );
              }
            }
          }
        }
      }

      buffer += str.substr(i, 1);

      i++;
    }

    return buffer;
  }

  private static intToArray(num: number): string {
    return pack('L', num);
  }

  public static sendPrinterCommands(response: express.Response, printerCommands: string, formatHexValues: boolean = false) {
    let buffer = '';

    const cpjHeader =
      String.fromCharCode(99) +
      String.fromCharCode(112) +
      String.fromCharCode(106) +
      String.fromCharCode(2);

    if (formatHexValues) {
      buffer += this.formatHexValues(printerCommands);
    } else {
      buffer += printerCommands;
    }

    const arrIdx1 = this.intToArray(buffer.length);

    buffer += String.fromCharCode(0); // set default printer

    const arrIdx2 = this.intToArray(buffer.length);

    buffer += this.licenseOwner + String.fromCharCode(124) + this.licenseKey;

    const commands = cpjHeader + arrIdx1 + arrIdx2 + buffer;

    response.setHeader('Content-Type', 'application/octet-stream');
    response.end(new Buffer(commands, 'binary'));
  }
}
