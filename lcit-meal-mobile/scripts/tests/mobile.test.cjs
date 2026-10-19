const assert = require('node:assert/strict');
const { test, beforeEach, afterEach } = require('node:test');
const { createTestApp } = require('./load-source.cjs');
let app, client, keys;
const originalFetch = global.fetch;
beforeEach(() => {
  app = createTestApp();
  client = app.load('services/apiClient.ts');
  keys = app.load('config/constants.ts').STORAGE_KEYS;
});
afterEach(() => { global.fetch = originalFetch; client.registerUnauthorizedCallback(null); });
const respond = (status, body) => new Response(JSON.stringify(body), { status });
test('Business dates retain calendar date across timezones and year boundaries', () => {
  const f = app.load('utils/formatters.ts');
  for (const date of ['2026-12-31', '2027-01-01', '2028-02-29']) {
    assert.equal(f.formatBusinessDate(`${date}T00:00:00.000Z`), date);
    assert.equal(f.formatBusinessDate(`${date}T23:59:59-07:00`), date);
  }
  assert.equal(f.formatDisplayDate('2026-10-15'), '15/10/2026');
  assert.equal(f.getFullDayOfWeek('2026-10-15'), 'Thứ Năm');
  assert.equal(f.formatBusinessDate('invalid'), '');
  assert.equal(f.formatDisplayDate(null), '');
});
test('Role normalization handles backend objects, strings and role priority', () => {
  const { extractUserRole } = app.load('types/auth.ts');
  assert.equal(extractUserRole({ roles: [{ code: 'employee' }, { code: 'admin' }] }), 'admin');
  assert.equal(extractUserRole({ roles: ['employee', 'manager'] }), 'manager');
  assert.equal(extractUserRole({ roles: ['kitchen'] }), 'kitchen');
  assert.equal(extractUserRole({ role: 'manager', roles: ['employee'] }), 'manager');
});
test('API normalizes override URL, attaches bearer token and unwraps payload', async () => {
  await app.storage.setItem(keys.API_URL_OVERRIDE, 'http://localhost:3000///');
  await app.storage.setItem(keys.AUTH_TOKEN, 'test-token');
  global.fetch = async (url, config) => {
    assert.equal(url, 'http://localhost:3000/api/meals');
    assert.equal(config.headers.Authorization, 'Bearer test-token');
    return respond(200, { success: true, payload: [{ id: 1 }] });
  };
  assert.deepEqual(await client.apiClient('meals'), [{ id: 1 }]);
});
test('Login 401 preserves server message without expiring another session', async () => {
  let called = false;
  client.registerUnauthorizedCallback(() => { called = true; });
  global.fetch = async (_url, config) => {
    assert.equal(config.headers.Authorization, undefined);
    return respond(401, { success: false, error: { code: 401, message: 'Sai mật khẩu' } });
  };
  await assert.rejects(client.apiClient('/auth/login', { skipAuth: true }), { code: 401, message: 'Sai mật khẩu' });
  assert.equal(called, false);
});
test('Protected 401 invokes session expiry callback', async () => {
  let called = 0;
  client.registerUnauthorizedCallback(() => { called++; });
  global.fetch = async () => respond(401, { success: false });
  await assert.rejects(client.apiClient('/meals'), { code: 401 });
  assert.equal(called, 1);
});
for (const status of [403, 409, 500]) {
  test(`API preserves server error ${status}`, async () => {
    global.fetch = async () => respond(status, { success: false, error: { code: status, message: 'Server error' } });
    await assert.rejects(client.apiClient('/meals'), { code: status, message: 'Server error' });
  });
}
test('Network failure reports connection error', async () => {
  global.fetch = async () => { throw new TypeError('Failed to fetch'); };
  await assert.rejects(client.apiClient('/meals'), { code: 0 });
});
test('Request timeout aborts fetch and reports 408', async () => {
  global.fetch = (_url, config) => new Promise((_resolve, reject) => {
    config.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
  });
  await assert.rejects(client.apiClient('/meals', { timeoutMs: 10 }), { code: 408 });
});
test('Non-JSON server failure retains HTTP status', async () => {
  global.fetch = async () => new Response('<html>Error</html>', { status: 502 });
  await assert.rejects(client.apiClient('/meals'), { code: 502 });
});
test('Timeout covers reading the response body, not only response headers', async () => {
  global.fetch = async (_url, config) => ({
    status: 200, ok: true,
    json: () => new Promise((_resolve, reject) => {
      config.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')), { once: true });
    }),
  });
  await assert.rejects(client.apiClient('/meals', { timeoutMs: 10 }), { code: 408 });
});
for (const body of ['<html>Proxy error</html>', 'null', '{}']) {
  test(`Malformed successful response is reported as server error: ${body}`, async () => {
    global.fetch = async () => new Response(body, { status: 200 });
    await assert.rejects(client.apiClient('/meals'), { code: 502 });
  });
}
test('Empty 204 response is accepted', async () => {
  global.fetch = async () => new Response(null, { status: 204 });
  assert.equal(await client.apiClient('/meals/1', { method: 'DELETE' }), null);
});
test('FormData leaves multipart boundary to fetch', async () => {
  global.fetch = async (_url, config) => {
    assert.equal(config.headers['Content-Type'], undefined);
    return respond(200, { success: true, payload: { uploaded: true } });
  };
  await client.apiClient('/upload', { method: 'POST', body: new FormData() });
});
test('Lists support arrays, pagination and missing payloads', () => {
  assert.deepEqual(client.extractDataList([{ id: 1 }]), [{ id: 1 }]);
  assert.deepEqual(client.extractDataList({ data: [{ id: 2 }] }), [{ id: 2 }]);
  for (const value of [null, undefined, {}, { data: null }]) assert.deepEqual(client.extractDataList(value), []);
});
test('Auth service persists normalized login and clears session even offline', async () => {
  const { authService } = app.load('services/authService.ts');
  global.fetch = async (_url, config) => {
    assert.deepEqual(JSON.parse(config.body), { username: 'user1', password: '123456' });
    return respond(200, { success: true, payload: { accessToken: 'session', user: { id: 1, roles: [{ code: 'employee' }] } } });
  };
  assert.equal((await authService.login({ username: ' user1 ', password: '123456' })).user.role, 'employee');
  assert.equal((await authService.getStoredSession()).token, 'session');
  global.fetch = async () => { throw new TypeError('offline'); };
  await authService.logout();
  assert.deepEqual(await authService.getStoredSession(), { user: null, token: null });
});
test('Mock store preserves registration ID and waits for cancellation approval', () => {
  const { mockStore } = app.load('services/mockStore.ts');
  const meal = mockStore.createMeal('2099-01-15', 'Test');
  const reg = mockStore.registerMeal(meal.id, 2);
  const option = mockStore.createMealOption('cancel_schedule', meal.mealDate, meal.mealDate);
  assert.equal(option.status, 'pending');
  assert.equal(mockStore.getMyRegistrations().find(r => r.id === reg.id).status, 'confirmed');
  assert.equal(mockStore.approveMealOption(option.id).status, 'approved');
  assert.equal(mockStore.getMyRegistrations().find(r => r.id === reg.id).status, 'cancelled');
  const again = mockStore.registerMeal(meal.id, 0);
  assert.equal(again.id, reg.id);
  assert.equal(again.status, 'confirmed');
});
