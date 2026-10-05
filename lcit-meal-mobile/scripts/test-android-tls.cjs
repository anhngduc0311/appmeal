// Run after: npx expo prebuild --platform android --no-install
// Add --live to verify the production server with only the bundled roots.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const https = require('node:https');
const tls = require('node:tls');
const { X509Certificate } = require('node:crypto');

const project = path.resolve(__dirname, '..');
const packageName = require('../app.json').expo.android.package;
const base = path.join(project, 'android/app/src/main');
const javaDir = path.join(base, 'java', ...packageName.split('.'));
const application = fs.readFileSync(path.join(javaDir, 'MainApplication.kt'), 'utf8');
assert.equal(application.split('LegacyTls.install(this)').length - 1, 1);
assert(application.indexOf('LegacyTls.install(this)') < application.indexOf('SoLoader.init'));
assert(fs.existsSync(path.join(javaDir, 'LegacyTls.java')));
assert(fs.readFileSync(path.join(base, 'AndroidManifest.xml'), 'utf8')
  .includes('android:networkSecurityConfig="@xml/network_security_config"'));

const fingerprints = [
  '96:BC:EC:06:26:49:76:F3:74:60:77:9A:CF:28:C5:A7:CF:E8:A3:C0:AA:E1:1A:8F:FC:EE:05:C0:BD:DF:08:C6',
  '69:72:9B:8E:15:A8:6E:FC:17:7A:57:AF:B7:17:1D:FC:64:AD:D2:8C:2F:CA:8C:F1:50:7E:34:45:3C:CB:14:70',
];
const ca = ['isrgrootx1', 'isrgrootx2'].map((name, index) => {
  const pem = fs.readFileSync(path.join(base, 'res/raw', `${name}.crt`));
  const certificate = new X509Certificate(pem);
  assert.equal(certificate.fingerprint256, fingerprints[index]);
  assert(certificate.ca);
  assert(certificate.verify(certificate.publicKey));
  return pem;
});
console.log('PASS: native initializer, manifest, public root fingerprints and signatures.');

function probe(wrongHostname = false) {
  return new Promise((resolve, reject) => {
    const request = https.get('https://com365.lcit.vn:4002/api/meals', {
      ca,
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.2',
      ...(wrongHostname ? {
        checkServerIdentity: (_hostname, certificate) => tls.checkServerIdentity('wrong-host.invalid', certificate),
      } : {}),
    }, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.setTimeout(15000, () => request.destroy(new Error('TLS probe timed out')));
    request.on('error', reject);
  });
}

async function main() {
  if (!process.argv.includes('--live')) return;
  // An unauthenticated request must reach the API and return HTTP 401.
  assert.equal(await probe(), 401);
  await assert.rejects(probe(true), { code: 'ERR_TLS_CERT_ALTNAME_INVALID' });
  console.log('PASS: server TLS 1.2 with bundled roots only; incorrect hostname rejected.');
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
