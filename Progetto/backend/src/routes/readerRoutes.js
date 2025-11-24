module.exports = function (app) {
    const reader = require("../controllers/readerController");

    app.route("/api/controlla-dati")
        .post(reader.checkData);
};
