const { test } = require('node:test');
const assert = require('node:assert/strict');
const { canAutoRegister } = require('../../src/jobs/autoRegistrationEligibility');

test('Kitchen and system administrator accounts never receive automatic meals', () => {
  for (const roles of [['kitchen'], [{ code: 'kitchen' }], ['employee', 'kitchen'], ['admin'], ['admin', 'employee']]) {
    assert.equal(canAutoRegister({ status: '1', roles }), false);
  }
});

test('Only active employees and managers receive automatic meals', () => {
  for (const role of ['employee', 'manager']) {
    assert.equal(canAutoRegister({ status: '1', roles: [{ code: role }] }), true);
    assert.equal(canAutoRegister({ status: 1, roles: [role] }), true);
    for (const status of ['0', '2', '-1']) assert.equal(canAutoRegister({ status, roles: [role] }), false);
  }
  assert.equal(canAutoRegister({ status: '1', roles: [] }), false);
});
