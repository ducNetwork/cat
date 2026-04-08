import { RouteManager } from '@lib/routes';

const rm = new RouteManager(__dirname);
await rm.loadLex('./src/routes');
rm.generate('./lexicons');