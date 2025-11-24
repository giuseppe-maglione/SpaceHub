module.exports = function (app) {
    const auth = require("../middleware/authMiddleware");

    app.post("/api/login", auth.login);
    app.post("/api/logout", auth.logout);
    app.post("/api/register", auth.register);
};
