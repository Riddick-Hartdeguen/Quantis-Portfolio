# Quantis MVP

Application web de gestion de budget personnel, développée en HTML, CSS et JavaScript natif, sans framework ni dépendance.

L'utilisateur saisit son salaire, ses charges fixes et ses opérations du mois. Quantis calcule en temps réel ses revenus, ses dépenses, son solde disponible et la part de son budget déjà consommée.

## Fonctionnalités

- **Salaire mensuel** : saisie du salaire, pris en compte immédiatement dans les revenus du mois.
- **Charges fixes** : ajout (nom, montant, date), modification, suppression et calcul du total.
- **Opérations du mois** : ajout de revenus divers ou de dépenses, avec une catégorie (alimentation, transport, loisirs, autre) et une date ; modification et suppression.
- **Tableau de bord** :
  - revenus du mois (salaire + revenus divers) ;
  - dépenses du mois (charges fixes + autres dépenses) ;
  - solde disponible, affiché en vert s'il est positif et en rouge s'il est négatif.
- **Budget mensuel utilisé** : barre de progression indiquant la part du salaire déjà consommée.
- **Sauvegarde automatique** : les données sont enregistrées dans le navigateur (`localStorage`) et retrouvées au rechargement de la page.
- **Interface responsive** : l'affichage s'adapte à la largeur et à la hauteur de la fenêtre, de l'ordinateur à la tablette ; les listes défilent à l'intérieur de leur carte plutôt que la page entière.

## Choix techniques

- Les montants sont stockés en **centimes entiers** pour éviter les erreurs d'arrondi des nombres décimaux en JavaScript.
- Les charges et les opérations sont conservées dans des **tableaux d'objets**. L'affichage est reconstruit à partir de ces tableaux après chaque ajout, modification ou suppression.
- Les dimensions sont exprimées en **`rem`** : une seule taille de base, ajustée selon la largeur et la hauteur de la fenêtre, redimensionne toute l'interface de façon proportionnelle.
- La hauteur maximale des listes est **calculée en JavaScript** à partir de la place réellement disponible, pour que l'application tienne dans la fenêtre sans barre de défilement.

## Technologies

- HTML5
- CSS3 : Grid, Flexbox, media queries, unités relatives
- JavaScript (ES6+) : manipulation du DOM, gestion des événements, `localStorage`
- Police Exo 2 (Google Fonts)

## Lancer le projet en local

Aucune installation n'est nécessaire.

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/Riddick-Hartdeguen/Quantis-Portfolio.git
   ```

2. Ouvrir le fichier `index.html` dans un navigateur récent.

La police est chargée depuis Google Fonts. Sans connexion internet, l'application reste utilisable avec une police de remplacement.

## Limites actuelles

- Le sélecteur de mois est affiché mais pas encore actif : l'application gère un seul mois à la fois.
- Les données restent enregistrées dans le navigateur utilisé. Il n'y a ni compte utilisateur, ni synchronisation, et vider les données du navigateur efface les informations saisies.
- Les catégories d'opérations sont fixes.

## Évolutions prévues

Les prochaines versions sont décrites dans [ROADMAP.md](ROADMAP.md).

> Les crédits et sources des ressources externes utilisées dans le projet sont disponibles dans [CREDITS.md](./CREDITS.md).
