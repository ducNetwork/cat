import { RouteManager } from '@lib/routes';

const rm = new RouteManager(__dirname);
await rm.load('./src/routes');
rm.generate('./lexicons');