const bcrypt = require("bcrypt");

// SIMULAZIONE DATABASE
const fakeUser = [{
    id: 1,
    username: "admin",
    passwordHash: "$2b$10$uP/NT.3OER3wXXeN6fPjeOdiB2r2AuP8WH9fMck/4cM/rzYXRTxQW" // "password"
}];

// LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: "Inserisci username e password" });

    // Cerca utente (qui dal fake DB)
    const user = fakeUser.find(u => u.username === username);

    if (!user)
        return res.status(401).json({ error: "Username errato" });

    const correct = await bcrypt.compare(password, user.passwordHash);

    if (!correct)
        return res.status(401).json({ error: "Password errata" });

    // Salviamo in sessione
    req.session.userId = user.id;

    res.json({ message: "Login effettuato", userId: user.id });
};

// LOGOUT
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Errore nel logout" });
        res.clearCookie("connect.sid");
        res.json({ message: "Logout completato" });
    });
};

// REGISTER
exports.register = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password)
        return res.status(400).json({ error: "Inserisci username e password" });

    const existing = fakeUser.find(u => u.username === username);

    if (existing)
        return res.status(400).json({ error: "Username già esistente" });

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
        id: fakeUser.length + 1,
        username,
        passwordHash
    };

    fakeUser.push(newUser);

    // login automatico (opzionale)
    req.session.userId = newUser.id;

    res.json({ message: "Registrazione completata", userId: newUser.id });
};

// MIDDLEWARE DI PROTEZIONE
exports.requireLogin = (req, res, next) => {

    if (req.session.userId) {
        return next();
    }

    // Se il browser si aspetta HTML → redirect
    const acc = req.headers.accept || "";
    if (acc.includes("text/html")) {
        return res.redirect("/login");
    }

    // Altrimenti API → JSON
    return res.status(401).json({ error: "Devi essere loggato" });
};
