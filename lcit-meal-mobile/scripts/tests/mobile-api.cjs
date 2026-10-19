// Exercise actual mobile services against the disposable backend test server.
// Never point this runner at production: it owns and waits for its QA server.
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const { createTestApp } = require('./load-source.cjs');
const root = path.resolve(__dirname, '../../..');
const backend = path.join(root, 'lcit-meal-api');
const logPath = path.join(root, 'test-results/mobile-api.log');
fs.mkdirSync(path.dirname(logPath), { recursive: true });
const log = fs.createWriteStream(logPath);
const child = spawn(process.execPath, ['scripts/test-workflows.cjs', '--serve'], {
  cwd: backend, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true,
});
child.stderr.pipe(log, { end: false });
let stopping;
async function cleanup() {
  if (stopping) return stopping;
  stopping = (async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.stdin.write('stop\n');
      await once(child, 'exit');
    }
    log.end();
  })();
  return stopping;
}
async function main() {
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error('QA server did not become ready in 45s; see mobile-api.log')), 45000);
    child.once('error', error => { clearTimeout(timeout); reject(error); });
    child.once('exit', code => { clearTimeout(timeout); reject(new Error(`QA backend exited (${code}); see mobile-api.log`)); });
    child.stdout.on('data', chunk => {
      log.write(chunk);
      output += chunk;
      if (output.includes('QA API READY')) {
        clearTimeout(timeout);
        const counts = output.match(/RESULT (\d+)\/(\d+) passed/);
        if (!counts || counts[1] !== counts[2]) reject(new Error('Backend regression suite failed; see mobile-api.log'));
        else resolve();
      }
    });
  });
  const app = createTestApp();
  const keys = app.load('config/constants.ts').STORAGE_KEYS;
  await app.storage.setItem(keys.API_URL_OVERRIDE, 'http://127.0.0.1:3000/api');
  const { authService } = app.load('services/authService.ts');
  const { mealService } = app.load('services/mealService.ts');
  const { apiClient } = app.load('services/apiClient.ts');
  const login = username => authService.login({ username, password: '123456' });
  const date = app.load('utils/formatters.ts').formatBusinessDate(new Date(Date.now() + 21 * 86400000));
  await login('admin');
  const meal = await mealService.createMeal({ mealDate: date, note: 'Mobile service integration' });
  await login('user1');
  const registration = await mealService.registerMeal({ mealId: meal.id, guestCount: 2 });
  assert.equal(registration.status, 'confirmed');
  assert.equal(registration.guestCount, 2);
  for (const guestCount of [-1, 11, 1.5]) {
    await assert.rejects(mealService.registerMeal({ mealId: meal.id, guestCount }), { code: 400 });
  }
  await assert.rejects(mealService.registerMeal({ mealId: meal.id, guestCount: 2 }), { code: 409 });
  assert.equal((await mealService.cancelRegistration(registration.id)).status, 'cancelled');
  assert.equal((await mealService.registerMeal({ mealId: meal.id, guestCount: 0 })).id, registration.id);
  const option = await mealService.createMealOption({ type: 'cancel_schedule', fromDate: date, toDate: date, note: 'Mobile approval test' });
  assert.equal(option.status, 'pending');
  await assert.rejects(mealService.approveMealOption(option.id), { code: 403 });
  await login('manager');
  assert.equal((await mealService.approveMealOption(option.id)).status, 'approved');
  await login('user1');
  assert.equal((await mealService.getMyRegistrations()).find(r => r.id === registration.id).status, 'cancelled');
  await authService.logout();
  await assert.rejects(apiClient('/meals'), { code: 401 });
  console.log('PASS mobile services: login, guest limits, duplicate, cancel, re-register, approval, permissions, logout/401');
  if (process.argv.includes('--serve')) {
    console.log('MOBILE QA READY http://localhost:3000 — isolated test accounts; enter stop to dispose the schema.');
    process.stdin.setEncoding('utf8');
    await new Promise(resolve => {
      const onInput = value => {
        if (value.trim() === 'stop') {
          process.stdin.off('data', onInput);
          process.stdin.pause();
          resolve();
        }
      };
      process.stdin.on('data', onInput);
    });
  }
}
process.once('SIGINT', () => { cleanup().then(() => process.exit(130)); });
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(cleanup);
