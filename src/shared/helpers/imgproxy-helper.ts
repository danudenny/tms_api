import { ConfigService } from '../services/config.service';

export abstract class ImgProxyHelper {
  // https://github.com/progapandist/imgproxy-form/blob/gh-pages/index.js

  public static generateProxyUrl(opts: {
    url: string;
    key: string;
    salt: string;
    resize: string;
    width: number;
    height: number;
    gravity: string;
    extension: string;
    enlarge: number;
    proxy_url: string;
  }) {
    const jsSHA = require('jssha');
    const encoded_url = Buffer.from(opts.url)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '-');
    const path =
      '/rs:' +
      opts.resize +
      ':' +
      opts.width +
      ':' +
      opts.height +
      ':' +
      opts.enlarge +
      '/g:' +
      opts.gravity +
      '/' +
      encoded_url +
      '.' +
      opts.extension;

    // https://www.npmjs.com/package/jssha
    const shaObj = new jsSHA(
      ConfigService.get('imgProxyHelper.algo'),
      'BYTES',
    );

    shaObj.setHMACKey(Buffer.from(opts.key), 'ARRAYBUFFER');
    shaObj.update(opts.salt);
    shaObj.update(path);
    const hmac = shaObj
      .getHMAC('B64')
      .replace(/=/g, '')
      .replace(/\//g, '_')
      .replace(/\+/g, '-');
    return opts.proxy_url + '/' + hmac + path;
  }

  public static sicepatProxyUrl(url: string) {
    const opt = {
      url,
      key: ConfigService.get('imgProxyHelper.key'),
      salt: ConfigService.get('imgProxyHelper.salt'),
      resize: 'fit',
      width: 768,
      height: 1024,
      gravity: 'no',
      extension: 'jpg',
      enlarge: 0,
      proxy_url: ConfigService.get('imgProxyHelper.proxyUrl'),
    };
    return this.generateProxyUrl(opt);
  }
}
