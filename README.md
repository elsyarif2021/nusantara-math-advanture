# Nusantara Math Adventure — Cloudflare migration

**Status:** repository initialized with deployment configuration and D1 schema. The complete migration source package (including original MP3) must still be uploaded to the root. Do not deploy this incomplete checkout.

After uploading the complete ZIP contents, follow its README: install dependencies, run tests, create the D1 database, replace the placeholder database ID, apply migrations, configure runtime secrets ADMIN_PASSWORD and SESSION_SECRET, build, and deploy with Wrangler.

Never commit runtime secrets or student data. Cloudflare live deployment has not been verified.
