# gecko-ss.com

Static marketing site for Gecko Services & Solutions, hosted on Cloudflare Pages.

- `public/` static site
- `functions/api/contact.js` form relay (needs `CONTACT_WEBHOOK_URL` env var)
- Deploy: `npx wrangler pages deploy public --project-name gecko-ss-web`
