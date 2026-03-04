# ECF Front-end Web – CRM Clients & Prospects

Application web front-end responsive pour la gestion de clients et prospects,
développée dans le cadre de l'ECF AFPA (Concepteur Développeur d'Applications).

---

## Stack technique

| Technologie               | Usage |
|---------------------------|---|
| HTML5                     | Structure sémantique, validation native |
| CSS3 + Bootstrap 5 + SASS | Mise en page responsive, composants UI |
| JavaScript ES6 Vanilla    | Logique métier, validation, LocalStorage, APIs |
| Leaflet.js                | Carte interactive (OpenStreetMap) |
| Git Flow                  | Gestion des branches et versions |
| LocalStorage              | Persistance des brouillons côté client |
| API adresse.data.gouv.fr  | Géocodage adresse → coordonnées GPS |
| API Open-Meteo            | Météo depuis coordonnées GPS |

---

## Structure du projet

```
ecf_front_web/
├── index.html
├── README.md
├── package.json
├── node_modules/
│   ├── bootstrap/
│   └── leaflet/
└── src/
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── brouillon.js
    │   ├── utils-form.js
    │   ├── form-client.js
    │   ├── form-prospect.js
    │   ├── modal.js
    │   ├── geo-adresse.js
    │   ├── meteo.js
    │   ├── carte.js
    │   └── detail.js
    └── pages/
        ├── clients/
        │   ├── form-client.html
        │   └── detail-client.html
        └── prospects/
            ├── form-prospect.html
            └── detail-prospect.html
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
    - Validation au `blur` + correction temps réel au `input`
    - Validation groupée à la soumission + focus sur premier champ invalide (RGAA)
- Brouillon LocalStorage :
    - Sauvegarde manuelle (bouton 💾)
    - Auto-sauvegarde toutes les 30 secondes + debounce 1s
    - Restauration au chargement + état visuel cohérent
    - Confirmation avant annulation si brouillon existant
- Auto-complétion adresse :
    - Bouton 📍 + frappe automatique (debounce 400ms)
    - Suggestions via API adresse.data.gouv.fr
    - Navigation clavier + fermeture Échap (RGAA)

### Formulaire Prospect (`form-prospect.html`)
- Champs obligatoires : raison sociale, email, téléphone, adresse complète
- Champs optionnels : niveau d'intérêt, date de prospection
- Même logique de validation, brouillon et auto-complétion que le client

### Pages Détail
- Fiche récapitulative des données client/prospect
- **Météo actuelle** : température, vent, humidité, emoji (Open-Meteo)
- **Carte interactive Leaflet** : marqueur + popup sur l'adresse (OSM)
- Météo + carte chargées en parallèle (`Promise.all`)

### Modales
- **Modale Connexion** : login/mot de passe, validation, fermeture ESC
- **Modale Suppression** : confirmation, focus trap RGAA

### Accessibilité (RGAA)
- `aria-invalid`, `aria-describedby`, `aria-live="polite"`
- Focus automatique sur premier champ invalide
- `role="application"` sur carte, `role="listbox"` sur suggestions
- Navigation clavier complète

---

## Architecture JavaScript

### `brouillon.js` – LocalStorage

| Fonction | Rôle |
|---|---|
| `lireFormulaire(form)` | Lit tous les champs → objet |
| `sauvegarderBrouillon(cle, donnees)` | Stocke dans LocalStorage |
| `lireBrouillon(cle)` | Retourne les données |
| `effacerBrouillon(cle)` | Supprime l'entrée |
| `restaurerFormulaire(form, donnees)` | Remplit les champs |
| `afficherBanniereBrouillon(form, heure)` | Bannière de restauration |
| `afficherConfirmationBrouillon(btn)` | Feedback visuel bouton |

### `utils-form.js` – Validation générique

| Fonction | Rôle |
|---|---|
| `getMessageErreur(champ, messagesErreur)` | Message selon état validité |
| `afficherErreur(champ, messagesErreur)` | `is-valid` / `is-invalid` |
| `brancherValidation(messagesErreur)` | `blur` + `input` sur tous les champs |
| `mettreAJourBadgeBrouillon(statut)` | Badge header |
| `brancherAutoSauvegarde(form, cle)` | `setInterval` + debounce |
| `brancherBoutonBrouillon(btnId, form, cle)` | Sauvegarde manuelle |
| `restaurerAvecEtatVisuel(form, messagesErreur, cle)` | Restauration + visuel |
| `brancherBoutonAnnuler(btnId, cle)` | Confirmation avant navigation |
| `brancherSoumission(form, messagesErreur, cle)` | Validation groupée |

### `geo-adresse.js` – Auto-complétion

| Fonction | Rôle |
|---|---|
| `rechercherAdresse(recherche)` | Appel API → features GeoJSON |
| `afficherSuggestions(liste, features, onChoix)` | Crée les `<li>` |
| `masquerSuggestions(liste)` | Vide et masque la liste |
| `remplirChampsAdresse(props, ...)` | Remplit rue, CP, ville |
| `brancherGeoAdresse(config)` | Branche bouton 📍 + debounce |

### `meteo.js` – Météo

| Fonction | Rôle |
|---|---|
| `geocoderVille(ville)` | Ville → coordonnées GPS |
| `recupererMeteo(lat, lon)` | Appel Open-Meteo |
| `afficherDonneesMeteo(meteo, ville)` | Injecte les données météo |
| `lancerMeteo(ville)` | Orchestre géocodage → météo |

### `carte.js` – Leaflet

| Fonction | Rôle |
|---|---|
| `geocoderAdresse(adresse)` | Adresse → coords + label + score |
| `construireAdresse(donnees, estClient)` | Rue + CP + ville |
| `initialiserCarte(lat, lon, label, nom)` | Carte + tuiles + marqueur |
| `lancerCarte(donnees, estClient)` | Orchestre géocodage → carte |

### `detail.js` – Orchestration

| Fonction | Rôle |
|---|---|
| `remplirFicheDetail(donnees, estClient)` | Injecte dans les `<span>` |
| `masquerSection(id)` | Masque si données manquantes |
| `afficherMessageAucuneDonnee()` | Message + bouton retour |

---

## Ordre de chargement des scripts

### Formulaires
```html
<script src="brouillon.js"></script>
<script src="utils-form.js"></script>
<script src="geo-adresse.js"></script>
<script src="form-client.js"></script>
```

### Pages détail
```html
<script src="leaflet.js"></script>
<script src="brouillon.js"></script>
<script src="meteo.js"></script>
<script src="carte.js"></script>
<script src="detail.js"></script>
```

---

## Git Flow

```
main
 └── develop
      ├── feature/phase1-structure-html
      ├── feature/phase2-bootstrap-responsive
      ├── feature/phase3-validation-client
      ├── feature/phase4-brouillon-localstorage
      ├── feature/phase5-modal-connexion
      ├── feature/phase6-modal-suppression
      ├── feature/phase7-brouillon-prospect
      ├── feature/phase7-validation-prospect
      ├── refactor/utils-form-js
      ├── feature/geo-adresse
      ├── feature/meteo
      └── feature/leaflet-carte
```

---

## APIs externes utilisées

| API | URL | Auth |
|---|---|---|
| Adresse gouv.fr | `api-adresse.data.gouv.fr/search/` | Aucune |
| Open-Meteo | `api.open-meteo.com/v1/forecast` | Aucune |
| OpenStreetMap | `tile.openstreetmap.org` | Aucune |

---

## Phases à venir

- [ ] Backend – `fetch()` vers une API REST
- [ ] Liste dynamique – Clients/prospects depuis le backend
- [ ] Édition – Pré-remplissage formulaires en mode édition

---

## Auteur

**Jferminh** – Formation CDA AFPA
ECF Front-end Web – Mars 2026
