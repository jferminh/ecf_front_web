/**
 * * detail.js
 * Logique des pages détail client et prospect
 * - Lit les données depuis LocalStorage
 * - Lance l'affichage météo
 * - Lance l'affichage de la carte Leaflet
 *
 */

document.addEventListener("DOMContentLoaded", async function () {

    // ─────────────────────────────────────────
    // Détecter sur quelle page détail on est
    // ─────────────────────────────────────────

    /*
     * On détecte la page via l'ID du conteneur principal
     * <main id="detail-client"> ou <main id="detail-prospect">
     */
    const estClient   = document.getElementById("detail-client")   !== null;
    const estProspect = document.getElementById("detail-prospect")  !== null;

    if (!estClient && !estProspect) return;

    const CLE_BROUILLON = estClient ? "brouillon-client" : "brouillon-prospect";
    // const ID_VILLE= "ville";
    const ID_VILLE      = estClient ? "ville"            : "ville-p";

    // ─────────────────────────────────────────
    // Lire les données depuis LocalStorage
    // ─────────────────────────────────────────

    const donnees = lireBrouillon(CLE_BROUILLON);

    if (!donnees) {
        /*
         * Pas de données en LocalStorage
         * → l'utilisateur a ouvert la page détail directement
         * sans passer par le formulaire
         */
        console.warn("Aucune donnée trouvée pour cette fiche.");
        afficherMessageAucuneDonnee();
        return;
    }

    // ─────────────────────────────────────────
    // Remplir la fiche détail
    // ─────────────────────────────────────────
    remplirFicheDetail(donnees, estClient);

    // ─────────────────────────────────────────
    // Lancer la météo et la carte en parallèle
    // ─────────────────────────────────────────

    /*
     * Promise.all() lance les deux appels simultanément
     * au lieu de les enchaîner l'un après l'autre :
     *
     * Sans Promise.all :  météo (1s) + carte (1s) = 2s d'attente
     * Avec Promise.all :  météo (1s)
     *                     carte (1s)  ← en même temps
     *                     = 1s d'attente au total
     */
    const ville = donnees[ID_VILLE];

    await Promise.all([

        // Météo
        ville && ville.trim() !== ""
            ? lancerMeteo(ville)
            : masquerSection("section-meteo"),

        // Carte
        lancerCarte(donnees, estClient),

    ]);
});

// ─────────────────────────────────────────────
// Remplir la fiche détail depuis les données
// ─────────────────────────────────────────────

function remplirFicheDetail(donnees, estClient) {
    Object.entries(donnees).forEach(function ([cle, valeur]) {
        if (cle.startsWith("_")) return;

        const element = document.getElementById("detail-" + cle);
        if (element) element.textContent = valeur || "–";
    });
}

// ─────────────────────────────────────────────
// Masquer une section si données manquantes
// ─────────────────────────────────────────────
function masquerSection(id) {
    const section = document.getElementById(id);
    if (section) section.classList.add("d-none");
}

// ─────────────────────────────────────────────
// Message si aucune donnée en LocalStorage
// ─────────────────────────────────────────────

function afficherMessageAucuneDonnee() {
    const main = document.querySelector("main");
    if (!main) return;

    main.innerHTML = `
        <div class="alert alert-info mt-4" role="alert">
            <h2 class="h5">Aucune fiche à afficher</h2>
            <p class="mb-0">
                Veuillez d'abord créer un client ou prospect depuis le formulaire.
            </p>
            <a href="../../index.html" class="btn btn-primary mt-3">
                Retour à la liste
            </a>
        </div>
    `;
}
