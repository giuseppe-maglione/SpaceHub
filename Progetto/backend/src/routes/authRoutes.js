module.exports = function (app) {
    const auth = require("../middleware/authMiddleware");

    app.post("/auth/login", auth.login);
    app.post("/auth/logout", auth.logout);
    app.post("/auth/register", auth.register);
    app.get("/auth/me", auth.checkLogged);
};
