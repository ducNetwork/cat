import { RouteManager } from '@lib/routes';

const rm = new RouteManager(__dirname);
await rm.loadLex('./src/xrpc');
rm.generate('./lexicons');