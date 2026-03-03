/**
 * detail.js
 * Logique des pages détail client et prospect
 * - Lit les données depuis LocalStorage
 * - Lance l'affichage météo
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
    // Lancer la météo
    // ─────────────────────────────────────────

    /*
     * On lit la ville depuis les données brouillon
     * ID_VILLE = "ville" (client) ou "ville-p" (prospect)
     */
    const ville = donnees[ID_VILLE];

    if (ville && ville.trim() !== "") {
        await lancerMeteo(ville);
    } else {
        // Pas de ville renseignée → masquer la section météo
        const sectionMeteo = document.getElementById("section-meteo");
        if (sectionMeteo) sectionMeteo.classList.add("d-none");
    }
});

// ─────────────────────────────────────────────
// Remplir la fiche détail depuis les données
// ─────────────────────────────────────────────

function remplirFicheDetail(donnees, estClient) {
    /*
     * Les IDs des spans de la fiche détail suivent la convention :
     * detail-<nom-du-champ>
     * Ex : <span id="detail-raison-sociale">
     *      <span id="detail-email-client">
     */
    Object.entries(donnees).forEach(function ([cle, valeur]) {
        // Ignorer la clé interne _sauvegardeLe
        if (cle.startsWith("_")) return;

        const element = document.getElementById("detail-" + cle);
        if (element) element.textContent = valeur || "–";
    });
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
