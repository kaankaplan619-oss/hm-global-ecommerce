# Demandes d'accès API — Fournisseurs print

> Date : 2026-05-17
> Statut : brouillons à valider avant envoi
> Issue de : `docs/audits/print-api-suppliers-deep-audit.md`

Ces brouillons servent à demander un **accès partenaire / sandbox API** chez les fournisseurs print identifiés comme candidats sérieux pour HM Global. Aucune intégration ne sera lancée tant qu'une réponse commerciale claire n'est pas obtenue (tarifs revendeur + conditions d'accès + délai support technique).

À adapter avant envoi :
- Vérifier le nom du contact si une page « équipe » liste un commercial dédié
- Ajuster le ton FR/EN selon le pays du fournisseur
- Envoyer depuis `contact@hm-global-agence.fr` (ou l'adresse pro principale) — pas depuis une adresse personnelle
- Joindre éventuellement le SIRET + plaquette PDF agence (si dispo)

---

## 1. Email — Print.com (HQ Pays-Bas, EN)

**À :** `partners@print.com` (alternative : formulaire https://www.print.com/en/api)
**Objet :** API partnership request — HM Global Agence (FR-based print & textile reseller)

---

Hello Print.com Partner Team,

I'm reaching out on behalf of **HM Global Agence**, a French communication agency based in Alsace (eastern France) specialising in textile printing and commercial print supports for SMBs, restaurants, sports clubs and corporate clients.

We currently operate an integrated e-commerce store running Stripe + Supabase + Printify (textile fulfilment). On the print side (business cards, flyers, brochures, posters, canvas), we use a manual quote flow that we'd like to replace with an automated API-based pipeline.

Print.com has been shortlisted in our internal supplier audit as a strong candidate, given your European production hubs and modern REST API.

Could you confirm the following before we open a partner account?

1. **Access conditions for small agencies** — is API access available to companies with ~50-200 print orders per month, or is it reserved for larger volumes?
2. **Reseller pricing** — do you have a published reseller margin grid, or is pricing negotiated case by case? We'd like a sample for business cards (350gsm, 85×55mm, 250pcs FR delivery) and A5 flyers (170gsm coated, 500pcs).
3. **API coverage** — does the public REST API cover catalogue + pricing + shipping rates + file upload + preview (BAT) generation? Is there a sandbox environment for integration testing without commitment?
4. **Mockup / preview generation** — does the API return a visual proof (PNG/PDF preview) before order confirmation, so we can show our clients the BAT inside our own UI?
5. **White-label shipping** — is the parcel branding neutral (no Print.com label visible to the end customer)?
6. **Technical contact** — would you assign a developer relations contact for the integration phase, or do we work via standard support tickets?

We're in the qualification phase, with a tentative go-live target around Q3 2026 if pricing and integration cost are aligned with our business case.

Could you share documentation, a tariff grid, and a sandbox API key to start technical evaluation?

Thank you for your time — looking forward to hearing from you.

Best regards,

[Nom signataire]
HM Global Agence
[URL site] · [SIRET] · [téléphone pro]

---

## 2. Email — HelloPrint Connect (HQ Pays-Bas, EN)

**À :** `api@helloprint.com` (alternative : https://partners.helloprint.com/hello-connect)
**Objet :** Hello Connect API — partnership inquiry from HM Global Agence (France)

---

Hello HelloPrint Connect team,

I represent **HM Global Agence**, a French agency based in Alsace (Bas-Rhin, FR-67) that runs an integrated e-commerce platform combining textile customisation (Printify-driven) and commercial print supports.

We are currently in the supplier qualification phase for our V2 print pipeline. After auditing 10 European print-on-demand vendors, HelloPrint Connect ranked among our top three candidates for the following reasons:

- European production footprint
- Documented Hello Connect API
- Strong catalogue coverage on cards, flyers, brochures, posters
- Possibility of white-label fulfilment

Before signing up to the partner programme, could you clarify:

1. **Eligibility for small agencies** — what's the minimum order volume or monthly commitment to access Hello Connect? We currently process roughly 30-80 print orders per month and expect to grow once the API integration is live.
2. **Reseller pricing & margins** — could you share sample wholesale prices for:
   - Standard business cards 85×55mm, 350gsm, 250pcs
   - A5 flyers 148×210mm, 170gsm coated, 500pcs
   - 50×70cm poster, 200gsm, single unit
   shipped to a French postcode (67460, Strasbourg area)?
3. **API capabilities** — does Hello Connect provide:
   - Catalogue endpoint with product metadata
   - Live pricing endpoint
   - File upload + preflight validation
   - Preview / BAT image generation (PNG or PDF)
   - Order placement + shipping tracking
4. **Sandbox / staging** — is there a free testing environment we can use during integration before committing?
5. **Onboarding timeline** — typical turnaround between application and active API key?
6. **Technical contact** — is there a dedicated developer relations engineer assigned during integration?

We'd also appreciate receiving a copy of the latest Hello Connect API documentation (OpenAPI spec or PDF), the partner programme terms, and any case studies of agencies of comparable size to ours.

Thank you for the time spent on this request. We're aiming to lock in our V2 print partner before the end of Q3 2026.

Best regards,

[Nom signataire]
HM Global Agence
[URL site] · [SIRET] · [téléphone pro]

---

## 3. Email court — Cloudprinter (HQ Danemark, EN — backup au cas où l'inscription auto-service n'aboutit pas)

**À :** `support@cloudprinter.com`
**Objet :** Free plan API access — HM Global Agence questions before signup

---

Hello Cloudprinter team,

I'm planning to sign up for the Cloudprinter Free plan on behalf of **HM Global Agence** (FR-based print & textile agency, ~30-80 orders/month).

Before creating the account, could you confirm:

1. The Free plan is sufficient for technical evaluation of the API (catalogue, pricing lookup, file upload, order quote) without payment commitment?
2. Whether the French production hub announced on your site is fully active for cards/flyers/posters in Q2-Q3 2026.
3. The procedure to obtain a sandbox API token versus production.

Thanks in advance — I'll proceed with self-service signup unless something requires a partner-channel onboarding.

Best regards,

[Nom signataire]
HM Global Agence

---

## 4. Email court — Prodigi (HQ UK, EN — pour clarifier les conditions Mockup Generator)

**À :** `support@prodigi.com` ou via le formulaire https://prodigi.com/contact/
**Objet :** Mockup Generator API — usage rights for reseller website (HM Global Agence, FR)

---

Hello Prodigi team,

We are evaluating Prodigi as a supplier for canvas, framed prints and posters at **HM Global Agence** (a French communication agency).

Our main interest beyond the order API is the **Mockup Generator** (https://mockups.prodigi.com/). Before signing up, could you clarify:

1. Is the Mockup Generator available **via API** (programmatic access), or only as a dashboard UI?
2. If API-accessible, what's the rate limit and pricing tier (Free / Pro / Enterprise)?
3. Are the generated mockup images **licensed for commercial use** on our customer-facing e-commerce site, without additional licensing fees?
4. Is there any watermark on the Free plan?
5. Output resolution and format (PNG/JPG)?
6. Typical lifestyle scenes available (e.g., framed poster on a living-room wall, canvas in a modern interior, etc.) — could you point to sample assets?

If the Mockup Generator is API-accessible with commercial usage included, we'd plan a V2 integration to enrich our `/impression` page with realistic visuals (currently we use static placeholders).

Thank you for the time spent — looking forward to your reply.

Best regards,

[Nom signataire]
HM Global Agence

---

## Suivi & règles internes

- **Avant envoi** : valider chaque email avec un relecteur (notamment les chiffres de volume mensuel cités).
- **Après envoi** : tracer la date d'envoi + relancer à J+7 si pas de réponse.
- **Tableau de suivi** : à créer dans Notion / Google Sheets externe (pas dans le repo).
- **Pas d'engagement contractuel** sans validation interne explicite des tarifs revendeur reçus.
- **Si un fournisseur impose un minimum de commande mensuel élevé** (> 200 commandes/mois) : noter dans le rapport audit et passer au suivant.

## Pièces à joindre éventuellement

- Plaquette commerciale HM Global Agence (PDF, si dispo)
- Extrait Kbis / SIRET
- URL du site en production
- Estimation de volume mensuel (cartes + flyers + posters + canvas)

---

*Document interne — ne pas exposer publiquement.*
