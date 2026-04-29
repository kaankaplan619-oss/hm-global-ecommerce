#!/usr/bin/env bash
# agent-report.sh — Résumé rapide de l'état du projet pour les agents IA
# Usage : npm run agent:report

set -e

BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
RESET="\033[0m"

echo ""
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"
echo -e "${BOLD}${CYAN}  HM Global — Rapport Agent                   ${RESET}"
echo -e "${BOLD}${CYAN}══════════════════════════════════════════════${RESET}"
echo ""

# ── Git status ────────────────────────────────────────────────────────────────
echo -e "${BOLD}📁 Git status${RESET}"
git status --short
echo ""

# ── Diff stat ─────────────────────────────────────────────────────────────────
echo -e "${BOLD}📊 Fichiers modifiés (diff staged + unstaged)${RESET}"
git diff --stat HEAD 2>/dev/null || echo "  (aucun diff par rapport à HEAD)"
echo ""

# ── Dernier commit ────────────────────────────────────────────────────────────
echo -e "${BOLD}🔖 Dernier commit${RESET}"
git log -1 --pretty=format:"  %C(yellow)%h%Creset  %s%n  %C(dim)%ad — %an%Creset" --date=short
echo ""
echo ""

# ── Rappel des commandes de validation ───────────────────────────────────────
echo -e "${BOLD}${GREEN}✅ Commandes de validation à lancer avant de clore la tâche${RESET}"
echo ""
echo -e "  ${YELLOW}npm run type-check${RESET}   → TypeScript strict (zéro erreur attendu)"
echo -e "  ${YELLOW}npm run build${RESET}        → Next.js build complet (zéro erreur attendu)"
echo -e "  ${YELLOW}npm run lint${RESET}         → ESLint (warnings tolérés, erreurs non)"
echo ""

# ── Rappel des tests manuels ─────────────────────────────────────────────────
echo -e "${BOLD}🧪 Tests manuels à effectuer${RESET}"
echo ""
echo "  [ ] /catalogue        → vérifier packshots produit isolés (pas de mannequins)"
echo "  [ ] /catalogue/tshirts, /hoodies, /polos, /softshells, /casquettes, /sacs, /enfants"
echo "  [ ] Page produit IB320 → image principale = packshot blanc iDeal"
echo "  [ ] Page produit TU03T → image principale = packshot blanc B&C"
echo "  [ ] Sélection couleur → image change correctement dans la galerie"
echo "  [ ] Upload logo → LightMockupPreview ou MockupViewer s'affiche"
echo "  [ ] Bouton 'Prévisualiser le BAT' → modal s'ouvre"
echo "  [ ] Impression / PDF → contenu correct, pas de régression @media print"
echo "  [ ] Mobile < 768px → grille + configurateur + BAT utilisables"
echo ""

# ── Rappel template rapport ───────────────────────────────────────────────────
echo -e "${BOLD}📝 Rapport agent${RESET}"
echo ""
echo "  Remplir AGENT_REPORT_TEMPLATE.md et fournir le rapport dans la réponse finale."
echo "  Voir aussi AGENT_CONTEXT.md pour les règles invariantes du projet."
echo ""
echo -e "${CYAN}══════════════════════════════════════════════${RESET}"
echo ""
