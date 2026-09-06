// Cloudflare Pages Function: relays contact-form submissions to a webhook
// (Zapier / Make / n8n catch hook). Set CONTACT_WEBHOOK_URL in Pages env vars.
export async function onRequestPost({ request, env }) {
  const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'Content-Type': 'application/json' } });
  const hook = env.CONTACT_WEBHOOK_URL;
  if (!hook) return json({ error: 'CONTACT_WEBHOOK_URL not configured' }, 500);

  let body = {};
  try { body = await request.json(); } catch { body = {}; }

  if (body.company_website) return json({ ok: true }); // honeypot
  if (!body.name || !body.email) return json({ error: 'name and email required' }, 400);

  const s = (v, n) => String(v ?? '').slice(0, n);
  const payload = {
    name: s(body.name, 200), business: s(body.business, 200), email: s(body.email, 200),
    phone: s(body.phone, 50), industry: s(body.industry, 100), message: s(body.message, 3000),
    budget_ok: body.budget_ok === 'yes', page: s(body.page, 500),
    received_at: new Date().toISOString(), ip: request.headers.get('cf-connecting-ip') || '',
  };

  try {
    const r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('webhook ' + r.status);
    return json({ ok: true });
  } catch { return json({ error: 'relay failed' }, 502); }
}
