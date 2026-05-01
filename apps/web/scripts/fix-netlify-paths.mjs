/**
 * Fixes Windows backslash paths embedded in the Netlify server handler.
 * Node.js interprets \v, \t, \a as escape sequences, causing runtime crashes
 * when the handler tries to import '\var\task\apps\web\...' on Linux.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const handlerPath = join(
  process.cwd(),
  '.netlify/functions-internal/___netlify-server-handler/___netlify-server-handler.mjs'
);

if (!existsSync(handlerPath)) {
  console.log('No Netlify handler found — skipping path fix.');
  process.exit(0);
}

const content = readFileSync(handlerPath, 'utf8');

// Replace Windows-style \var\task\apps\web paths with POSIX /var/task/apps/web
const fixed = content
  .replace(/\\var\\task\\apps\\web\\/g, '/var/task/apps/web/')
  .replace(/\\var\\task\\apps\\web\//g, '/var/task/apps/web/');

if (fixed === content) {
  console.log('No Windows path issues found in Netlify handler.');
} else {
  writeFileSync(handlerPath, fixed, 'utf8');
  console.log('Fixed Windows backslash paths in Netlify server handler.');
}
