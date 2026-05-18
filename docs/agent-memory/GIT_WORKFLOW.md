# GIT_WORKFLOW — Règles Git HM Global

> À lire avant tout commit ou push. Sert de référence rapide à Claude Code.
>
> Source de vérité Hermès : `../../../docs/hermes/07_GITHUB_WORKFLOW.md` (working dir parent). Ce fichier est la version repo-local synthétique.

---

## Règles absolues

1. **Toujours commencer par** `git status --short` + `git branch --show-current` avant **toute** action Git.
2. **Jamais `git add -A`** ni `git add .` — stage **par groupe précis** (fichier par fichier ou dossier ciblé).
3. **Jamais de push direct sur `main`** sans validation Kaan **écrite** dans la mission.
4. **Jamais `git commit --amend`** sur un commit déjà poussé. Toujours créer un **nouveau commit**.
5. **Jamais `git push --force`** sur une branche partagée. Sur `main` jamais, point.
6. **Jamais `--no-verify`** pour bypass les hooks pre-commit. Si un hook bloque, investiguer la cause.

---

## Conventions de commits

### Format messages

Convention courte type [Conventional Commits](https://www.conventionalcommits.org/) :
- `feat(scope): description` — nouvelle feature
- `fix(scope): description` — bug fix
- `chore(scope): description` — maintenance, assets, configs
- `docs(scope): description` — documentation
- `refactor(scope): description` — refactor sans changement de comportement

Exemples du repo :
```
feat(catalogue): add new textile products
fix(build): resolve hm visual utils import on Vercel
chore(assets): add Printify mockups and home page premium images
feat(configurator): unify textile marking zones — single source of truth
```

### Un commit = un thème

Pas de commit fourre-tout. Si ton diff couvre `catalogue + home + impression`, fais **3 commits** :
1. `feat(catalogue): ...`
2. `feat(home): ...`
3. `feat(impression): ...`

---

## Branches

| Nom | Usage |
|---|---|
| `main` | Production. Pas de commit direct. Merge uniquement après PR + approval Kaan. |
| `mission/AAAA-MM-JJ-titre-court` | Mission Hermès classique. PR vers `main`. |
| `night/AAAA-MM-JJ-titre-court` | Night Mode (LOW risk only). |
| `fix/issue-NNN-titre` | Bug isolé sans mission complète. |

**Convention nommage** : kebab-case, daté `AAAA-MM-JJ` au début pour tri chronologique.

---

## Avant tout push sur une branche destinée à Vercel

Obligatoire dans cet ordre :

1. `git status --short` — vérifier qu'aucun fichier inattendu n'est stagé.
2. `git diff --cached --name-only` — confirmer la liste stagée.
3. `npx tsc --noEmit` — type-check passe (exit 0).
4. `npm run build` — build local passe (exit 0).
5. **Scanner les imports tracked → untracked** (cause #1 d'échec Vercel — voir `VERCEL_DEBUG.md` §1).
6. `git commit` avec message conventionnel.
7. `git push` (sans `--force`).

---

## Vérifications après commit

```bash
git log --oneline -3        # voir les 3 derniers commits
git status -sb              # confirmer "nothing to commit, clean working tree" (sauf untracked)
git diff --cached --name-only | wc -l    # 0 si tout est commité
```

---

## Stratégie commit/stash pour un working tree pollué

Si beaucoup de modifications M ou de nouveaux fichiers untracked et qu'on veut travailler propre :

**Option A — Commits thématiques** (recommandé pour propreté) :
```bash
git add <fichiers groupe 1>
git commit -m "feat(scope1): ..."
git add <fichiers groupe 2>
git commit -m "feat(scope2): ..."
# ...
```

**Option B — Stash global** (rapide mais brutal) :
```bash
git stash push -u -m "WIP avant mission XYZ"
# ... mission ...
git stash pop  # éventuels conflits à résoudre
```

**Option C — Branche WIP isolée** (compromis) :
```bash
git checkout -b wip/work-en-cours
git add -A && git commit -m "wip: en cours"
git checkout main
git checkout -b mission/2026-MM-JJ-nouveau-truc
```

---

## PR vers main

1. Push la branche mission : `git push -u origin mission/...`
2. Ouvrir une PR via l'UI GitHub OU `gh pr create` (si gh CLI installé).
3. Template PR auto-rempli : `.github/pull_request_template.md`.
4. Marquer **Draft** tant que tests visuels Chrome MCP non complets.
5. Ajouter labels : `hermes:mission`, `priority:Px`, `zone:xxx`, `status:to-validate`.
6. **Attendre approval Kaan** avant merge.
7. Merge **sans squash** si plusieurs commits significatifs (préserver l'historique).

---

## Erreurs Git courantes & solutions

| Erreur | Cause | Solution |
|---|---|---|
| `Authentication failed for https://github.com/...` | Token PAT expiré | Passer en SSH (`git remote set-url origin git@github.com:...`) |
| `Permission denied (publickey)` | Clé SSH non ajoutée à GitHub | Ajouter `~/.ssh/id_ed25519.pub` dans Settings → SSH and GPG keys |
| `... behind/diverged from origin` | Quelqu'un a poussé pendant ton travail | `git pull --rebase origin <branche>`, résoudre conflits |
| `nothing to commit, working tree clean` mais fichiers attendus | Fichiers déjà committés OU dans `.gitignore` | `git ls-files <chemin>` pour vérifier |
| `command not found: gh` | GitHub CLI non installé | `brew install gh` puis `gh auth login` |

---

## Quick reference commands

```bash
# Inventaire
git status --short
git branch --show-current
git log --oneline -5
git diff --stat
git diff --cached --name-only

# Stage précis (jamais -A)
git add path/to/file.tsx path/to/another.ts

# Vérifier avant commit
git diff --cached --name-only | wc -l                    # nombre stagé
git diff --cached --name-only | grep -v "<pattern OK>"  # détecter intrus

# Commit + push branche
git commit -m "type(scope): message"
git push

# Push première fois (avec tracking)
git push -u origin <nom-branche>

# Désamender un add accidentel
git restore --staged <fichier>
```
