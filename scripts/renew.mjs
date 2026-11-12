// Perpanjang kesegaran daftar pencabutan: tanda tangani timestamp baru dengan
// kunci perpanjangan (FRESHNESS_KEY, secret GitHub Actions) lalu tulis
// hauling/trust.json = { revocations, timestamp }. Tanpa dependensi.
import { createHash, createPrivateKey, sign } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const VALID_DAYS = 14;
const b64url = (buf) => Buffer.from(buf).toString('base64url');

const revocations = readFileSync(new URL('../revocations.signed', import.meta.url), 'utf8').trim();
const [payloadPart, sigPart] = revocations.split('.');
const list = JSON.parse(Buffer.from(payloadPart ?? '', 'base64url').toString('utf8'));
if (!sigPart || list.v !== 1 || list.type !== 'revocations' || !Number.isInteger(list.seq)) {
  throw new Error('revocations.signed bukan daftar pencabutan yang valid.');
}

const secret = Buffer.from(process.env.FRESHNESS_KEY ?? '', 'base64url');
if (secret.length !== 64) throw new Error('FRESHNESS_KEY tidak diisi atau bukan kunci Ed25519 64 byte.');
const key = createPrivateKey({
  format: 'jwk',
  key: { kty: 'OKP', crv: 'Ed25519', d: b64url(secret.subarray(0, 32)), x: b64url(secret.subarray(32)) },
});

const now = Math.floor(Date.now() / 1000);
const encoded = b64url(JSON.stringify({
  v: 1,
  type: 'timestamp',
  seq: list.seq,
  sha256: createHash('sha256').update(revocations, 'utf8').digest('hex'),
  issued_at: now,
  expires_at: now + VALID_DAYS * 86400,
}));
const timestamp = `${encoded}.${b64url(sign(null, Buffer.from(encoded, 'utf8'), key))}`;

writeFileSync(new URL('../hauling/trust.json', import.meta.url), `${JSON.stringify({ revocations, timestamp }, null, 2)}\n`);
console.log(`trust.json diperbarui: seq ${list.seq}, berlaku sampai ${new Date((now + VALID_DAYS * 86400) * 1000).toISOString()}`);
