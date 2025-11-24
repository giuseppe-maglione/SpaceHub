import express from "express";
import session from "express-session";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { initDbPool } from "./src/services/db.js";

dotenv.config();

// Serve a far funzionare __dirname con import ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inizializza il DB
await initDbPool();

const app = express();
const sessionSecret = process.env.SESSION_SECRET || "super-secret-key";

// Middleware JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessioni
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,     // metti true quando sarai in HTTPS reale
        maxAge: 1000 * 60 * 60 // 1h
    }
}));

// Serve i file statici del frontend React
const buildPath = path.join(__dirname, "..", "..", "frontend", "build");
app.use(express.static(buildPath));

// Rotte API
import bookingsRoutes from "./routes/bookingsRoutes.js";
import readerRoutes from "./routes/apiRoutes.js";
import authRoutes from "./routes/authRoutes.js";

bookingsRoutes(app);
readerRoutes(app);
authRoutes(app);

// Catch-all: React gestisce il routing
app.get("*", (req, res) => {
    res.sendFile(path.resolve(buildPath, "index.html"));
});

app.listen(3000, () => {
    console.log("Server in ascolto su http://localhost:3000");
});
