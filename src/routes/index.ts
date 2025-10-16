import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();
const dir = __dirname;

fs.readdirSync(dir).forEach((file) => {
  if (file === 'index.ts' || file === 'index.js') return;
  const fullPath = path.join(dir, file);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const routeModule = require(fullPath);
  const route = routeModule.default || routeModule;
  const routeName = file.replace('.Route.ts', '').replace('.Route.js', '').toLowerCase();
  router.use(`/${routeName}`, route);
});

export default router;
