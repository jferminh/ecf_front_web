# ECF Front-end Web – CRM Clients & Prospects

Application web front-end responsive pour la gestion de clients et prospects,
développée dans le cadre de l'ECF AFPA (Concepteur Développeur d'Applications).

---

## Stack technique

| Technologie | Usage |
|---|---|
| HTML5 | Structure sémantique, validation native |
| CSS3 + Bootstrap 5 | Mise en page responsive, composants UI |
| JavaScript | Logique métier, validation, LocalStorage, APIs |
| Git Flow | Gestion des branches et versions |
| LocalStorage | Persistance des brouillons côté client |

---

## Structure du projet

```
ecf_front_web/
├── index.html                        # Page d'accueil – liste clients/prospects
├── README.md
└── src/
    ├── css/
    │   └── main.css                  # Styles personnalisés
    │   └── main.scss                 # Styles personnalisés
    │   └── components.scss           # Styles personnalisés
    │   └── variables.scss            # Styles personnalisés
    ├── js/
    │   ├── brouillon.js              # Fonctions LocalStorage (brouillon)
    │   ├── utils-form.js             # Fonctions génériques de validation
    │   ├── form-client.js            # Configuration formulaire client
    │   ├── form-prospect.js          # Configuration formulaire prospect
    │   └── modal.js                  # Modales connexion et suppression
    └── pages/
        ├── clients/
        │   ├── form-client.html      # Formulaire création/édition client
        │   └── detail.html           # Fiche détail client
        └── prospects/
            ├── form-prospect.html    # Formulaire création/édition prospect
            └── detail.html           # Fiche détail prospect
```

---

## Fonctionnalités réalisées

### Navigation & Structure
- Page d'accueil avec liste clients/prospects (onglets Bootstrap)
- Navigation responsive avec menu hamburger
- Header avec badge brouillon auto (`[data-badge-brouillon]`)

### Formulaire Client (`form-client.html`)
- Champs : raison sociale, email, téléphone, CA annuel, nombre d'employés,
  adresse complète (rue, code postal, ville)
- Validation HTML5 native (sans JS)
- Validation JS progressive :
  - Messages d'erreur personnalisés par type (`valueMissing`, `typeMismatch`,
    `patternMismatch`, `rangeUnderflow`, `tooShort`, `badInput`)
  - Validation au `blur` (départ du champ)
  - Correction en temps réel au `input` (si champ déjà en erreur)
  - Validation groupée à la soumission + focus sur premier champ invalide (RGAA)
- Brouillon LocalStorage :
  - Sauvegarde manuelle (bouton 💾)
  - Auto-sauvegarde toutes les 30 secondes
  - Auto-sauvegarde debounce 1s après chaque frappe
  - Restauration au chargement + état visuel cohérent (vert/rouge/neutre)
  - Bannière d'information à la restauration
  - Confirmation avant annulation si brouillon existant

### Formulaire Prospect (`form-prospect.html`)
- Champs obligatoires : raison sociale, email, téléphone, adresse complète
- Champs optionnels : niveau d'intérêt, date de prospection
- Même logique de validation que le formulaire client
- Même logique de brouillon LocalStorage (clé séparée `brouillon-prospect`)

### Modales
- **Modale Connexion** : champs login/mot de passe, validation, fermeture ESC
- **Modale Suppression** : confirmation avant suppression, focus trap RGAA

### Accessibilité (RGAA)
- `aria-invalid="true"` sur les champs invalides
- `aria-describedby` reliant chaque champ à sa zone d'erreur
- Focus automatique sur le premier champ invalide à la soumission
- Zones d'erreur avec `hidden` (masquées au lecteur d'écran si vides)
- Navigation clavier complète sur les modales (focus trap)

---

## Architecture JavaScript

### `brouillon.js` – Fonctions LocalStorage

| Fonction | Rôle |
|---|---|
| `lireFormulaire(form)` | Lit tous les champs et retourne un objet |
| `sauvegarderBrouillon(cle, donnees)` | Sérialise et stocke dans LocalStorage |
| `lireBrouillon(cle)` | Désérialise et retourne les données |
| `effacerBrouillon(cle)` | Supprime l'entrée LocalStorage |
| `restaurerFormulaire(form, donnees)` | Remplit les champs depuis un objet |
| `afficherBanniereBrouillon(form, heure)` | Affiche la bannière de restauration |
| `afficherConfirmationBrouillon(btn)` | Feedback visuel sur le bouton |

### `utils-form.js` – Fonctions génériques de validation

| Fonction | Rôle |
|---|---|
| `getMessageErreur(champ, messagesErreur)` | Retourne le message selon l'état de validité |
| `afficherErreur(champ, messagesErreur)` | Applique `is-valid` / `is-invalid` + message |
| `brancherValidation(messagesErreur)` | Branche `blur` + `input` sur tous les champs |
| `mettreAJourBadgeBrouillon(statut)` | Met à jour le badge header |
| `brancherAutoSauvegarde(form, cle)` | Lance `setInterval` + debounce |
| `brancherBoutonBrouillon(btnId, form, cle)` | Branche le bouton de sauvegarde manuelle |
| `restaurerAvecEtatVisuel(form, messagesErreur, cle)` | Restaure + applique l'état visuel |
| `brancherBoutonAnnuler(btnId, cle)` | Confirmation avant navigation si brouillon |
| `brancherSoumission(form, messagesErreur, cle)` | Validation groupée + redirection |

### `form-client.js` / `form-prospect.js` – Configuration

Chaque fichier ne contient que :
- `CLE_BROUILLON` : clé LocalStorage propre au formulaire
- `messagesErreur` : table des messages par champ et par type d'erreur
- 6 appels aux fonctions de `utils-form.js`

---

## Phases à venir

- [ ] Géolocalisation – Bouton 📍 API Adresse.gouv.fr (auto-complétion adresse)
- [ ] Leaflet – Carte interactive sur les pages détail
- [ ] Météo – API météo sur les pages détail
- [ ] Backend – Remplacement des redirections par `fetch()` vers une API REST

---

## Auteur

**Jferminh** – Formation CDA AFPA
ECF Front-end Web – Février 2026
