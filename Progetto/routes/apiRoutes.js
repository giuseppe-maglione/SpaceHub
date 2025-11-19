module.exports = function (app) {
    const reader = require("../controllers/apiController");

    app.route("/api/controlla-dati")
        .post(reader.controllaDati);
};
