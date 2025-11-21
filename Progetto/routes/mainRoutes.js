module.exports = function(app) {
    const auth = require("../controllers/authController");
    const main = require("../controllers/mainController");

    app.route("/")
        .get(main.index)

    // Pagine pubbliche
    app.route("/aule-disponibili")
        .get(main.auleDisponibiliPage)

    // Pagine solo per utenti loggati
    app.route("/crea-prenotazione")
        .get(auth.requireLogin, main.creaPrenotazionePage)

    app.route("/gestisci-prenotazione")
        .get(auth.requireLogin, main.gestisciPrenotazionePage)
};
