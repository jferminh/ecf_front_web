# ECF Front-end Web — CRM Clients / Prospects

Application web front-end responsive pour la gestion de clients et prospects,
développée dans le cadre de l’ECF AFPA « Participer au développement front d’un projet Web ». 

---

## Stack technique

| Technologie              | Usage                                                                 |
|--------------------------|-----------------------------------------------------------------------|
| HTML5                    | Structure sémantique, validation native                              |
| CSS3 + SASS + Bootstrap  | Mise en page responsive, composants UI, thème personnalisé           |
| JavaScript ES6 (Vanilla) | Logique métier, validation, LocalStorage, appels API                 |
| Leaflet.js               | Carte interactive (tuiles OpenStreetMap)                             |
| Git / Git Flow           | Branches `develop` + features, commits structurés                    |
| LocalStorage             | Brouillons formulaires, session de démo                              |
| API adresse.data.gouv.fr | Auto-complétion et géocodage des adresses                            |
| API Open-Meteo           | Données météo actuelles depuis coordonnées GPS                       |

---

## Structure du projet

```text
ecf-front-web/
├── login.html                    # Page d’accueil / connexion
├── index.html                    # Tableau de bord clients / prospects (protégé par guard)
├── mentions-legales.html         # Informations RGPD / légales
├── README.md
├── package.json
├── node_modules/
│   ├── bootstrap/
│   └── leaflet/
└── src/
    ├── css/
    │   ├── variables.scss        # Palette, espacements, breakpoints
    │   ├── components.scss       # Composants (cards, hero, etc.)
    │   ├── main.scss             # Point d’entrée SASS
    │   └── main.css              # CSS compilé
    ├── js/
    │   ├── auth-guard.js         # Redirection vers login si session absente/expirée
    │   ├── login.js              # Connexion, validation, création de user-session
    │   ├── rgpd-consent.js       # Bandeau consentement LocalStorage
    │   ├── modal.js              # Modale suppression + modale déconnexion
    │   ├── brouillon.js          # Sauvegarde / restauration brouillons formulaires
    │   ├── utils-form.js         # Validation générique + auto-sauvegarde
    │   ├── form-client.js        # Configuration validation formulaire client
    │   ├── form-prospect.js      # Configuration validation formulaire prospect
    │   ├── geo-adresse.js        # Auto-complétion adresse (API adresse.data.gouv.fr)
    │   ├── meteo.js              # Appels Open-Meteo et affichage météo
    │   ├── carte.js              # Initialisation carte Leaflet
    │   └── detail.js             # Orchestration des pages détail (météo + carte)
    └── pages/
        ├── clients/
        │   ├── form-client.html      # Formulaire création/édition client
        │   └── detail-client.html    # Fiche détail client
        └── prospects/
            ├── form-prospect.html    # Formulaire création/édition prospect
            └── detail-prospect.html  # Fiche détail prospect
```

---

## Fonctionnalités

### Connexion / Déconnexion

- Page `login.html` : page d’accueil avec hero, description de l’application, formulaire de connexion desktop + modal mobile.
- Validation JS des champs identifiant / mot de passe (messages personnalisés, toggle afficher/masquer mot de passe). 
- Création d’une session de démo dans `LocalStorage` (`user-session`) et redirection vers `index.html`. 
- Guard `auth-guard.js` chargé dans le `<head>` de `index.html` : redirige vers `login.html` si la session est absente ou expirée. 
- Bouton **Déconnexion** dans le header de `index.html` : modale de confirmation, suppression de `user-session`, retour à `login.html`. 

### Tableau de bord

- `index.html` : onglets **Clients** / **Prospects** avec :
    - barre de recherche,
    - bouton “Créer un client / prospect”,
    - tableaux responsive (Bootstrap),
    - pagination accessible (`nav` + `aria-label`, `aria-current`, `aria-disabled`).

### Formulaire Client

- Champs :
    - raison sociale, email, téléphone,
    - CA annuel, nombre d’employés,
    - rue, code postal, ville. 
- Validation progressive :
    - HTML5 native utilisable sans JS,
    - avec JS : messages personnalisés par type d’erreur (`valueMissing`, `typeMismatch`, `patternMismatch`, `rangeUnderflow`, `tooShort`, `badInput`). [file:1]
    - validation au `blur`, correction en temps réel au `input`,
    - validation groupée à la soumission, focus sur le premier champ invalide (RGAA). 
- Brouillon LocalStorage :
    - Sauvegarde manuelle via bouton “Enregistrer brouillon”.
    - Auto-sauvegarde toutes les 30 secondes + après 1s d’inactivité (debounce). 
    - Restauration au chargement + bannière “Brouillon restauré”.
    - Confirmation avant “Annuler” si un brouillon existe. 
- Auto-complétion adresse :
    - Bouton ou frappe dans le champ rue → appel API adresse.data.gouv.fr avec debounce. 
    - Liste de suggestions accessible (clavier, Esc).
    - Remplissage automatique de rue / code postal / ville + validation visuelle immédiate. 

### Formulaire Prospect

- Champs obligatoires : raison sociale, email, téléphone, adresse (rue, code postal, ville). 
- Champs optionnels : niveau d’intérêt, date de prospection. 
- Même logique que le client pour :
    - validation progressive,
    - brouillon (`brouillon-prospect`),
    - auto-sauvegarde,
    - restauration + bannière,
    - auto-complétion d’adresse. 

### Pages Détail

- `detail-client.html` et `detail-prospect.html` : fiches récapitulatives. 
- Météo :
    - Récupération des coordonnées de la ville.
    - Appel Open-Meteo : température, vent, humidité, symbole météo.
    - Affichage résumé météo. 
- Carte :
    - Leaflet + tuiles OpenStreetMap.
    - Marqueur sur l’adresse, popup avec le nom de l’entité. 
- Chargement parallèle météo + carte via `Promise.all` dans `detail.js`. 

---

## RGPD & Accessibilité

### RGPD

- Bandeau de consentement sur l’utilisation de LocalStorage (`rgpd-consent`, durée 30 jours). 
- Bloc d’information RGPD sur chaque formulaire (finalités, droits, base légale). 
- Checkbox de consentement explicite :
    - obligatoire,
    - non incluse dans le brouillon pour respecter le Privacy by Design. 
- Page `mentions-legales.html` :
    - responsable de traitement,
    - types de données, finalités, durées de conservation,
    - droits d’accès, rectification, opposition, portabilité,
    - informations sur les API externes utilisées. 

### Accessibilité (RGAA)

- Champs de formulaire :
    - `aria-invalid`, `aria-describedby` vers la zone d’erreur,
    - zones d’erreur avec `role="alert"` et `hidden` contrôlé en JS. 
- Modales :
    - `role="dialog"`, `aria-modal="true"`, `aria-labelledby`,
    - focus sur la modale à l’ouverture, fermeture avec `Esc`. 
- Liste de suggestions adresse :
    - `role="listbox"` + éléments `role="option"`,
    - navigation au clavier, fermeture avec `Esc`, clic extérieur. 
- Pages détail carte :
    - `role="application"` sur la zone de carte pour certains lecteurs d’écran. 

---

## Architecture JavaScript (résumé)

- `brouillon.js` :
    - `lireFormulaire(form)`, `sauvegarderBrouillon(cle, donnees)`,
    - `lireBrouillon(cle)`, `effacerBrouillon(cle)`,
    - `restaurerFormulaire(form, donnees)`,
    - `afficherBanniereBrouillon(form, heure)`,
    - `afficherConfirmationBrouillon(btn)`. 
- `utils-form.js` :
    - `getMessageErreur(champ, messagesErreur)`,
    - `afficherErreur(champ, messagesErreur)`,
    - `brancherValidation(messagesErreur)`,
    - `mettreAJourBadgeBrouillon(statut)`,
    - `brancherAutoSauvegarde(form, cle)`,
    - `brancherBoutonBrouillon(btnId, form, cle)`,
    - `restaurerAvecEtatVisuel(form, messagesErreur, cle)`,
    - `brancherBoutonAnnuler(btnId, cle)`,
    - `brancherSoumission(form, messagesErreur, cle)`. 
- `form-client.js` / `form-prospect.js` :
    - définissent la constante `CLEBROUILLON` et la table `messagesErreur`,
    - appellent uniquement les fonctions de `utils-form.js` + `brancherGeoAdresse`. 
- `geo-adresse.js` :
    - `rechercherAdresse`, `afficherSuggestions`, `masquerSuggestions`,
    - `remplirChampsAdresse`, `brancherGeoAdresse(config)`. 
- `meteo.js`, `carte.js`, `detail.js` :
    - météo + Leaflet isolés et orchestrés sur les pages détail. 

---

## Lancement du projet

1. Installer les dépendances :

```bash
npm install
```

2. Lancer watcher SASS :

```bash
npm run sass   # compilation SASS en continu
```


---

## Git Flow

- Branches principales :
    - `main` : version stable.
    - `develop` : intégration des features. 
- Branches de feature :
    - `feature/...` pour chaque bloc fonctionnel (validation, brouillon, modales, géolocalisation, météo, carte, login). 

---

## APIs externes

| API                  | URL                             | Authentification |
|----------------------|---------------------------------|------------------|
| Adresse.gouv.fr      | https://api-adresse.data.gouv.fr | Aucune           |
| Open-Meteo           | https://api.open-meteo.com       | Aucune           |
| OpenStreetMap (tuiles) | https://tile.openstreetmap.org  | Aucune           |

---

## Évolutions possibles

- Connexion réelle à un backend JakartaEE (remplacement des redirections par des appels `fetch` vers une API REST). 
- Liste dynamique clients/prospects (CRUD complet côté serveur).
- Gestion de rôles utilisateurs (admin / commercial).
- Export CSV / PDF des listes.
