# 02 — Rôles des agents

Acteurs (humains + IA) qui interviennent sur HM Global Agence, leurs périmètres et leurs limites.

---

## Humains

### Kaan (admin, dev, décisionnaire)
- Valide **toute** modification production
- Décide la direction produit, design, business
- Lance les missions Claude Code localement (iPad → Claude.ai → copier-coller)
- Seul autorisé à modifier les variables Vercel Production
- Seul autorisé à activer/désactiver `visible: true|false` sur un produit
- Approuve les commits / merges sur `main`

### Mère (opératrice agence)
- Gère messages clients, demandes de fichiers logo, devis Pennylane, traduction FR/TR, suivi commandes
- Outils principaux : Mac Mini agence, Gmail, Pennylane, Discord
- Reçoit des drafts générés par Hermès (`/agence client-message`, `/agence procedure`)
- Ne touche **pas** au code applicatif
- N'a pas accès aux variables Vercel, Stripe, Supabase
- Limitée aux commandes Discord `/agence ...` (opérations) — voir `02_AGENT_ROLES` + `09_CURRENT_TASKS`

---

## Agents IA

### Claude Code (cet agent)
- Lit, propose, modifie le code applicatif
- Tourne en local sur la machine de Kaan (CLI + Claude.ai)
- Lecture obligatoire de `CLAUDE.md` + `00_START_HERE.md` + fichiers mémoire pertinents avant action
- Ne déploie jamais — Vercel auto-deploy se charge du push
- Pas d'accès aux secrets (jamais affichés, jamais loggués)
- Périmètre strict défini par la mission en cours

### Hermès Bot (RMS slash commands — Discord)
- Hébergé sur Vercel (repo `hm-hermes-bot`, séparé de hm-global)
- Endpoint `/api/discord/interactions` — Discord Interactions HTTP (Ed25519)
- Endpoint `/api/rms/process` — relais HMAC depuis le Gateway (Railway)
- Commandes disponibles :
  - **`/hermes audit`** — autorisation d'audit lecture seule (texte à coller)
  - **`/hermes mission`** — template mission complet (type audit / exec / doc)
  - **`/hermes decision`** — bloc decision log à coller
  - **`/hermes idea`** — classification structurée d'une idée brute (Claude API)
  - **`/hermes ask`** — réponse conversationnelle naturelle + commande sœur suggérée (Claude API)
  - **`/agence procedure`** — procédure interne (logo, BAT, relance, livraison, …)
  - **`/agence client-message`** — message client prêt à coller (FR ou TR)
- Aucune action de production déclenchée — texte uniquement, réponse éphémère
- Rate-limit partagé par user / jour UTC

### Hermès Gateway (chat libre Discord — Railway)
- Hébergé sur Railway (repo `hm-hermes-gateway`, séparé)
- Connexion WebSocket Discord Gateway (intent `MESSAGE_CONTENT`)
- Écoute les messages naturels dans des channels whitelistés
- Déclencheur : préfixe `Hermès,` ou mention `@Hermès Bot`
- Relaie vers `hm-hermes-bot` `/api/rms/process` (HMAC signé)
- Aucune logique LLM côté Gateway — pure passerelle
- Whitelist user + channel + rate-limit côté Gateway, re-vérifiés côté Vercel (defense in depth)

### Claude Navigation (Playwright / Chrome MCP)
- Tests visuels, navigation, screenshots, vérification UI
- Validation des previews Vercel après PR draft
- Aucune modification de code
- Lancé manuellement par Kaan ou via mission spécifique

### ChatGPT / GPT maître (audit stratégique externe)
- Avis indépendant sur l'architecture, la roadmap, la direction produit
- Pas d'accès au code — analyse via prompts manuels (Kaan colle le contexte)
- Sert de second avis, jamais d'exécutant

---

## Agents futurs (V2+)

### agent_code (claude-code-action dans GitHub Actions)
- Exécute des missions code automatiquement depuis une issue
- Sortie : PR **draft** uniquement, jamais auto-mergée
- Branch protection sur `main` obligatoire avant activation

### agent_ux
- Drafts maquettes, microcopy, a11y review
- Drafts uniquement, jamais d'écriture sur le code

### agent_prospect / agent_publish
- Drafts emails commerciaux / posts social
- Drafts uniquement, jamais d'envoi auto

### agent_admin (finance / commandes)
- Lecture Stripe (READ-only) + admin commandes (READ-only)
- Rapports chiffrés uniquement, aucune écriture

---

## Règles inter-agents

1. **Aucune auto-orchestration multi-agents** (V0-V3). Tout passe par Kaan.
2. **Aucun agent n'agit en production sans validation humaine écrite**.
3. **Tous les drafts sont à humain**. Hermès propose, Kaan valide, l'humain exécute.
4. Pour toute zone HIGH (cf. `08_DO_NOT_TOUCH`) → un agent ne propose JAMAIS d'exec en première intention, toujours audit lecture seule d'abord.
5. Un agent ne déclenche pas un autre agent V1-V3.

---

## Mapping rapide « j'ai besoin de ... → quel agent »

| Besoin | Agent / canal |
|---|---|
| Comprendre une zone du code | Claude Code (mission `audit`) |
| Implémenter un changement code | Claude Code (mission `exec`) avec mission formalisée |
| Idée brute non cadrée | Discord `/hermes idea` |
| Question libre / conseil | Discord `/hermes ask` (ou chat libre via Gateway) |
| Message client à rédiger | Discord `/agence client-message` |
| Procédure interne | Discord `/agence procedure` |
| Test visuel preview | Claude Navigation |
| Audit stratégique externe | ChatGPT / GPT maître (manuel) |
| Décision business | Kaan + log via `/hermes decision` |
