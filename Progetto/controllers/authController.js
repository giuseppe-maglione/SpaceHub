const bcrypt = require("bcrypt");

// Esempio: questo user verrebbe dal database
const fakeUser = {
    id: 1,
    username: "admin",
    passwordHash: "$2b$10$uP/NT.3OER3wXXeN6fPjeOdiB2r2AuP8WH9fMck/4cM/rzYXRTxQW" // "password"
};

// LOGIN
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (username !== fakeUser.username)
        return res.status(401).json({ error: "Username errato" });

    const correct = await bcrypt.compare(password, fakeUser.passwordHash);

    if (!correct)
        return res.status(401).json({ error: "Password errata" });

    // Salviamo nella sessione
    req.session.userId = fakeUser.id;

    res.json({ message: "Login effettuato" });
};

// LOGOUT
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logout completato" });
    });
};

// REGISTER
exports.register = async (req, res) => {
    const { username, password } = req.body;

    // Controlla se esiste già
    const existing = fakeUser.find(u => u.username === username);
    if (existing) {
        return res.status(400).json({ error: "Username già esistente" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crea nuovo utente
    const newUser = {
        id: fakeUser.length + 1,
        username,
        passwordHash
    };

    fakeUser.push(newUser);

    // Login automatico (facoltativo)
    req.session.userId = newUser.id;

    res.json({ message: "Registrazione completata" });
};

// Middleware per proteggere le pagine
exports.requireLogin = (req, res, next) => {

    // Utente autenticato → OK
    if (req.session.userId) {
        return next();
    }

    // Se la richiesta accetta HTML → reindirizza al login
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect("/login");
    }

    // Se la richiesta è API → manda JSON
    return res.status(401).json({ error: "Devi essere loggato" });
};

