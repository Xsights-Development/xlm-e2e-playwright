import { createRequire } from 'node:module';
import { join } from 'node:path';

/** Register every bundled moment locale (weekday asserts in i18n E2E). */
createRequire(join(process.cwd(), 'package.json'))('moment/min/locales.js');
