# Comparatif fournisseurs textile 2026

Date de référence : 14 mai 2026

## Objectif

Mettre en place deux gammes sur HM Global :

- une gamme premium, propre, simple à automatiser
- une gamme low cost, plus adaptée à une clientèle sensible au prix

Le point clé est de choisir entre :

- POD pur via API
- achat textile + marquage externalisé partiellement
- achat textile + production interne

---

## Résumé exécutif

### Recommandation la plus rationnelle aujourd'hui

- Premium : garder Printful
- Low cost : utiliser TopTex comme base textile
- Low cost court terme :
  - soit Printify si on veut rester très léger en opérations
  - soit TopTex + transferts DTF achetés à l'extérieur + pose chez nous si on veut plus de marge

### Recommandation finale

Le meilleur montage pour HM Global aujourd'hui est :

- Printful pour la gamme premium
- TopTex pour la gamme low cost textile
- ne pas investir tout de suite dans une chaîne DTF complète interne sauf si le volume devient régulier

---

## Ce que dit le projet local

### Produits low cost déjà présents

Dans le repo :

- `IB320` achat : `2,54 € HT`
- `IB321` achat : `2,54 € HT`

Références code :

- `data/products.ts` : `PRODUCT_IB320`
- `data/products.ts` : `PRODUCT_IB321`

### Prix publics actuellement posés

Dans le repo :

- gamme iDeal low cost affichée à `19,90 € TTC`
- Gildan 5000 Printful affiché à `19,90 € TTC`

Conclusion :

Le site a déjà les bases produit, mais le pricing actuel ne sépare pas encore assez nettement la logique premium et la logique low cost.

---

## Comparatif fournisseurs

## 1. Printful

### Avantages

- API très propre
- logique draft / confirm déjà intégrée dans le projet
- bon pour le premium
- peu de charge opérationnelle interne

### Inconvénients

- plus cher
- moins bon pour une offre agressive à 10-15 €

### Positionnement conseillé

- premium
- image de marque
- produits où la simplicité d'exécution prime sur la marge

### Verdict

Excellent pour le premium. Mauvais choix pour une vraie gamme low cost.

---

## 2. Printify

### Avantages

- moins cher que Printful sur les t-shirts d'appel
- API exploitable
- plusieurs print providers
- intéressant si on veut garder une logique POD automatisée

### Inconvénients

- qualité et régularité plus dépendantes du provider choisi
- moins simple à piloter qu'un fournisseur unique très premium

### Positionnement conseillé

- low cost POD
- entrée de gamme automatisée
- test rapide de marché sans alourdir l'entreprise

### Verdict

Meilleur choix API pur pour la gamme low cost.

---

## 3. TopTex

### Avantages

- excellent coût textile
- déjà présent dans le projet
- parfait pour construire une vraie gamme prix d'appel

### Inconvénients

- ce n'est pas un POD complet clé en main
- il faut gérer le marquage par ailleurs

### Positionnement conseillé

- low cost réel
- volume
- corporate, associations, staff, événementiel, clientèle sensible au prix

### Verdict

Meilleure base économique pour la gamme low cost, à condition d'assumer une partie de la chaîne.

---

## 4. PrintoClock

### Avantages

- déjà commencé dans le projet
- intéressant pour une logique plus européenne / plus textile
- bon candidat si on veut garder une passerelle API

### Inconvénients

- moins standard qu'un acteur comme Printful
- demande plus de cadrage opérationnel

### Verdict

Bonne piste complémentaire, mais aujourd'hui la vraie comparaison business doit surtout se faire entre Printful, Printify et TopTex.

---

## Chiffrage concret

Les chiffres ci-dessous sont des estimations prudentes utiles pour décider.

Ils ne remplacent pas :

- les devis exacts de transferts
- les coûts logistiques réels
- les temps réels passés par l'équipe

---

## Hypothèses utilisées

- T-shirt low cost : TopTex `IB320`
- coût textile : `2,54 € HT`
- coût humain interne chargé retenu pour simulation : `18 à 22 € / heure`
- petit logo coeur :
  - préparation
  - pose
  - contrôle
  - pliage

Temps interne estimé :

- `6 à 10 minutes` par pièce en petite série artisanale organisée simplement

Consommables secondaires :

- sachet / protection / pertes / manutention : `0,40 à 0,90 € HT`

---

## Scénario A

## TopTex + transfert DTF externe + pose chez nous

### Cas 1 : logo coeur simple

- tee : `2,54 € HT`
- transfert DTF externe : `1,20 à 2,00 € HT`
- main-d'oeuvre : `1,80 à 3,70 € HT`
- consommables / pertes : `0,40 à 0,90 € HT`

### Coût total estimé

- `5,94 à 9,14 € HT`
- soit environ `7,13 à 10,97 € TTC`

### Lecture business

- vendre à `10 € TTC` : trop serré dans la plupart des cas
- vendre à `12,90 € TTC` : viable
- vendre à `14,90 € TTC` : sain

---

### Cas 2 : grand dos ou visuel plus large

- tee : `2,54 € HT`
- transfert DTF plus grand : `2,50 à 4,50 € HT`
- main-d'oeuvre : `2,00 à 3,70 € HT`
- consommables / pertes : `0,40 à 0,90 € HT`

### Coût total estimé

- `7,44 à 11,64 € HT`
- soit environ `8,93 à 13,97 € TTC`

### Lecture business

Un grand dos à `10 € TTC` n'est pas rationnel.

---

## Scénario B

## TopTex + production DTF complète chez nous

### Avantages

- meilleure marge à long terme
- contrôle qualité
- liberté de production

### Inconvénients

- investissement matériel
- maintenance
- courbe d'apprentissage
- gestion quotidienne
- immobilisation de l'équipe

### Budget matériel observé

- presse à chaud : autour de `900 € HT`
- imprimantes DTF : environ `7 990 € HT` à `16 500 € HT`
- four / tunnel / poudreuse : environ `840 € HT` à `6 500 € HT`

### Lecture business

La production interne complète devient pertinente si :

- le flux commandes est régulier
- l'équipe peut absorber la production
- l'objectif marge devient prioritaire

Sinon, c'est trop lourd pour un lancement ou une activité parallèle.

---

## Scénario C

## Low cost en API pur via Printify

### Avantages

- pas de charge atelier
- pas de matériel
- automatisation simple
- bon pour sortir rapidement une gamme d'appel

### Inconvénients

- marge plus faible que TopTex + pose interne
- moins de contrôle
- prix cassé limité

### Lecture business

Très bon choix si le temps interne est plus rare que la marge.

---

## Comparaison décisionnelle

## Option 1 : Printful premium + Printify low cost

### Avantages

- plus simple à exécuter
- peu de charge interne
- rapide à mettre en place
- bonne séparation des gammes

### Inconvénients

- marge low cost correcte mais pas maximale
- plus dépendant des fournisseurs externes

### Verdict

Le meilleur choix si la priorité est le temps et la fluidité.

---

## Option 2 : Printful premium + TopTex + pose interne partielle

### Avantages

- meilleure marge low cost
- vrai contrôle sur l'offre d'appel
- compatible avec un positionnement “à partir de”

### Inconvénients

- plus d'organisation
- plus de temps pour l'équipe
- demande un mini process atelier

### Verdict

Le meilleur choix si la priorité est la marge, sans aller jusqu'à une usine interne.

---

## Option 3 : Printful premium + TopTex + production textile interne complète

### Avantages

- meilleure marge théorique
- autonomie

### Inconvénients

- plus gros poids opérationnel
- investissement matériel
- détourne l'entreprise de ses autres sujets

### Verdict

À envisager seulement après validation du volume.

---

## Recommandation HM Global

## Phase 1

- garder Printful pour le premium
- créer une vraie gamme low cost TopTex
- ne pas promettre `9,90 €` en standard unitaire
- viser plutôt :
  - `12,90 € TTC` à `14,90 € TTC` pour logo coeur simple
  - `15,90 € TTC` et plus pour des marquages plus larges

## Phase 2

Si le volume low cost prend :

- soit passer sur Printify pour automatiser davantage
- soit renforcer TopTex + transferts externes + pose chez vous

## Phase 3

Seulement si la demande est forte et récurrente :

- investir dans une vraie capacité DTF interne

---

## Prix de vente conseillés

### Gamme premium

- T-shirt premium POD : `19,90 €` à `24,90 €+`

### Gamme low cost

- logo coeur simple : `12,90 €` à `14,90 €`
- coeur + dos : `15,90 €` à `19,90 €`

### Mention marketing possible

- “à partir de `9,90 €`” uniquement :
  - sur offre volume
  - ou opération spéciale
  - pas comme promesse unitaire standard

---

## Conclusion nette

Si on raisonne froidement :

- le premium doit rester chez Printful
- le low cost le plus rentable repose sur TopTex
- mais le low cost le plus léger à opérer repose sur Printify

Donc :

- si la priorité est le temps : `Printful + Printify`
- si la priorité est la marge : `Printful + TopTex + pose interne légère`
- si la priorité est l'industrialisation : `Printful + TopTex + production complète`, mais plus tard

