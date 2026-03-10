// Guard de session — à charger en 1er dans <head> d'index.html
// Redirige vers login.html si aucune session valide n'existe
// Fonction Immédiatement Invoque
(function() {
    const SESSION_KEY = "user-session";
    const raw = localStorage.getItem(SESSION_KEY);

    if (!raw) return window.location.replace('login.html');

    try {
        const {date} = JSON.parse(raw);
        const DUREE_SESSION = 28800000; // 8h pré-calculées en ms (8*60*60*1000)

        if (!date || (Date.now() - date) > DUREE_SESSION) {
            throw new Error("Expired"); // On force le passage au catch pour centraliser le nettoyage
        }
    } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        window.location.replace('login.html');
    }
})();