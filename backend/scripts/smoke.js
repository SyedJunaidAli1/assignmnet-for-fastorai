/**
 * Smoke test for the CRM API.
 * Usage:
 *   node scripts/smoke.js                       (defaults to http://localhost:5000)
 *   node scripts/smoke.js http://localhost:5000
 * Requires the API to be running with MongoDB connected.
 * Exits 0 if every acceptance criterion passes, 1 otherwise.
 */

const BASE = process.argv[2] || 'http://localhost:5000';
let failures = 0;

async function call(method, path, { body = undefined, token = undefined } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { status: res.status, json };
}

function check(name, cond, detail = '') {
  if (cond) {
    console.log(`  PASS ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL ${name} ${detail}`);
  }
}

const suffixed = Date.now();
const A = { name: 'Counselor A', email: `a${suffixed}@test.com`, password: 'password123' };
const B = { name: 'Counselor B', email: `b${suffixed}@test.com`, password: 'password123' };

async function login(creds) {
  const { status, json } = await call('POST', '/api/auth/login', { body: { email: creds.email, password: creds.password } });
  if (status !== 200) throw new Error(`login failed for ${creds.email}: ${JSON.stringify(json)}`);
  return json.token;
}

async function main() {
  console.log(`Smoke testing ${BASE}\n`);

  // 1. Register
  const reg = await call('POST', '/api/auth/register', { body: A });
  check('register counselor A (201)', reg.status === 201 && reg.json?.success, JSON.stringify(reg.json));
  const dup = await call('POST', '/api/auth/register', { body: { ...A, name: 'Dup' } });
  check('duplicate email rejected (409)', dup.status === 409);
  await call('POST', '/api/auth/register', { body: B });

  // 2. Login
  const bad = await call('POST', '/api/auth/login', { body: { email: A.email, password: 'wrongpass' } });
  check('login wrong password rejected (401)', bad.status === 401);
  const tokenA = await login(A);
  const tokenB = await login(B);
  const me = await call('GET', '/api/auth/me', { token: tokenA });
  check('GET /api/auth/me with JWT', me.status === 200 && me.json?.user?.email === A.email);
  const noAuth = await call('GET', '/api/leads/public');
  check('protected route rejects missing JWT (401)', noAuth.status === 401);

  // 3. Public form API (no auth)
  const lead = {
    name: 'Rahul Verma',
    email: `rahul${suffixed}@student.com`,
    phone: '9876543210',
    courseInterest: 'Data Science',
    message: 'Wants weekend batches',
  };
  const submit = await call('POST', '/api/public/leads', { body: lead });
  check('public enquiry submission without auth (201)', submit.status === 201 && submit.json?.success, JSON.stringify(submit.json));
  const badForm = await call('POST', '/api/public/leads', { body: { ...lead, name: '' } });
  check('public form validation (400)', badForm.status === 400);

  // 4. Unclaimed leads are public to every counselor
  const poolA = await call('GET', '/api/leads/public', { token: tokenA });
  const leadId = poolA.json?.leads?.[0]?._id;
  const poolB = await call('GET', '/api/leads/public', { token: tokenB });
  check('unclaimed pool visible to counselor A', poolA.status === 200 && poolA.json.count > 0);
  check('unclaimed pool identical for counselor B (public)', poolB.status === 200 && poolB.json.count === poolA.json.count);

  // 5. Claim
  const claim = await call('POST', `/api/leads/${leadId}/claim`, { token: tokenA });
  check('counselor A claims the lead', claim.status === 200 && claim.json?.lead?.status === 'claimed', JSON.stringify(claim.json));
  const claimAgain = await call('POST', `/api/leads/${leadId}/claim`, { token: tokenB });
  check("second claim blocked (409) - lead is now private", claimAgain.status === 409);
  const poolAfter = await call('GET', '/api/leads/public', { token: tokenB });
  check('claimed lead removed from public pool', poolAfter.status === 200 && !poolAfter.json.leads.some((l) => l._id === leadId));

  // 6. Claimed-by-me leads
  const mineA = await call('GET', '/api/leads/mine', { token: tokenA });
  check("counselor A's claimed enquiry in /mine", mineA.status === 200 && mineA.json.leads.some((l) => l._id === leadId));
  const mineB = await call('GET', '/api/leads/mine', { token: tokenB });
  check("counselor B cannot fetch A's claimed lead", mineB.status === 200 && mineB.json.leads.length === 0);

  console.log(`\n${failures === 0 ? 'ALL TESTS PASSED' : `${failures} TEST(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err.message);
  process.exit(1);
});
