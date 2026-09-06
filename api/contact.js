// Vercel serverless function: relays contact-form submissions to a webhook
// (Zapier / Make / n8n catch hook). Set CONTACT_WEBHOOK_URL in Vercel env vars.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return res.status(500).json({ error: 'CONTACT_WEBHOOK_URL not configured' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body || {};

  if (body.company_website) return res.status(200).json({ ok: true }); // honeypot
  if (!body.name || !body.email) return res.status(400).json({ error: 'name and email required' });

  const payload = {
    name: String(body.name).slice(0, 200),
    business: String(body.business || '').slice(0, 200),
    email: String(body.email).slice(0, 200),
    phone: String(body.phone || '').slice(0, 50),
    industry: String(body.industry || '').slice(0, 100),
    message: String(body.message || '').slice(0, 3000),
    budget_ok: body.budget_ok === 'yes',
    page: String(body.page || '').slice(0, 500),
    received_at: new Date().toISOString(),
    ip: (req.headers['x-forwarded-for'] || '').split(',')[0].trim(),
  };

  try {
    const r = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('webhook ' + r.status);
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: 'relay failed' });
  }
}
