// Integration tests against the real Express app and a disposable MySQL schema.
// Run from lcit-meal-api: node scripts/test-workflows.cjs [--serve]
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ quiet: true });
const dbName = `qa_meal_${Date.now()}_${process.pid}`;
const results = [];
let connection, server, pool, created = false;
let base;
const sessions = {};
async function check(name, fn) {
  try { await fn(); results.push({ name, status: 'PASS' }); console.log(`PASS ${name}`); }
  catch (e) { results.push({ name, status: 'FAIL', error: e.message }); console.log(`FAIL ${name}: ${e.message}`); }
}
async function request(role, endpoint, method = 'GET', body, expected = 200) {
  const response = await fetch(base + endpoint, {
    method, headers: { 'Content-Type': 'application/json', ...(sessions[role] ? { Authorization: `Bearer ${sessions[role].accessToken}` } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: AbortSignal.timeout(15000),
  });
  const json = await response.json();
  assert.ok([].concat(expected).includes(response.status), `${method} ${endpoint}: expected ${expected}, got ${response.status}; ${json.error?.message || ''}`);
  return json.payload;
}
const rows = p => Array.isArray(p) ? p : p.data;
async function cleanup() {
  if (server) await new Promise(resolve => server.close(resolve));
  if (pool) await pool.end();
  if (connection) {
    if (created) await connection.query(`DROP DATABASE \`${dbName}\``);
    await connection.end();
  }
}
async function main() {
  const source = process.env.DB_NAME;
  connection = await mysql.createConnection({ host: process.env.DB_HOST, port: process.env.DB_PORT, user: process.env.DB_USER, password: process.env.DB_PASSWORD });
  await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  created = true;
  await connection.query(`USE \`${dbName}\``);
  await connection.query('SET FOREIGN_KEY_CHECKS=0');
  const [tables] = await connection.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_TYPE=\'BASE TABLE\'', [source]);
  for (const { TABLE_NAME: name } of tables) {
    const [ddl] = await connection.query(`SHOW CREATE TABLE \`${source}\`.\`${name}\``);
    await connection.query(ddl[0]['Create Table'].split(`\`${source}\`.`).join(`\`${dbName}\`.`));
  }
  // Only configuration is copied. No real users, registrations or payments.
  for (const name of ['role', 'system_setting', 'meal_schedule_config']) {
    await connection.query(`INSERT INTO \`${name}\` SELECT * FROM \`${source}\`.\`${name}\``);
  }
  const hash = await bcrypt.hash('123456', 10);
  for (const [username, role] of [['admin','admin'],['manager','manager'],['user1','employee'],['user2','employee'],['kitchen','kitchen']]) {
    const [r] = await connection.query('INSERT INTO user (full_name,username,password_hash,auth_key,status) VALUES (?,?,?,?,?)', [`QA ${username}`,username,hash,`qa_${username}`,'1']);
    await connection.query('INSERT INTO user_role (user_id,role_id,status) SELECT ?,id,\'active\' FROM role WHERE code=?', [r.insertId,role]);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS=1');
  await require('./migrate.cjs')(connection);
  process.env.DB_NAME = dbName;
  process.env.JWT_SECRET = require('node:crypto').randomBytes(32).toString('hex');
  const app = require('../src/app');
  pool = require('../src/config/database');
  server = app.listen(process.argv.includes('--serve') ? 3000 : 0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}/api`;
  for (const role of ['admin','manager','user1','user2','kitchen']) {
    await check(`Login ${role}`, async () => { sessions[role] = await request(null,'/auth/login','POST',{username:role,password:'123456'}); assert.ok(sessions[role].accessToken); assert.equal(sessions[role].user.passwordHash,undefined); });
  }
  await check('Reject wrong password', () => request(null,'/auth/login','POST',{username:'user1',password:'wrong'},401));
  await check('Reject missing credentials', () => request(null,'/auth/login','POST',{},400));
  await check('Require authentication', () => request(null,'/meals','GET',undefined,401));
  for (const role of ['admin','manager','user1','kitchen']) {
    await check(`${role}: dashboard`, () => request(role,'/dashboard/home'));
    for (const ep of ['/meals','/meal-registrations/me','/payments/me','/notifications/me','/system-settings'])
      await check(`${role}: ${ep}`, () => request(role,ep,'GET',undefined,role === 'kitchen' ? 403 : 200));
    await check(`${role}: users permission`, () => request(role,'/users','GET',undefined,['admin','manager'].includes(role) ? 200 : 403));
    await check(`${role}: audit permission`, () => request(role,'/audit-logs','GET',undefined,role === 'admin' ? 200 : 403));
  }
  await check('Employee cannot create user', () => request('user1','/users','POST',{},403));
  await check('Manager cannot modify settings', () => request('manager','/system-settings/key/meal_price','PUT',{settingValue:'999'},403));
  await check('Web origin 8081 allowed by CORS', async () => { const r = await fetch(base+'/auth/login',{method:'OPTIONS',headers:{Origin:'http://localhost:8081','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}}); assert.equal(r.headers.get('access-control-allow-origin'),'http://localhost:8081'); });
  const date = new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  const meal = await request('admin','/meals','POST',{mealDate:date,note:'QA workflow'},201);
  await check('Duplicate meal rejected', () => request('admin','/meals','POST',{mealDate:date},409));
  await check('Admin cannot self-register', () => request('admin','/meal-registrations','POST',{mealId:meal.id,guestCount:0},403));
  let reg;
  await check('Employee registers with 2 guests', async () => { reg = await request('user1','/meal-registrations','POST',{mealId:meal.id,guestCount:2},201); assert.equal(reg.status,'confirmed'); assert.equal(reg.guestCount,2); });
  await check('Duplicate registration rejected', () => request('user1','/meal-registrations','POST',{mealId:meal.id,guestCount:2},409));
  for (const count of [-1,11,1.5]) await check(`Reject guestCount ${count}`, () => request('user1','/meal-registrations','POST',{mealId:meal.id,guestCount:count},400));
  await check('Update guests keeps same registration', async () => { const r = await request('user1','/meal-registrations','POST',{mealId:meal.id,guestCount:3},201); assert.equal(r.id,reg.id); assert.equal(r.guestCount,3); });
  await check('Other employee cannot read registration', () => request('user2',`/meal-registrations/${reg.id}`,'GET',undefined,403));
  await check('Other employee cannot cancel registration', () => request('user2',`/meal-registrations/${reg.id}/cancel`,'PATCH',{},403));
  await check('Employee cannot register for another user', () => request('user2','/meal-registrations','POST',{mealId:meal.id,userId:sessions.manager.user.id,guestCount:0},403));
  await check('Cancel registration', async () => { const r = await request('user1',`/meal-registrations/${reg.id}/cancel`,'PATCH',{}); assert.equal(r.status,'cancelled'); });
  await check('Re-register after cancellation', async () => { const r = await request('user1','/meal-registrations','POST',{mealId:meal.id,guestCount:0},201); assert.equal(r.id,reg.id); assert.equal(r.status,'confirmed'); });
  let option;
  await check('Cancel date range syncs registration', async () => { option = await request('user1','/meal-options','POST',{type:'cancel_schedule',fromDate:date,toDate:date},201); assert.equal(option.status,'approved'); const r = await request('user1',`/meal-registrations/${reg.id}`); assert.equal(r.status,'cancelled'); });
  await check('Other employee cannot read cancellation request', () => request('user2',`/meal-options/${option.id}`,'GET',undefined,403));
  await check('Employee cannot cancel meals for another user', () => request('user2','/meal-options','POST',{userId:sessions.manager.user.id,type:'cancel_schedule',fromDate:date,toDate:date},403));
  await check('Holiday restore preserves voluntary cancellation', async () => { const event = await request('admin','/holiday-events','POST',{name:'QA holiday',fromDate:date,toDate:date},201); await request('admin',`/holiday-events/${event.id}/restore`,'PATCH',{}); const r = await request('user1',`/meal-registrations/${reg.id}`); assert.equal(r.status,'cancelled'); });
  await check('Holiday restore leaves voluntary cancellation unchanged', async () => { const r = await request('user1',`/meal-registrations/${reg.id}`); assert.equal(r.status,'cancelled'); });
  await check('Overlapping holidays restore only their own registrations after last holiday', async () => {
    const day=new Date(Date.now()+14*86400000).toISOString().slice(0,10);
    const m=await request('admin','/meals','POST',{mealDate:day},201);
    const a=await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},201);
    const b=await request('user2','/meal-registrations','POST',{mealId:m.id,guestCount:0},201);
    await request('user2',`/meal-registrations/${b.id}/cancel`,'PATCH',{});
    const eventBody={name:'QA overlap',fromDate:day,toDate:day};
    const h1=await request('admin','/holiday-events','POST',eventBody,201);
    const h2=await request('admin','/holiday-events','POST',eventBody,201);
    assert.equal((await request('user1',`/meal-registrations/${a.id}`)).status,'cancelled');
    await request('admin',`/holiday-events/${h1.id}/restore`,'PATCH',{});
    assert.equal((await request('admin',`/meals/${m.id}`)).isCancelled,true);
    assert.equal((await request('user1',`/meal-registrations/${a.id}`)).status,'cancelled');
    await request('admin',`/holiday-events/${h2.id}/restore`,'PATCH',{});
    assert.equal((await request('admin',`/meals/${m.id}`)).isCancelled,false);
    assert.equal((await request('user1',`/meal-registrations/${a.id}`)).status,'confirmed');
    assert.equal((await request('user2',`/meal-registrations/${b.id}`)).status,'cancelled');
    await request('admin',`/holiday-events/${h2.id}/restore`,'PATCH',{},409);
  });
  await check('Holiday restoration rolls back every change on database failure', async () => {
    const day=new Date(Date.now()+15*86400000).toISOString().slice(0,10);
    const m=await request('admin','/meals','POST',{mealDate:day},201);
    const r=await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},201);
    const h=await request('admin','/holiday-events','POST',{name:'QA rollback',fromDate:day,toDate:day},201);
    await connection.query(`CREATE TRIGGER qa_fail_restore BEFORE UPDATE ON meal_registration FOR EACH ROW
      SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='QA injected failure'`);
    try {
      await request('admin',`/holiday-events/${h.id}/restore`,'PATCH',{},500);
      assert.equal((await request('admin',`/holiday-events/${h.id}`)).status,'active');
      assert.equal((await request('admin',`/meals/${m.id}`)).isCancelled,true);
      assert.equal((await request('user1',`/meal-registrations/${r.id}`)).status,'cancelled');
    } finally { await connection.query('DROP TRIGGER qa_fail_restore'); }
    await request('admin',`/holiday-events/${h.id}/restore`,'PATCH',{});
    assert.equal((await request('user1',`/meal-registrations/${r.id}`)).status,'confirmed');
  });
  await check('Cancellation submitted during holiday remains cancelled after restore', async () => {
    const day=new Date(Date.now()+16*86400000).toISOString().slice(0,10);
    const m=await request('admin','/meals','POST',{mealDate:day},201);
    const r=await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},201);
    const h=await request('admin','/holiday-events','POST',{name:'QA personal opt out',fromDate:day,toDate:day},201);
    await request('user1','/meal-options','POST',{type:'cancel_schedule',fromDate:day,toDate:day},201);
    await request('admin',`/holiday-events/${h.id}/restore`,'PATCH',{});
    assert.equal((await request('user1',`/meal-registrations/${r.id}`)).status,'cancelled');
  });
  let payment;
  await check('Create payment', async () => { payment = await request('manager','/payments','POST',{userId:sessions.user1.user.id,paymentDate:date,amount:90000},201); assert.equal(Number(payment.amount),90000); });
  await check('Payment business date survives API serialization', async () => { assert.equal(payment.paymentDate.slice(0,10),date); });
  await check('Personal payments contain own invoice', async () => { const p = rows(await request('user1','/payments/me')); assert.ok(p.some(p=>p.id===payment.id)); assert.ok(p.every(p=>p.userId===sessions.user1.user.id)); });
  await check('Employee cannot mark paid', () => request('user1',`/payments/${payment.id}/mark-paid`,'PATCH',{},403));
  await check('Manager marks paid', async () => { const p=await request('manager',`/payments/${payment.id}/mark-paid`,'PATCH',{paidAmount:90000}); assert.equal(p.status,'paid'); });
  await check('Reject repeated payment confirmation', () => request('manager',`/payments/${payment.id}/mark-paid`,'PATCH',{},409));
  await check('Reject negative payment update', () => request('manager',`/payments/${payment.id}`,'PUT',{amount:-100},400));
  await check('Reject negative paid amount', async () => { const p = await request('admin','/payments','POST',{userId:sessions.user2.user.id,paymentDate:date,amount:100},201); await request('manager',`/payments/${p.id}/mark-paid`,'PATCH',{paidAmount:-100},400); });
  for (const amount of [null,'','not-a-number',true]) {
    await check(`Reject invalid payment amount ${JSON.stringify(amount)}`, () => request('manager',`/payments/${payment.id}`,'PUT',{amount},400));
  }
  await check('CORS rejects unknown web origin', async () => {
    const r=await fetch(base+'/auth/login',{method:'OPTIONS',headers:{Origin:'https://untrusted.example','Access-Control-Request-Method':'POST'}});
    assert.equal(r.headers.get('access-control-allow-origin'),null);
  });
  await check('Read and mark personal notifications', async () => { const n = rows(await request('user1','/notifications/me')); assert.ok(n.length>0); await request('user1','/notifications/me/seen-all','PATCH',{}); const count=await request('user1','/notifications/me/unseen-count'); assert.equal(count.total,0); });
  for (const ep of ['/payments/export','/meal-registrations/export']) await check(`Excel ${ep}`, async () => { const r = await fetch(base+ep,{headers:{Authorization:`Bearer ${sessions.admin.accessToken}`}}); assert.equal(r.status,200); const b=Buffer.from(await r.arrayBuffer()); assert.equal(b.subarray(0,2).toString(),'PK'); });
  await check('Update own profile', async () => { const u=await request('user1','/users/me','PATCH',{fullName:'QA edited'}); assert.equal(u.fullName,'QA edited'); });
  let createdUser;
  await check('Admin creates employee', async () => { createdUser=await request('admin','/users','POST',{username:'qa_created',fullName:'QA created',password:'123456'},201); assert.ok(createdUser.roles.some(r=>r.code==='employee')); });
  await check('Duplicate username rejected', () => request('admin','/users','POST',{username:'qa_created',fullName:'QA duplicate',password:'123456'},409));
  await check('Manager cannot modify users', () => request('manager',`/users/${createdUser.id}`,'PUT',{fullName:'Unauthorized'},403));
  await check('Reject registration for past day', async () => { const m=await request('admin','/meals','POST',{mealDate:'2020-01-01'},201); await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},409); });
  await check('Registration cutoff enforced for today', async () => {
    const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    await connection.query("UPDATE system_setting SET setting_value='00:00' WHERE setting_key='registration_close_time'");
    const m=await request('admin','/meals','POST',{mealDate:today},201);
    await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},400);
    await connection.query("UPDATE system_setting SET setting_value='23:59' WHERE setting_key='registration_close_time'");
    const r=await request('user1','/meal-registrations','POST',{mealId:m.id,guestCount:0},201);
    await connection.query("UPDATE system_setting SET setting_value='00:00' WHERE setting_key='registration_close_time'");
    await request('user1',`/meal-registrations/${r.id}`,'PUT',{guestCount:2},400);
  });
  await check('Logout revokes token', async () => { await request('user2','/auth/logout','POST',{}); await request('user2','/meals','GET',undefined,401); });
  const output = path.resolve(__dirname,'../../test-results/api-workflows.json');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify({timestamp:new Date().toISOString(),database:'disposable schema; config only copied',results},null,2));
  console.log(`RESULT ${results.filter(r=>r.status==='PASS').length}/${results.length} passed; ${output}`);
  if (process.argv.includes('--serve')) {
    console.log(`QA schema: ${dbName}`);
    console.log('QA API READY http://localhost:3000; isolated accounts admin/manager/user1/user2/kitchen, password 123456. Type stop to clean up.');
    process.stdin.setEncoding('utf8');
    process.stdin.on('data',async input=>{if(input.trim()==='stop'){await cleanup();process.exit(0);}});
    process.once('SIGINT',async()=>{await cleanup();process.exit(0);});
    process.once('SIGTERM',async()=>{await cleanup();process.exit(0);});
  } else { await cleanup(); process.exitCode=results.some(r=>r.status==='FAIL')?1:0; }
}
main().catch(async e=>{console.error(e.message);await cleanup();process.exitCode=1;});
