module.exports = function (app) {
    const auth = require("../controllers/authController");

    app.route("/api/login")
        .post(auth.login);

    app.route("/api/logout")
        .post(auth.logout);
};