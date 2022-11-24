export const IFRAME_CONFIG = 'IFRAME_CONFIG';

interface MetabaseIframeConfig {
  url: string;
  secret: string;
  expiry: number;
}

export interface IframeConfig {
  metabase: MetabaseIframeConfig;
}
