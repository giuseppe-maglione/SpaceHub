const path = require("path");

exports.index = (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
};

exports.auleDisponibiliPage = (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "aule-disponibili.html"));
};

exports.creaPrenotazionePage = (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "crea-prenotazione.html"));
};

exports.gestisciPrenotazionePage = (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "gestisci-prenotazione.html"));
};
