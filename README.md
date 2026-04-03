# Avez-vous bien mangé ?

Site web permettant aux élèves de noter le menu de la cantine chaque jour. Accessible sur GitHub Pages, connecté à Firebase pour stocker les votes et les menus.

---

## Sommaire

1. [Comment ça marche](#comment-ça-marche)
2. [Mettre à jour le menu](#mettre-à-jour-le-menu)
3. [Consulter les statistiques](#consulter-les-statistiques)
4. [Développement local](#développement-local)
5. [Déployer le site](#déployer-le-site)
6. [Structure du projet](#structure-du-projet)
7. [Firebase — administration](#firebase--administration)
8. [Résolution de problèmes](#résolution-de-problèmes)

---

## Comment ça marche

- Le site est hébergé gratuitement sur **GitHub Pages** (branche `prod`).
- Les menus et les votes sont stockés dans **Firebase Realtime Database**.
- Chaque élève reçoit un identifiant anonyme unique stocké dans son navigateur — pas de compte, pas de mot de passe.
- Un élève peut voter une seule fois par plat, mais peut modifier son vote à tout moment.
- Le menu change chaque jour selon la clé de date (`YYYY-MM-DD`). Si aucun menu n'est renseigné pour le jour, le site affiche un menu par défaut avec une mention « hors ligne ».

---

## Mettre à jour le menu

### 1. Modifier le fichier `scripts/menus.json`

C'est ici que tu renseignes les menus à venir. Tu peux préparer toute une semaine (ou un mois) d'avance :

```json
{
  "2026-09-01": {
    "starter": ["Salade verte", "Melon"],
    "dish": ["Lasagnes", "Poisson pané"],
    "dessert": ["Mousse au chocolat"]
  },
  "2026-09-02": {
    "starter": ["Soupe de légumes"],
    "dish": ["Poulet rôti", "Quiche lorraine"],
    "dessert": ["Yaourt", "Fruit"]
  }
}
```

Chaque catégorie (`starter`, `dish`, `dessert`) contient une liste de plats. Tu peux mettre autant de plats que tu veux dans chaque catégorie.

### 2. Envoyer les menus à Firebase

```bash
# Envoyer tous les menus du fichier
npm run update-menu

# Envoyer uniquement un jour précis
node scripts/update-menu.mjs 2026-09-01
```

> Le script lit automatiquement les variables d'environnement dans `.env.local`. Il faut donc avoir ce fichier configuré (voir [Développement local](#développement-local)).

---

## Consulter les statistiques

La page `/menu/stats` affiche les notes moyennes et le nombre de votes par plat pour le jour en cours, organisés par catégorie (Entrée / Plat / Dessert).

Elle est accessible directement via le lien **Stats →** en haut de la page principale.

---

## Développement local

### Prérequis

- [Node.js](https://nodejs.org/) version 18 ou supérieure
- Un accès au projet Firebase (demander les credentials à l'ancien responsable)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/MaxDkn/menu.git
cd menu

# Installer les dépendances
npm install
```

### Configuration des variables d'environnement

Copier le fichier d'exemple et le remplir :

```bash
cp .env.example .env.local
```

Ouvrir `.env.local` et renseigner les valeurs :

```
NEXT_PUBLIC_FIREBASE_API_KEY=        # Clé API Firebase
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=    # ex: mon-projet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=   # ex: https://mon-projet-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=     # ex: mon-projet
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_SECRET=                     # Secret admin pour le script update-menu
```

Toutes ces valeurs se trouvent dans la [console Firebase](https://console.firebase.google.com) :
- **Variables `NEXT_PUBLIC_*`** : Paramètres du projet (⚙️) → Général → Vos applications → SDK Firebase → Configuration
- **`FIREBASE_SECRET`** : Paramètres du projet → Comptes de service → Secrets de base de données

> `.env.local` ne doit **jamais** être commité sur Git (il est dans `.gitignore`). Ne jamais partager ce fichier.

### Lancer le serveur de développement

```bash
npm run dev
```

Le site est accessible sur [http://localhost:3000/menu](http://localhost:3000/menu).

Pour tester depuis un téléphone sur le même réseau Wi-Fi, accéder à `http://[ip-de-ton-pc]:3000/menu` (l'IP locale s'affiche dans le terminal au démarrage).

---

## Déployer le site

```bash
npm run deploy
```

Cette commande :
1. Compile le site en fichiers statiques (`next build`)
2. Ajoute le fichier `.nojekyll` nécessaire pour GitHub Pages
3. Pousse le dossier `out/` sur la branche `prod` du dépôt

> Le fichier `.env.local` doit être présent sur la machine au moment du build — les variables Firebase sont intégrées dans les fichiers générés.

Le site sera mis à jour sur GitHub Pages dans la minute qui suit.

---

## Structure du projet

```
menu/
├── app/
│   ├── page.tsx          # Page principale (vote)
│   ├── navbar.tsx        # Barre de navigation (Entrée / Plat / Dessert)
│   ├── stats/
│   │   └── page.tsx      # Page des statistiques
│   ├── layout.tsx        # Layout global (titre, police)
│   ├── globals.css       # Styles globaux (Tailwind)
│   └── icon.svg          # Icône du site
├── lib/
│   ├── firebase.ts       # Initialisation Firebase
│   └── db.ts             # Fonctions de lecture/écriture (menu, votes, stats)
├── scripts/
│   ├── menus.json        # Menus à publier (à modifier chaque semaine)
│   └── update-menu.mjs   # Script d'envoi des menus vers Firebase
├── .env.example          # Modèle de configuration (sans les vraies valeurs)
└── next.config.ts        # Configuration Next.js (basePath /menu, export statique)
```

---

## Firebase — administration

### Accéder à la console

[console.firebase.google.com](https://console.firebase.google.com) → projet `commission-menu`

### Structure de la base de données

```
menu/
  2026-09-01/
    starter: ["Salade verte", ...]
    dish:    ["Lasagnes", ...]
    dessert: ["Yaourt", ...]

votes/
  2026-09-01/
    {uid_élève}/
      salade_verte: 4
      lasagnes: 5
```

Les votes sont anonymes : chaque `uid` est un identifiant aléatoire généré dans le navigateur de l'élève, sans aucune information personnelle.

### Règles de sécurité

Dans Firebase → Realtime Database → Règles, les règles doivent être :

```json
{
  "rules": {
    "menu":  { ".read": true,  ".write": false },
    "votes": { ".read": true,  ".write": true  }
  }
}
```

- `menu` : lecture publique, écriture réservée au script admin.
- `votes` : lecture et écriture publiques (les élèves votent sans compte).

### Voir les votes d'une journée

Dans la console Firebase → Realtime Database → Données → `votes/2026-09-01`

---

## Résolution de problèmes

**Le site affiche « hors ligne » alors que j'ai mis le menu à jour**
→ Vérifier que la date dans `menus.json` correspond exactement à aujourd'hui au format `YYYY-MM-DD`.
→ Vérifier dans la console Firebase que la donnée est bien présente sous `menu/YYYY-MM-DD`.
→ Vérifier les règles Firebase (`menu` doit avoir `.read: true`).

**Le script `npm run update-menu` échoue**
→ Vérifier que `FIREBASE_SECRET` est bien renseigné dans `.env.local`.
→ Vérifier que `NEXT_PUBLIC_FIREBASE_DATABASE_URL` est correct.

**Les votes ne s'enregistrent pas**
→ Vérifier les règles Firebase (`votes` doit avoir `.write: true`).
→ Ouvrir la console du navigateur (F12) pour voir l'erreur exacte.

**Le déploiement échoue**
→ S'assurer que `.env.local` est présent sur la machine avant de lancer `npm run deploy`.
→ Vérifier que le dépôt Git est bien configuré avec `git remote -v`.
