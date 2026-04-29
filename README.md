# HM Global Agence — Textile personnalisé

Site e-commerce B2B de textile personnalisé : catalogue, configurateur logo, BAT, panier, paiement Stripe, admin.

---

## Workflow agentique obligatoire

> Cette règle s'applique à tout agent IA (Claude Code, ChatGPT, Cursor, etc.) intervenant sur ce projet.

À la fin de **chaque tâche**, l'agent doit :

1. **Lire `AGENT_CONTEXT.md`** — objectif du site, règles invariantes, fichiers critiques
2. **Respecter `PROTECTED_FEATURES.md`** — ne jamais casser une fonctionnalité protégée
3. **Exécuter `TEST_CHECKLIST.md`** autant que possible — au minimum `npm run type-check` et `npm run build`
4. **Remplir `AGENT_REPORT.md`** — rapport structuré avec résultats de tests, risques, prochaine action
5. **Ne jamais déclarer une tâche terminée sans preuve de test**

```bash
npm run agent:report   # résumé git + rappel commandes de validation
npm run type-check     # TypeScript — obligatoire
npm run build          # Next.js build — obligatoire
```

---

## Getting Started

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
