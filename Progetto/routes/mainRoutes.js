const path = require("path");
const auth = require("../controllers/authController");

module.exports = function(app) {

    app.route("/")
        .get((req, res) => {
            res.sendFile(path.join(__dirname, "../public/index.html"));
        });

    // Pagine pubbliche
    app.route("/aule-disponibili")
        .get((req, res) => {
            res.sendFile(path.join(__dirname, "../public/aule-disponibili.html"));
        });

    // Pagine solo per utenti loggati
    app.route("/crea-prenotazione")
        .get(auth.requireLogin, (req, res) => {
            res.sendFile(path.join(__dirname, "../public/crea-prenotazione.html"));
        });

    app.route("/gestisci-prenotazione")
        .get(auth.requireLogin, (req, res) => {
            res.sendFile(path.join(__dirname, "../public/gestisci-prenotazione.html"));
        });
};
