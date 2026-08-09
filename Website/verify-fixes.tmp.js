(async () => {
  // 1. Your 2-star case
  const r1 = await fetch('http://localhost:3500/api/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name: 'Slow Service Customer', rating: 2, message: 'slow services bad impression, took too long to bring my car' }),
  });
  console.log('2-star case:', r1.status, await r1.json());

  // 2. 5-star but bad message
  const r2 = await fetch('http://localhost:3500/api/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name: 'Confused 5-star', rating: 5, message: 'The staff gave me completely wrong directions to the venue and the captain was rude, but overall okay I guess.' }),
  });
  console.log('5-star-bad-message case:', r2.status, await r2.json());

  // 3. Honeypot filled (simulating aggressive autofill) — should now still save
  const r3 = await fetch('http://localhost:3500/api/feedback', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ name: 'Honeypot Filled User', rating: 3, message: 'Testing that honeypot no longer blocks real data.', company: 'SomeAutofillValue' }),
  });
  console.log('honeypot-filled case:', r3.status, await r3.json());
})();
